param(
  [string]$Region = "us-east-1",
  [string]$StackName = "MyfitInfraStack",
  [string]$ImageTag = "latest",
  [int]$BackendStabilizationTimeoutMinutes = 25,
  [switch]$SkipMigration,
  [switch]$SkipBackend,
  [switch]$SkipFrontend
)

$ErrorActionPreference = "Stop"
$env:AWS_PAGER = ""

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$infraDir = Split-Path -Parent $scriptDir
$workspaceDir = Split-Path -Parent $infraDir
$backendDir = Join-Path $workspaceDir "myFit-api"
$frontendDir = Join-Path $workspaceDir "myfit"

Write-Host "Loading CloudFormation outputs from $StackName..." -ForegroundColor Cyan
$stackJson = aws cloudformation describe-stacks --region $Region --stack-name $StackName --output json
$stack = ($stackJson | ConvertFrom-Json).Stacks[0]

$outputs = @{}
foreach ($o in $stack.Outputs) {
  $outputs[$o.OutputKey] = $o.OutputValue
}

function Require-Output([string]$Key) {
  if (-not $outputs.ContainsKey($Key) -or -not $outputs[$Key]) {
    throw "Missing stack output: $Key"
  }
}

function Wait-EcsServiceStable {
  param(
    [string]$ClusterName,
    [string]$ServiceName,
    [string]$RegionName,
    [int]$TimeoutMinutes
  )

  $deadline = (Get-Date).AddMinutes($TimeoutMinutes)
  while ((Get-Date) -lt $deadline) {
    $serviceJson = aws ecs describe-services --region $RegionName --cluster $ClusterName --services $ServiceName --output json
    $service = ($serviceJson | ConvertFrom-Json).services[0]

    if (-not $service) {
      throw "ECS service '$ServiceName' not found in cluster '$ClusterName'."
    }

    $primary = $service.deployments | Where-Object { $_.status -eq "PRIMARY" } | Select-Object -First 1
    $latestEvent = $service.events | Select-Object -First 1
    $eventMsg = if ($latestEvent) { $latestEvent.message } else { "No service events yet." }

    Write-Host ("ECS status: desired={0}, running={1}, pending={2}, primaryRollout={3}" -f $service.desiredCount, $service.runningCount, $service.pendingCount, $primary.rolloutState) -ForegroundColor Yellow
    Write-Host ("Latest event: {0}" -f $eventMsg) -ForegroundColor DarkYellow

    $isStable =
      ($service.runningCount -eq $service.desiredCount) -and
      ($service.pendingCount -eq 0) -and
      ($service.deployments.Count -eq 1) -and
      ($primary.rolloutState -eq "COMPLETED")

    if ($isStable) {
      Write-Host "ECS service is stable." -ForegroundColor Green
      return
    }

    Start-Sleep -Seconds 15
  }

  throw "Timed out waiting for ECS service stabilization after $TimeoutMinutes minutes."
}

function Invoke-BackendMigration {
  param(
    [string]$ClusterName,
    [string]$ServiceName,
    [string]$RegionName
  )

  Write-Host "Preparing one-off ECS migration task..." -ForegroundColor Cyan

  $serviceJson = aws ecs describe-services --region $RegionName --cluster $ClusterName --services $ServiceName --output json
  $service = ($serviceJson | ConvertFrom-Json).services[0]
  if (-not $service) {
    throw "Cannot load ECS service '$ServiceName' in cluster '$ClusterName'."
  }

  $taskDefinitionArn = $service.taskDefinition
  if (-not $taskDefinitionArn) {
    throw "Cannot determine task definition ARN from ECS service '$ServiceName'."
  }

  $network = $service.networkConfiguration.awsvpcConfiguration
  if (-not $network -or -not $network.subnets -or $network.subnets.Count -eq 0) {
    throw "Cannot determine awsvpc network settings from ECS service '$ServiceName'."
  }

  $taskDefJson = aws ecs describe-task-definition --region $RegionName --task-definition $taskDefinitionArn --output json
  $taskDefinition = ($taskDefJson | ConvertFrom-Json).taskDefinition
  if (-not $taskDefinition -or -not $taskDefinition.containerDefinitions -or $taskDefinition.containerDefinitions.Count -eq 0) {
    throw "Cannot read container definitions from task definition '$taskDefinitionArn'."
  }

  $containerName = $taskDefinition.containerDefinitions[0].name
  $assignPublicIp = if ($network.assignPublicIp) { $network.assignPublicIp } else { "DISABLED" }

  $networkConfig = @{
    awsvpcConfiguration = @{
      subnets = @($network.subnets)
      securityGroups = @($network.securityGroups)
      assignPublicIp = $assignPublicIp
    }
  } | ConvertTo-Json -Compress -Depth 6

  $overrides = @{
    containerOverrides = @(
      @{
        name = $containerName
        command = @("--run.migration=true")
      }
    )
  } | ConvertTo-Json -Compress -Depth 6

  $networkConfigFile = Join-Path $env:TEMP ("ecs-network-config-{0}.json" -f ([Guid]::NewGuid().ToString("N")))
  $overridesFile = Join-Path $env:TEMP ("ecs-overrides-{0}.json" -f ([Guid]::NewGuid().ToString("N")))
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($networkConfigFile, $networkConfig, $utf8NoBom)
  [System.IO.File]::WriteAllText($overridesFile, $overrides, $utf8NoBom)

  Write-Host "Running migration task on ECS (container: $containerName)..." -ForegroundColor Cyan
  $runTaskJson = aws ecs run-task --region $RegionName --cluster $ClusterName --launch-type FARGATE --task-definition $taskDefinitionArn --count 1 --network-configuration "file://$networkConfigFile" --overrides "file://$overridesFile" --output json
  $runTask = $runTaskJson | ConvertFrom-Json

  if ($runTask.failures -and $runTask.failures.Count -gt 0) {
    $failureReason = $runTask.failures[0].reason
    throw "Failed to start migration task: $failureReason"
  }

  $taskArn = $runTask.tasks[0].taskArn
  if (-not $taskArn) {
    throw "Migration task ARN not returned by ECS run-task."
  }

  Write-Host "Waiting migration task to stop..." -ForegroundColor Yellow
  aws ecs wait tasks-stopped --region $RegionName --cluster $ClusterName --tasks $taskArn

  $describeTaskJson = aws ecs describe-tasks --region $RegionName --cluster $ClusterName --tasks $taskArn --output json
  $task = ($describeTaskJson | ConvertFrom-Json).tasks[0]
  $container = $task.containers | Select-Object -First 1
  $exitCode = $container.exitCode
  $stopReason = if ($task.stoppedReason) { $task.stoppedReason } else { "No stop reason" }

  if ($exitCode -ne 0) {
    throw "Migration task failed (exitCode=$exitCode). Reason: $stopReason"
  }

  Remove-Item -Force $networkConfigFile -ErrorAction SilentlyContinue
  Remove-Item -Force $overridesFile -ErrorAction SilentlyContinue

  Write-Host "Migration task completed successfully." -ForegroundColor Green
}

function Deploy-Frontend {
  Require-Output "FrontendBucketName"
  Require-Output "CloudFrontDistributionId"

  $bucketName = $outputs["FrontendBucketName"]
  $distributionId = $outputs["CloudFrontDistributionId"]
  $frontendBaseUrl = if ($outputs.ContainsKey("FrontendBaseUrl")) { $outputs["FrontendBaseUrl"] } else { "https://$($outputs["CloudFrontDomainName"])" }
  $backendApiBaseUrl = if ($outputs.ContainsKey("BackendApiBaseUrl")) { $outputs["BackendApiBaseUrl"] } else { $frontendBaseUrl }

  Write-Host "Building and deploying Expo web frontend..." -ForegroundColor Cyan
  Set-Location $frontendDir
  npm ci
  if ($LASTEXITCODE -ne 0) {
    Write-Warning "npm ci failed (lockfile mismatch). Falling back to npm install for this deployment."
    npm install
    if ($LASTEXITCODE -ne 0) {
      throw "Frontend dependency install failed."
    }
  }

  # Build web with deployment-specific URLs so frontend calls AWS endpoints instead of localhost.
  $env:EXPO_PUBLIC_NODE_ENV = "production"
  $env:EXPO_PUBLIC_BACKEND_API_URL = $backendApiBaseUrl

  # Always source browser Cognito URL from frontend .env to avoid stale terminal environment values.
  $frontendEnvFile = Join-Path $frontendDir ".env"
  if (Test-Path $frontendEnvFile) {
    $browserCognitoLine = Select-String -Path $frontendEnvFile -Pattern '^EXPO_PUBLIC_BROWSER_COGNITO_URL=' | Select-Object -First 1
    if ($browserCognitoLine) {
      $env:EXPO_PUBLIC_BROWSER_COGNITO_URL = $browserCognitoLine.Line.Substring("EXPO_PUBLIC_BROWSER_COGNITO_URL=".Length)
    }
  }

  if ($env:EXPO_PUBLIC_BROWSER_COGNITO_URL) {
    try {
      $cognitoUri = [System.Uri]$env:EXPO_PUBLIC_BROWSER_COGNITO_URL
      $query = [System.Web.HttpUtility]::ParseQueryString($cognitoUri.Query)
      $query["redirect_uri"] = "$frontendBaseUrl/callback"

      $builder = New-Object System.UriBuilder($cognitoUri)
      $builder.Query = $query.ToString()
      $env:EXPO_PUBLIC_BROWSER_COGNITO_URL = $builder.Uri.AbsoluteUri
    }
    catch {
      Write-Warning "Could not rewrite EXPO_PUBLIC_BROWSER_COGNITO_URL redirect_uri. Using existing value."
    }
  }

  if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
  }
  if (Test-Path "web-build") {
    Remove-Item -Recurse -Force "web-build"
  }

  npx expo export --platform web --clear

  $buildDir = "dist"
  if (-not (Test-Path $buildDir)) {
    $buildDir = "web-build"
  }

  if (-not (Test-Path $buildDir)) {
    throw "Cannot find frontend output folder. Expected dist or web-build."
  }

  aws s3 sync $buildDir "s3://$bucketName" --delete --region $Region
  aws cloudfront create-invalidation --distribution-id $distributionId --paths "/*" --output text | Out-Null

  Write-Host "Frontend deployment completed." -ForegroundColor Green
}

function Deploy-Backend {
  Require-Output "BackendEcrRepositoryUri"
  Require-Output "EcsClusterName"
  Require-Output "EcsServiceName"

  $repoUri = $outputs["BackendEcrRepositoryUri"]
  $clusterName = $outputs["EcsClusterName"]
  $serviceName = $outputs["EcsServiceName"]

  Write-Host "Deploying backend image to ECR: ${repoUri}:${ImageTag}" -ForegroundColor Cyan
  Set-Location $backendDir

  Write-Host "Building backend JAR (skip tests) before Docker build..." -ForegroundColor Cyan
  if (Test-Path (Join-Path $backendDir "mvnw.cmd")) {
    .\mvnw.cmd -q -DskipTests package
  }
  elseif (Test-Path (Join-Path $backendDir "mvnw")) {
    .\mvnw -q -DskipTests package
  }
  else {
    mvn -q -DskipTests package
  }

  if ($LASTEXITCODE -ne 0) {
    throw "Backend Maven package failed. Docker build aborted."
  }

  $accountId = (aws sts get-caller-identity --query Account --output text)
  $ecrPassword = aws ecr get-login-password --region $Region
  $registry = "$accountId.dkr.ecr.$Region.amazonaws.com"
  $ecrPassword | docker login --username AWS --password-stdin $registry

  docker build -t "${repoUri}:${ImageTag}" .
  docker push "${repoUri}:${ImageTag}"

  if (-not $SkipMigration) {
    Invoke-BackendMigration -ClusterName $clusterName -ServiceName $serviceName -RegionName $Region
  }

  Write-Host "Forcing ECS rollout..." -ForegroundColor Cyan
  aws ecs update-service --region $Region --cluster $clusterName --service $serviceName --force-new-deployment | Out-Null
  Wait-EcsServiceStable -ClusterName $clusterName -ServiceName $serviceName -RegionName $Region -TimeoutMinutes $BackendStabilizationTimeoutMinutes

  Write-Host "Backend deployment completed." -ForegroundColor Green
}

try {
  if (-not $SkipFrontend) {
    Deploy-Frontend
  }

  if (-not $SkipBackend) {
    Deploy-Backend
  }

  Write-Host "Application deployment finished." -ForegroundColor Green
}
finally {
  Set-Location $infraDir
}

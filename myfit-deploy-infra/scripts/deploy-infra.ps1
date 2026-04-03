param(
  [string]$Region = "us-east-1",
  [string]$StackName = "MyfitInfraStack",
  [string]$DomainName = "",
  [string]$HostedZoneId = "",
  [string]$HostedZoneName = "myfit.click",
  [string]$CertificateArn = "",
  [switch]$RunCleanup,
  [switch]$ConfirmCleanupDelete
)

$ErrorActionPreference = "Stop"

# Single source of truth for Bedrock API key secret used by ECS task definition.
$BedrockApiKeySecretArn = "arn:aws:secretsmanager:us-east-1:294568841239:secret:myfit/bedrock-api-key-cJiujb"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoDir = Split-Path -Parent $scriptDir
Set-Location $repoDir

if ($RunCleanup) {
  $cleanupArgs = @("-Region", $Region)
  if ($ConfirmCleanupDelete) {
    $cleanupArgs += "-ConfirmDelete"
  }

  & "$scriptDir\cleanup-failed-cloudformation.ps1" @cleanupArgs
}

Write-Host "Installing dependencies..." -ForegroundColor Cyan
npm ci

Write-Host "Building CDK app..." -ForegroundColor Cyan
npm run build

Write-Host "Bootstrapping CDK environment..." -ForegroundColor Cyan
npx cdk bootstrap --region $Region

$contextArgs = @()
if ($DomainName) { $contextArgs += @("-c", "domainName=$DomainName") }
if ($HostedZoneId) { $contextArgs += @("-c", "hostedZoneId=$HostedZoneId") }
if ($HostedZoneName) { $contextArgs += @("-c", "hostedZoneName=$HostedZoneName") }
if ($CertificateArn) { $contextArgs += @("-c", "certificateArn=$CertificateArn") }
if ($BedrockApiKeySecretArn) { $contextArgs += @("-c", "bedrockApiKeySecretArn=$BedrockApiKeySecretArn") }

Write-Host "Synthesizing stack..." -ForegroundColor Cyan
npx cdk synth $StackName --region $Region @contextArgs

Write-Host "Deploying stack $StackName..." -ForegroundColor Cyan
npx cdk deploy $StackName --region $Region --require-approval never @contextArgs

Write-Host "Infra deployment completed." -ForegroundColor Green

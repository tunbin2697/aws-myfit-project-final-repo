param(
  [string]$Region = "us-east-1",
  [switch]$DryRun,
  [switch]$ConfirmDelete
)

$ErrorActionPreference = "Stop"

if (-not $DryRun -and -not $ConfirmDelete) {
  throw "Deletion is disabled by default. Re-run with -ConfirmDelete (or use -DryRun to inspect only)."
}

$failedStatuses = @(
  "CREATE_FAILED",
  "ROLLBACK_FAILED",
  "ROLLBACK_COMPLETE",
  "DELETE_FAILED",
  "UPDATE_ROLLBACK_FAILED",
  "UPDATE_ROLLBACK_COMPLETE",
  "UPDATE_ROLLBACK_COMPLETE_CLEANUP_IN_PROGRESS",
  "IMPORT_ROLLBACK_FAILED",
  "IMPORT_ROLLBACK_COMPLETE"
)

Write-Host "Scanning CloudFormation failed stacks in region $Region..." -ForegroundColor Cyan

$stacksJson = aws cloudformation list-stacks `
  --region $Region `
  --stack-status-filter $failedStatuses `
  --query "StackSummaries[].{Name:StackName,Status:StackStatus}" `
  --output json

$stacks = $stacksJson | ConvertFrom-Json

if (-not $stacks -or $stacks.Count -eq 0) {
  Write-Host "No failed stacks found." -ForegroundColor Green
  exit 0
}

Write-Host "Failed stacks:" -ForegroundColor Yellow
$stacks | Format-Table -AutoSize

foreach ($stack in $stacks) {
  $stackName = $stack.Name
  Write-Host "`nProcessing stack: $stackName ($($stack.Status))" -ForegroundColor Cyan

  $resourcesJson = aws cloudformation list-stack-resources `
    --region $Region `
    --stack-name $stackName `
    --query "StackResourceSummaries[].{Type:ResourceType,PhysicalId:PhysicalResourceId,Status:ResourceStatus}" `
    --output json

  $resources = $resourcesJson | ConvertFrom-Json

  # Best effort: empty S3 buckets that can block stack deletion.
  foreach ($res in $resources) {
    if ($res.Type -eq "AWS::S3::Bucket" -and $res.PhysicalId) {
      $bucket = $res.PhysicalId
      Write-Host "  Emptying S3 bucket: $bucket" -ForegroundColor DarkYellow
      if (-not $DryRun) {
        aws s3 rm "s3://$bucket" --recursive --region $Region | Out-Null
      }
    }
  }

  if ($DryRun) {
    Write-Host "  DryRun enabled. Skip deleting stack $stackName." -ForegroundColor DarkGray
    continue
  }

  Write-Host "  Deleting stack: $stackName" -ForegroundColor Yellow
  aws cloudformation delete-stack --region $Region --stack-name $stackName

  try {
    aws cloudformation wait stack-delete-complete --region $Region --stack-name $stackName
    Write-Host "  Deleted: $stackName" -ForegroundColor Green
  }
  catch {
    Write-Warning "  Delete wait failed for $stackName. Check CloudFormation events manually."
  }
}

Write-Host "Cleanup finished." -ForegroundColor Green

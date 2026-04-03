# MyFit AWS Deployment Pipeline Runbook

This document is the operational guide for deploying MyFit after source-code changes in backend (Spring Boot) and frontend (Expo web), with practical debugging and security guardrails.

## 1) Scope and goals

- Describe how code changes move from local workspace to AWS runtime.
- Explain the two deployment scripts and when to use each.
- Capture failure patterns already seen and how to debug quickly.
- Provide CLI command references for deploy, debug, and monitoring.
- Prevent secret leakage during development and operations.

## 2) AWS stack description

The current stack is defined in `lib/myfit-infra-stack.ts`.

### 2.1 Core resources

- VPC with public/private subnets and 1 NAT gateway.
- ECS Cluster with Fargate service for backend.
- ALB for backend traffic on port 80 (CloudFront-facing).
- ECR repository `myfit-backend` (imported existing repo).
- RDS PostgreSQL 15 (private, generated secret in Secrets Manager).
- ElastiCache Redis (private).
- S3 bucket for frontend static files.
- CloudFront distribution serving frontend and proxying API paths.

### 2.2 CloudFront routing

- Default behavior: S3 static website files.
- Additional behaviors:
  - `/api/*` -> ALB origin
  - `/auth/*` -> ALB origin
  - `/user/*` -> ALB origin

This allows one public base URL for frontend and API calls.

### 2.3 Auth and identity

- Cognito user pool and client are referenced (existing resources), not created by this stack.
- Backend validates JWTs from Cognito issuer.
- Frontend uses Cognito Hosted UI login URL and callback.

### 2.4 Service outputs used by deploy scripts

- `BackendEcrRepositoryUri`
- `EcsClusterName`
- `EcsServiceName`
- `FrontendBucketName`
- `CloudFrontDistributionId`
- `FrontendBaseUrl`
- `BackendApiBaseUrl`

## 3) Two deploy scripts and usage

## 3.1 `scripts/deploy-infra.ps1` (Infrastructure)

Use when:

- Changing CDK stack code in `myfit-infra`.
- Rotating architecture-level settings (network, ECS task env, CloudFront behavior, DB/Redis infra).

What it does:

1. Optional cleanup of failed CloudFormation stacks.
2. `npm ci` and `npm run build`.
3. `cdk bootstrap`.
4. `cdk synth`.
5. `cdk deploy`.

Examples:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\deploy-infra.ps1
powershell -ExecutionPolicy Bypass -File .\scripts\deploy-infra.ps1 -SkipCleanup
powershell -ExecutionPolicy Bypass -File .\scripts\deploy-infra.ps1 -DomainName myfit.example.com -HostedZoneId Z123... -HostedZoneName myfit.example.com -CertificateArn arn:aws:acm:...
```

## 3.2 `scripts/deploy-app.ps1` (Application)

Use when:

- Backend source code changed in `myFit-api`.
- Frontend source code/env changed in `myfit`.

What it does:

Backend path:

1. Read infra outputs from CloudFormation.
2. Build backend JAR using Maven (`-DskipTests`).
3. Build/push Docker image to ECR.
4. Force ECS new deployment.
5. Poll ECS service until rollout is complete.

Frontend path:

1. Read infra outputs for base URL, bucket, distribution.
2. Build Expo web export.
3. Upload static assets to S3.
4. Invalidate CloudFront cache.

Examples:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\deploy-app.ps1
powershell -ExecutionPolicy Bypass -File .\scripts\deploy-app.ps1 -SkipFrontend
powershell -ExecutionPolicy Bypass -File .\scripts\deploy-app.ps1 -SkipBackend
powershell -ExecutionPolicy Bypass -File .\scripts\deploy-app.ps1 -ImageTag latest -BackendStabilizationTimeoutMinutes 40
```

## 4) End-to-end pipeline from code edit to AWS

## 4.1 Backend code change -> production

1. Edit backend source in `../myFit-api/src`.
2. Optional local verification:

```powershell
Set-Location ..\myFit-api
.\mvnw.cmd test
```

3. Deploy backend:

```powershell
Set-Location ..\myfit-infra
powershell -ExecutionPolicy Bypass -File .\scripts\deploy-app.ps1 -SkipFrontend
```

4. Verify ECS steady state and health:

```powershell
$stack='MyfitInfraStack'; $region='us-east-1'
$cluster=aws cloudformation describe-stacks --region $region --stack-name $stack --query "Stacks[0].Outputs[?OutputKey=='EcsClusterName'].OutputValue" --output text
$service=aws cloudformation describe-stacks --region $region --stack-name $stack --query "Stacks[0].Outputs[?OutputKey=='EcsServiceName'].OutputValue" --output text
aws ecs describe-services --region $region --cluster $cluster --services $service --query "services[0].{Desired:desiredCount,Running:runningCount,Pending:pendingCount,Rollout:deployments[0].rolloutState}" --output table
```

## 4.2 Frontend code change -> production

1. Edit frontend source in `../myfit`.
2. Ensure frontend env values are production-safe (`EXPO_PUBLIC_BACKEND_API_URL`, Cognito browser URL callback).
3. Deploy frontend:

```powershell
Set-Location ..\myfit-infra
powershell -ExecutionPolicy Bypass -File .\scripts\deploy-app.ps1 -SkipBackend
```

4. Validate deployed bundle and API base URL:

```powershell
$cf='doa50uf4r2d4u.cloudfront.net'
$index=curl.exe -s "https://$cf/index.html"
$jsPath=([regex]::Match($index,'_expo/static/js/web/[^"'']+\.js')).Value
curl.exe -s "https://$cf/$jsPath" | Select-String -Pattern 'https://doa50uf4r2d4u.cloudfront.net|localhost:8080'
```

## 4.3 Infra change -> production

1. Edit CDK source in `lib/myfit-infra-stack.ts`.
2. Preview changes:

```powershell
Set-Location .
npx cdk diff MyfitInfraStack --region us-east-1
```

3. Deploy infra:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\deploy-infra.ps1
```

4. If ECS task definition/env changed, run backend deployment to refresh container rollout when needed.

## 5) Bugs already faced and fix patterns

## 5.1 Stale backend code after deploy

Symptom:

- Script runs successfully, but behavior does not reflect recent Java changes.

Cause:

- Docker image built from old `target/*.jar` when JAR was not rebuilt.

Fix:

- `deploy-app.ps1` now runs Maven package before Docker build.

## 5.2 CloudFront callback/login mismatch (localhost in production)

Symptom:

- Login redirect points to localhost callback.

Causes:

- Stale frontend env values.
- Bundle built with wrong env at export time.

Fix pattern:

- Source Cognito browser URL from frontend `.env`.
- Rewrite `redirect_uri` to current `FrontendBaseUrl/callback` during deploy.
- Invalidate CloudFront and verify live JS bundle.

## 5.3 403 on `/user/sync` after login

Symptom:

- OAuth callback succeeds, then sync API fails.

Cause seen:

- CORS preflight rejected (`Invalid CORS request`) because runtime CORS config did not match production origin behavior.

Fix pattern:

- Align CORS config and ECS env origins with CloudFront domain patterns.
- Confirm preflight with explicit `OPTIONS` call before retrying full login flow.

## 5.4 ECS stabilization hangs/flaps

Symptoms:

- Long rollout without completion.
- Tasks churn between old/new sets.

Common causes:

- Wrong health-check endpoint.
- Slow startup without enough grace period.
- Application startup errors.

Fix pattern:

- Verify ALB target health path and backend endpoint availability.
- Increase health-check grace if startup is slow.
- Read ECS service events and CloudWatch logs.

## 6) Debug process checklist

Use this order to reduce time-to-resolution.

1. Confirm CloudFormation stack health.
2. Confirm ECS service desired/running/pending and rollout state.
3. Inspect ALB target group health.
4. Tail backend logs.
5. Confirm frontend bundle contains expected API/auth config.
6. Validate Cognito callback/logout URLs.
7. Test CORS preflight and authenticated endpoint manually.

## 6.1 Stack and deployment state

```powershell
aws cloudformation describe-stacks --region us-east-1 --stack-name MyfitInfraStack --query "Stacks[0].StackStatus" --output text
aws cloudformation describe-stack-events --region us-east-1 --stack-name MyfitInfraStack --max-items 20
```

## 6.2 ECS service events and tasks

```powershell
$region='us-east-1'; $stack='MyfitInfraStack'
$cluster=aws cloudformation describe-stacks --region $region --stack-name $stack --query "Stacks[0].Outputs[?OutputKey=='EcsClusterName'].OutputValue" --output text
$service=aws cloudformation describe-stacks --region $region --stack-name $stack --query "Stacks[0].Outputs[?OutputKey=='EcsServiceName'].OutputValue" --output text
aws ecs describe-services --region $region --cluster $cluster --services $service --query "services[0].events[0:10].[createdAt,message]" --output table
aws ecs list-tasks --region $region --cluster $cluster --service-name $service --desired-status RUNNING
```

## 6.3 Backend logs (CloudWatch)

```powershell
$region='us-east-1'; $stack='MyfitInfraStack'
$cluster=aws cloudformation describe-stacks --region $region --stack-name $stack --query "Stacks[0].Outputs[?OutputKey=='EcsClusterName'].OutputValue" --output text
$service=aws cloudformation describe-stacks --region $region --stack-name $stack --query "Stacks[0].Outputs[?OutputKey=='EcsServiceName'].OutputValue" --output text
$task=aws ecs list-tasks --region $region --cluster $cluster --service-name $service --desired-status RUNNING --query "taskArns[0]" --output text
$td=aws ecs describe-tasks --region $region --cluster $cluster --tasks $task --query "tasks[0].taskDefinitionArn" --output text
$tdJson=aws ecs describe-task-definition --region $region --task-definition $td | ConvertFrom-Json
$logGroup=$tdJson.taskDefinition.containerDefinitions[0].logConfiguration.options.'awslogs-group'
aws logs tail $logGroup --region $region --since 1h --follow
```

## 6.4 CORS and auth API probing

```powershell
$uri='https://doa50uf4r2d4u.cloudfront.net/user/sync'
curl.exe -s -i -X OPTIONS $uri -H "Origin: https://doa50uf4r2d4u.cloudfront.net" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: authorization,content-type"
curl.exe -s -i -X POST $uri -H "Content-Type: application/json" -d '{"email":"test@example.com"}'
```

## 6.5 CloudFront behavior and cache validation

```powershell
$dist=aws cloudformation describe-stacks --region us-east-1 --stack-name MyfitInfraStack --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDistributionId'].OutputValue" --output text
aws cloudfront get-distribution-config --id $dist --query "DistributionConfig.CacheBehaviors.Items[].PathPattern" --output text
```

## 6.6 Cognito callback/logout check

```powershell
aws cognito-idp describe-user-pool-client --user-pool-id us-east-1_9AoKPqZO1 --client-id 661fm3mj7s5qcmoldri1mem9sr --region us-east-1 --query "UserPoolClient.{CallbackURLs:CallbackURLs,LogoutURLs:LogoutURLs}" --output json
```

## 7) Secret safety and anti-leak policy

Do not commit, print, or share:

- AWS access keys, secret keys, session tokens.
- Cognito app client secret (if confidential client is used).
- Bedrock bearer tokens or any API keys.
- Database passwords and Secrets Manager payloads.

Required practices:

- Use IAM roles for ECS task permissions.
- Keep local secrets in untracked files (`.env`, not committed).
- Keep sample values in `.env.sample` only with placeholders.
- Rotate any secret that has been exposed in logs/chat/screenshots.
- Prefer AWS CLI query output filters to avoid dumping full objects.

Recommended git ignore additions in app repos:

- `.env`
- `*.pem`
- `*.key`
- `*.ppk`
- `*secret*`

## 8) Monitoring commands

## 8.1 ALB target health

```powershell
$tgArn=aws elbv2 describe-target-groups --region us-east-1 --query "TargetGroups[?contains(TargetGroupName,'MyfitI-Backe')].TargetGroupArn | [0]" --output text
aws elbv2 describe-target-health --region us-east-1 --target-group-arn $tgArn --output table
```

## 8.2 ECS service health summary

```powershell
$region='us-east-1'; $stack='MyfitInfraStack'
$cluster=aws cloudformation describe-stacks --region $region --stack-name $stack --query "Stacks[0].Outputs[?OutputKey=='EcsClusterName'].OutputValue" --output text
$service=aws cloudformation describe-stacks --region $region --stack-name $stack --query "Stacks[0].Outputs[?OutputKey=='EcsServiceName'].OutputValue" --output text
aws ecs describe-services --region $region --cluster $cluster --services $service --query "services[0].{Desired:desiredCount,Running:runningCount,Pending:pendingCount,Events:events[0:3]}" --output json
```

## 8.3 RDS and Redis endpoint visibility

```powershell
aws cloudformation describe-stacks --region us-east-1 --stack-name MyfitInfraStack --query "Stacks[0].Outputs[?OutputKey=='DatabaseEndpointAddress' || OutputKey=='RedisEndpointAddress']" --output table
```

## 9) Recommended release procedure

1. Run infra diff if infra code changed.
2. Deploy infra only when needed.
3. Deploy backend only and verify health/logs.
4. Deploy frontend only and verify callback/API bundle values.
5. Execute smoke tests (login, sync user, core API route).
6. Monitor ECS events and CloudWatch logs for 15-30 minutes.

This sequence keeps rollback surface small and shortens incident recovery time.

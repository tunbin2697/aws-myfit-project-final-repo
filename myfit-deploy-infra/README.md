# MyFit Infra (AWS CDK)

This folder contains Infrastructure as Code for MyFit on AWS and deployment scripts for backend and frontend.

## Stack at a glance

- Compute: ECS Fargate service behind ALB
- Image registry: ECR (existing repository imported by name)
- Database: RDS PostgreSQL (private subnet)
- Cache: ElastiCache Redis (private subnet)
- Frontend hosting: S3 + CloudFront
- API routing: CloudFront path behaviors for /api/*, /auth/*, /user/* to ALB
- Auth integration: Cognito existing pool/client IDs are referenced by context/defaults
- Observability: CloudWatch logs for ECS and RDS PostgreSQL logs export

Main stack source: lib/myfit-infra-stack.ts

## Deployment scripts

- scripts/deploy-infra.ps1
  - Install deps, build CDK app, bootstrap CDK, synth, deploy stack
  - Optional cleanup step for failed CloudFormation stacks

- scripts/deploy-app.ps1
  - Backend flow: build Maven JAR, build/push Docker image to ECR, force ECS rollout, wait for stable service
  - Frontend flow: export Expo web, upload to S3, invalidate CloudFront
  - Reads CloudFormation outputs to avoid hardcoding infrastructure values

- scripts/cleanup-failed-cloudformation.ps1
  - Deletes failed stacks and best-effort empties S3 buckets that block deletion

## Detailed runbook

See docs/DEPLOYMENT_PIPELINE.md for:

- End-to-end pipeline from source-code change to AWS
- Backend and frontend deployment workflows
- Frequent failure cases and debugging playbook
- Safe secret handling checklist
- Useful AWS CLI commands for deploy, debug, and monitoring

## Quick start

1. Deploy or update infrastructure:
	- powershell -ExecutionPolicy Bypass -File .\scripts\deploy-infra.ps1
2. Deploy backend and frontend app:
	- powershell -ExecutionPolicy Bypass -File .\scripts\deploy-app.ps1
3. Deploy backend only:
	- powershell -ExecutionPolicy Bypass -File .\scripts\deploy-app.ps1 -SkipFrontend
4. Deploy frontend only:
	- powershell -ExecutionPolicy Bypass -File .\scripts\deploy-app.ps1 -SkipBackend

## Notes

- Avoid committing or echoing secrets in logs.
- Prefer AWS IAM roles for ECS task access instead of static credentials.
- Run cdk diff before infra deploy when you need explicit change review.

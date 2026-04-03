# CI/CD Static Deploy Flow (Backend + Migration First)

This document describes the deployment flow implemented in GitHub Actions for the backend repo.

## Objectives

- Run fully in CI (no local-machine dependency).
- Ensure migration success before backend rollout.
- Ensure ECS service is stable after deployment.
- Keep infrastructure inputs static for now (simpler debugging).

## Implemented flow in backend workflow

Push/manual trigger
→ Build backend JAR
→ Build Docker image
→ Push to ECR (commit SHA tag)
→ Run one-off ECS migration task (`--run.migration=true`)
→ Fail pipeline immediately if migration exit code is non-zero
→ Register new ECS task definition with pushed image
→ Update ECS service
→ Wait ECS service stable
→ Verify primary rollout state is `COMPLETED`

## Why this prevents restart loops better

- Migration is executed before ECS rollout.
- If migration fails, service update is not triggered.
- If rollout fails, workflow fails after stability/rollout verification.

## Static configuration approach

The workflow uses static environment values:

- `AWS_REGION`
- `ECR_REPOSITORY`
- `ECS_CLUSTER`
- `ECS_SERVICE`

No CloudFormation output lookup is used in CI.

## Frontend deployment note

This repository workflow currently deploys backend only.

- Frontend code is not part of this repository.
- Frontend deploy (Expo web build, S3 sync, CloudFront invalidation) should run in frontend repo workflow or a separate orchestration workflow that checks out both repos.

## Next improvements

1. Add backend test stage before packaging.
2. Add environment separation (dev/staging/prod).
3. Add deployment circuit breaker validation/rollback policy in infrastructure config.
4. Add integrated frontend deployment workflow (if needed) with static vars.

---

Written on: 2026-03-25

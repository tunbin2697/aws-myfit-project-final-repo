# MyFit Deployment Side-by-Side Comparison (Configuration-Level)

Date: 2026-03-12  
Scope:
- Your stack: `myfit-infra`
- Team stack: `myFit-deploy`
- Baseline guide: `AWS architechture.md`

---

## 1) Guide Baseline (What architecture expects)

From the guide, the target architecture/services are:

- VPC with public/private subnet segmentation
- ECS Fargate backend behind ALB
- HTTPS termination using ACM at ALB (and CloudFront when used)
- RDS PostgreSQL in private subnet
- ElastiCache Redis in private subnet
- S3 + CloudFront for frontend/static assets
- Route 53 domain routing (frontend + backend/API domain)
- Cognito-based authentication
- IAM least-privilege roles for ECS runtime/execution
- CloudWatch logs/monitoring
- Optional CI/CD automation

Important TLS interpretation from guide:
- **Required by guide**: HTTPS client -> ALB/CloudFront via ACM.
- **Not strictly required by guide**: TLS ALB -> ECS (internal VPC leg is often HTTP).

---

## 2) Service-by-Service Side-by-Side Comparison

## 2.1 Network/VPC

| Item | Guide expectation | `myfit-infra` | `myFit-deploy` | Similarity | Difference / Impact |
|---|---|---|---|---|---|
| VPC | Yes | Single stack VPC, `maxAzs:2`, `natGateways:1` | Dedicated NetworkStack, `maxAzs:2`, `natGateways:0` | Both create multi-AZ VPC | `myfit-infra` favors private egress via NAT; `myFit-deploy` favors cost (public ECS path) |
| Subnets | Public + Private | Uses private-with-egress for DB and Redis | Public + private-isolated; ECS in public subnet | Both separate data plane from internet | `myFit-deploy` runs ECS publicly assigned IP (controlled via SG) |
| Security Groups | Segmented by tier | DB/Redis SG allow from ECS service SG | ALB/ECS/DB/Cache SG clearly split | Both enforce SG layering | `myFit-deploy` DB/Cache SG have `allowAllOutbound:false`; `myfit-infra` defaults outbound permissive SG style |

## 2.2 Compute (ECS/ALB/ECR)

| Item | Guide expectation | `myfit-infra` | `myFit-deploy` | Similarity | Difference / Impact |
|---|---|---|---|---|---|
| ECS Fargate | Yes | ALB Fargate pattern, `cpu:512`, `mem:1024`, desired=1 | Custom ECS+ALB wiring, `cpu:512`, `mem:1024`, desired=2, autoscaling 2..10 | Both use Fargate + ALB | HA better in `myFit-deploy` (desired 2), but public subnet model changes security posture |
| ECR | Yes | Imports existing `myfit-backend` repo | Imports existing `myfit-api` repo | Both avoid recreation collisions | Repo naming mismatch can complicate shared runbook |
| ALB listener | Yes | HTTP listener always; HTTPS only if cert/domain context provided | HTTP only listener in code | Both have ALB ingress | `myfit-infra` can do HTTPS conditionally; `myFit-deploy` currently lacks ACM/HTTPS listener wiring |
| Target health check | Yes | `/test/health` | `/actuator/health` | Both define health checks | Endpoint mismatch risk between projects/runbooks |
| ECS env & secrets | Yes | DB creds from Secrets Manager, Redis host, CORS origins, region | DB host/port/name/user/pass from secret, Redis host/port, region, Cognito pool ID | Both inject runtime config from infra | Secret schema mismatch risk in `myFit-deploy` (see section 4) |

## 2.3 Database (RDS PostgreSQL)

| Item | Guide expectation | `myfit-infra` | `myFit-deploy` | Similarity | Difference / Impact |
|---|---|---|---|---|---|
| Engine | PostgreSQL | Postgres 15 | Postgres 16 | Both PostgreSQL | Minor version divergence |
| Size/cost profile | micro/small suitable | T3 micro, 20GB, single-AZ | T4g micro, 50GB, **multi-AZ** | Both private RDS with secret creds | `myFit-deploy` aligns better with HA note; `myfit-infra` aligns better with lower base cost |
| Secret management | Yes | Generated secret from RDS credentials helper | Explicit secret resource `myfit/db/credentials` | Both use Secrets Manager | Secret key naming assumptions differ across stacks |
| Logs/backups | CloudWatch + backup | CloudWatch export `postgresql`, retention 1 week, backup 1 day | Backup 7 days, no explicit CloudWatch export in stack | Both have backups | Observability stronger in `myfit-infra`; retention stronger in `myFit-deploy` |

## 2.4 Cache (ElastiCache Redis)

| Item | Guide expectation | `myfit-infra` | `myFit-deploy` | Similarity | Difference / Impact |
|---|---|---|---|---|---|
| Redis in private subnet | Yes | `cache.t3.micro`, private subnet group | `cache.t4g.micro`, private isolated subnet group | Both satisfy private Redis requirement | Different family/generation and engine version config |
| Access control | SG from ECS only | Yes | Yes | Equivalent | Low risk difference |

## 2.5 Storage + CDN

| Item | Guide expectation | `myfit-infra` | `myFit-deploy` | Similarity | Difference / Impact |
|---|---|---|---|---|---|
| S3 static/media | Yes | Frontend bucket (retained, versioned) | Media bucket (retained, encrypted) | Both create S3 | Bucket purpose differs (frontend-only vs media-only) |
| CloudFront | Expected | Present and active in stack | **Removed/commented out currently** | N/A | `myFit-deploy` currently diverges from guide for CDN layer |
| OAI/OAC style | Recommended | OAI + bucket read grant | Not present now | N/A | `myFit-deploy` missing distribution access controls due temporary removal |

## 2.6 Auth (Cognito)

| Item | Guide expectation | `myfit-infra` | `myFit-deploy` | Similarity | Difference / Impact |
|---|---|---|---|---|---|
| Cognito integration | Yes | References existing pool/client via context/default IDs | Creates User Pool + Client in AuthStack | Both support Cognito path | `myfit-infra` is integrate-only; `myFit-deploy` is provision-and-integrate |
| OAuth callback flow | Required for hosted UI | Managed in app deploy script rewrite logic | Client OAuth configured, Google IdP noted manual | Both recognize OAuth needs | Runtime callback correctness automation stronger in `myfit-infra` scripts |

## 2.7 DNS + ACM + Route53

| Item | Guide expectation | `myfit-infra` | `myFit-deploy` | Similarity | Difference / Impact |
|---|---|---|---|---|---|
| Route53 alias records | Yes (when custom domain) | Conditional frontend and backend A records when zone + cert present | No Route53 records in shown stacks | Limited | `myFit-deploy` currently no integrated domain routing |
| ACM certificate integration | Yes | Conditional import ARN and bind to ALB + CloudFront | Not configured in shown stacks | Limited | `myFit-deploy` currently no HTTPS cert integration path in code |

## 2.8 IAM / Least Privilege

| Item | Guide expectation | `myfit-infra` | `myFit-deploy` | Similarity | Difference / Impact |
|---|---|---|---|---|---|
| ECS execution role | Required | Implicit via ECS patterns | Explicit `TaskExecutionRole` managed policy | Both have execution path | Explicit role modeling clearer in `myFit-deploy` |
| ECS task role | Required | Present via pattern; reads DB secret | Explicit role with S3 + DB secret grants | Both apply least-privilege intent | Comparable, with explicitness better in `myFit-deploy` |

## 2.9 Observability / Operations

| Item | Guide expectation | `myfit-infra` | `myFit-deploy` | Similarity | Difference / Impact |
|---|---|---|---|---|---|
| CloudWatch logs | Yes | ECS logs + RDS postgres export + runbook | ECS logs configured, no RDS export seen | Both have ECS logging | `myfit-infra` has stronger operational runbook and scripted validation |
| Deploy automation | Recommended | `deploy-infra.ps1`, `deploy-app.ps1`, stabilization polling | CDK deploy scripts only in package scripts | Both can deploy | `myfit-infra` is operationally more production-ready |

## 2.10 CI/CD + Bastion

| Item | Guide expectation | `myfit-infra` | `myFit-deploy` | Similarity | Difference / Impact |
|---|---|---|---|---|---|
| CI/CD | Optional | Not provisioned as CDK stack | CodePipeline + CodeBuild + ECS deploy stage | Only one has CI/CD | Good extra in `myFit-deploy`, but depends on repo/token correctness |
| Bastion | Optional | Not present | Bastion host stack present | Only one has bastion | Bastion SG allows SSH from anywhere (needs hardening) |

---

## 3) Similarities Summary (Both got these right)

- Core managed services selected correctly: ECS Fargate, ALB, RDS PostgreSQL, Redis, S3, IAM roles, Cognito integration path.
- VPC segmentation and SG-based service boundaries are implemented.
- DB and cache are not publicly exposed.
- Secrets Manager is used for DB credentials.
- CloudWatch container logging is present.

---

## 4) Detailed Differences and Risks

## 4.1 `myfit-infra` distinctive strengths

- End-to-end deploy workflow is mature (build, push, rollout, stabilization wait, frontend invalidation).
- CloudFront/API separation is explicitly preserved to avoid SPA fallback masking backend errors.
- Route53 + ACM path already implemented (conditional by context values).

## 4.2 `myfit-infra` risks / issues

1. HA/capacity baseline lower than guide recommendation:
   - `desiredCount:1` and single-AZ RDS instance.
2. Health-check path differs from common Spring default (`/test/health` vs `/actuator/health`) and may drift from backend implementation.
3. Cognito IDs are output from context defaults, not validated/provisioned in stack.
4. S3 env uses context bucket name, not the created frontend bucket output (possible app/storage intent mismatch).

## 4.3 `myFit-deploy` distinctive strengths

- Very clear multi-stack domain separation (network/db/storage/auth/compute/cicd/bastion).
- Multi-AZ RDS micro and desired ECS=2 align with resilience goals.
- Explicit IAM role and scaling setup.

## 4.4 `myFit-deploy` risks / issues

1. CloudFront absent currently (commented/removed), diverging from guide static delivery pattern.
2. No ACM + HTTPS listener + Route53 domain integration in shown code.
3. ECS placed in public subnets with public IP for cost optimization (acceptable for MVP but weaker than private egress model).
4. Potential secret schema mismatch:
   - Compute expects secret keys `host`, `port`, `dbname`.
   - DB secret template explicitly sets username/password; host/port/dbname availability depends on secret attachment behavior and should be verified.
5. Bastion host ingress allows SSH from `0.0.0.0/0` (high risk unless rapidly restricted).

---

## 5) Side-by-Side: What Both Plans Miss vs Guide (Detailed)

| Guide requirement | `myfit-infra` status | `myFit-deploy` status | Gap details |
|---|---|---|---|
| HTTPS at ALB via ACM | **Conditional** (only if cert/domain context provided) | **Missing in stack code** | Both are not guaranteed secure-by-default from first deploy |
| CloudFront for frontend CDN | Implemented | Missing currently | Team deploy diverges materially from guide on static delivery edge layer |
| Route53 integrated routing | Conditional records provided | Missing in shown stacks | Team deploy lacks integrated domain automation |
| Consistent health-check strategy | Custom path `/test/health` | `/actuator/health` | Cross-project drift may break deployment stability |
| Resilience baseline (2 app tasks + robust DB HA) | Task count below target, DB single-AZ | Task count good, DB multi-AZ good | Each plan misses a different part of HA baseline |
| Unified environment/secret contract | Partial (context-driven Cognito/bucket) | Possible secret field assumptions | Both need explicit contract documentation/validation tests |
| Security hardening by default | Mostly strong but depends on context for TLS | Bastion open SSH + public ECS model | Hardening posture inconsistent across both plans |

---

## 6) TLS Check: ALB -> ECS in `myfit-infra`

Short answer: **You are correct that ALB -> ECS is not TLS-encrypted currently**.

Technical check:
- In `myfit-infra`, backend service uses `containerPort:8080` and ALB target group forwards HTTP to tasks.
- HTTPS on ALB is only enabled when certificate/domain context is provided.
- Therefore current design is:
  - Client -> ALB: HTTP or HTTPS (depends on cert context)
  - ALB -> ECS: HTTP (inside VPC)

Is this wrong?
- It is common/acceptable for many AWS deployments to terminate TLS at ALB and use private HTTP to ECS.
- If your requirement is strict end-to-end encryption, you must add TLS on container side and HTTPS target group/listener protocol to backend tasks.

---

## 7) Recommendation Action Session (Prioritized)

## Session A — Security Baseline (P0)

1. Enforce HTTPS by default on internet edge:
   - `myfit-infra`: require `certificateArn` + domain context in production deploy script (fail-fast if missing).
   - `myFit-deploy`: add ACM cert + HTTPS listener + HTTP->HTTPS redirect + Route53 records.
2. Harden bastion:
   - Restrict SSH ingress to fixed office/home CIDR or prefer SSM-only (no SSH ingress).
3. Add explicit security checklist gate in CI (or pre-deploy script).

## Session B — Runtime Contract Alignment (P0/P1)

1. Standardize health endpoint across both stacks and backend app.
2. Standardize secret key contract (`DB_HOST/PORT/NAME/USERNAME/PASSWORD`) and assert keys before ECS deploy.
3. Standardize ECR repository naming convention across projects.

## Session C — Availability and Cost Policy (P1)

1. Decide production defaults:
   - ECS desired task count: 2 minimum.
   - RDS mode: multi-AZ for prod, single-AZ for dev/test.
2. Decide network posture policy:
   - Private ECS + NAT (stronger security) vs Public ECS + SG restriction (lower cost).

## Session D — Guide Conformance Completion (P1)

1. Restore CloudFront in `myFit-deploy` stack with OAC/OAI and frontend-only behavior.
2. Keep API separate from CloudFront SPA fallback in both projects.
3. Add explicit Route53 + domain outputs for frontend and API.

## Session E — Ops and Documentation (P2)

1. Merge one canonical deployment runbook and one environment contract doc.
2. Add automated post-deploy verification suite:
   - ALB health, ECS stable, CORS preflight, auth callback URL, bundle config checks.

---

## 8) Immediate Next-Step Checklist (Practical)

- [ ] Confirm production certificate ARN and hosted zone values.
- [ ] Add fail-fast check in deploy scripts if HTTPS context missing in prod.
- [ ] Unify health-check path in both stacks and backend.
- [ ] Verify Secrets Manager keys used by ECS task env.
- [ ] Restrict bastion SSH ingress or disable SSH entirely.
- [ ] Re-enable CloudFront + Route53 + ACM in team deploy.

---

## 9) Final Verdict

- `myfit-infra` is stronger in operational deployment maturity and frontend/API routing correctness.
- `myFit-deploy` is stronger in modular architecture, HA defaults for app/database, and CI/CD intent.
- Neither is fully guide-complete out of the box; the biggest shared gap is **secure-by-default HTTPS/domain automation and configuration contract consistency**.
- Your TLS concern is valid specifically for **ALB -> ECS leg** (currently HTTP in `myfit-infra`).
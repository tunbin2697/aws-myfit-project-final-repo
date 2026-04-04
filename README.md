# Cloud-Native Fitness Platform on AWS

This repository combines the three project repositories into one monorepo to present the full MyFit platform end-to-end, from user experience to cloud deployment.

Live application: myfit.click
## Internship Reports

| Member | Report URL |
| --- | --- |
| Võ Quốc Bảo Khang | [https://tunbin2697.github.io/facj-worklog-/](https://tunbin2697.github.io/facj-worklog-/) |
| Nguyễn Minh Khang | [https://minhkhang17.github.io/worklogAws/](https://minhkhang17.github.io/worklogAws/) |
| Hoàng Phạm Gia Bảo | [https://baohoang2005.github.io/AWS_WORKLOG/](https://baohoang2005.github.io/AWS_WORKLOG/) |
| Lê Nguyễn Thiên Danh | [https://chrislee1901.github.io/fcj-workshop-template/](https://chrislee1901.github.io/fcj-workshop-template/) |
| Trương Đình Lộc | [https://superziggs.github.io/Internship-report/](https://superziggs.github.io/Internship-report/) |

MyFit is a cloud-native fitness platform designed to support users across their health and workout journey, with:
- A Spring Boot backend API secured with Cognito and JWT
- A React Native (Expo) frontend app for mobile and web
- AWS infrastructure as code (CDK) and deployment scripts
- AI chatbot integration through backend services

---

## 1) Project Purpose

This monorepo is organized to make the full system easy to understand and evaluate:
- Application logic and APIs (backend)
- Mobile/web client experience (frontend)
- Cloud infrastructure and deployment automation (infra)

The goal of this showcase is to demonstrate a stable, scalable, and secure AWS-based solution that connects frontend, backend, and infrastructure into one coherent platform.

---

## 2) Monorepo Structure

```text
final repo/
	myFit-api/                 # Spring Boot backend
	myFit-FrontEnd/            # React Native + Expo frontend
	myfit-deploy-infra/        # AWS CDK infrastructure + deploy scripts
```

---

## 3) Quick Navigation

### Main sections
- Backend API folder: [myFit-api](myFit-api/)
- Frontend folder: [myFit-FrontEnd](myFit-FrontEnd/)
- Infrastructure folder: [myfit-deploy-infra](myfit-deploy-infra/)

### Child READMEs
- Backend detailed README: [myFit-api/README.md](myFit-api/README.md)
- Frontend detailed README: [myFit-FrontEnd/README.md](myFit-FrontEnd/README.md)
- Infrastructure detailed README: [myfit-deploy-infra/README.md](myfit-deploy-infra/README.md)

---

## 4) Section Overview

### A. Backend API (myFit-api)

The backend is a Java 17 + Spring Boot 3 REST API that powers core platform features:
- Authentication and token validation (AWS Cognito integration)
- Workout plans, exercises, user sessions, nutrition, and profile data
- Media URL handling (S3 + CloudFront)
- AI chatbot endpoint integration
- PostgreSQL persistence with Flyway migrations

Backend is containerized (Docker), supports local development via Maven or Docker Compose, and is designed for cloud deployment.

See details: [myFit-api/README.md](myFit-api/README.md)

### B. Frontend App (myFit-FrontEnd)

The frontend is a cross-platform React Native app (Expo) for Android, iOS, and Web:
- Cognito-based authentication flow
- Workout and diet tracking features
- Health metrics and chart visualization
- AI chat screen integration with backend chatbot APIs
- Redux Toolkit + React Query architecture for state and server data

The frontend includes local setup instructions, env configuration, and CI/CD web deployment flow.

See details: [myFit-FrontEnd/README.md](myFit-FrontEnd/README.md)

### C. Infra Stack (myfit-deploy-infra)

Infrastructure is defined with AWS CDK and deployment automation scripts:
- ECS Fargate backend service behind ALB
- ECR image registry
- RDS PostgreSQL in private subnets
- S3 + CloudFront hosting for frontend
- CloudFront path routing to backend API paths
- Deployment scripts for infrastructure and application rollout

This section includes practical runbooks for deployment, debugging, and rollback scenarios.

See details: [myfit-deploy-infra/README.md](myfit-deploy-infra/README.md)

## 5) Highlights From Each Child README

### Backend Highlights
- Feature-based Spring Boot module architecture
- Flyway migration strategy and schema versioning
- Dockerized runtime and AWS-ready integration points
- Security guidance for JWT, secrets, and environment config

### Frontend Highlights
- Cross-platform Expo architecture (mobile + web)
- Clear environment variable and local run instructions
- Production deployment workflow for static web hosting on AWS
- Service-layer separation for maintainability and testing

### Infra Highlights
- End-to-end AWS architecture with compute, data, cache, and CDN
- Scripted deployment for infrastructure and app updates
- Operational runbooks for failure handling and diagnostics
- Cloud outputs usage to avoid hardcoded deployment values

---

## 6) Suggested Exploration Path (5-10 Minutes)

1. Read this overview to understand the big picture.
2. Open backend README for domain/API architecture: [myFit-api/README.md](myFit-api/README.md)
3. Open frontend README for client behavior and integration: [myFit-FrontEnd/README.md](myFit-FrontEnd/README.md)
4. Open infra README for deployment architecture and scripts: [myfit-deploy-infra/README.md](myfit-deploy-infra/README.md)

---

## 7) Assignment Context

For this final assignment showcase, the original repositories were combined into this monorepo to make evaluation straightforward across:
- Full-stack implementation quality
- Cloud architecture and deployment readiness
- AI feature integration within a production-style platform structure

This layout is intentionally documentation-first so the project goal, architecture, and deployment flow are easy to review from the root level.

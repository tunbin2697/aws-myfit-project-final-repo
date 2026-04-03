# MyFit Monorepo Showcase (Final Course Assignment)

This repository combines three project repositories into one monorepo to present the full MyFit platform end-to-end.

MyFit is a fitness platform deployed on AWS, with:
- A Spring Boot backend API
- A React Native (Expo) frontend app
- AWS infrastructure as code (CDK) and deployment scripts
- AI chatbot integration via AWS Bedrock (inside the infra scope)

---

## 1) Project Purpose

This monorepo is organized to quickly understand how the complete system is structured and deployed:
- Application logic and APIs (backend)
- Mobile/web client experience (frontend)
- Cloud infrastructure and deployment automation (infra)

The goal of this showcase is to demonstrate integration across software engineering, cloud deployment, and AI-enabled features in one coherent platform.

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
- Bedrock chatbot notes: [myfit-deploy-infra/bedrock chatbot/README](myfit-deploy-infra/bedrock%20chatbot/README)

---

## 4) Section Overview

### A. Backend API (myFit-api)

The backend is a Java 17 + Spring Boot 3 REST API that powers core platform features:
- Authentication and token validation (AWS Cognito integration)
- Workout plans, exercises, user sessions, nutrition, and profile data
- Media URL handling (S3 + CloudFront)
- AI chatbot endpoint integration with AWS Bedrock
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
- RDS PostgreSQL and ElastiCache Redis (private subnets)
- S3 + CloudFront hosting for frontend
- CloudFront path routing to backend API paths
- Deployment scripts for infra and app rollout

This section includes practical runbooks for deployment, debugging, and rollback scenarios.

See details: [myfit-deploy-infra/README.md](myfit-deploy-infra/README.md)

### D. Bedrock Chatbot (inside infra scope)

Bedrock chatbot integration is documented under the infra project and explains:
- AI model usage with Anthropic Claude through AWS Bedrock
- Chat flow from frontend to backend to Bedrock runtime
- Persistent chat history and token usage tracking
- Service health endpoint and reliability behavior

See details: [myfit-deploy-infra/bedrock chatbot/README](myfit-deploy-infra/bedrock%20chatbot/README)

---

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

### Bedrock Highlights
- AI fitness coaching assistant behavior and system prompt strategy
- Message persistence, token accounting, and usage controls
- API protocol details and model/runtime configuration choices
- Health monitoring endpoint for service readiness checks

---

## 6) Suggested Exploration Path (5-10 Minutes)

1. Read this overview to understand the big picture.
2. Open backend README for domain/API architecture: [myFit-api/README.md](myFit-api/README.md)
3. Open frontend README for client behavior and integration: [myFit-FrontEnd/README.md](myFit-FrontEnd/README.md)
4. Open infra README for deployment architecture and scripts: [myfit-deploy-infra/README.md](myfit-deploy-infra/README.md)
5. Open Bedrock notes for AI/chatbot implementation details: [myfit-deploy-infra/bedrock chatbot/README](myfit-deploy-infra/bedrock%20chatbot/README)

---

## 7) Assignment Context

For this final assignment showcase, the original repositories were combined into this monorepo to make evaluation straightforward across:
- Full-stack implementation quality
- Cloud architecture and deployment readiness
- AI feature integration within a production-style platform structure

This layout is intentionally documentation-first to make project navigation and evaluation straightforward.

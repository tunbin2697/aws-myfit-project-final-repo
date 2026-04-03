
# FitMe Backend API

> A modern Spring Boot fitness platform backend with intelligent workout planning, AI-powered chatbot assistance, and seamless media management.

[![Java](https://img.shields.io/badge/Java-17-orange?logo=java)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-green?logo=spring)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue?logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?logo=docker)](https://www.docker.com/)
[![AWS](https://img.shields.io/badge/AWS-Powered-FF9900?logo=amazonaws)](https://aws.amazon.com/)

## Project Overview

**FitMe** is a Spring Boot REST API backend for a complete fitness platform. As the project owner, I designed this API to power mobile and web applications with:

- User authentication and profile management
- Workout plan creation and progress tracking  
- Exercise library with detailed metadata and media
- AI-powered fitness chatbot for personalized recommendations
- Food/nutrition database for diet planning
- Session management for tracking user progress

The backend integrates with AWS services for authentication (Cognito), AI capabilities (Bedrock), and media storage (S3/CloudFront), but the core business logic is self-contained and framework-agnostic.

### Key Features

- **Workout Planning**: Create, manage, and track customized fitness plans
- **User Profiles & Sessions**: Manage user data with secure JWT authentication
- **Exercise Database**: Browse detailed exercises with media references
- **AI Chatbot**: Intelligent fitness assistant for personalized advice
- **Food & Nutrition**: Comprehensive food database for diet planning
- **Progress Tracking**: Monitor fitness milestones and achievements
- **Media Management**: Generate secure CloudFront URLs for images/videos
- **RESTful API**: Well-structured endpoints for all operations

### Technology Stack

| Component | Technology |
|-----------|-----------|
| **Language & Framework** | Java 17, Spring Boot 3.x |
| **Database** | PostgreSQL 15+, JPA/Hibernate |
| **Migrations** | Flyway |
| **Cloud Platform** | AWS (ECR, ECS, RDS, S3, CloudFront, Cognito, Bedrock) |
| **Containerization** | Docker |
| **Build Tool** | Maven |
| **API Security** | OAuth2, JWT, AWS Cognito |

---

## Getting Started

### Prerequisites

Ensure you have the following installed:

- **Java 17** or higher
- **Maven 3.8+**
- **Docker** (for containerized development)
- **Docker Compose** (for orchestrating local services)
- **Git**

### Quick Start (Local Development)

#### Option 1: Using Docker Compose (Recommended for Non-Owner Developers)

This is the easiest way to get the full stack running locally without managing PostgreSQL separately.

**1. Clone the repository**

```bash
git clone <repository-url>
cd myFit-api
git branch --track <your-branch> origin/<your-branch>  # if working on a specific branch
```

**2. Set up environment variables**

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database Connection
DB_URL=jdbc:postgresql://postgres:5432/fitme_db
DB_USERNAME=fitme_user
DB_PASSWORD=fitme_password

# AWS Credentials (for local development)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<your-aws-key>
AWS_SECRET_ACCESS_KEY=<your-aws-secret>
AWS_S3_BUCKET=crawl.fitness

# Authentication
COGNITO_ISSUER_URI=<your-cognito-issuer-url>

# AI Chatbot (Bedrock)
BEDROCK_API_KEY=<your-bedrock-api-key>

# Server Settings
SERVER_PORT=8080
```

**For local development only**, you can use mock values. For testing AWS integrations, you'll need real AWS credentials.

**3. Build and start the services**

```bash
# Build the application and Docker image
docker compose build --no-cache

# Start all services (backend + PostgreSQL)
docker compose up -d --pull always
```

**4. Verify the setup**

```bash
# Check running containers
docker compose ps

# View logs
docker compose logs -f fitme-backend

# Test the API
curl http://localhost:8080/api/health
```

**5. Access the application**

- Backend API: `http://localhost:8080`
- PostgreSQL: `localhost:5432` (if needed for direct access)

#### Option 2: Local Maven Build (For Java Development)

If you prefer running the application directly on your machine:

**1-2. Follow steps 1-2 from Option 1 above**

**3. Install dependencies and build**

```bash
./mvnw clean install
```

**4. Run the application**

```bash
./mvnw spring-boot:run
```

Alternatively, run the compiled JAR:

```bash
java -jar target/fitme-0.0.1-SNAPSHOT.jar
```

**5. Start PostgreSQL separately** (if not using Docker Compose)

```bash
# Using Docker
docker run -d \
  --name postgres-fitme \
  -e POSTGRES_DB=fitme_db \
  -e POSTGRES_USER=fitme_user \
  -e POSTGRES_PASSWORD=fitme_password \
  -p 5432:5432 \
  postgres:15

# Or use your local PostgreSQL installation
```

#### Option 3: Use Pre-Built Docker Image

For quick testing without building:

```bash
docker run -d \
  -e DB_URL=jdbc:postgresql://host.docker.internal:5432/fitme_db \
  -p 8080:8080 \
  minhkhang17/fitme:latest
```

### Database Migrations

Flyway automatically handles database schema migrations on application startup. Check your migrations in `src/main/resources/db/migration/`.

Current migrations:
- `V1__init_schema.sql` - Initial database schema
- `V2__seed_core.sql` - Core data seeding
- `V3__seed_workout_plans.sql` - Sample workout plans
- `V4__repair_missing_schema.sql` - Schema fixes
- `V5__reseed_core_and_workout.sql` - Data reseeding
- `V6__seed_images_from_s3_json.sql` - S3 media references
- `V7__create_chatbot_message_table.sql` - Chat history tables

---

## Project Structure

```
myFit-api/
├── src/
│   ├── main/
│   │   ├── java/com/example/fitme/
│   │   │   ├── FitMeApplication.java          # Main Spring Boot entry point
│   │   │   ├── common/                        # Shared utilities
│   │   │   ├── config/                        # Configuration classes (Security, AWS, DB)
│   │   │   └── module/                        # Feature modules
│   │   │       ├── authentication/            # Auth module
│   │   │       ├── chatbot/                   # AI chatbot module
│   │   │       ├── food/                      # Food/nutrition module
│   │   │       ├── media/                     # Media upload/management
│   │   │       ├── session/                   # User session management
│   │   │       ├── system_goal/               # Fitness goal management
│   │   │       └── ...
│   │   └── resources/
│   │       ├── application.properties         # Main configuration
│   │       ├── application-dev.properties     # Dev-specific config
│   │       ├── s3_images_upload.json          # S3 image metadata
│   │       └── db/migration/                  # Flyway migrations
│   └── test/
│       └── java/com/example/fitme/            # Unit & integration tests
├── Dockerfile                                  # Container image definition
├── docker-compose.yml                         # Local dev environment setup
├── pom.xml                                    # Maven dependencies & build config
├── mvnw / mvnw.cmd                            # Maven wrapper scripts
└── docs/                                      # Documentation & workflows
```

---

## Backend Architecture

This backend is built with Spring Boot and provides RESTful APIs for the FitMe fitness platform:

```
┌──────────────────────────────────────────────────┐
│         FitMe Backend (Spring Boot)              │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │   REST API Endpoints                     │   │
│  │   - Authentication (JWT tokens)          │   │
│  │   - Workout plans & exercises            │   │
│  │   - User sessions & profiles             │   │
│  │   - Food/nutrition data                  │   │
│  │   - Chatbot interactions                 │   │
│  │   - Media file URLs (S3/CloudFront)      │   │
│  └──────────────────────────────────────────┘   │
│                  │                              │
│  ┌──────────────┴──────────────┬──────────┐     │
│  ▼                              ▼          ▼     │
│ PostgreSQL            AWS Cognito      AWS      │
│ (Database)            (Token Validation) Bedrock│
│                                         (LLM)   │
└──────────────────────────────────────────────────┘
```

### Core Integrations

| Integration | Purpose |
|-------------|---------|
| **PostgreSQL Database** | Primary data storage (user profiles, workouts, food data, chat history) |
| **AWS Cognito** | Validates JWT tokens for secure API requests |
| **AWS S3 + CloudFront** | Backend generates signed URLs for media files (exercises, food images) |
| **AWS Bedrock API** | Powers AI chatbot with Claude LLM for personalized fitness advice |

---

## CI/CD Pipeline

This repository includes automated testing and building:

**Detailed flow documented in:** [CICD-Static-Deploy-Flow.md](docs/rules%20and%20workflows/CICD-Static-Deploy-Flow.md)

### Build & Test Workflow

1. **Code Push** → Trigger GitHub Actions
2. **Build & Test** → Maven builds JAR, runs unit tests
3. **Docker Build** → Package application in Docker image
4. **Database Migrations** → Flyway validates schema changes
5. **Image Registry** → Push to Amazon ECR (if deployment triggered)
6. **Deployment** → ECS rolls out new version (infrastructure detail)

### Key Points

- **Tests run first**: Catch bugs before building Docker image
- **Migrations validated**: Schema changes verified before deployment
- **Reproducible builds**: Version tagged by commit SHA

---

## Security & Best Practices

### Secrets Management

**Never commit secrets to the repository.** Store them securely instead.

**Recommended methods:**
- Store AWS credentials in `.env` (local), not in code
- GitHub Actions Secrets (for CI/CD)
- AWS Secrets Manager (for production)
- AWS Systems Manager Parameter Store

### API Security

- **JWT Token Validation**: All requests validated against Cognito tokens
- **Database Credentials**: Injected via environment variables
- **S3 Access**: Backend generates signed URLs with expiration
- **Bedrock API Key**: Stored securely, never exposed to clients

### Environment Variable Security

- Database passwords in `.env` only (never in `application.properties`)
- AWS keys injected at runtime
- Properties file should contain only non-secret configuration

---

## Backend Configuration

| File | Purpose |
|------|---------|
| `pom.xml` | Maven dependencies and build configuration |
| `application.properties` | Main Spring Boot settings (logging, JPA, Flyway) |
| `application-dev.properties` | Development-specific overrides |
| `.env.example` | Environment variables template (database, AWS keys, ports) |
| `s3_images_upload.json` | S3 media metadata and references |
| `Dockerfile` | Container image for backend |
| `docker-compose.yml` | Local development stack (backend + PostgreSQL) |

---

## Development Guidelines

### Building Locally

```bash
# Clean and build
./mvnw clean package

# Skip tests for faster builds (not recommended for commits)
./mvnw clean package -DskipTests

# Run specific tests
./mvnw test -Dtest=UserServiceTest
```

### Running Tests

```bash
# All tests
./mvnw test

# Integration tests only
./mvnw test -Dgroups="integration"

# Coverage report
./mvnw jacoco:report
```

### Code Quality

The project uses standard Spring Boot conventions. Ensure:
- Proper exception handling
- Meaningful commit messages
- Code review before merging to `main`
- Tests cover critical business logic

---

## Troubleshooting

### Docker Compose Issues

**Containers won't start:**
```bash
# Check logs
docker compose logs fitme-backend

# Rebuild from scratch
docker compose down -v
docker compose build --no-cache
docker compose up -d
```

**Database connection error:**
- Verify `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` in `.env`
- Ensure PostgreSQL container is running: `docker compose ps`
- Check PostgreSQL logs: `docker compose logs postgres`
- Wait a few seconds for database to be ready before API startup

### Application Issues

**Migration failures:**
1. Check logs: `docker compose logs fitme-backend`
2. Verify SQL syntax in `src/main/resources/db/migration/`
3. Clear volumes and restart: `docker compose down -v && docker compose up`

**Chatbot not responding:**
- Verify `BEDROCK_API_KEY` in `.env`
- Check AWS region and model availability
- View logs for Bedrock API errors

**S3 media URLs not working:**
- Verify `AWS_S3_BUCKET` in `.env`
- Check AWS credentials have S3 read access
- Ensure CloudFront domain is correctly configured

**Port 8080 already in use:**
```bash
# Find process using port
netstat -ano | findstr :8080

# Or change port in docker-compose.yml
```

**Can't connect to API:**
```bash
# Test local connection
curl http://localhost:8080/api/health

# Check if service is running
docker compose ps

# View detailed logs
docker compose logs -f fitme-backend
```

---

## Documentation

- [CI/CD Deployment Flow](docs/rules%20and%20workflows/CICD-Static-Deploy-Flow.md)
- [Development Review Workflow](docs/rules%20and%20workflows/DEV-Review-Deploy-Workflow.md)
- [Flyway Migration Guide](docs/lib%20or%20tool/Flyway-Migration-Guide.md)

---

## Future Roadmap

- [ ] Add Swagger/OpenAPI documentation for APIs
- [ ] Expand unit and integration test coverage
- [ ] Implement caching layer for frequently accessed data
- [ ] Add API rate limiting and request validation
- [ ] Enhance chatbot with conversation history and context
- [ ] Add real-time notifications for progress milestones
- [ ] Performance optimization for media URL generation
- [ ] GraphQL support alongside REST API

---

## About This Backend Service

I built **FitMe Backend** as a modern REST API for a complete fitness ecosystem. The focus is on:

- **Clean API design**: RESTful endpoints for all fitness operations
- **Data reliability**: PostgreSQL with Flyway migrations ensure schema consistency
- **Smart integrations**: Cognito for auth, Bedrock for AI, S3 for media
- **Developer experience**: Easy local setup, clear project structure, comprehensive logging
- **Production-ready**: Containerized, scalable, tested, documented

This backend powers:
- Personalized workout plan management
- Real-time fitness progress tracking with user sessions
- AI-powered chatbot for fitness advice
- Exercise library with rich media content
- Food & nutrition database for diet planning

The codebase is organized by feature modules, making it easy to find and extend functionality.

---

## Support & Contribution

For issues, questions, or contributions:

1. Check existing documentation in `/docs`
2. Review the [CI/CD workflow](docs/rules%20and%20workflows/CICD-Static-Deploy-Flow.md) for deployment questions
3. Follow the [Development Review Workflow](docs/rules%20and%20workflows/DEV-Review-Deploy-Workflow.md) for contributing code

---

**Built for fitness enthusiasts worldwide**

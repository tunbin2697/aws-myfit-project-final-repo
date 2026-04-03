**Development, Review & Deployment Workflow**

This guide is separated into: **Rules**, **Dev Workflow**, **PR Workflow**, and **Deploy Workflow**.

## Rules

- Do not commit secrets (`DB_*`, `AWS_*`, tokens, keys). Use `.env` locally and CI/infra secrets in pipelines.
- Use the Maven wrapper from this repo (`mvnw` / `mvnw.cmd`), not system Maven.
- Keep dev-only behavior in `application-dev.properties`; keep production config in `application.properties`.
- For schema changes, always add a Flyway migration file (`V{n}__description.sql`) and test it before PR.
- Run tests/build before opening a PR.

## Dev Workflow

### 1) Start app in dev profile

```powershell
# Windows PowerShell (recommended)
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.arguments=--spring.profiles.active=dev"
```

```bash
# Unix / WSL
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

### 2) Local env setup

- Create `.env` at project root.
- Define at least: `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`.
- Add other needed keys (`AWS_*`, `S3_BUCKET_NAME`, etc.).

### 3) Understand dev DB behavior

- `application-dev.properties` currently uses:
  - `spring.jpa.hibernate.ddl-auto=create-drop`
  - `spring.flyway.enabled=false`
- In dev profile, schema is recreated on run; use migration-only mode to validate Flyway scripts.

### 4) Run migration-only locally (for testing SQL)

```powershell
$env:DB_URL='jdbc:postgresql://localhost:5432/fitme'
$env:DB_USERNAME='postgres'
$env:DB_PASSWORD='password'
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.arguments=--run.migration=true"
```

## PR Workflow

### 1) Create branch

- Branch from your mainline branch (`develop` or `main`, based on team flow).

### 2) Implement code change

- Update entity/repository/service/controller code as needed.

### 3) Create migration SQL (manual)

- Flyway in this project does **not** auto-generate SQL diff files.
- Command `--run.migration=true` only **applies** existing SQL files from `src/main/resources/db/migration`.
- To create a migration, write SQL manually:
  1. Check current latest version in `src/main/resources/db/migration` (example now: `V5__...`).
  2. Create next file (example): `V6__add_user_goal_columns.sql`.
  3. Add only schema/data changes needed for this feature.
  4. Keep migration focused and safe (prefer additive changes first).

- Example skeleton:

```sql
-- V6__add_user_goal_columns.sql
ALTER TABLE user_goal
    ADD COLUMN target_calories INTEGER;

UPDATE user_goal
SET target_calories = 2000
WHERE target_calories IS NULL;
```

### 4) Validate migration locally

- If schema changed, add migration to `src/main/resources/db/migration`.
- Use Flyway naming: `V{n}__short_description.sql`.
- Apply migration using PowerShell:

```powershell
$env:DB_URL='jdbc:postgresql://localhost:5432/fitme'
$env:DB_USERNAME='postgres'
$env:DB_PASSWORD='password'
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.arguments=--run.migration=true"
```

- Optional check in DB:

```sql
SELECT installed_rank, version, description, success
FROM flyway_schema_history
ORDER BY installed_rank;
```

### 5) Quality checks before PR

```powershell
.\mvnw.cmd test
.\mvnw.cmd -DskipTests=false package
```

### 6) PR content checklist

- Summarize what changed.
- List migration file names and DB impact.
- Include manual deploy steps if needed.
- Request reviewer(s), especially for DB schema changes.

## Deploy Workflow

### 1) Pre-deploy

- Run and verify on staging first.
- Backup production DB / create snapshot before production migration.

### 2) Apply migrations in production

- Run migration-only mode with production secrets (`DB_URL`, `DB_USERNAME`, `DB_PASSWORD`).
- Example command (from CI/deploy host):

```bash
java -jar target/<artifact>.jar --run.migration=true
```

### 3) Deploy app

- After migration succeeds, deploy/start app using `deploy-app` script or pipeline.

### 4) Post-deploy checks

- Smoke test key endpoints.
- Check logs and monitoring.
- If needed, execute rollback/runbook (app rollback + DB restore path).

---

Written on: 2026-03-25

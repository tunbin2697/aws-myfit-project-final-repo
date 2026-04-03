# Flyway cutover checklist (myFit-api)

## Completed in this repository

1. Added Flyway dependency in Maven (`org.flywaydb:flyway-core`).
2. Locked production/default Hibernate mode to validation only:
   - `spring.jpa.hibernate.ddl-auto=validate`
3. Enabled Flyway on default startup:
   - `spring.flyway.enabled=true`
4. Restricted Java runtime seeding to local development only:
   - `DatabaseSeeder` now runs only under `dev` profile.
5. Added dedicated local dev profile config:
   - `application-dev.properties`
   - `spring.jpa.hibernate.ddl-auto=create-drop`
   - `spring.flyway.enabled=false`
6. Added migration-only startup mode:
   - run app with `--run.migration=true`
   - app starts with `WebApplicationType.NONE` so one-off migration task can execute and exit.
7. Added migration folder scaffold:
   - `src/main/resources/db/migration/`

## Required prerequisites (not completed here)

These are required to finish the production-safe rollout but are outside this workspace scope or need your review:

1. **Create real Flyway SQL files** (mandatory)
   - Add `V1__init_schema.sql` from your current schema.
   - Convert runtime seed logic into SQL migrations (`V2...`, `V3...`, etc.).
   - Remove JSON/startup seed dependence for production.

2. **Infra deployment ordering** (in `myfit-infra` repo)
   - Update deployment flow to: Build -> Push image -> Run one migration ECS task (`--run.migration=true`) -> Deploy/update ECS service.

3. **GitHub Actions safeguards**
   - Block `ddl-auto=create` and `ddl-auto=create-drop` in non-dev config.
   - Enforce migration file presence when schema/entity changes.
   - Optionally block risky SQL in PR checks (`DROP TABLE`, `DROP COLUMN`, etc.).

4. **One-time DB reset/cutover plan**
   - Prepare a one-time reset/new DB plan before first Flyway-driven production deployment.

## Suggested first migration task command

Example one-off command args for migration task container:

`java -jar app.jar --run.migration=true`

This should run before rolling ECS service tasks.

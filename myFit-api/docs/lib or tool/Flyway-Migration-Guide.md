# Flyway Migration Guide (FitMe API)

This document explains how Flyway works in this project, how migration SQL files are used, and what command you should run in each case.

## 1) How Flyway works with migration SQL

Flyway is a database migration tool that runs SQL files in order and tracks what was already applied.

- Migration files are in: `src/main/resources/db/migration`
- Naming format: `V{version}__{description}.sql`
  - Example: `V6__add_user_goal_columns.sql`
- Flyway executes migrations by ascending version (`V1`, `V2`, `V3`, ...)
- Flyway records each applied migration in table: `flyway_schema_history`

Because Flyway tracks applied versions, each migration is run once per database (unless you manually change history or use repair workflows).

## 2) Important point: Flyway does NOT auto-generate SQL diff here

In this project, Flyway does **not** create migration SQL from your entity/model changes.

- You must write SQL migration files manually.
- Command `--run.migration=true` only applies existing SQL files.
- It does not compare schema and generate `Vx__...sql` automatically.

## 3) Project behavior by mode/profile

From current project setup:

- `application.properties`:
  - `spring.flyway.enabled=true`
  - `spring.jpa.hibernate.ddl-auto=validate`
- `application-dev.properties`:
  - `spring.flyway.enabled=false`
  - `spring.jpa.hibernate.ddl-auto=create-drop`

So locally in `dev` profile, DB schema may be recreated by Hibernate and Flyway is disabled unless you run migration-only mode explicitly.

## 4) Migration-only mode in this project

`FitMeApplication` supports a custom argument:

- `--run.migration=true`

When this argument is used, the app runs Flyway migration logic directly (using `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`) and exits.

Windows PowerShell command:

```powershell
$env:DB_URL='jdbc:postgresql://localhost:5432/myfit'
$env:DB_USERNAME='postgres'
$env:DB_PASSWORD='password'
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.arguments=--run.migration=true"
```

## 5) Exact workflow to create a new migration

### Step 1: Identify schema change

Decide what must change in DB (table/column/index/constraint/data patch).

### Step 2: Create next migration file

In `src/main/resources/db/migration`, create next version file:

- If latest is `V5__...`, create `V6__...`
- Use clear description: `V6__add_target_calories_to_user_goal.sql`

### Step 3: Write SQL manually

Keep it deterministic and safe. Prefer additive changes first.

Example:

```sql
ALTER TABLE user_goal
    ADD COLUMN target_calories INTEGER;

UPDATE user_goal
SET target_calories = 2000
WHERE target_calories IS NULL;
```

### Step 4: Apply migration on local DB

Run migration-only mode command (above).

### Step 5: Verify migration applied

Check DB history:

```sql
SELECT installed_rank, version, description, success
FROM flyway_schema_history
ORDER BY installed_rank;
```

### Step 6: Test app and commit

- Run tests/build:

```powershell
.\mvnw.cmd test
.\mvnw.cmd -DskipTests=false package
```

- Commit code + migration file together.

## 6) Rules for writing good migrations

- Never edit an already-applied migration file in shared environments.
- Create a new version file for every new change.
- Keep one migration focused on one logical change.
- For risky/destructive operations, prepare rollback/restore plan.
- Avoid environment-specific assumptions in SQL.

## 7) What if migration SQL is bad?

If a migration script is incorrect, Flyway behavior depends on the failure type.

### Case A: SQL error in migration (syntax/table/column/constraint error)

- Flyway stops at the failing migration version.
- Later migrations are not executed.
- On PostgreSQL, failed statements are rolled back when possible (transactional behavior).
- The migration is marked failed in `flyway_schema_history` (or does not finish as successful).

### Case B: Migration applies, but backend code/schema expectation does not match

- Flyway can still report success (because SQL executed).
- Application may fail later at startup/runtime:
  - startup validation issue (you use `spring.jpa.hibernate.ddl-auto=validate` in non-dev profile), or
  - runtime query/entity mismatch errors.

### Case C: You edited an already-applied migration file

- Flyway validates checksums.
- If file content changed after apply, Flyway throws validation/checksum mismatch error on next run.

### Case D: Migration history and local files drift

- If DB has applied migration but file is missing/renamed locally, validation can fail.
- If local file exists but DB never applied it, Flyway will try to apply it when migrating.

### What command behavior looks like in this project

- With `--run.migration=true`: migration process exits with error if a migration fails.
- With normal startup and `spring.flyway.enabled=true`: app startup fails if Flyway migration/validation fails.

### Recovery rules

1. **Do not modify applied migration files** in shared environments.
2. If a migration failed before successful apply, fix SQL and rerun.
3. If migration was already applied and now needs a change, create a new versioned migration (`V{next}__...sql`).
4. Use `repair` only with team agreement and after understanding checksum/history impact.
5. Always verify history table after rerun:

```sql
SELECT installed_rank, version, description, success
FROM flyway_schema_history
ORDER BY installed_rank;
```

## 8) Common confusion (quick answers)

- **Q: Do I run `--run.migration=true` to create SQL diff?**
  - **A: No.** It only executes existing migration SQL files.

- **Q: Then who creates the migration SQL?**
  - **A: You do, manually** (`V{n}__description.sql`).

- **Q: Why use migration-only mode?**
  - **A: To validate and apply Flyway scripts independently from normal app startup.**

- **Q: If local DB is at `V5`, I create `V6`, `V7`, `V8`, test locally, then deploy — will AWS migrate `V5 -> V8` automatically?**
  - **A: Yes, that is the expected Flyway behavior.**
  - If production DB is still at `V5` and deployed artifact contains `V6..V8`, Flyway applies them in order (`V6`, then `V7`, then `V8`).
  - This is safe when all migrations are valid, ordered, and compatible with the backend code you deploy.
  - Do not edit already-applied old files; add a new version (`V9__...`) for fixes.
  - Validate `V5 -> V8` path on staging before production.

## 9) Real-world failure scenarios and what to do

### Scenario 1: Local DB is at `V5`, but you accidentally edit old `V2` and app breaks

What happens:

- Flyway compares checksum for already-applied migrations.
- Since `V2` content changed, Flyway validation fails (checksum mismatch).
- Migration/startup can fail until this is fixed.

What you should do:

1. Revert `V2` file to the original committed version.
2. Do **not** keep modifications in `V2` (or any applied migration).
3. If you need schema/data change now, create a new migration file (for example `V6__...sql`).
4. Re-run migration check/app startup.

If this happened only on your local machine and never pushed:

- You may reset local DB and rerun from clean migration history.
- But for shared/staging/production environments, a versioned milways use a newgration file for changes.

### Scenario 2: Local DB at `V5`, then you create `V6` (bad), `V7` (bad), `V8` (looks good)

Important Flyway rule:

- Flyway executes in order. `V8` will not “fix” a failed `V6`/`V7` automatically.
- If `V6` fails, migration stops at `V6`; `V7` and `V8` are not executed.

Possible outcomes:

- **Outcome A: `V6` or `V7` fails during migration**
  - Local test should fail.
  - You must fix with a new migration (or fix before first shared apply), then re-test full path.
  - Do not deploy until full `V5 -> ... -> latest` path is clean.

- **Outcome B: `V6` and `V7` execute successfully but are logically wrong, `V8` compensates locally**
  - Flyway still treats `V6` and `V7` as successful.
  - In production, DB at `V5` will still run `V6`, `V7`, `V8` in order.
  - If `V8` truly and safely compensates, production may still end at a good final schema/data.
  - Risk: intermediate bad steps may cause data loss, long locks, or runtime issues during rollout.

What to do before production:

1. Validate migration chain on staging from a DB snapshot close to production.
2. Verify app startup and key flows after migration.
3. If `V6`/`V7` are already committed and applied anywhere shared, do not rewrite them; add new corrective migration (`V9__...`).
4. Only deploy when the full chain is proven safe end-to-end.

Production note:

- AWS/Flyway does not skip “bad but successful” migrations.
- It will run every pending version in order from current DB version to latest available migration.

---

Written on: 2026-03-25

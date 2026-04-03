# ERD & Authorization Changes (2026-02-24)

This document summarizes the schema and security changes made during the recent refactor, why they were made, and how to reset the development database and restart the app.

**Summary**
- Removed `isSystem` and `createdBy` from `WorkoutPlan` — `WorkoutPlan` now represents system templates only.
- Introduced `workout_log` as the runtime model for performed sets (one row per performed set), replacing the older `user_workout_session_exercise` / `user_workout_session_exercise_set` runtime model.
- Centralized authorization: ownership checks moved into services via `OwnershipValidator` and `SecurityUtils` which use the JWT subject; admin override supported.
- Fixed a Lombok builder warning by applying `@Builder.Default` (fully-qualified where needed) for collection defaults.

**Date**: 2026-02-24

---

**ERD changes (high level)**

- WorkoutPlan (system template)
  - Removed columns: `is_system` (boolean), `created_by` (enum).
  - Semantics: all persisted `workout_plan` rows are considered system templates in the current model. Users create `UserWorkoutPlan` records as clones of these templates.

- UserWorkoutPlan (user-owned)
  - Unchanged shape in this refactor; used for user-owned plans and holds `user_id`, `is_active`, etc.

- WorkoutLog (new runtime table)
  - New table to record performed sets as a flat log (one row per set).
  - Typical columns:
    - `id` UUID PK
    - `user_workout_session_id` UUID FK -> `user_workout_session.id`
    - `exercise_id` UUID FK -> `exercise.id`
    - `set_number` integer
    - `reps` integer
    - `weight` numeric (nullable)
    - `duration_seconds` integer (nullable)
    - `created_at` timestamp

- Legacy runtime tables removed (or commented out in code):
  - `user_workout_session_exercise`
  - `user_workout_session_exercise_set`

Rationale: a flat per-set log is simpler to query for analytics, reduces multi-level entity reconstruction, and avoids data duplication in the runtime flow.

---

**Authorization & Ownership**

- JWT subject is used as the canonical `userId` for ownership checks.
- `SecurityUtils` exposes helpers to get current JWT subject and role.
- `OwnershipValidator` centralizes the pattern:
  - `checkUserOwnership(UUID userId)` — throws `ApiException` with `FORBIDDEN_ACTION` unless the requestor is the user or has admin role.
  - Services should call `ownershipValidator.checkUserOwnership(userId)` at entry points that must be owner-only.
- Admin override: users with the admin role (mapped from JWT claims in `SecurityConfig`) bypass ownership checks where appropriate.
- All write/read operations on user-scoped resources now verify ownership at the service layer (not controllers). This avoids accidental IDORs and centralizes logic for easier auditing.

Key files to review (examples):
- `src/main/java/com/example/fitme/common/utils/SecurityUtils.java`
- `src/main/java/com/example/fitme/common/utils/OwnershipValidator.java`
- `src/main/java/com/example/fitme/module/user_workout_plan/service/impl/UserWorkoutPlanServiceImpl.java`
- `src/main/java/com/example/fitme/module/session/service/impl/SessionServiceImpl.java`

(See codebase for the full list of services updated.)

---

**Lombok builder warning and fix**

Warning encountered:

- `@SuperBuilder will ignore the initializing expression entirely. If you want the initializing expression to serve as default, add @Builder.Default.`

Fix applied:

- For collection fields (e.g., `List<WorkoutPlanExercise> exercises`) we added a `@Builder.Default` annotation to preserve the initializing expression when using Lombok builders.
- In a few places the fully-qualified `@lombok.Builder.Default` was used to avoid annotation import conflicts.

Example change (entity):

```java
@OneToMany(mappedBy = "workoutPlan", cascade = CascadeType.ALL, orphanRemoval = true)
@lombok.Builder.Default
private List<WorkoutPlanExercise> exercises = new ArrayList<>();
```

---

**DB reset & migration (development)**

Caution: the reset script below is destructive and intended for development only. Do not run it in production.

I added a development reset script at `db/reset_db.sql` that:
- Drops the legacy runtime tables (if present)
- Creates the `workout_log` table
- Keeps the system `workout_plan` template table

Sample commands to run the script on a local Postgres DB (Windows PowerShell):

```powershell
$env:PGPASSWORD = 'password'
psql -h localhost -U postgres -d fitme -f db/reset_db.sql
```

Or using connection URL / env vars, then restart the app (dev run):

```powershell
$env:DB_USERNAME='postgres'
$env:DB_PASSWORD='password'
.\mvnw.cmd -Dspring-boot.run.fork=false spring-boot:run
```

Alternative run from built jar:

```powershell
$env:DB_USERNAME='postgres'; $env:DB_PASSWORD='password'; java -jar target\fitme-0.0.1-SNAPSHOT.jar
```

If you prefer to migrate existing session data into `workout_log`, add a custom migration script that reads the old exercise/set tables and inserts corresponding `workout_log` rows — this requires careful mapping of set indices and timestamps.

---

**Files changed in this refactor (representative)**
- `src/main/java/com/example/fitme/module/workout/entity/WorkoutPlan.java` (removed fields, added builder defaults)
- `src/main/java/com/example/fitme/module/workout/repository/WorkoutPlanRepository.java` (queries updated)
- `src/main/java/com/example/fitme/module/workout/mapper/WorkoutPlanMapper.java` (DTO mapping updated)
- `src/main/java/com/example/fitme/module/workout/service/workoutplan/impl/SystemWorkoutPlanServiceImpl.java` (system APIs updated)
- `src/main/java/com/example/fitme/common/utils/OwnershipValidator.java` (new/updated)
- `src/main/java/com/example/fitme/module/session/service/impl/SessionServiceImpl.java` (uses `WorkoutLog`)
- `src/main/java/com/example/fitme/module/workout/entity/WorkoutLog.java` (new runtime entity)

---

**Next actions & recommendations**

- Create a Flyway (or Liquibase) migration to: drop old columns/tables and create `workout_log` with proper constraints. This is required for any production migration.
- If you need data preserved, write a migration that copies old runtime rows into `workout_log` with test runs on a copy of the production DB.
- Sweep the codebase for any remaining references to `isSystem` / `createdBy` and remove or adapt them.

---

If you want, I can:
- Add `db/reset_db.sql` into the repo now (destructive dev reset script).
- Generate a Flyway SQL migration skeleton for manual editing.
- Run the reset script against your local DB (if you confirm host/credentials and allow destructive action).


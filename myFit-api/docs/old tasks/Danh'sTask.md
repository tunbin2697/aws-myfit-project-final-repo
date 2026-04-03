# User Workout Plan — Task brief

Purpose: implement the user-side workout-plan tables and API used to store plans that users create or clone from system templates. This task only implements the plan layer (table + exercises); session work is already done.

Key tables and their purpose
- `user_workout_plan` — stores a user's plan metadata and ownership. Each row represents a plan owned by a user.
- `user_workout_plan_exercises` — stores exercises belonging to a user plan, with ordering and scheduling fields so the app can render the plan (day/week/order, sets, reps, rest, etc.).

How these interact with other entities
- `UserProfile` / `user` — each plan is owned by a `userId`; the plan module must read/verify the owning user.
- System exercise table — `user_workout_plan_exercises.exercises_id` references the system exercise definition (the exercise master data maintained by the workout module). Teams should copy that ID into user plan rows when cloning.
- Session module — sessions are runtime instances of plan execution. `user_workout_session` references `user_workout_plan` via `user_workout_plan_id` and should be able to create sessions from plan rows.
- Body/health data — optional: frontend may surface a user's metrics alongside plans (no direct FK required; access via `userId`).

Primary tasks (what you must implement)
1. Create the `user_workout_plan` table/entity to store user plans. Ensure it includes `userId`, active flag, and timestamps.
2. Create the `user_workout_plan_exercises` table/entity to store exercises for each plan with fields for sets, rep, rest_seconds, day/week indexes, and order_index.
3. Expose repository methods to fetch plans by `userId` and exercises by `user_workout_plan_id` (ordered by `order_index`).
4. Implement service methods and controller endpoints to: create a plan, list user plans, get plan with exercises, add/update/remove exercises.

Sub-tasks (small, explicit items)
- Drop `source_workout_plan_id` from `user_workout_plan` (do not re-add it). This column must be removed — cloning should copy necessary data into user tables rather than store a pointer.
- Add finder methods: `findByUserId(...)`, `findByUserWorkoutPlanIdOrderByOrderIndex(...)`.
- Add DTOs for create/update plan and add/update exercise. Use validation annotations where appropriate.
- Add DB migration script to create the two tables and remove the `source_workout_plan_id` column if present.
 - Implement `UserProfile` relationships (subtask): ensure `UserProfile` integrates with `GoalType`, `BodyMetric`, `HealthCalculation`, and `user_workout_plan`.
	 - Add/confirm `goalTypeId` on `UserProfile` or provide repository access to the user's goal.
	 - Ensure `BodyMetricRepository` exposes methods to fetch latest and all metrics by `userId`.
	 - Ensure `HealthCalculation` (or `HealCalculation`) repository exposes latest calculations by `userId`.
	 - Ensure `UserWorkoutPlanRepository` can fetch plans by `userId`.
	 - Acceptance: APIs can return a user's profile together with or linked to their goalType, latest body metric, latest health calculation, and list of plans.

Coding style & integration notes (follow existing modules)
- Extend `EntityBase` for entities (ID + timestamps) — keep the style consistent with other modules.
- Prefer storing UUID references (primitive `UUID` fields) rather than eager entity relationships.
- Use Lombok and `@SuperBuilder` where other entities use them.
- Controllers should return `ApiResponse<T>` consistent with `module.user_metric.controller` style and use `@RequiredArgsConstructor`.
- Keep service logic in a `service` package and use Spring `@Service` + transaction boundaries for modifications.

Acceptance checklist (what reviewers will verify)
- `user_workout_plan` exists and does NOT contain `source_workout_plan_id`.
- `user_workout_plan_exercises` exists and supports ordered exercises per plan.
- Repositories expose the required finder methods by `userId` and `user_workout_plan_id`.
- Controller endpoints exist for CRUD operations and return `ApiResponse<T>`.
- A DB migration script is present to create tables and drop `source_workout_plan_id` if needed.

## Frontend environment (quick note)

- The frontend includes a `.env` sample (`myfit/.env.sample`). Each developer should create their own `.env` from that sample and set:
	- `EXPO_PUBLIC_NODE_ENV=development`
	- `EXPO_PUBLIC_BACKEND_API_URL=http://<your-private-ip>:8080` (e.g. `http://192.168.1.9:8080`)
- Run Expo on your machine and ensure the app uses your private IP so the frontend can call the local backend.
- Test primarily with the **web** version (browser). Mobile testing requires extra setup — contact Bao Khang before testing on mobile devices.


# Frontend API Performance Issues

> **Audience:** Frontend team  
> **Date:** March 11, 2026  
> **Scope:** Workout-related screens and media loading  

---

## Overview

Two categories of performance problems have been identified through network observation:

1. **Redundant API calls** — certain endpoints are invoked multiple times per screen visit.
2. **Blocking image pre-fetch** — all image URLs are resolved before the screen renders any data.

Neither issue requires over-engineering to fix. Standard `useEffect` hygiene and deferring async work until after first render are sufficient.

---

## Issue 1 — `/api/workouts/exercises` called multiple times

### Observed behaviour

The endpoint is hit **more than once** when navigating to a screen that lists exercises — for example when opening `PlanEditScreen` or `PlanExercisePicker`, or when returning to `PlanDetailScreen` after adding an exercise.

### Root cause

**`PlanEditScreen`** (`src/screens/Workout/PlanEditScreen.tsx`)

The `load` callback is created with `useCallback([planId, editorDay])`. `editorDay` is read from Redux (`uiSlice.planEditorDay`).

```
// lines ~50-95 (PlanEditScreen.tsx)
const load = useCallback(async () => { ... getSystemExercises() ... }, [planId, editorDay]);

useEffect(() => { load(); }, [load]);                              // effect A — runs on every new load identity
useEffect(() => {
    const unsub = navigation.addListener('focus', () => { load(); });
    return unsub;
}, [navigation, load]);                                            // effect B — focus listener also re-registers on every new load identity
```

The problem is the **feedback cycle**:

1. `PlanExercisePicker` dispatches `setPlanEditorDay(dayOfWeek)` after adding an exercise.
2. This changes `editorDay` in Redux.
3. `PlanEditScreen` (still in the navigation stack) receives the new `editorDay` → the `load` callback identity changes.
4. Effect A fires immediately because `load` is in its dependency array → a new API call is made.
5. Separately, navigating back to `PlanEditScreen` fires the `focus` event → effect B's listener also calls `load()`.

Result: `getSystemExercises()` (and `getPlanById`) run **at least twice** and sometimes three times on a single return from the picker.

---

**`PlanDetailScreen`** (`src/screens/Workout/PlanDetailScreen.tsx`)

```
// lines ~130-155 (PlanDetailScreen.tsx)
const loadData = useCallback(async () => { ... getExercises() ... }, [planId, planName]);

useEffect(() => { loadData(); }, [loadData]);                     // effect A — mount + any identity change

const plansReloadKey = useSelector(s => s.ui.plansReloadKey);
useEffect(() => {
    if (!plan) return;
    loadData();                                                   // effect C — fires on any Redux bump
}, [plansReloadKey]);
```

`bumpPlansReloadKey()` is dispatched from `PlanExercisePicker` after a successful add. This triggers effect C, which runs `loadData()` (again including `getExercises()`). If `planName` also changed reference between renders, effect A fires simultaneously.

---

**`PlanExercisePicker`** (`src/screens/Workout/PlanExercisePicker.tsx`)

This screen has a clean and isolated `useEffect([], [])` load — it alone is not the problem. However, because it dispatches both `setPlanEditorDay` and `bumpPlansReloadKey` before calling `navigation.goBack()`, it is the **trigger** that destabilises the other two screens' callbacks, causing cascading re-fetches in the screens behind it in the stack.

---

## Issue 2 — `/api/user-workout-plans/{id}` called multiple times

### Observed behaviour

The plan detail endpoint is hit multiple times when entering `PlanDetailScreen` or `PlanEditScreen`, and again on returning from child screens.

### Root cause

The same `useCallback` + `useEffect` dependency patterns described in Issue 1 apply here. Both `loadData` (PlanDetailScreen) and `load` (PlanEditScreen) call `getPlanById(planId)` as their first action, so every extra invocation of the load function produces an extra call to this endpoint.

Specific compounding patterns:

- **PlanDetailScreen** registers both a mount effect *and* a `plansReloadKey` watcher. Both can fire within the same reconciliation cycle after a Redux update.
- **PlanEditScreen** registers both a mount effect *and* a `focus` listener, both referencing the same `load` callback. Because the focus listener is re-registered every time `load` changes identity, screens that are still mounted but not focused re-subscribe and call `load()` unnecessarily on identity change — effectively acting as a second mount effect.

---

## Issue 3 — Image API calls block the first screen render

### Observed behaviour

All `GET /api/images/exercise/{id}` calls fire **before** the screen paints any exercise data. The user sees a full-screen spinner until every single image URL is resolved.

### Root cause

**`workoutService.ts`** (`src/services/workoutService.ts`)

The three helper functions `attachExerciseImages`, `attachPlanSummaryImages`, and `attachPlanDetailImages` are called synchronously inside the service functions that fetch the main data:

```
// workoutService.ts
export const getExercises = async () => {
    const response = await api.get('/api/workouts/exercises');
    return attachExerciseImages(response.data.result ?? []);   // awaited — nothing is returned until ALL images are fetched
};
```

`attachExerciseImages` calls `getExerciseImageUrlMap` which, inside `mediaService.ts`, loops through all exercise IDs in batches of 8 and `await`s each batch sequentially before proceeding:

```
// mediaService.ts — getImageUrlMapByOwner
for (let i = 0; i < uniqueIds.length; i += MAX_CONCURRENT_IMAGE_REQUESTS) {
    const batch = uniqueIds.slice(i, i + MAX_CONCURRENT_IMAGE_REQUESTS);
    const batchEntries = await Promise.all(batch.map(...));   // each group of 8 waits for the previous one
    entries.push(...batchEntries);
}
```

Because the service functions `await` the image attachment before resolving, the calling screen's `setLoading(false)` never runs until the final image batch completes. For a list with many exercises this serialises the entire render behind tens of HTTP requests.

The same blocking pattern applies to `getWorkoutPlans` → `attachPlanSummaryImages` and `getWorkoutPlanById` → `attachPlanDetailImages`.

Additionally, screens like `PlanDetailScreen` and `PlanEditScreen` call `getExercises()` solely to build a name/image lookup map. This means the image pre-fetch for the full exercise list is triggered again on these screens even when `workoutService` already has the data cached elsewhere.

> **Note:** `mediaService` does implement an in-memory URL cache (`imageUrlCache`) and an in-flight deduplication map (`inflightRequests`). These help avoid redundant network hits once a URL is known. However they do not help with the blocking-render problem because the screen still waits for all URLs to be resolved on the first load.

---

## Summary Table

| # | Endpoint | Affected Files | Type |
|---|----------|---------------|------|
| 1 | `GET /api/workouts/exercises` | `PlanEditScreen.tsx`, `PlanDetailScreen.tsx`, `PlanExercisePicker.tsx` | Redundant calls from unstable `useCallback` dependencies + dual-trigger effects |
| 2 | `GET /api/user-workout-plans/{id}` | `PlanEditScreen.tsx`, `PlanDetailScreen.tsx` | Same as above — both APIs share the same load function |
| 3 | `GET /api/images/exercise/{id}` | `workoutService.ts`, `mediaService.ts` | Pre-fetch blocks first render; not lazy / deferred |

---

## Notes for the team

- Focus on the `useEffect` dependency arrays and `useCallback` dependency lists. The core rule is: **only put values in a dependency array if the effect or callback truly must re-run when they change**. State values controlled by Redux that are only needed _inside_ the callback (not as a signal to re-run) do not belong in the dependency array.
- For the focus-listener pattern, the common intent is "reload when the user returns to this screen." A focus listener alone is sufficient for that; pairing it with a `[load]` dependency that itself changes on Redux updates is redundant.
- For images, the general idea is: render the list/data first, then load images in the background and update each item as its URL arrives. The `imageUrlCache` already in `mediaService` is a solid foundation — the missing piece is not awaiting the images before returning the main payload to the screen.
- These are async coordination issues, not architectural ones. Keep fixes local and minimal.

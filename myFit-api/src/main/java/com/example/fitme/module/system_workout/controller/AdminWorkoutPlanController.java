package com.example.fitme.module.system_workout.controller;

import com.example.fitme.common.response.ApiResponse;
import com.example.fitme.module.system_workout.dto.workoutplan.*;
import com.example.fitme.module.system_workout.service.workoutplan.SystemWorkoutPlanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;


@RestController
@RequestMapping("/api/admin/workout-plans")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminWorkoutPlanController {

    private final SystemWorkoutPlanService systemWorkoutPlanService;
    private static final String BASE_PATH = "/api/admin/workout-plans";

    /**
     * Create new system workout plan.
     * POST /api/admin/workout-plans
     */
    @PostMapping
    public ResponseEntity<ApiResponse<WorkoutPlanResponse>> create(
            @Valid @RequestBody WorkoutPlanRequest request) {
        
        WorkoutPlanResponse response = systemWorkoutPlanService.create(request);
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<WorkoutPlanResponse>builder()
                        .code(1000)
                        .message("System workout plan created successfully")
                        .result(response)
                        .timestamp(Instant.now())
                        .path(BASE_PATH)
                        .build());
    }

    /**
     * Get all system workout plans (summary only).
     * GET /api/admin/workout-plans
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<WorkoutPlanSummaryResponse>>> getAll() {
        List<WorkoutPlanSummaryResponse> response = systemWorkoutPlanService.getAllSystemPlans();
        
        return ResponseEntity.ok(ApiResponse.<List<WorkoutPlanSummaryResponse>>builder()
                .code(1000)
                .message("System workout plans retrieved successfully")
                .result(response)
                .timestamp(Instant.now())
                .path(BASE_PATH)
                .build());
    }

    /**
     * Get system workout plans by goal type.
     * GET /api/admin/workout-plans/by-goal-type/{goalTypeId}
     */
    @GetMapping("/by-goal-type/{goalTypeId}")
    public ResponseEntity<ApiResponse<List<WorkoutPlanSummaryResponse>>> getByGoalType(
            @PathVariable UUID goalTypeId) {
        List<WorkoutPlanSummaryResponse> response = 
                systemWorkoutPlanService.getSystemPlansByGoalType(goalTypeId);
        
        return ResponseEntity.ok(ApiResponse.<List<WorkoutPlanSummaryResponse>>builder()
                .code(1000)
                .message("System workout plans retrieved successfully")
                .result(response)
                .timestamp(Instant.now())
                .path(BASE_PATH + "/by-goal-type/" + goalTypeId)
                .build());
    }

    /**
     * Get system workout plan by ID (with full exercise details).
     * GET /api/admin/workout-plans/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<WorkoutPlanResponse>> getById(@PathVariable UUID id) {
        WorkoutPlanResponse response = systemWorkoutPlanService.getById(id);
        
        return ResponseEntity.ok(ApiResponse.<WorkoutPlanResponse>builder()
                .code(1000)
                .message("System workout plan retrieved successfully")
                .result(response)
                .timestamp(Instant.now())
                .path(BASE_PATH + "/" + id)
                .build());
    }

    /**
     * Update existing system workout plan.
     * PUT /api/admin/workout-plans/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<WorkoutPlanResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody WorkoutPlanRequest request) {
        
        WorkoutPlanResponse response = systemWorkoutPlanService.update(id, request);
        
        return ResponseEntity.ok(ApiResponse.<WorkoutPlanResponse>builder()
                .code(1000)
                .message("System workout plan updated successfully")
                .result(response)
                .timestamp(Instant.now())
                .path(BASE_PATH + "/" + id)
                .build());
    }

    /**
     * Delete system workout plan.
     * DELETE /api/admin/workout-plans/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        systemWorkoutPlanService.delete(id);
        
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(1000)
                .message("System workout plan deleted successfully")
                .timestamp(Instant.now())
                .path(BASE_PATH + "/" + id)
                .build());
    }

    /**
     * Add exercise to a system workout plan.
     * POST /api/admin/workout-plans/{id}/exercises
     */
    @PostMapping("/{id}/exercises")
    public ResponseEntity<ApiResponse<WorkoutPlanResponse>> addExercise(
            @PathVariable UUID id,
            @Valid @RequestBody WorkoutPlanExerciseRequest request) {
        
        WorkoutPlanResponse response = systemWorkoutPlanService.addExercise(id, request);
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<WorkoutPlanResponse>builder()
                        .code(1000)
                        .message("Exercise added to workout plan successfully")
                        .result(response)
                        .timestamp(Instant.now())
                        .path(BASE_PATH + "/" + id + "/exercises")
                        .build());
    }

    /**
     * Update exercise in a system workout plan.
     * PUT /api/admin/workout-plans/{id}/exercises/{exerciseId}
     */
    @PutMapping("/{id}/exercises/{exerciseId}")
    public ResponseEntity<ApiResponse<WorkoutPlanExerciseResponse>> updateExercise(
            @PathVariable UUID id,
            @PathVariable UUID exerciseId,
            @Valid @RequestBody WorkoutPlanExerciseRequest request) {
        
        WorkoutPlanExerciseResponse response = 
                systemWorkoutPlanService.updateExercise(id, exerciseId, request);
        
        return ResponseEntity.ok(ApiResponse.<WorkoutPlanExerciseResponse>builder()
                .code(1000)
                .message("Exercise updated successfully")
                .result(response)
                .timestamp(Instant.now())
                .path(BASE_PATH + "/" + id + "/exercises/" + exerciseId)
                .build());
    }

    /**
     * Remove exercise from a system workout plan.
     * DELETE /api/admin/workout-plans/{id}/exercises/{exerciseId}
     */
    @DeleteMapping("/{id}/exercises/{exerciseId}")
    public ResponseEntity<ApiResponse<Void>> removeExercise(
            @PathVariable UUID id,
            @PathVariable UUID exerciseId) {
        
        systemWorkoutPlanService.removeExercise(id, exerciseId);
        
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(1000)
                .message("Exercise removed from workout plan successfully")
                .timestamp(Instant.now())
                .path(BASE_PATH + "/" + id + "/exercises/" + exerciseId)
                .build());
    }
}

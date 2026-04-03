package com.example.fitme.module.user_workout_plan.controller;

import com.example.fitme.common.response.ApiResponse;
import com.example.fitme.module.user_workout_plan.dto.UserWorkoutPlanExerciseRequest;
import com.example.fitme.module.user_workout_plan.dto.UserWorkoutPlanExerciseResponse;
import com.example.fitme.module.user_workout_plan.dto.UserWorkoutPlanRequest;
import com.example.fitme.module.user_workout_plan.dto.UserWorkoutPlanResponse;
import com.example.fitme.module.user_workout_plan.service.UserWorkoutPlanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import com.example.fitme.module.authentication.service.UserProfileService.UserProfileService;


@RestController
@RequestMapping("/api/user-workout-plans")
@RequiredArgsConstructor
public class UserWorkoutPlanController {

    private final UserWorkoutPlanService planService;
        private final UserProfileService userProfileService;
    private static final String BASE_PATH = "/api/user-workout-plans";

    // =========================================================================
    // Plan endpoints
    // =========================================================================

    /**
     * Create a new workout plan for the authenticated user.
     * POST /api/user-workout-plans/me
     */
    @PostMapping("/me")
    public ResponseEntity<ApiResponse<UserWorkoutPlanResponse>> createPlan(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody UserWorkoutPlanRequest request) {
        UUID userId = extractUserId(jwt);
        UserWorkoutPlanResponse result = planService.createPlan(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<UserWorkoutPlanResponse>builder()
                        .code(1000)
                        .message("Workout plan created successfully")
                        .result(result)
                        .timestamp(Instant.now())
                        .path(BASE_PATH + "/me")
                        .build());
    }

    /**
     * Clone a system plan (isSystem=true) into the authenticated user's account.
     * Data is copied — no pointer to the source is stored.
     * POST /api/user-workout-plans/me/clone/{systemPlanId}
     */
    @PostMapping("/me/clone/{systemPlanId}")
    public ResponseEntity<ApiResponse<UserWorkoutPlanResponse>> cloneFromSystemPlan(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID systemPlanId) {
        UUID userId = extractUserId(jwt);
        UserWorkoutPlanResponse result = planService.cloneFromSystemPlan(userId, systemPlanId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<UserWorkoutPlanResponse>builder()
                        .code(1000)
                        .message("System plan cloned successfully")
                        .result(result)
                        .timestamp(Instant.now())
                        .path(BASE_PATH + "/me/clone/" + systemPlanId)
                        .build());
    }

    /**
     * Get all plans belonging to the authenticated user (summary — no exercises).
     * GET /api/user-workout-plans/me
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<UserWorkoutPlanResponse>>> getMyPlans(
            @AuthenticationPrincipal Jwt jwt) {
        UUID userId = extractUserId(jwt);
        List<UserWorkoutPlanResponse> result = planService.getMyPlans(userId);
        return ResponseEntity.ok(ApiResponse.<List<UserWorkoutPlanResponse>>builder()
                .code(1000)
                .message("Workout plans retrieved successfully")
                .result(result)
                .timestamp(Instant.now())
                .path(BASE_PATH + "/me")
                .build());
    }

    /**
     * Get the currently active plan of the authenticated user.
     * GET /api/user-workout-plans/me/active
     */
    @GetMapping("/me/active")
    public ResponseEntity<ApiResponse<UserWorkoutPlanResponse>> getMyActivePlan(
            @AuthenticationPrincipal Jwt jwt) {
        UUID userId = extractUserId(jwt);
        UserWorkoutPlanResponse result = planService.getMyActivePlan(userId);
        return ResponseEntity.ok(ApiResponse.<UserWorkoutPlanResponse>builder()
                .code(1000)
                .message("Active workout plan retrieved successfully")
                .result(result)
                .timestamp(Instant.now())
                .path(BASE_PATH + "/me/active")
                .build());
    }

    /**
     * Get plan detail including all exercises (ordered by orderIndex).
     * GET /api/user-workout-plans/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserWorkoutPlanResponse>> getPlanById(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id) {
        UUID userId = extractUserId(jwt);
        UserWorkoutPlanResponse result = planService.getPlanById(userId, id);
        return ResponseEntity.ok(ApiResponse.<UserWorkoutPlanResponse>builder()
                .code(1000)
                .message("Workout plan retrieved successfully")
                .result(result)
                .timestamp(Instant.now())
                .path(BASE_PATH + "/" + id)
                .build());
    }

    /**
     * Update plan metadata (name, description, goalTypeId, isActive).
     * PUT /api/user-workout-plans/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserWorkoutPlanResponse>> updatePlan(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id,
            @Valid @RequestBody UserWorkoutPlanRequest request) {
        UUID userId = extractUserId(jwt);
        UserWorkoutPlanResponse result = planService.updatePlan(userId, id, request);
        return ResponseEntity.ok(ApiResponse.<UserWorkoutPlanResponse>builder()
                .code(1000)
                .message("Workout plan updated successfully")
                .result(result)
                .timestamp(Instant.now())
                .path(BASE_PATH + "/" + id)
                .build());
    }

    /**
     * Activate this plan and deactivate all other plans of the user.
     * Enforces the business rule: only one active plan per user.
     * PUT /api/user-workout-plans/{id}/activate
     */
    @PutMapping("/{id}/activate")
    public ResponseEntity<ApiResponse<UserWorkoutPlanResponse>> activatePlan(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id) {
        UUID userId = extractUserId(jwt);
        UserWorkoutPlanResponse result = planService.activatePlan(userId, id);
        return ResponseEntity.ok(ApiResponse.<UserWorkoutPlanResponse>builder()
                .code(1000)
                .message("Workout plan activated successfully")
                .result(result)
                .timestamp(Instant.now())
                .path(BASE_PATH + "/" + id + "/activate")
                .build());
    }

    /**
     * Delete a plan and all its exercises.
     * DELETE /api/user-workout-plans/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deletePlan(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id) {
        UUID userId = extractUserId(jwt);
        planService.deletePlan(userId, id);
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .code(1000)
                .message("Workout plan deleted successfully")
                .result("Deleted")
                .timestamp(Instant.now())
                .path(BASE_PATH + "/" + id)
                .build());
    }

    // =========================================================================
    // Exercise endpoints
    // =========================================================================

    /**
     * Add an exercise to a plan.
     * planId comes from @PathVariable — NOT from request body.
     * POST /api/user-workout-plans/{planId}/exercises
     */
    @PostMapping("/{planId}/exercises")
    public ResponseEntity<ApiResponse<UserWorkoutPlanExerciseResponse>> addExercise(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID planId,
            @Valid @RequestBody UserWorkoutPlanExerciseRequest request) {
        UUID userId = extractUserId(jwt);
        UserWorkoutPlanExerciseResponse result = planService.addExercise(userId, planId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<UserWorkoutPlanExerciseResponse>builder()
                        .code(1000)
                        .message("Exercise added to plan successfully")
                        .result(result)
                        .timestamp(Instant.now())
                        .path(BASE_PATH + "/" + planId + "/exercises")
                        .build());
    }

    /**
     * Get all exercises of a plan, ordered by orderIndex.
     * GET /api/user-workout-plans/{planId}/exercises
     */
    @GetMapping("/{planId}/exercises")
    public ResponseEntity<ApiResponse<List<UserWorkoutPlanExerciseResponse>>> getExercises(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID planId) {
        UUID userId = extractUserId(jwt);
        List<UserWorkoutPlanExerciseResponse> result = planService.getExercisesByPlan(userId, planId);
        return ResponseEntity.ok(ApiResponse.<List<UserWorkoutPlanExerciseResponse>>builder()
                .code(1000)
                .message("Plan exercises retrieved successfully")
                .result(result)
                .timestamp(Instant.now())
                .path(BASE_PATH + "/" + planId + "/exercises")
                .build());
    }

    /**
     * Update an exercise entry.
     * planId from @PathVariable is the authoritative source — not from body.
     * PUT /api/user-workout-plans/{planId}/exercises/{exerciseId}
     */
    @PutMapping("/{planId}/exercises/{exerciseId}")
    public ResponseEntity<ApiResponse<UserWorkoutPlanExerciseResponse>> updateExercise(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID planId,
            @PathVariable UUID exerciseId,
            @Valid @RequestBody UserWorkoutPlanExerciseRequest request) {
        UUID userId = extractUserId(jwt);
        UserWorkoutPlanExerciseResponse result = planService.updateExercise(userId, planId, exerciseId, request);
        return ResponseEntity.ok(ApiResponse.<UserWorkoutPlanExerciseResponse>builder()
                .code(1000)
                .message("Exercise updated successfully")
                .result(result)
                .timestamp(Instant.now())
                .path(BASE_PATH + "/" + planId + "/exercises/" + exerciseId)
                .build());
    }

    /**
     * Remove an exercise from a plan.
     * DELETE /api/user-workout-plans/{planId}/exercises/{exerciseId}
     */
    @DeleteMapping("/{planId}/exercises/{exerciseId}")
    public ResponseEntity<ApiResponse<String>> removeExercise(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID planId,
            @PathVariable UUID exerciseId) {
        UUID userId = extractUserId(jwt);
        planService.removeExercise(userId, planId, exerciseId);
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .code(1000)
                .message("Exercise removed successfully")
                .result("Deleted")
                .timestamp(Instant.now())
                .path(BASE_PATH + "/" + planId + "/exercises/" + exerciseId)
                .build());
    }

    // =========================================================================
    // Helper
    // =========================================================================

    /**
     * Extract the user's UUID from the JWT subject claim.
     * This is the ONLY source of userId for all operations — prevents IDOR.
     */
    private UUID extractUserId(Jwt jwt) {
                // JWT `sub` contains the Cognito user id (cognito sub). Map it to
                // the application's internal UUID via UserProfileService.
                String cognitoSub = jwt.getSubject();
                return userProfileService.getUserIdByCognitoId(cognitoSub);
    }
}

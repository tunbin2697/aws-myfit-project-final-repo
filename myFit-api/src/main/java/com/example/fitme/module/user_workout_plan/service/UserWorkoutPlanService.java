package com.example.fitme.module.user_workout_plan.service;

import com.example.fitme.module.user_workout_plan.dto.UserWorkoutPlanExerciseRequest;
import com.example.fitme.module.user_workout_plan.dto.UserWorkoutPlanExerciseResponse;
import com.example.fitme.module.user_workout_plan.dto.UserWorkoutPlanRequest;
import com.example.fitme.module.user_workout_plan.dto.UserWorkoutPlanResponse;

import java.util.List;
import java.util.UUID;

/**
 * Service contract for user workout plan management.
 * All methods receive userId extracted from JWT (not from client input).
 */
public interface UserWorkoutPlanService {

    // ===== Plan operations =====

    UserWorkoutPlanResponse createPlan(UUID userId, UserWorkoutPlanRequest request);

    /**
     * Clone a system plan (isSystem=true) into the user's own plan.
     * Copies name, description, goalTypeId and all exercises.
     * Does NOT store a pointer back to the source plan.
     */
    UserWorkoutPlanResponse cloneFromSystemPlan(UUID userId, UUID systemPlanId);

    List<UserWorkoutPlanResponse> getMyPlans(UUID userId);

    UserWorkoutPlanResponse getMyActivePlan(UUID userId);

    /** Returns plan detail including exercises list. */
    UserWorkoutPlanResponse getPlanById(UUID userId, UUID planId);

    UserWorkoutPlanResponse updatePlan(UUID userId, UUID planId, UserWorkoutPlanRequest request);

    /**
     * Set this plan as active; deactivates all other plans of the user.
     */
    UserWorkoutPlanResponse activatePlan(UUID userId, UUID planId);

    void deletePlan(UUID userId, UUID planId);

    // ===== Exercise operations =====

    UserWorkoutPlanExerciseResponse addExercise(UUID userId, UUID planId, UserWorkoutPlanExerciseRequest request);

    List<UserWorkoutPlanExerciseResponse> getExercisesByPlan(UUID userId, UUID planId);

    UserWorkoutPlanExerciseResponse updateExercise(UUID userId, UUID planId, UUID exerciseId, UserWorkoutPlanExerciseRequest request);

    void removeExercise(UUID userId, UUID planId, UUID exerciseId);
}

package com.example.fitme.module.system_workout.service.workoutplan;

import com.example.fitme.module.system_workout.dto.workoutplan.*;

import java.util.List;
import java.util.UUID;

public interface SystemWorkoutPlanService {
    
    /**
     * Create new system workout plan.
     */
    WorkoutPlanResponse create(WorkoutPlanRequest request);
    
    /**
     * Get all system workout plans (summary only).
     */
    List<WorkoutPlanSummaryResponse> getAllSystemPlans();
    
    /**
     * Get all system workout plans by goal type (summary only).
     */
    List<WorkoutPlanSummaryResponse> getSystemPlansByGoalType(UUID goalTypeId);
    
    /**
     * Get system workout plan by ID (with full exercise details).
     */
    WorkoutPlanResponse getById(UUID id);
    
    /**
     * Update existing system workout plan.
     */
    WorkoutPlanResponse update(UUID id, WorkoutPlanRequest request);
    
    /**
     * Delete system workout plan.
     */
    void delete(UUID id);
    
    /**
     * Add exercise to a system workout plan.
     */
    WorkoutPlanResponse addExercise(UUID workoutPlanId, WorkoutPlanExerciseRequest request);
    
    /**
     * Remove exercise from a system workout plan.
     */
    void removeExercise(UUID workoutPlanId, UUID workoutPlanExerciseId);
    
    /**
     * Update exercise configuration in a system workout plan.
     */
    WorkoutPlanExerciseResponse updateExercise(UUID workoutPlanId, UUID workoutPlanExerciseId, 
                                                WorkoutPlanExerciseRequest request);
}

package com.example.fitme.module.system_workout.controller;

import com.example.fitme.common.response.ApiResponse;
import com.example.fitme.module.system_workout.dto.exercise.CustomExerciseRequest;
import com.example.fitme.module.system_workout.dto.exercise.ExerciseResponse;
import com.example.fitme.module.system_workout.dto.musclegroup.MuscleGroupResponse;
import com.example.fitme.module.system_workout.dto.workoutplan.WorkoutPlanResponse;
import com.example.fitme.module.system_workout.dto.workoutplan.WorkoutPlanSummaryResponse;
import com.example.fitme.module.system_workout.service.exercise.ExerciseService;
import com.example.fitme.module.system_workout.service.musclegroup.MuscleGroupService;
import com.example.fitme.module.system_workout.service.workoutplan.SystemWorkoutPlanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/workouts")
@RequiredArgsConstructor
public class WorkoutController {

    private final SystemWorkoutPlanService systemWorkoutPlanService;
    private final ExerciseService exerciseService;
    private final MuscleGroupService muscleGroupService;
    private static final String BASE_PATH = "/api/workouts";

    // ========== Muscle Groups ==========

    /**
     * Get all muscle groups.
     * GET /api/workouts/muscle-groups
     */
    @GetMapping("/muscle-groups")
    public ResponseEntity<ApiResponse<List<MuscleGroupResponse>>> getAllMuscleGroups() {
        List<MuscleGroupResponse> response = muscleGroupService.getAll();
        
        return ResponseEntity.ok(ApiResponse.<List<MuscleGroupResponse>>builder()
                .code(1000)
                .message("Muscle groups retrieved successfully")
                .result(response)
                .timestamp(Instant.now())
                .path(BASE_PATH + "/muscle-groups")
                .build());
    }

    /**
     * Get muscle group by ID.
     * GET /api/workouts/muscle-groups/{id}
     */
    @GetMapping("/muscle-groups/{id}")
    public ResponseEntity<ApiResponse<MuscleGroupResponse>> getMuscleGroupById(@PathVariable UUID id) {
        MuscleGroupResponse response = muscleGroupService.getById(id);
        
        return ResponseEntity.ok(ApiResponse.<MuscleGroupResponse>builder()
                .code(1000)
                .message("Muscle group retrieved successfully")
                .result(response)
                .timestamp(Instant.now())
                .path(BASE_PATH + "/muscle-groups/" + id)
                .build());
    }

    // ========== Exercises ==========

    /**
     * Get all exercises.
     * GET /api/workouts/exercises
     */
    @GetMapping("/exercises")
    public ResponseEntity<ApiResponse<List<ExerciseResponse>>> getAllExercises() {
        List<ExerciseResponse> response = exerciseService.getAll();
        
        return ResponseEntity.ok(ApiResponse.<List<ExerciseResponse>>builder()
                .code(1000)
                .message("Exercises retrieved successfully")
                .result(response)
                .timestamp(Instant.now())
                .path(BASE_PATH + "/exercises")
                .build());
    }

    /**
     * Get exercise by ID.
     * GET /api/workouts/exercises/{id}
     */
    @GetMapping("/exercises/{id}")
    public ResponseEntity<ApiResponse<ExerciseResponse>> getExerciseById(@PathVariable UUID id) {
        ExerciseResponse response = exerciseService.getById(id);
        
        return ResponseEntity.ok(ApiResponse.<ExerciseResponse>builder()
                .code(1000)
                .message("Exercise retrieved successfully")
                .result(response)
                .timestamp(Instant.now())
                .path(BASE_PATH + "/exercises/" + id)
                .build());
    }

    /**
     * Get exercises by muscle group.
     * GET /api/workouts/exercises/by-muscle-group/{muscleGroupId}
     */
    @GetMapping("/exercises/by-muscle-group/{muscleGroupId}")
    public ResponseEntity<ApiResponse<List<ExerciseResponse>>> getExercisesByMuscleGroup(
            @PathVariable UUID muscleGroupId) {
        List<ExerciseResponse> response = exerciseService.getByMuscleGroupId(muscleGroupId);
        
        return ResponseEntity.ok(ApiResponse.<List<ExerciseResponse>>builder()
                .code(1000)
                .message("Exercises retrieved successfully")
                .result(response)
                .timestamp(Instant.now())
                .path(BASE_PATH + "/exercises/by-muscle-group/" + muscleGroupId)
                .build());
    }

    /**
     * Create a custom exercise.
     * POST /api/workouts/exercises/custom
     */
    @PostMapping("/exercises/custom")
    public ResponseEntity<ApiResponse<ExerciseResponse>> createCustomExercise(
            @Valid @RequestBody CustomExerciseRequest request) {
        ExerciseResponse response = exerciseService.createCustom(request);
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<ExerciseResponse>builder()
                .code(1000)
                .message("Custom exercise created successfully")
                .result(response)
                .timestamp(Instant.now())
                .path(BASE_PATH + "/exercises/custom")
                .build());
    }

    // ========== System Workout Plans (Templates) ==========

    /**
     * Get all system workout plan templates (summary only).
     * GET /api/workouts/plans
     */
    @GetMapping("/plans")
    public ResponseEntity<ApiResponse<List<WorkoutPlanSummaryResponse>>> getAllWorkoutPlans() {
        List<WorkoutPlanSummaryResponse> response = systemWorkoutPlanService.getAllSystemPlans();
        
        return ResponseEntity.ok(ApiResponse.<List<WorkoutPlanSummaryResponse>>builder()
                .code(1000)
                .message("Workout plan templates retrieved successfully")
                .result(response)
                .timestamp(Instant.now())
                .path(BASE_PATH + "/plans")
                .build());
    }

    /**
     * Get system workout plan templates by goal type.
     * GET /api/workouts/plans/by-goal-type/{goalTypeId}
     */
    @GetMapping("/plans/by-goal-type/{goalTypeId}")
    public ResponseEntity<ApiResponse<List<WorkoutPlanSummaryResponse>>> getWorkoutPlansByGoalType(
            @PathVariable UUID goalTypeId) {
        List<WorkoutPlanSummaryResponse> response = 
                systemWorkoutPlanService.getSystemPlansByGoalType(goalTypeId);
        
        return ResponseEntity.ok(ApiResponse.<List<WorkoutPlanSummaryResponse>>builder()
                .code(1000)
                .message("Workout plan templates retrieved successfully")
                .result(response)
                .timestamp(Instant.now())
                .path(BASE_PATH + "/plans/by-goal-type/" + goalTypeId)
                .build());
    }

    /**
     * Get system workout plan template by ID (with full exercise details).
     * GET /api/workouts/plans/{id}
     */
    @GetMapping("/plans/{id}")
    public ResponseEntity<ApiResponse<WorkoutPlanResponse>> getWorkoutPlanById(@PathVariable UUID id) {
        WorkoutPlanResponse response = systemWorkoutPlanService.getById(id);
        
        return ResponseEntity.ok(ApiResponse.<WorkoutPlanResponse>builder()
                .code(1000)
                .message("Workout plan template retrieved successfully")
                .result(response)
                .timestamp(Instant.now())
                .path(BASE_PATH + "/plans/" + id)
                .build());
    }
}

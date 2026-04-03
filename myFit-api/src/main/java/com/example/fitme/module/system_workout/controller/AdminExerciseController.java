package com.example.fitme.module.system_workout.controller;

import com.example.fitme.common.response.ApiResponse;
import com.example.fitme.module.system_workout.dto.exercise.ExerciseRequest;
import com.example.fitme.module.system_workout.dto.exercise.ExerciseResponse;
import com.example.fitme.module.system_workout.service.exercise.ExerciseService;
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
@RequestMapping("/api/admin/exercises")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminExerciseController {

    private final ExerciseService exerciseService;
    private static final String BASE_PATH = "/api/admin/exercises";

    /**
     * Create new exercise.
     * POST /api/admin/exercises
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ExerciseResponse>> create(
            @Valid @RequestBody ExerciseRequest request) {
        
        ExerciseResponse response = exerciseService.create(request);
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<ExerciseResponse>builder()
                        .code(1000)
                        .message("Exercise created successfully")
                        .result(response)
                        .timestamp(Instant.now())
                        .path(BASE_PATH)
                        .build());
    }

    /**
     * Get all exercises.
     * GET /api/admin/exercises
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ExerciseResponse>>> getAll() {
        List<ExerciseResponse> response = exerciseService.getAll();
        
        return ResponseEntity.ok(ApiResponse.<List<ExerciseResponse>>builder()
                .code(1000)
                .message("Exercises retrieved successfully")
                .result(response)
                .timestamp(Instant.now())
                .path(BASE_PATH)
                .build());
    }

    /**
     * Get exercise by ID.
     * GET /api/admin/exercises/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ExerciseResponse>> getById(@PathVariable UUID id) {
        ExerciseResponse response = exerciseService.getById(id);
        
        return ResponseEntity.ok(ApiResponse.<ExerciseResponse>builder()
                .code(1000)
                .message("Exercise retrieved successfully")
                .result(response)
                .timestamp(Instant.now())
                .path(BASE_PATH + "/" + id)
                .build());
    }

    /**
     * Get exercises by muscle group.
     * GET /api/admin/exercises/by-muscle-group/{muscleGroupId}
     */
    @GetMapping("/by-muscle-group/{muscleGroupId}")
    public ResponseEntity<ApiResponse<List<ExerciseResponse>>> getByMuscleGroup(
            @PathVariable UUID muscleGroupId) {
        List<ExerciseResponse> response = exerciseService.getByMuscleGroupId(muscleGroupId);
        
        return ResponseEntity.ok(ApiResponse.<List<ExerciseResponse>>builder()
                .code(1000)
                .message("Exercises retrieved successfully")
                .result(response)
                .timestamp(Instant.now())
                .path(BASE_PATH + "/by-muscle-group/" + muscleGroupId)
                .build());
    }

    /**
     * Update existing exercise.
     * PUT /api/admin/exercises/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ExerciseResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody ExerciseRequest request) {
        
        ExerciseResponse response = exerciseService.update(id, request);
        
        return ResponseEntity.ok(ApiResponse.<ExerciseResponse>builder()
                .code(1000)
                .message("Exercise updated successfully")
                .result(response)
                .timestamp(Instant.now())
                .path(BASE_PATH + "/" + id)
                .build());
    }

    /**
     * Delete exercise.
     * DELETE /api/admin/exercises/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        exerciseService.delete(id);
        
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(1000)
                .message("Exercise deleted successfully")
                .timestamp(Instant.now())
                .path(BASE_PATH + "/" + id)
                .build());
    }
}

package com.example.fitme.module.system_workout.service.exercise;

import com.example.fitme.module.system_workout.dto.exercise.CustomExerciseRequest;
import com.example.fitme.module.system_workout.dto.exercise.ExerciseRequest;
import com.example.fitme.module.system_workout.dto.exercise.ExerciseResponse;

import java.util.List;
import java.util.UUID;


public interface ExerciseService {
    
    /**
     * Create new exercise.
     */
    ExerciseResponse create(ExerciseRequest request);

    /**
     * Create custom exercise for user (with default muscle group).
     */
    ExerciseResponse createCustom(CustomExerciseRequest request);
    
    /**
     * Get all exercises.
     */
    List<ExerciseResponse> getAll();
    
    /**
     * Get exercise by ID.
     */
    ExerciseResponse getById(UUID id);
    
    /**
     * Get exercises by muscle group ID.
     */
    List<ExerciseResponse> getByMuscleGroupId(UUID muscleGroupId);
    
    /**
     * Update existing exercise.
     */
    ExerciseResponse update(UUID id, ExerciseRequest request);
    
    /**
     * Delete exercise.
     */
    void delete(UUID id);
}

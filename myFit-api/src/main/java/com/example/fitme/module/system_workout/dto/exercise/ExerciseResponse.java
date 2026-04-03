package com.example.fitme.module.system_workout.dto.exercise;

import com.example.fitme.module.system_workout.dto.musclegroup.MuscleGroupResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response DTO for exercise.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExerciseResponse {
    private UUID id;
    private String name;
    private String description;
    private String equipment;
    private MuscleGroupResponse muscleGroup;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

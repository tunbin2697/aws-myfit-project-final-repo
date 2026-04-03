package com.example.fitme.module.system_workout.dto.exercise;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Request DTO for creating/updating exercises.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExerciseRequest {

    @NotBlank(message = "Exercise name cannot be blank")
    @Size(max = 150, message = "Exercise name must not exceed 150 characters")
    private String name;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    @Size(max = 255, message = "Equipment must not exceed 255 characters")
    private String equipment;

    @NotNull(message = "Muscle group ID cannot be blank")
    private UUID muscleGroupId;
}

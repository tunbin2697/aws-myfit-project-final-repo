package com.example.fitme.module.system_workout.dto.exercise;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for user-created custom exercises.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomExerciseRequest {
    @NotBlank(message = "Exercise name cannot be blank")
    @Size(max = 150, message = "Exercise name must not exceed 150 characters")
    private String name;
}

package com.example.fitme.module.system_workout.dto.workoutplan;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

/**
 * Request DTO for creating/updating workout plans.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkoutPlanRequest {

    @NotBlank(message = "Workout plan name cannot be blank")
    @Size(max = 150, message = "Workout plan name must not exceed 150 characters")
    private String name;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    @NotNull(message = "Workout plan goal type ID cannot be blank")
    private UUID goalTypeId;

    @Valid
    private List<WorkoutPlanExerciseRequest> exercises;
}

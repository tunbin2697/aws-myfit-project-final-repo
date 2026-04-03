package com.example.fitme.module.user_workout_plan.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Request DTO for adding or updating an exercise in a user workout plan.
 *
 * userWorkoutPlanId is intentionally absent — the controller passes it
 * from @PathVariable to avoid conflicting sources of truth.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserWorkoutPlanExerciseRequest {

    @NotNull(message = "Exercise ID cannot be null")
    private UUID exerciseId;

    /** Day of week: 1=Monday … 7=Sunday */
    private Integer dayOfWeek;

    @Min(value = 1, message = "Sets must be at least 1")
    private Integer sets;

    @Min(value = 1, message = "Reps must be at least 1")
    private Integer reps;

    @Min(value = 0, message = "Rest seconds cannot be negative")
    private Integer restSeconds;

    @Min(value = 0, message = "Day index cannot be negative")
    private Integer dayIndex;

    @Min(value = 0, message = "Week index cannot be negative")
    private Integer weekIndex;

    @Min(value = 0, message = "Order index cannot be negative")
    private Integer orderIndex;
}

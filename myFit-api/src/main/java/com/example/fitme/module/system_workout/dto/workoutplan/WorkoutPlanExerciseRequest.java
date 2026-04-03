package com.example.fitme.module.system_workout.dto.workoutplan;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Request DTO for adding an exercise to a workout plan.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkoutPlanExerciseRequest {

    @NotNull(message = "Exercise ID is required")
    private UUID exerciseId;

    @NotNull(message = "Day of week is required")
    @Min(value = 1, message = "Day of week must be at least 1")
    private Integer dayOfWeek;

    @NotNull(message = "Sets is required")
    @Min(value = 1, message = "Sets must be at least 1")
    private Integer sets;

    @NotNull(message = "Reps is required")
    @Min(value = 1, message = "Reps must be at least 1")
    private Integer reps;

    @NotNull(message = "Rest seconds is required")
    @Min(value = 0, message = "Rest seconds cannot be negative")
    private Integer restSeconds;

    @NotNull(message = "Day index is required")
    @Min(value = 0, message = "Day index cannot be negative")
    private Integer dayIndex;

    @NotNull(message = "Week index is required")
    @Min(value = 0, message = "Week index cannot be negative")
    private Integer weekIndex;

    @NotNull(message = "Order index is required")
    @Min(value = 0, message = "Order index cannot be negative")
    private Integer orderIndex;
}

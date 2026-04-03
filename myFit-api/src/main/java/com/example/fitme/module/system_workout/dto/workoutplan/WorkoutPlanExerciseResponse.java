package com.example.fitme.module.system_workout.dto.workoutplan;

import com.example.fitme.module.system_workout.dto.exercise.ExerciseResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Response DTO for workout plan exercise.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkoutPlanExerciseResponse {
    private UUID id;
    private ExerciseResponse exercise;
    private Integer dayOfWeek;
    private Integer sets;
    private Integer reps;
    private Integer restSeconds;
    private Integer dayIndex;
    private Integer weekIndex;
    private Integer orderIndex;
}

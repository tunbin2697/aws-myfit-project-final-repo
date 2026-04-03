package com.example.fitme.module.user_workout_plan.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response DTO for an exercise entry within a user workout plan.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserWorkoutPlanExerciseResponse {

    private UUID id;
    private UUID userWorkoutPlanId;
    private UUID exerciseId;
    private Integer dayOfWeek;
    private Integer sets;
    private Integer reps;
    private Integer restSeconds;
    private Integer dayIndex;
    private Integer weekIndex;
    private Integer orderIndex;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

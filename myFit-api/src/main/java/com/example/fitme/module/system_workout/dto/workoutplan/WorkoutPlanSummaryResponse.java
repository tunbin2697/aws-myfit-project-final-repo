package com.example.fitme.module.system_workout.dto.workoutplan;

import com.example.fitme.module.system_goal.dto.GoalTypeResponse;
 
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Summary response DTO for workout plan (without exercises).
 * Used for list endpoints to reduce payload size.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkoutPlanSummaryResponse {
    private UUID id;
    private String name;
    private String description;
    private GoalTypeResponse goalType;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

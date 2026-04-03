package com.example.fitme.module.system_workout.dto.workoutplan;

import com.example.fitme.module.system_goal.dto.GoalTypeResponse;
 
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Response DTO for workout plan.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkoutPlanResponse {
    private UUID id;
    private String name;
    private String description;
    private GoalTypeResponse goalType;
    private List<WorkoutPlanExerciseResponse> exercises;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

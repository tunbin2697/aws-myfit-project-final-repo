package com.example.fitme.module.user_workout_plan.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Response DTO for a user workout plan.
 * The 'exercises' list is only populated on detail (GET /{id}) calls.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserWorkoutPlanResponse {

    private UUID id;
    private UUID userId;
    private String name;
    private String description;
    private UUID goalTypeId;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /** Populated only on detail requests, null on list requests. */
    private List<UserWorkoutPlanExerciseResponse> exercises;
}

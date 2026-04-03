package com.example.fitme.module.user_workout_plan.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Request DTO for creating or updating a user workout plan.
 * userId is intentionally absent — the backend extracts it from the JWT token.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserWorkoutPlanRequest {

    @NotBlank(message = "Plan name cannot be blank")
    @Size(max = 150, message = "Plan name must not exceed 150 characters")
    private String name;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    /** Optional: reference to a GoalType (e.g. weight loss, muscle gain). */
    private UUID goalTypeId;

    /** If null, defaults to true on creation. */
    private Boolean isActive;
}

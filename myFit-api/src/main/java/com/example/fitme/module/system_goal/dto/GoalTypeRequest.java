package com.example.fitme.module.system_goal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for creating/updating goal types.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoalTypeRequest {

    @NotBlank(message = "Goal name cannot be blank")
    @Size(max = 100, message = "Goal name must not exceed 100 characters")
    private String name;

    @NotBlank(message = "Description cannot be blank")
    @Size(max = 255, message = "Description must not exceed 255 characters")
    private String description;
}

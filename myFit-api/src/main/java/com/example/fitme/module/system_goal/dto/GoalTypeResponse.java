package com.example.fitme.module.system_goal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response DTO for goal type.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoalTypeResponse {
    private UUID id;
    private String name;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

package com.example.fitme.module.system_workout.dto.musclegroup;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response DTO for muscle group.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MuscleGroupResponse {
    private UUID id;
    private String name;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

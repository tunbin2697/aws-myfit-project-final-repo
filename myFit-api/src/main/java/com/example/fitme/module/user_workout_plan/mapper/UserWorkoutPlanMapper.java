package com.example.fitme.module.user_workout_plan.mapper;

import com.example.fitme.module.user_workout_plan.dto.UserWorkoutPlanRequest;
import com.example.fitme.module.user_workout_plan.dto.UserWorkoutPlanResponse;
import com.example.fitme.module.user_workout_plan.entity.UserWorkoutPlan;
import com.example.fitme.module.authentication.entity.UserProfile;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Mapper for UserWorkoutPlan entity and DTOs.
 */
@Component
public class UserWorkoutPlanMapper {

    /**
     * Convert request DTO + userId (from JWT) to entity.
     */
    public UserWorkoutPlan toEntity(UUID userId, UserWorkoutPlanRequest request) {
        return UserWorkoutPlan.builder()
                .user(UserProfile.builder().id(userId).build())
                .name(request.getName())
                .description(request.getDescription())
                .goalTypeId(request.getGoalTypeId())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();
    }

    /**
     * Convert entity to response DTO (without exercises list).
     */
    public UserWorkoutPlanResponse toResponse(UserWorkoutPlan entity) {
        return UserWorkoutPlanResponse.builder()
                .id(entity.getId())
                .userId(entity.getUser() != null ? entity.getUser().getId() : null)
                .name(entity.getName())
                .description(entity.getDescription())
                .goalTypeId(entity.getGoalTypeId())
                .isActive(entity.getIsActive())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    /**
     * Apply update request to existing entity.
     */
    public void updateEntity(UserWorkoutPlan entity, UserWorkoutPlanRequest request) {
        entity.setName(request.getName());
        entity.setDescription(request.getDescription());
        entity.setGoalTypeId(request.getGoalTypeId());
        if (request.getIsActive() != null) {
            entity.setIsActive(request.getIsActive());
        }
    }
}

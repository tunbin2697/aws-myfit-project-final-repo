package com.example.fitme.module.system_goal.mapper;

import com.example.fitme.module.system_goal.dto.GoalTypeRequest;
import com.example.fitme.module.system_goal.dto.GoalTypeResponse;
import com.example.fitme.module.system_goal.entity.GoalType;
import org.springframework.stereotype.Component;

/**
 * Mapper for GoalType entity and DTOs.
 */
@Component
public class GoalTypeMapper {

    /**
     * Convert Request DTO to Entity.
     */
    public GoalType toEntity(GoalTypeRequest request) {
        return GoalType.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();
    }

    /**
     * Update existing entity from Request DTO.
     */
    public void updateEntity(GoalType entity, GoalTypeRequest request) {
        entity.setName(request.getName());
        entity.setDescription(request.getDescription());
    }

    /**
     * Convert Entity to Response DTO.
     */
    public GoalTypeResponse toResponse(GoalType entity) {
        return GoalTypeResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}

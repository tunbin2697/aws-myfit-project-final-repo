package com.example.fitme.module.system_workout.mapper;

import com.example.fitme.module.system_workout.dto.musclegroup.MuscleGroupRequest;
import com.example.fitme.module.system_workout.dto.musclegroup.MuscleGroupResponse;
import com.example.fitme.module.system_workout.entity.MuscleGroup;
import org.springframework.stereotype.Component;

/**
 * Mapper for MuscleGroup entity and DTOs.
 */
@Component
public class MuscleGroupMapper {

    /**
     * Convert Request DTO to Entity.
     */
    public MuscleGroup toEntity(MuscleGroupRequest request) {
        return MuscleGroup.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();
    }

    /**
     * Update existing entity from Request DTO.
     */
    public void updateEntity(MuscleGroup entity, MuscleGroupRequest request) {
        entity.setName(request.getName());
        entity.setDescription(request.getDescription());
    }

    /**
     * Convert Entity to Response DTO.
     */
    public MuscleGroupResponse toResponse(MuscleGroup entity) {
        if (entity == null) {
            return null;
        }
        return MuscleGroupResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}

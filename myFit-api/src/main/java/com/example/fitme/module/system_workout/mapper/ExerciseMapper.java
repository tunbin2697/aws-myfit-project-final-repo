package com.example.fitme.module.system_workout.mapper;

import com.example.fitme.module.system_workout.dto.exercise.ExerciseRequest;
import com.example.fitme.module.system_workout.dto.exercise.ExerciseResponse;
import com.example.fitme.module.system_workout.entity.Exercise;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Mapper for Exercise entity and DTOs.
 */
@Component
@RequiredArgsConstructor
public class ExerciseMapper {

    private final MuscleGroupMapper muscleGroupMapper;

    /**
     * Convert Request DTO to Entity.
     * Note: MuscleGroup should be set separately after fetching from repository.
     */
    public Exercise toEntity(ExerciseRequest request) {
        return Exercise.builder()
                .name(request.getName())
                .description(request.getDescription())
                .equipment(request.getEquipment())
                .build();
    }

    /**
     * Update existing entity from Request DTO.
     */
    public void updateEntity(Exercise entity, ExerciseRequest request) {
        entity.setName(request.getName());
        entity.setDescription(request.getDescription());
        entity.setEquipment(request.getEquipment());
    }

    /**
     * Convert Entity to Response DTO.
     */
    public ExerciseResponse toResponse(Exercise entity) {
        if (entity == null) {
            return null;
        }
        return ExerciseResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .equipment(entity.getEquipment())
                .muscleGroup(muscleGroupMapper.toResponse(entity.getMuscleGroup()))
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}

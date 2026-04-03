package com.example.fitme.module.user_metric.mapper;

import com.example.fitme.module.user_metric.dto.bodyMetric.BodyMetricRequest;
import com.example.fitme.module.user_metric.dto.bodyMetric.BodyMetricResponse;
import com.example.fitme.module.user_metric.entity.BodyMetric;
import org.springframework.stereotype.Component;

/**
 * Mapper for BodyMetric entity and DTOs.
 * Handles conversion between entity and DTOs with proper type conversions.
 */
@Component
public class BodyMetricMapper {

    /**
     * Convert Request DTO to Entity.
     * Note: ID and timestamps are managed by JPA.
     * 
     * @param request The request DTO
     * @return BodyMetric entity
     */
    public BodyMetric toEntity(BodyMetricRequest request) {
        return BodyMetric.builder()
                .user(com.example.fitme.module.authentication.entity.UserProfile.builder().id(request.getUserId()).build())
                .heightCm(request.getHeightCm().floatValue())
                .weightKg(request.getWeightKg().floatValue())
                .age(request.getAge())
                .gender(request.getGender())
                .activityLevel(request.getActivityLevel())
                .build();
    }

    /**
     * Convert Entity to Response DTO.
     * 
     * @param entity The body metric entity
     * @return BodyMetricResponse DTO
     */
    public BodyMetricResponse toResponse(BodyMetric entity) {
        return BodyMetricResponse.builder()
                .id(entity.getId())
                .userId(entity.getUser() != null ? entity.getUser().getId() : null)
            .gender(entity.getGender())
                .heightCm(entity.getHeightCm().doubleValue())
                .weightKg(entity.getWeightKg().doubleValue())
                .age(entity.getAge())
                .activityLevel(entity.getActivityLevel())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    /**
     * Update existing entity with data from request.
     * Used for PUT operations.
     * 
     * @param entity The entity to update
     * @param request The request with new data
     */
    public void updateEntity(BodyMetric entity, BodyMetricRequest request) {
        entity.setHeightCm(request.getHeightCm().floatValue());
        entity.setWeightKg(request.getWeightKg().floatValue());
        entity.setAge(request.getAge());
        entity.setActivityLevel(request.getActivityLevel());
        entity.setGender(request.getGender());
    }
}

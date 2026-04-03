package com.example.fitme.module.user_metric.dto.bodyMetric;

import com.example.fitme.module.user_metric.enumType.ActivityLevel;
import com.example.fitme.module.user_metric.enumType.Gender;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response DTO for body metrics.
 * Contains all body metric data including timestamps.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BodyMetricResponse {
    private UUID id;
    private UUID userId;
    private Gender gender;
    private Double heightCm;
    private Double weightKg;
    private Integer age;
    private ActivityLevel activityLevel;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

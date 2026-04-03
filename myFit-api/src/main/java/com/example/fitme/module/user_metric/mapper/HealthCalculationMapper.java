package com.example.fitme.module.user_metric.mapper;

import com.example.fitme.module.user_metric.dto.health.HealthCalculationResponse;
import com.example.fitme.module.user_metric.dto.health.MacrosResult;
import com.example.fitme.module.user_metric.entity.HealthCalculation;
import com.example.fitme.module.user_metric.util.NumberFormatter;
import com.example.fitme.module.user_metric.util.HealthMetricsCalculator;
import org.springframework.stereotype.Component;

/**
 * Mapper for HealthCalculation entity and DTOs.
 * Applies proper rounding when converting to response DTO.
 */
@Component
public class HealthCalculationMapper {

    /**
     * Convert Entity to Response DTO with proper rounding.
     * - BMI, BMR, TDEE: 1 decimal
     * - Macros (grams): 2 decimals
     */
    public HealthCalculationResponse toResponse(HealthCalculation entity) {
        // Calculate macros from stored TDEE (macros are not persisted)
        HealthMetricsCalculator.MacrosResult calc = HealthMetricsCalculator.calculateMacros(entity.getTdee().doubleValue(), entity.getGoalType().name());
        MacrosResult macros = MacrosResult.builder()
            .protein(NumberFormatter.round2(calc.getProtein()))
            .carbs(NumberFormatter.round2(calc.getCarbs()))
            .fat(NumberFormatter.round2(calc.getFat()))
            .build();
        // Input snapshot comes from the associated BodyMetric when available
        var bm = entity.getBodyMetric();
        Double height = bm != null && bm.getHeightCm() != null ? bm.getHeightCm().doubleValue() : null;
        Double weight = bm != null && bm.getWeightKg() != null ? bm.getWeightKg().doubleValue() : null;
        Integer age = bm != null ? bm.getAge() : null;
        var activityLevel = bm != null ? bm.getActivityLevel() : null;
        var gender = bm != null ? bm.getGender() : null;

        return HealthCalculationResponse.builder()
                .id(entity.getId())
                .userId(entity.getUser() != null ? entity.getUser().getId() : null)
                // Input data
                .gender(gender)
                .age(age)
                .height(height)
                .weight(weight)
                .activityLevel(activityLevel)
                // Calculated metrics (rounded to 1 decimal)
                .bmi(NumberFormatter.round1(entity.getBmi().doubleValue()))
                .bmr(NumberFormatter.round1(entity.getBmr().doubleValue()))
                .tdee(NumberFormatter.round1(entity.getTdee().doubleValue()))
                .macros(macros)
                // Metadata
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}

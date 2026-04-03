package com.example.fitme.module.user_metric.dto.health;

import com.example.fitme.module.user_metric.enumType.ActivityLevel;
import com.example.fitme.module.user_metric.enumType.Gender;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response DTO for health calculation with all input data and calculated results.
 * All numeric values are properly rounded for UI display.
 * Macros are calculated from TDEE (no goal-based calorie adjustment).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HealthCalculationResponse {
    private UUID id;
    private UUID userId;
    
    // Input data
    private Gender gender;
    private Integer age;
    private Double height;        // cm
    private Double weight;        // kg
    private ActivityLevel activityLevel;
    
    // Calculated metrics (rounded)
    private Double bmi;           // 1 decimal
    private Double bmr;           // 1 decimal
    private Double tdee;          // 1 decimal
    
    // Macros (rounded to 2 decimals, calculated from TDEE)
    private MacrosResult macros;
    
    // Metadata
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

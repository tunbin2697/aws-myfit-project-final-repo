package com.example.fitme.module.user_metric.dto.health;

import com.example.fitme.module.user_metric.enumType.ActivityLevel;
import com.example.fitme.module.user_metric.enumType.Gender;
import com.example.fitme.module.user_metric.enumType.GoalTypes;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Request DTO for calculating health metrics.
 * Contains all input data needed for BMI, BMR, TDEE, and Macros calculation.
 * No goal required - macros calculated from TDEE only.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CalculateMetricsRequest {

    @NotNull(message = "User ID cannot be null")
    private UUID userId;

    @NotNull(message = "Gender cannot be null")
    private Gender gender;

    @NotNull(message = "Age cannot be null")
    @Min(value = 10, message = "Age must be at least 10")
    @Max(value = 120, message = "Age must not exceed 120")
    private Integer age;

    @NotNull(message = "Height cannot be null")
    @DecimalMin(value = "50.0", message = "Height must be at least 50 cm")
    @DecimalMax(value = "300.0", message = "Height must not exceed 300 cm")
    private Double height; // cm

    @NotNull(message = "Weight cannot be null")
    @DecimalMin(value = "20.0", message = "Weight must be at least 20 kg")
    @DecimalMax(value = "500.0", message = "Weight must not exceed 500 kg")
    private Double weight; // kg

    @NotNull(message = "Activity level cannot be null")
    private ActivityLevel activityLevel;

    @NotNull
    private GoalTypes goalTypes;

}

package com.example.fitme.module.user_metric.dto.bodyMetric;

import jakarta.validation.constraints.*;
import com.example.fitme.module.user_metric.enumType.ActivityLevel;
import com.example.fitme.module.user_metric.enumType.Gender;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Request DTO for creating or updating body metrics.
 * Contains user's physical measurements.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BodyMetricRequest {

    @NotNull(message = "User ID cannot be null")
    private UUID userId;

    @NotNull(message = "Height cannot be null")
    @DecimalMin(value = "50.0", message = "Height must be at least 50 cm")
    @DecimalMax(value = "300.0", message = "Height must not exceed 300 cm")
    private Double heightCm;

    @NotNull(message = "Weight cannot be null")
    @DecimalMin(value = "20.0", message = "Weight must be at least 20 kg")
    @DecimalMax(value = "500.0", message = "Weight must not exceed 500 kg")
    private Double weightKg;

    @NotNull(message = "Age cannot be null")
    @Min(value = 10, message = "Age must be at least 10")
    private Integer age;

    @NotNull(message = "Gender cannot be null")
    private Gender gender;

    @NotNull(message = "Activity level cannot be null")
    private ActivityLevel activityLevel;

    @NotBlank
    private String goalTypeName;
}

package com.example.fitme.module.user_metric.entity;

import com.example.fitme.common.entity.EntityBase;
import com.example.fitme.module.authentication.entity.UserProfile;
import com.example.fitme.module.user_metric.enumType.ActivityLevel;
import com.example.fitme.module.user_metric.enumType.Gender;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/**
 * Body metric entity for tracking user's physical measurements.
 * Stores height, weight, age and activity level used for calculations.
 * Relationship: Many BodyMetric -> One User (via JPA relation to UserProfile)
 */
@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@Table(name = "body_metric")
public class BodyMetric extends EntityBase {

    @NotNull(message = "User is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserProfile user;

    @NotNull(message = "Height cannot be null")
    @Min(value = 50, message = "Height must be at least 50 cm")
    @Column(name = "height_cm", nullable = false)
    private Float heightCm;

    @NotNull(message = "Weight cannot be null")
    @Min(value = 20, message = "Weight must be at least 20 kg")
    @Column(name = "weight_kg", nullable = false)
    private Float weightKg;

    @NotNull(message = "Age cannot be null")
    @Min(value = 10, message = "Age must be at least 10")
    @Column(nullable = false)
    private Integer age;

    @NotNull(message = "Gender cannot be null")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Gender gender;

    @NotNull(message = "Activity level cannot be null")
    @Enumerated(EnumType.STRING)
    @Column(name = "activity_level", nullable = false)
    private ActivityLevel activityLevel;
}

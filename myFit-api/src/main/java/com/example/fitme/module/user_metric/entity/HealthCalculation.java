package com.example.fitme.module.user_metric.entity;

import com.example.fitme.common.entity.EntityBase;
import com.example.fitme.module.authentication.entity.UserProfile;
import com.example.fitme.module.user_metric.enumType.GoalTypes;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/**
 * Health calculation results storing calculated metrics (bmi, bmr, tdee).
 * Inputs (height, weight, age, activityLevel) are stored in BodyMetric.
 * HealthCalculation belongs to a User and optionally references the BodyMetric
 * snapshot used to compute the values.
 */
@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@Table(name = "health_calculation")
public class HealthCalculation extends EntityBase {

    @NotNull(message = "User is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserProfile user;

    /**
     * The body metric snapshot used for this calculation (optional but preferred).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "body_metric_id")
    private BodyMetric bodyMetric;

    // Calculated metrics (stored as Float for DB efficiency)
    @Column(nullable = false)
    private Float bmi;

    @Column(nullable = false)
    private Float bmr;

    @Column(nullable = false)
    private Float tdee;

    @Column
    private GoalTypes goalType;
}

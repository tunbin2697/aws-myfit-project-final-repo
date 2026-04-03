package com.example.fitme.module.user_workout_plan.entity;

import com.example.fitme.common.entity.EntityBase;
import com.example.fitme.module.authentication.entity.UserProfile;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import lombok.Builder;
import org.hibernate.annotations.SQLRestriction;

import java.util.UUID;

/**
 * User's personal workout plan.
 * Can be created from scratch or cloned from a system plan template.
 * 
 * NOTE: source_workout_plan_id is intentionally omitted.
 * When cloning, data is copied directly into this table.
 * 
 * Business rule: each user may have at most ONE plan with isActive=true.
 */
@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@SQLRestriction("is_deleted = false")
@Table(name = "user_workout_plan")
public class UserWorkoutPlan extends EntityBase {

    @NotNull(message = "User is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserProfile user;

    @NotBlank(message = "Plan name cannot be blank")
    @Size(max = 150, message = "Plan name must not exceed 150 characters")
    @Column(nullable = false, length = 150)
    private String name;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    @Column(length = 1000)
    private String description;

    /**
     * Optional reference to the GoalType this plan targets.
     * Stored as UUID (no FK constraint) to keep modules decoupled.
     */
    @Column(name = "goal_type_id")
    private UUID goalTypeId;

    /**
     * Whether this plan is currently active for the user.
     * Business rule: only ONE plan per user can be active at a time.
     */
    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Builder.Default
    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;
}

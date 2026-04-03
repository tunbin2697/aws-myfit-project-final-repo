package com.example.fitme.module.user_workout_plan.entity;

import com.example.fitme.common.entity.EntityBase;
import com.example.fitme.module.system_workout.entity.Exercise;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/**
 * Exercise entry within a user's personal workout plan.
 * Copied from system plan exercises when cloning, or manually added.
 *
 * orderIndex is used for stable ordering within a day/week slot.
 */
@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@Table(name = "user_workout_plan_exercises")
public class UserWorkoutPlanExercise extends EntityBase {

    @NotNull(message = "User workout plan is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_workout_plan_id", nullable = false)
    private UserWorkoutPlan userWorkoutPlan;

    /**
     * Reference to the system exercise definition (exercises table).
     */
    @NotNull(message = "Exercise is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exercises_id", nullable = false)
    private Exercise exercise;

    /** Day of week: 1 = Monday … 7 = Sunday */
    @Column(name = "day_of_week")
    private Integer dayOfWeek;

    @Min(value = 1, message = "Sets must be at least 1")
    @Column(name = "sets")
    private Integer sets;

    @Min(value = 1, message = "Reps must be at least 1")
    @Column(name = "reps")
    private Integer reps;

    @Min(value = 0, message = "Rest seconds cannot be negative")
    @Column(name = "rest_seconds")
    private Integer restSeconds;

    @Min(value = 0, message = "Day index cannot be negative")
    @Column(name = "day_index")
    private Integer dayIndex;

    @Min(value = 0, message = "Week index cannot be negative")
    @Column(name = "week_index")
    private Integer weekIndex;

    /** Position of this exercise within its day — used for ordering. */
    @Min(value = 0, message = "Order index cannot be negative")
    @Column(name = "order_index")
    private Integer orderIndex;
}

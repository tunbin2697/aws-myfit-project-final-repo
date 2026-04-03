package com.example.fitme.module.system_workout.entity;

import com.example.fitme.common.entity.EntityBase;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/**
 * Join entity between WorkoutPlan and Exercise.
 * Contains detailed configuration for each exercise in a workout plan.
 */
@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@Table(name = "workout_plan_exercises")
public class WorkoutPlanExercise extends EntityBase {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workout_plan_id", nullable = false)
    @NotNull(message = "Workout plan is required")
    private WorkoutPlan workoutPlan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exercises_id", nullable = false)
    @NotNull(message = "Exercise is required")
    private Exercise exercise;

    /**
     * Day of the week (1-7, where 1 = Monday)
     */
    @Column(name = "day_of_week")
    @Min(value = 1, message = "Day of week must be at least 1")
    private Integer dayOfWeek;

    /**
     * Number of sets for this exercise
     */
    @Column(name = "sets")
    @Min(value = 1, message = "Sets must be at least 1")
    private Integer sets;

    /**
     * Number of repetitions per set
     */
    @Column(name = "reps")
    @Min(value = 1, message = "Reps must be at least 1")
    private Integer reps;

    /**
     * Rest time between sets in seconds
     */
    @Column(name = "rest_seconds")
    @Min(value = 0, message = "Rest seconds cannot be negative")
    private Integer restSeconds;

    /**
     * Day index within the workout program (e.g., Day 1, Day 2, etc.)
     */
    @Column(name = "day_index")
    @Min(value = 0, message = "Day index cannot be negative")
    private Integer dayIndex;

    /**
     * Week index within the workout program (for multi-week programs)
     */
    @Column(name = "week_index")
    @Min(value = 0, message = "Week index cannot be negative")
    private Integer weekIndex;

    /**
     * Order of the exercise within the day
     */
    @Column(name = "order_index")
    @Min(value = 0, message = "Order index cannot be negative")
    private Integer orderIndex;
}

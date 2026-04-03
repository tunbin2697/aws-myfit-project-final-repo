package com.example.fitme.module.system_workout.entity;

import com.example.fitme.common.entity.EntityBase;
import com.example.fitme.module.system_goal.entity.GoalType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.List;

/**
 * Workout Plan entity.
 * System workout plans serve as templates for users to clone.
 * Only admins can create/update/delete system plans.
 */
@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@Table(name = "workout_plan")
public class WorkoutPlan extends EntityBase {

    @NotBlank(message = "Workout plan name cannot be blank")
    @Size(max = 150, message = "Workout plan name must not exceed 150 characters")
    @Column(nullable = false, length = 150)
    private String name;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    @Column(length = 1000)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "goal_type_id")
    private GoalType goalType;

    @OneToMany(mappedBy = "workoutPlan", cascade = CascadeType.ALL, orphanRemoval = true)
    @lombok.Builder.Default
    private List<WorkoutPlanExercise> exercises = new ArrayList<>();

    @Column(name = "difficulty_level", length = 50)
    private String difficultyLevel;

    @Column(name = "estimated_duration_minutes")
    private Integer estimatedDurationMinutes;

    @Column(name = "is_system_plan")
    private Boolean isSystemPlan;

    public void addExercise(WorkoutPlanExercise exercise) {
        exercises.add(exercise);
        exercise.setWorkoutPlan(this);
    }
}

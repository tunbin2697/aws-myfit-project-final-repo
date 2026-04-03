package com.example.fitme.module.session.entity;

import com.example.fitme.common.entity.EntityBase;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import com.example.fitme.module.system_workout.entity.Exercise;


@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@Table(name = "workout_log")
public class WorkoutLog extends EntityBase {

    @NotNull(message = "Session is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_workout_session_id", nullable = false)
    private UserWorkoutSession userWorkoutSession;

    @NotNull(message = "Exercise is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exercise_id", nullable = false)
    private Exercise exercise;

    @Column(name = "set_number")
    private Integer setNumber;

    @Column(name = "reps")
    private Integer reps;

    @Column(name = "weight")
    private Float weight;

    @Column(name = "duration_seconds")
    private Integer durationSeconds;
}

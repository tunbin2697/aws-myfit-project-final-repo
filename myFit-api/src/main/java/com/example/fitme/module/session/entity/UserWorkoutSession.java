package com.example.fitme.module.session.entity;

import com.example.fitme.common.entity.EntityBase;
import com.example.fitme.module.authentication.entity.UserProfile;
import com.example.fitme.module.user_workout_plan.entity.UserWorkoutPlan;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import lombok.Builder;

import java.time.LocalDate;
import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@Table(name = "user_workout_session")
public class UserWorkoutSession extends EntityBase {


    @NotNull(message = "User is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserProfile user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_workout_plan_id")
    private UserWorkoutPlan userWorkoutPlan;

    @Column(name = "workout_date")
    private LocalDate workoutDate;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "week_index")
    private Integer weekIndex;

    @Column(name = "day_index")
    private Integer dayIndex;

    @OneToMany(mappedBy = "userWorkoutSession", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WorkoutLog> logs;
}

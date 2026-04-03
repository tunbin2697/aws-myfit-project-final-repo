package com.example.fitme.module.system_goal.entity;

import com.example.fitme.common.entity.EntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import jakarta.persistence.OneToMany;
import jakarta.persistence.CascadeType;
import java.util.ArrayList;
import java.util.List;
import lombok.Builder;

/**
 * Goal type master data.
 * Stores available fitness goals created by admins.
 */
@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@Table(name = "goal_type")
public class GoalType extends EntityBase {

    @NotBlank(message = "Goal name cannot be blank")
    @Size(max = 100, message = "Goal name must not exceed 100 characters")
    @Column(unique = true, nullable = false, length = 100)
    private String name;
    private String description;

    @Builder.Default
    @OneToMany(mappedBy = "goalType", cascade = CascadeType.ALL, orphanRemoval = false)
    private List<com.example.fitme.module.system_workout.entity.WorkoutPlan> workoutPlans = new ArrayList<>();
}

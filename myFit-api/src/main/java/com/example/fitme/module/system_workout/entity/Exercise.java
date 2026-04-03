package com.example.fitme.module.system_workout.entity;

import com.example.fitme.common.entity.EntityBase;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/**
 * Exercise master data.
 * Stores exercise definitions that can be used in workout plans.
 */
@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@Table(name = "exercises")
public class Exercise extends EntityBase {

    @NotBlank(message = "Exercise name cannot be blank")
    @Size(max = 150, message = "Exercise name must not exceed 150 characters")
    @Column(nullable = false, length = 150)
    private String name;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    @Column(length = 1000)
    private String description;

    @Size(max = 255, message = "Equipment must not exceed 255 characters")
    @Column(length = 255)
    private String equipment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "muscle_group_id")
    private MuscleGroup muscleGroup;
}

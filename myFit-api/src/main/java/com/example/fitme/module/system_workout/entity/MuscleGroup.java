package com.example.fitme.module.system_workout.entity;

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

/**
 * Muscle group master data.
 * Categories for exercises (e.g., Chest, Back, Legs).
 */
@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@Table(name = "muscle_group")
public class MuscleGroup extends EntityBase {

    @NotBlank(message = "Muscle group name cannot be blank")
    @Size(max = 100, message = "Muscle group name must not exceed 100 characters")
    @Column(unique = true, nullable = false, length = 100)
    private String name;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    @Column(length = 500)
    private String description;
}

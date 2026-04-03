package com.example.fitme.module.food.entity;

import com.example.fitme.common.entity.EntityBase;
import com.example.fitme.module.authentication.entity.UserProfile;
import com.example.fitme.module.food.enums.MealType;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "meal")
@Entity
@SuperBuilder
public class Meal extends EntityBase {
    @ManyToOne
    private UserProfile userProfile;


    private LocalDateTime date;

    private MealType mealType;

    private String note;
}

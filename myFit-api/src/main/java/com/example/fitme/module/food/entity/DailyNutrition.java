package com.example.fitme.module.food.entity;

import com.example.fitme.common.entity.EntityBase;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "daily_nutrition")
@Entity
@SuperBuilder
public class DailyNutrition extends EntityBase {

    private LocalDate nutritionDate;

    private float totalProtein;
    private float totalCarbs;
    private float totalCalories;
    private float totalFats;
}
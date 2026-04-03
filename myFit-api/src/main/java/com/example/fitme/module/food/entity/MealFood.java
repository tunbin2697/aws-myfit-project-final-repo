package com.example.fitme.module.food.entity;

import com.example.fitme.common.entity.EntityBase;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "meal_food")
@Entity
@SuperBuilder
public class MealFood extends EntityBase {



    private float quantity; // gram

    private float calories;
    private float protein;
    private float carbs;
    private float fats;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meal_id", nullable = false)
    private Meal meal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "food_id", nullable = false)
    private Food food;
}
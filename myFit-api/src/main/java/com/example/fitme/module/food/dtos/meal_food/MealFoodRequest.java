package com.example.fitme.module.food.dtos.meal_food;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record MealFoodRequest(
        @NotNull
        UUID mealId,

        @NotNull
        UUID foodId,

        @Min(1)
        float quantity
) {
}

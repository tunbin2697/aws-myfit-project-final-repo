package com.example.fitme.module.food.dtos.meal_food;

import java.util.UUID;

public record MealFoodResponse(

        UUID id,

        UUID mealId,
        UUID foodId,

        float quantity,
        float calories,
        float protein,
        float carbs,
        float fats
) {
}

package com.example.fitme.module.food.dtos.daily_nutrition;

import java.time.LocalDate;
import java.util.UUID;

public record DailyNutritionResponse(
        UUID id,
        LocalDate nutritionDate,

        float totalProtein,
        float totalCarbs,
        float totalCalories,
        float totalFats

) {
}

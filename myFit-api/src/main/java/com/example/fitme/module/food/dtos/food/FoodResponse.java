package com.example.fitme.module.food.dtos.food;

import java.time.LocalDateTime;
import java.util.UUID;

public record FoodResponse(
        UUID id,

        String name,

        float caloriesPer100g,
        float proteinPer100g,
        float carbsPer100g,
        float fatsPer100g,

        String unit,

        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {

}

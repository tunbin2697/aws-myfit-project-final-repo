package com.example.fitme.module.food.dtos.meal;

import com.example.fitme.module.food.enums.MealType;

import java.time.LocalDateTime;
import java.util.UUID;

public record MealResponse(
        UUID id,

        LocalDateTime date,
        MealType mealType,
        String note,

        LocalDateTime createdAt,
        LocalDateTime updatedAt

) {
}

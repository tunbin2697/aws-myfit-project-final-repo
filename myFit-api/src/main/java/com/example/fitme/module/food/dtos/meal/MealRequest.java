package com.example.fitme.module.food.dtos.meal;

import com.example.fitme.module.food.enums.MealType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record MealRequest(

        @NotBlank
        String user_id,

        @NotNull
        LocalDateTime date,

        @NotNull
        MealType mealType,

        String note
) {
}

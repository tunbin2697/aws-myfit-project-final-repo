package com.example.fitme.module.food.dtos.food;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record FoodRequest(

        @NotBlank
        String name,

        @Min(0)
        float caloriesPer100g,

        @Min(0)
        float proteinPer100g,

        @Min(0)
        float carbsPer100g,

        @Min(0)
        float fatsPer100g,

        @NotBlank
        String unit,

        @NotNull
        Boolean isSystem
) {
}

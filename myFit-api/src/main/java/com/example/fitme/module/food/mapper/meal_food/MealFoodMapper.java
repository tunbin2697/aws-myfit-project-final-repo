package com.example.fitme.module.food.mapper.meal_food;

import com.example.fitme.module.food.dtos.meal_food.MealFoodResponse;
import com.example.fitme.module.food.entity.MealFood;

public class MealFoodMapper {

    private MealFoodMapper() {}


    public static MealFoodResponse toResponse(MealFood entity) {
        return new MealFoodResponse(
                entity.getId(),
                entity.getMeal().getId(),
                entity.getFood().getId(),
                entity.getQuantity(),
                entity.getCalories(),
                entity.getProtein(),
                entity.getCarbs(),
                entity.getFats()
        );
}
}

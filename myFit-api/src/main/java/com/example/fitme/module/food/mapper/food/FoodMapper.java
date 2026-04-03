package com.example.fitme.module.food.mapper.food;

import com.example.fitme.module.food.dtos.food.FoodRequest;
import com.example.fitme.module.food.dtos.food.FoodResponse;
import com.example.fitme.module.food.entity.Food;

public class FoodMapper {
    public static Food toEntity(FoodRequest request) {
        return Food.builder()
                .name(request.name())
                .caloriesPer100g(request.caloriesPer100g())
                .proteinPer100g(request.proteinPer100g())
                .carbsPer100g(request.carbsPer100g())
                .fatsPer100g(request.fatsPer100g())
                .unit(request.unit())
                .build();
    }

    public static FoodResponse toResponse(Food food) {
        return new FoodResponse(
                food.getId(),
                food.getName(),
                food.getCaloriesPer100g(),
                food.getProteinPer100g(),
                food.getCarbsPer100g(),
                food.getFatsPer100g(),
                food.getUnit(),
                food.getCreatedAt(),
                food.getUpdatedAt()
        );
    }
}

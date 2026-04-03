package com.example.fitme.module.food.mapper.meal;

import com.example.fitme.module.food.dtos.meal.MealRequest;
import com.example.fitme.module.food.dtos.meal.MealResponse;
import com.example.fitme.module.food.entity.Meal;

public class MealMapper {
    private MealMapper() {}



    public static Meal toEntity(MealRequest request) {
        return Meal.builder()
                .date(request.date())
                .mealType(request.mealType())
                .note(request.note())
                .build();
    }

    public static MealResponse toResponse(Meal meal) {
        return new MealResponse(
                meal.getId(),
                meal.getDate(),
                meal.getMealType(),
                meal.getNote(),
                meal.getCreatedAt(),
                meal.getUpdatedAt()
        );
    }
}

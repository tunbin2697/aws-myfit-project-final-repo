package com.example.fitme.module.food.service.meal_food;

import com.example.fitme.module.food.dtos.meal_food.MealFoodRequest;
import com.example.fitme.module.food.dtos.meal_food.MealFoodResponse;
import com.example.fitme.module.food.entity.MealFood;

import java.util.List;
import java.util.UUID;

public interface MealFoodService {

    MealFoodResponse addFoodToMeal(MealFoodRequest request);

    void remove(UUID id);

    List<MealFoodResponse> getByMeal(UUID mealId);

    List<MealFood> findByMealId(UUID id);
}

package com.example.fitme.module.food.service.meal_food.impl;

import com.example.fitme.common.exception.ApiException;
import com.example.fitme.common.exception.ErrorCode;
import com.example.fitme.module.food.dtos.meal_food.MealFoodRequest;
import com.example.fitme.module.food.dtos.meal_food.MealFoodResponse;
import com.example.fitme.module.food.entity.Food;
import com.example.fitme.module.food.entity.Meal;
import com.example.fitme.module.food.entity.MealFood;
import com.example.fitme.module.food.mapper.meal_food.MealFoodMapper;
import com.example.fitme.module.food.repository.FoodRepository;
import com.example.fitme.module.food.repository.MealFoodRepository;
import com.example.fitme.module.food.repository.MealRepository;
import com.example.fitme.module.food.service.meal_food.MealFoodService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MealFoodServiceImpl implements MealFoodService {
    @Autowired
    private MealFoodRepository mealFoodRepository;
    private final MealRepository mealRepository;
    private final FoodRepository foodRepository;

    @Override
    public MealFoodResponse addFoodToMeal(MealFoodRequest request) {

        Meal meal = mealRepository.findById(request.mealId())
                .orElseThrow(() -> new ApiException(
                        ErrorCode.RESOURCE_NOT_FOUND,
                        "Meal not found"));

        Food food = foodRepository.findById(request.foodId())
                .orElseThrow(() -> new ApiException(
                        ErrorCode.RESOURCE_NOT_FOUND,
                        "Food not found"));

        float quantity = request.quantity();

        // TÍNH MACRO THEO QUANTITY
        float factor = quantity / 100f;

        float calories = food.getCaloriesPer100g() * factor;
        float protein = food.getProteinPer100g() * factor;
        float carbs = food.getCarbsPer100g() * factor;
        float fats = food.getFatsPer100g() * factor;

        MealFood mealFood = MealFood.builder()
                .meal(meal)
                .food(food)
                .quantity(quantity)
                .calories(calories)
                .protein(protein)
                .carbs(carbs)
                .fats(fats)
                .build();

        MealFood saved = mealFoodRepository.save(mealFood);

        return MealFoodMapper.toResponse(saved);
    }

    @Override
    public void remove(UUID id) {

        MealFood entity = mealFoodRepository.findById(id)
                .orElseThrow(() -> new ApiException(
                        ErrorCode.RESOURCE_NOT_FOUND,
                        "MealFood not found"));

        mealFoodRepository.delete(entity);
    }

    @Override
    public List<MealFoodResponse> getByMeal(UUID mealId) {

        return mealFoodRepository.findByMealId(mealId)
                .stream()
                .map(MealFoodMapper::toResponse)
                .toList();
    }

    @Override
    public List<MealFood> findByMealId(UUID id) {
        return mealFoodRepository.findAllByMealId(id);
    }
}

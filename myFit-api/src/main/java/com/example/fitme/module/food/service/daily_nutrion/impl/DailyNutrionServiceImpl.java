package com.example.fitme.module.food.service.daily_nutrion.impl;

import com.example.fitme.module.food.dtos.daily_nutrition.DailyNutritionResponse;
import com.example.fitme.module.food.entity.DailyNutrition;
import com.example.fitme.module.food.entity.Meal;
import com.example.fitme.module.food.entity.MealFood;
import com.example.fitme.module.food.repository.DailyNutritionRepository;
import com.example.fitme.module.food.service.daily_nutrion.DailyNutrionService;
import com.example.fitme.module.food.service.meal.MealService;
import com.example.fitme.module.food.service.meal_food.MealFoodService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
public class DailyNutrionServiceImpl implements DailyNutrionService {

    @Autowired
    private MealService mealService;
    private MealFoodService mealFoodService;
    private DailyNutritionRepository dailyNutritionRepository;
    @Override
    public DailyNutritionResponse calculateByDate(LocalDate date) {

        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.atTime(LocalTime.MAX);

        List<Meal> meals = mealService.findByDateBetween(start, end);

        float totalProtein = 0f;
        float totalCarbs = 0f;
        float totalCalories = 0f;
        float totalFats = 0f;

        for (Meal meal : meals) {

            List<MealFood> mealFoods =
                    mealFoodService.findByMealId(meal.getId());

            for (MealFood mf : mealFoods) {
                totalProtein += mf.getProtein();
                totalCarbs += mf.getCarbs();
                totalCalories += mf.getCalories();
                totalFats += mf.getFats();
            }
        }

        DailyNutrition daily = dailyNutritionRepository
                .findByNutritionDate(date)
                .orElse(DailyNutrition.builder()
                        .nutritionDate(date)
                        .build());

        daily.setTotalProtein(totalProtein);
        daily.setTotalCarbs(totalCarbs);
        daily.setTotalCalories(totalCalories);
        daily.setTotalFats(totalFats);

        DailyNutrition saved = dailyNutritionRepository.save(daily);

        return new DailyNutritionResponse(
                saved.getId(),
                saved.getNutritionDate(),
                saved.getTotalProtein(),
                saved.getTotalCarbs(),
                saved.getTotalCalories(),
                saved.getTotalFats()
        );
    }

    @Override
    public DailyNutritionResponse getByDate(LocalDate date) {
        return null;
    }
}

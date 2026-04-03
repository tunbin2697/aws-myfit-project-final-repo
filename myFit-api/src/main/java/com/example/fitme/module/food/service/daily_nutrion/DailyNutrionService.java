package com.example.fitme.module.food.service.daily_nutrion;

import com.example.fitme.module.food.dtos.daily_nutrition.DailyNutritionResponse;

import java.time.LocalDate;


public interface DailyNutrionService {
    DailyNutritionResponse calculateByDate(LocalDate date);

    DailyNutritionResponse getByDate(LocalDate date);
}

package com.example.fitme.module.food.service.meal;

import com.example.fitme.module.food.dtos.meal.MealRequest;
import com.example.fitme.module.food.dtos.meal.MealResponse;
import com.example.fitme.module.food.entity.Meal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface MealService {
    MealResponse create(MealRequest request);

    MealResponse update(UUID id, MealRequest request);

    void delete(UUID id);

    MealResponse findById(UUID id);

    Page<MealResponse> findAll(Pageable pageable);

    List<MealResponse> findByDate(LocalDate date);

    List<MealResponse> findByMealType(String mealType);

    List<Meal> findByDateBetween(LocalDateTime start, LocalDateTime end);

    List<MealResponse> findByUserId(UUID id);
}

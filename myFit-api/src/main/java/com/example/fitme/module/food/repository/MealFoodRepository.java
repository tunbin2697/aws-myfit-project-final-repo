package com.example.fitme.module.food.repository;

import com.example.fitme.module.food.entity.MealFood;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Repository
public interface MealFoodRepository extends JpaRepository<MealFood, UUID> {
    Collection<MealFood> findByMealId(UUID mealId);

    List<MealFood> findAllByMealId(UUID id);
}

package com.example.fitme.module.food.repository;

import com.example.fitme.module.food.entity.Food;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.UUID;

@Repository
public interface FoodRepository extends JpaRepository<Food, UUID> {

    Collection<Food> findByNameContainingIgnoreCase(String keyword);


    Collection<Food> findByCaloriesPer100gBetweenAndProteinPer100gGreaterThanEqual(float minCal, float maxCal, float minPro);
}

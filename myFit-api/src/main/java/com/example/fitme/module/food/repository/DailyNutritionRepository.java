package com.example.fitme.module.food.repository;

import com.example.fitme.module.food.entity.DailyNutrition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DailyNutritionRepository extends JpaRepository<DailyNutrition, UUID> {
    Optional<DailyNutrition> findByNutritionDate(LocalDate date);
}

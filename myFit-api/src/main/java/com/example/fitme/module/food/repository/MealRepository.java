package com.example.fitme.module.food.repository;

import com.example.fitme.module.food.entity.Meal;
import com.example.fitme.module.food.enums.MealType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Repository
public interface MealRepository extends JpaRepository<Meal, UUID> {
    Collection<Meal> findByDateBetween(LocalDateTime start, LocalDateTime end);

    Collection<Meal> findByMealType(MealType type);

    List<Meal> findByUserProfileId(UUID userProfileId);
}

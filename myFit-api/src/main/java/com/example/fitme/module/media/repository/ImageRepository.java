package com.example.fitme.module.media.repository;

import com.example.fitme.module.media.entity.Image;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ImageRepository extends JpaRepository<Image, UUID> {
    List<Image> findByFoodId(UUID foodId);
    List<Image> findByWorkoutPlanId(UUID workoutPlanId);
    List<Image> findByExerciseId(UUID exerciseId);
}

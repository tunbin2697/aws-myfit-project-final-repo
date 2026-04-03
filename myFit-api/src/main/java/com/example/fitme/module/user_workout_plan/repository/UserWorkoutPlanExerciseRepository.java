package com.example.fitme.module.user_workout_plan.repository;

import com.example.fitme.module.user_workout_plan.entity.UserWorkoutPlanExercise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository for UserWorkoutPlanExercise.
 */
@Repository
public interface UserWorkoutPlanExerciseRepository extends JpaRepository<UserWorkoutPlanExercise, UUID> {

    /**
     * Find all exercises for a plan, sorted by orderIndex ascending.
     */
    List<UserWorkoutPlanExercise> findByUserWorkoutPlanIdOrderByOrderIndex(UUID userWorkoutPlanId);

    /**
     * Delete all exercises belonging to a given plan (used before deleting the plan).
     */
    void deleteByUserWorkoutPlanId(UUID userWorkoutPlanId);

    /**
     * Check whether any user workout plan exercises reference the given exercise id.
     */
    boolean existsByExerciseId(UUID exerciseId);
}

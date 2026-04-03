package com.example.fitme.module.user_workout_plan.repository;

import com.example.fitme.module.user_workout_plan.entity.UserWorkoutPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for UserWorkoutPlan.
 */
@Repository
public interface UserWorkoutPlanRepository extends JpaRepository<UserWorkoutPlan, UUID> {

    /**
     * Use Spring Data derived queries that traverse the `user.id` property.
     * These method names (findByUserId...) will be correctly resolved to the
     * nested path `user.id` by Spring Data JPA.
     */
    List<UserWorkoutPlan> findByUserId(UUID userId);

    Optional<UserWorkoutPlan> findByUserIdAndIsActiveTrue(UUID userId);

    List<UserWorkoutPlan> findAllByUserIdAndIsActiveTrue(UUID userId);

    boolean existsByUserId(UUID userId);
}

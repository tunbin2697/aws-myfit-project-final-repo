package com.example.fitme.module.system_workout.repository;

import com.example.fitme.module.system_workout.entity.WorkoutPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for WorkoutPlan entity.
 */
@Repository
public interface WorkoutPlanRepository extends JpaRepository<WorkoutPlan, UUID> {
    
       /**
        * Find workout plans by goal type ID.
        */
       List<WorkoutPlan> findByGoalTypeId(UUID goalTypeId);

       /**
        * Check if a workout plan exists with the given name.
        */
       boolean existsByName(String name);
    
    /**
     * Find workout plan with all exercises eagerly loaded.
     */
    @Query("SELECT DISTINCT wp FROM WorkoutPlan wp " +
           "LEFT JOIN FETCH wp.exercises wpe " +
           "LEFT JOIN FETCH wpe.exercise e " +
           "LEFT JOIN FETCH e.muscleGroup " +
           "LEFT JOIN FETCH wp.goalType " +
           "WHERE wp.id = :id")
    Optional<WorkoutPlan> findByIdWithExercises(@Param("id") UUID id);
    
    /**
     * Find all system workout plans with goal type.
     */
    @Query("SELECT wp FROM WorkoutPlan wp " +
           "LEFT JOIN FETCH wp.goalType ")
    List<WorkoutPlan> findAllWithGoalType();
}

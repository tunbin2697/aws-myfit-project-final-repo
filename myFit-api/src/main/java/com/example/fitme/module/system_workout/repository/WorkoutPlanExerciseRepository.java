package com.example.fitme.module.system_workout.repository;

import com.example.fitme.module.system_workout.entity.WorkoutPlanExercise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository for WorkoutPlanExercise entity.
 */
@Repository
public interface WorkoutPlanExerciseRepository extends JpaRepository<WorkoutPlanExercise, UUID> {
    
    /**
     * Find all exercises for a workout plan.
     */
    List<WorkoutPlanExercise> findByWorkoutPlanId(UUID workoutPlanId);
    
    /**
     * Find exercises for a workout plan ordered by day and order index.
     */
    @Query("SELECT wpe FROM WorkoutPlanExercise wpe " +
           "WHERE wpe.workoutPlan.id = :workoutPlanId " +
           "ORDER BY wpe.weekIndex, wpe.dayIndex, wpe.orderIndex")
    List<WorkoutPlanExercise> findByWorkoutPlanIdOrdered(@Param("workoutPlanId") UUID workoutPlanId);
    
    /**
     * Find exercises for a specific day in a workout plan.
     */
    List<WorkoutPlanExercise> findByWorkoutPlanIdAndDayIndex(UUID workoutPlanId, Integer dayIndex);
    
    /**
     * Find exercises for a specific week and day in a workout plan.
     */
    List<WorkoutPlanExercise> findByWorkoutPlanIdAndWeekIndexAndDayIndex(
            UUID workoutPlanId, Integer weekIndex, Integer dayIndex);
    
    /**
     * Delete all exercises for a workout plan.
     */
    void deleteByWorkoutPlanId(UUID workoutPlanId);

       /**
        * Check whether any workout plan exercises reference the given exercise id.
        */
       boolean existsByExerciseId(UUID exerciseId);
    
    /**
     * Find exercises with exercise and muscle group eagerly loaded.
     */
    @Query("SELECT wpe FROM WorkoutPlanExercise wpe " +
           "LEFT JOIN FETCH wpe.exercise e " +
           "LEFT JOIN FETCH e.muscleGroup " +
           "WHERE wpe.workoutPlan.id = :workoutPlanId " +
           "ORDER BY wpe.weekIndex, wpe.dayIndex, wpe.orderIndex")
    List<WorkoutPlanExercise> findByWorkoutPlanIdWithExercises(@Param("workoutPlanId") UUID workoutPlanId);
}

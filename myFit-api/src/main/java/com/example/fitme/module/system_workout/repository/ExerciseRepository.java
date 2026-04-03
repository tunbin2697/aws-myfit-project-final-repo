package com.example.fitme.module.system_workout.repository;

import com.example.fitme.module.system_workout.entity.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for Exercise entity.
 */
@Repository
public interface ExerciseRepository extends JpaRepository<Exercise, UUID> {
    
    /**
     * Find exercise by name.
     */
    Optional<Exercise> findByName(String name);
    
    /**
     * Check if exercise exists by name.
     */
    boolean existsByName(String name);
    
    /**
     * Find all exercises by muscle group ID.
     */
    List<Exercise> findByMuscleGroupId(UUID muscleGroupId);
    
    /**
     * Find exercises with muscle group eagerly loaded.
     */
    @Query("SELECT e FROM Exercise e LEFT JOIN FETCH e.muscleGroup")
    List<Exercise> findAllWithMuscleGroup();
    
    /**
     * Find exercise by ID with muscle group eagerly loaded.
     */
    @Query("SELECT e FROM Exercise e LEFT JOIN FETCH e.muscleGroup WHERE e.id = :id")
    Optional<Exercise> findByIdWithMuscleGroup(@Param("id") UUID id);
}

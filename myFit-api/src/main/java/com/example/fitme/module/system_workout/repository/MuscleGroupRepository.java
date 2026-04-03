package com.example.fitme.module.system_workout.repository;

import com.example.fitme.module.system_workout.entity.MuscleGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository for MuscleGroup entity.
 */
@Repository
public interface MuscleGroupRepository extends JpaRepository<MuscleGroup, UUID> {
    
    /**
     * Find muscle group by name.
     */
    Optional<MuscleGroup> findByName(String name);
    
    /**
     * Check if muscle group exists by name.
     */
    boolean existsByName(String name);
}

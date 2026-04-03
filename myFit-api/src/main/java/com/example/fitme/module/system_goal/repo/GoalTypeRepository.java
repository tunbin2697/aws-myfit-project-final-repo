package com.example.fitme.module.system_goal.repo;

import com.example.fitme.module.system_goal.entity.GoalType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository for GoalType entity.
 */
@Repository
public interface GoalTypeRepository extends JpaRepository<GoalType, UUID> {
    
    /**
     * Find goal type by name.
     * Useful for lookup when creating health calculations.
     */
    Optional<GoalType> findByName(String name);
    
    /**
     * Check if goal type exists by name.
     */
    boolean existsByName(String name);
}

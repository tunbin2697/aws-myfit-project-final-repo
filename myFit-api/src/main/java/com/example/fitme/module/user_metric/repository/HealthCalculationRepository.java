package com.example.fitme.module.user_metric.repository;

import com.example.fitme.module.user_metric.entity.HealthCalculation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for HealthCalculation entity.
 */
@Repository
public interface HealthCalculationRepository extends JpaRepository<HealthCalculation, UUID> {
    
    /**
     * Find all calculations for a user, ordered by creation date (newest first).
     * Useful for showing calculation history.
     */
    List<HealthCalculation> findByUser_IdOrderByCreatedAtDesc(UUID userId);

    Optional<HealthCalculation> findFirstByUser_IdOrderByCreatedAtDesc(UUID userId);

    long countByUser_Id(UUID userId);
}

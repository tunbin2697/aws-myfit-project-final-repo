package com.example.fitme.module.user_metric.repository;

import com.example.fitme.module.user_metric.entity.BodyMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for BodyMetric entity.
 * Provides CRUD operations and custom queries for body metrics.
 */
@Repository
public interface BodyMetricRepository extends JpaRepository<BodyMetric, UUID> {

    /**
     * Find all body metrics for a user, ordered by newest first.
     * 
     * @param userId The user ID to search for
     * @return List of body metrics ordered by creation date descending
     */
    List<BodyMetric> findByUser_IdOrderByCreatedAtDesc(UUID userId);

    /**
     * Find the latest body metric for a user.
     * 
     * @param userId The user ID to search for
     * @return Optional containing the latest body metric if exists
     */
    Optional<BodyMetric> findFirstByUser_IdOrderByCreatedAtDesc(UUID userId);

    /**
     * Check if a user has any body metrics.
     * 
     * @param userId The user ID to check
     * @return true if user has body metrics, false otherwise
     */
    boolean existsByUser_Id(UUID userId);
}

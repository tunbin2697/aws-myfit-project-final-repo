package com.example.fitme.module.user_metric.service.bodymetric;

import com.example.fitme.module.user_metric.dto.bodyMetric.BodyMetricRequest;
import com.example.fitme.module.user_metric.dto.bodyMetric.BodyMetricResponse;

import java.util.List;
import java.util.UUID;

/**
 * Service interface for BodyMetric operations.
 * Defines CRUD operations for managing user body metrics.
 */
public interface BodyMetricService {

    /**
     * Create a new body metric record.
     * 
     * @param request The body metric data
     * @return Created body metric response
     */
    BodyMetricResponse create(BodyMetricRequest request);

    /**
     * Get all body metrics for a user, ordered by newest first.
     * 
     * @param userId The user ID
     * @return List of body metrics
     */
    List<BodyMetricResponse> getUserHistory(UUID userId);

    /**
     * Get the latest body metric for a user.
     * 
     * @param userId The user ID
     * @return Latest body metric
     */
    BodyMetricResponse getLatestByUserId(UUID userId);

    /**
     * Get a body metric by ID.
     * 
     * @param id The body metric ID
     * @return Body metric response
     */
    BodyMetricResponse getById(UUID id);

    /**
     * Update an existing body metric.
     * 
     * @param id The body metric ID
     * @param request The updated data
     * @return Updated body metric
     */
    BodyMetricResponse update(UUID id, BodyMetricRequest request);

    /**
     * Delete a body metric by ID.
     * 
     * @param id The body metric ID
     */
    void delete(UUID id);
}

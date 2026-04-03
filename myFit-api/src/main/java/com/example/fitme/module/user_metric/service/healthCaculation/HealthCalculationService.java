package com.example.fitme.module.user_metric.service.healthCaculation;

import com.example.fitme.module.user_metric.dto.health.CalculateMetricsRequest;
import com.example.fitme.module.user_metric.dto.health.HealthCalculationResponse;

import java.util.List;
import java.util.UUID;

/**
 * Service interface for HealthCalculation operations.
 */
public interface HealthCalculationService {
    
    /**
     * Calculate health metrics and save to database.
     * This performs all calculations (BMI, BMR, TDEE, Macros) and stores the result.
     */
    HealthCalculationResponse calculateAndSave(CalculateMetricsRequest request);
    
    /**
     * Get calculation history for a user (newest first).
     */
    List<HealthCalculationResponse> getUserHistory(UUID userId);
    
    /**
     * Get latest calculation for a user.
     */
    HealthCalculationResponse getLatestByUserId(UUID userId);
    
    /**
     * Get calculation by ID.
     */
    HealthCalculationResponse getById(UUID id);
    
    /**
     * Delete calculation.
     */
    void delete(UUID id);
}

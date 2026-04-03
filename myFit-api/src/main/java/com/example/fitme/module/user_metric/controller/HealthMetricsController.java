package com.example.fitme.module.user_metric.controller;

import com.example.fitme.common.response.ApiResponse;
import com.example.fitme.module.user_metric.dto.health.CalculateMetricsRequest;
import com.example.fitme.module.user_metric.dto.health.HealthCalculationResponse;
import com.example.fitme.module.user_metric.service.healthCaculation.HealthCalculationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * REST API Controller for Health Metrics Calculation.
 * Base path: /api/metrics
 */
@RestController
@RequestMapping("/api/metrics")
@RequiredArgsConstructor
public class HealthMetricsController {

    private final HealthCalculationService healthCalculationService;

    /**
     * Calculate health metrics and save.
     * POST /api/metrics/calculate
     * 
     * Calculates BMI, BMR, TDEE, Calorie Goal, and Macros based on input data.
     */
    @PostMapping("/calculate")
    public ResponseEntity<ApiResponse<HealthCalculationResponse>> calculateMetrics(
            @Valid @RequestBody CalculateMetricsRequest request) {
        
        HealthCalculationResponse response = healthCalculationService.calculateAndSave(request);
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<HealthCalculationResponse>builder()
                        .code(1000)
                        .message("Health metrics calculated successfully")
                        .result(response)
                        .timestamp(Instant.now())
                        .path("/api/metrics/calculate")
                        .build());
    }

    /**
     * Get user's calculation history.
     * GET /api/metrics/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<HealthCalculationResponse>>> getUserHistory(
            @PathVariable UUID userId) {
        
        List<HealthCalculationResponse> response = healthCalculationService.getUserHistory(userId);
        
        return ResponseEntity.ok()
                .body(ApiResponse.<List<HealthCalculationResponse>>builder()
                        .code(1000)
                        .message("Success")
                        .result(response)
                        .timestamp(Instant.now())
                        .path("/api/metrics/user/" + userId)
                        .build());
    }

    /**
     * Get latest calculation for user.
     * GET /api/metrics/user/{userId}/latest
     */
    @GetMapping("/user/{userId}/latest")
    public ResponseEntity<ApiResponse<HealthCalculationResponse>> getLatest(
            @PathVariable UUID userId) {
        
        HealthCalculationResponse response = healthCalculationService.getLatestByUserId(userId);
        
        return ResponseEntity.ok()
                .body(ApiResponse.<HealthCalculationResponse>builder()
                        .code(1000)
                        .message("Success")
                        .result(response)
                        .timestamp(Instant.now())
                        .path("/api/metrics/user/" + userId + "/latest")
                        .build());
    }

    /**
     * Get calculation by ID.
     * GET /api/metrics/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<HealthCalculationResponse>> getById(
            @PathVariable UUID id) {
        
        HealthCalculationResponse response = healthCalculationService.getById(id);
        
        return ResponseEntity.ok()
                .body(ApiResponse.<HealthCalculationResponse>builder()
                        .code(1000)
                        .message("Success")
                        .result(response)
                        .timestamp(Instant.now())
                        .path("/api/metrics/" + id)
                        .build());
    }

    /**
     * Delete calculation.
     * DELETE /api/metrics/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        healthCalculationService.delete(id);
        
        return ResponseEntity.ok()
                .body(ApiResponse.<Void>builder()
                        .code(1000)
                        .message("Calculation deleted successfully")
                        .result(null)
                        .timestamp(Instant.now())
                        .path("/api/metrics/" + id)
                        .build());
    }
}

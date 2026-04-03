package com.example.fitme.module.user_metric.controller;

import com.example.fitme.common.response.ApiResponse;
import com.example.fitme.module.user_metric.dto.bodyMetric.BodyMetricRequest;
import com.example.fitme.module.user_metric.dto.bodyMetric.BodyMetricResponse;
import com.example.fitme.module.user_metric.service.bodymetric.BodyMetricService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * REST controller for BodyMetric operations.
 * Provides CRUD endpoints for managing user body metrics.
 */
@RestController
@RequestMapping("/api/body-metrics")
@RequiredArgsConstructor
public class BodyMetricController {

    private final BodyMetricService bodyMetricService;

    /**
     * Create a new body metric record.
     * 
     * @param request Body metric data
     * @return Created body metric with 201 status
     */
    @PostMapping
    public ResponseEntity<ApiResponse<BodyMetricResponse>> create(
            @Valid @RequestBody BodyMetricRequest request) {

        BodyMetricResponse response = bodyMetricService.create(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<BodyMetricResponse>builder()
                        .code(1000)
                        .message("Body metric created successfully")
                        .result(response)
                        .timestamp(Instant.now())
                        .path("/api/body-metrics")
                        .build());
    }

    /**
     * Get all body metrics for a user ordered by newest first.
     * 
     * @param userId User ID
     * @return List of body metrics
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<BodyMetricResponse>>> getUserHistory(
            @PathVariable UUID userId) {

        List<BodyMetricResponse> response = bodyMetricService.getUserHistory(userId);

        return ResponseEntity.ok(
                ApiResponse.<List<BodyMetricResponse>>builder()
                        .code(1000)
                        .message("Success")
                        .result(response)
                        .timestamp(Instant.now())
                        .path("/api/body-metrics/user/" + userId)
                        .build());
    }

    /**
     * Get the latest body metric for a user.
     * 
     * @param userId User ID
     * @return Latest body metric
     */
    @GetMapping("/user/{userId}/latest")
    public ResponseEntity<ApiResponse<BodyMetricResponse>> getLatest(
            @PathVariable UUID userId) {

        BodyMetricResponse response = bodyMetricService.getLatestByUserId(userId);

        return ResponseEntity.ok(
                ApiResponse.<BodyMetricResponse>builder()
                        .code(1000)
                        .message("Success")
                        .result(response)
                        .timestamp(Instant.now())
                        .path("/api/body-metrics/user/" + userId + "/latest")
                        .build());
    }

    /**
     * Get a specific body metric by ID.
     * 
     * @param id Body metric ID
     * @return Body metric data
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BodyMetricResponse>> getById(
            @PathVariable UUID id) {

        BodyMetricResponse response = bodyMetricService.getById(id);

        return ResponseEntity.ok(
                ApiResponse.<BodyMetricResponse>builder()
                        .code(1000)
                        .message("Success")
                        .result(response)
                        .timestamp(Instant.now())
                        .path("/api/body-metrics/" + id)
                        .build());
    }

    /**
     * Update an existing body metric.
     * 
     * @param id Body metric ID
     * @param request Updated body metric data
     * @return Updated body metric
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BodyMetricResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody BodyMetricRequest request) {

        BodyMetricResponse response = bodyMetricService.update(id, request);

        return ResponseEntity.ok(
                ApiResponse.<BodyMetricResponse>builder()
                        .code(1000)
                        .message("Body metric updated successfully")
                        .result(response)
                        .timestamp(Instant.now())
                        .path("/api/body-metrics/" + id)
                        .build());
    }

    /**
     * Delete a body metric by ID.
     * 
     * @param id Body metric ID
     * @return Success message
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        bodyMetricService.delete(id);

        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .code(1000)
                        .message("Body metric deleted successfully")
                        .result(null)
                        .timestamp(Instant.now())
                        .path("/api/body-metrics/" + id)
                        .build());
    }
}

package com.example.fitme.module.user_metric.service.healthCaculation.impl;

import com.example.fitme.common.exception.ApiException;
import com.example.fitme.common.exception.ErrorCode;
import com.example.fitme.module.user_metric.dto.bodyMetric.BodyMetricRequest;
import com.example.fitme.module.user_metric.dto.health.CalculateMetricsRequest;
import com.example.fitme.module.user_metric.dto.health.HealthCalculationResponse;
import com.example.fitme.module.user_metric.entity.HealthCalculation;
import com.example.fitme.module.user_metric.mapper.HealthCalculationMapper;
import com.example.fitme.module.user_metric.repository.HealthCalculationRepository;
import com.example.fitme.module.user_metric.service.healthCaculation.HealthCalculationService;
import com.example.fitme.module.user_metric.service.bodymetric.BodyMetricService;
import com.example.fitme.module.user_metric.util.HealthMetricsCalculator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implementation of HealthCalculationService.
 * Performs health metrics calculations and manages calculation history.
 * 
 * Key Features:
 * - Uses Double precision for calculations (HealthMetricsCalculator)
 * - Stores as Float in database (automatic JPA conversion)
 * - Returns Double with proper rounding in DTOs (NumberFormatter)
 */
@Service
@RequiredArgsConstructor
public class HealthCalculationServiceImpl implements HealthCalculationService {

    private final HealthCalculationRepository healthCalculationRepository;
    private final HealthCalculationMapper healthCalculationMapper;
    private final BodyMetricService bodyMetricService;

    @Override
    @Transactional
    public HealthCalculationResponse calculateAndSave(CalculateMetricsRequest request) {
        // 1. Save body metrics FIRST (for history tracking)
        BodyMetricRequest bodyMetricRequest = BodyMetricRequest.builder()
            .userId(request.getUserId())
            .heightCm(request.getHeight())
            .weightKg(request.getWeight())
            .age(request.getAge())
            .gender(request.getGender())
            .activityLevel(request.getActivityLevel())
            .build();

        // create returns the saved DTO so we can reference the BodyMetric entity
        var savedMetric = bodyMetricService.create(bodyMetricRequest);
        
        // 2. Perform all calculations using Double precision (no goal needed)
        HealthMetricsCalculator.CompleteCalculationResult result = 
            HealthMetricsCalculator.calculateAll(
                request.getGender(),
                request.getWeight(),
                request.getHeight(),
                request.getAge(),
                request.getActivityLevel(),
                    request.getGoalTypes().name()
            );


        // Build HealthCalculation entity referencing the saved BodyMetric and user
        HealthCalculation entity = HealthCalculation.builder()
            .user(com.example.fitme.module.authentication.entity.UserProfile.builder().id(request.getUserId()).build())
            .bodyMetric(com.example.fitme.module.user_metric.entity.BodyMetric.builder().id(savedMetric.getId()).build())
            .bmi(Double.valueOf(result.getBmi()).floatValue())
            .bmr(Double.valueOf(result.getBmr()).floatValue())
            .tdee(Double.valueOf(result.getTdee()).floatValue())
                .goalType(request.getGoalTypes())
            .build();

        // Save to database
        HealthCalculation saved = healthCalculationRepository.save(entity);

        // Return DTO with properly rounded values
        return healthCalculationMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HealthCalculationResponse> getUserHistory(UUID userId) {
        return healthCalculationRepository.findByUser_IdOrderByCreatedAtDesc(userId)
                .stream()
                .map(healthCalculationMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public HealthCalculationResponse getLatestByUserId(UUID userId) {
        HealthCalculation entity = healthCalculationRepository.findFirstByUser_IdOrderByCreatedAtDesc(userId)
            .orElseThrow(() -> new ApiException(ErrorCode.HEALTH_CALCULATION_NOT_FOUND,
                "Không tìm thấy bản ghi tính toán cho user ID: " + userId));

        return healthCalculationMapper.toResponse(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public HealthCalculationResponse getById(UUID id) {
        HealthCalculation entity = healthCalculationRepository.findById(id)
                .orElseThrow(() -> new ApiException(ErrorCode.HEALTH_CALCULATION_NOT_FOUND,
                    "Không tìm thấy bản ghi tính toán với ID: " + id));

        return healthCalculationMapper.toResponse(entity);
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        if (!healthCalculationRepository.existsById(id)) {
            throw new ApiException(ErrorCode.HEALTH_CALCULATION_NOT_FOUND,
                "Không tìm thấy bản ghi tính toán với ID: " + id);
        }

        healthCalculationRepository.deleteById(id);
    }
}

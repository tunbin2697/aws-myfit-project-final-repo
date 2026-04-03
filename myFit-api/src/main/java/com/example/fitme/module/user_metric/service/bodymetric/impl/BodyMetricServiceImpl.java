package com.example.fitme.module.user_metric.service.bodymetric.impl;

import com.example.fitme.common.exception.ApiException;
import com.example.fitme.common.exception.ErrorCode;
import com.example.fitme.module.user_metric.mapper.BodyMetricMapper;
import com.example.fitme.module.user_metric.dto.bodyMetric.BodyMetricRequest;
import com.example.fitme.module.user_metric.dto.bodyMetric.BodyMetricResponse;
import com.example.fitme.module.user_metric.entity.BodyMetric;
import com.example.fitme.module.user_metric.repository.BodyMetricRepository;
import com.example.fitme.module.user_metric.service.bodymetric.BodyMetricService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.fitme.common.utils.OwnershipValidator;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implementation of BodyMetricService.
 * Provides CRUD operations for body metrics with transaction management.
 */
@Service
@RequiredArgsConstructor
public class BodyMetricServiceImpl implements BodyMetricService {

    private final BodyMetricRepository bodyMetricRepository;
    private final BodyMetricMapper bodyMetricMapper;
    private final OwnershipValidator ownershipValidator;

    @Override
    @Transactional
    public BodyMetricResponse create(BodyMetricRequest request) {
        // Authorization: only owner (or admin) can create metrics for the user
        ownershipValidator.checkUserOwnership(request.getUserId());

        BodyMetric entity = bodyMetricMapper.toEntity(request);
        BodyMetric saved = bodyMetricRepository.save(entity);
        return bodyMetricMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BodyMetricResponse> getUserHistory(UUID userId) {
        // Authorization: requester must be owner (or admin)
        ownershipValidator.checkUserOwnership(userId);

        return bodyMetricRepository.findByUser_IdOrderByCreatedAtDesc(userId)
                .stream()
                .map(bodyMetricMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public BodyMetricResponse getLatestByUserId(UUID userId) {
        // Authorization: requester must be owner (or admin)
        ownershipValidator.checkUserOwnership(userId);

        BodyMetric entity = bodyMetricRepository.findFirstByUser_IdOrderByCreatedAtDesc(userId)
            .orElseThrow(() -> new ApiException(
                ErrorCode.BODY_METRIC_NOT_FOUND,
                "Không tìm thấy body metrics cho user ID: " + userId));
        return bodyMetricMapper.toResponse(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public BodyMetricResponse getById(UUID id) {
        BodyMetric entity = bodyMetricRepository.findById(id)
            .orElseThrow(() -> new ApiException(
                ErrorCode.BODY_METRIC_NOT_FOUND,
                "Không tìm thấy body metric với ID: " + id));
        // Authorization: only owner (or admin) can access this metric
        ownershipValidator.checkUserOwnership(entity.getUser().getId());

        return bodyMetricMapper.toResponse(entity);
    }

    @Override
    @Transactional
    public BodyMetricResponse update(UUID id, BodyMetricRequest request) {
        BodyMetric entity = bodyMetricRepository.findById(id)
            .orElseThrow(() -> new ApiException(
                ErrorCode.BODY_METRIC_NOT_FOUND,
                "Không tìm thấy body metric với ID: " + id));
        // Authorization: only owner (or admin) can update
        ownershipValidator.checkUserOwnership(entity.getUser().getId());

        bodyMetricMapper.updateEntity(entity, request);
        BodyMetric updated = bodyMetricRepository.save(entity);
        return bodyMetricMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        BodyMetric entity = bodyMetricRepository.findById(id)
                .orElseThrow(() -> new ApiException(
                        ErrorCode.BODY_METRIC_NOT_FOUND,
                        "Không tìm thấy body metric với ID: " + id));
        // Authorization: only owner (or admin) can delete
        ownershipValidator.checkUserOwnership(entity.getUser().getId());

        bodyMetricRepository.deleteById(id);
    }
}

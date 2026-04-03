package com.example.fitme.module.system_goal.service.impl;

import com.example.fitme.common.exception.ApiException;
import com.example.fitme.common.exception.ErrorCode;
import com.example.fitme.module.system_goal.dto.GoalTypeRequest;
import com.example.fitme.module.system_goal.dto.GoalTypeResponse;
import com.example.fitme.module.system_goal.entity.GoalType;
import com.example.fitme.module.system_goal.mapper.GoalTypeMapper;
import com.example.fitme.module.system_goal.repo.GoalTypeRepository;
import com.example.fitme.module.system_goal.service.GoalTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implementation of GoalTypeService.
 * Handles CRUD operations for goal types.
 */
@Service
@RequiredArgsConstructor
public class GoalTypeServiceImpl implements GoalTypeService {

    private final GoalTypeRepository goalTypeRepository;
    private final GoalTypeMapper goalTypeMapper;

    @Override
    @Transactional
    public GoalTypeResponse create(GoalTypeRequest request) {
        // Check if goal type already exists
        if (goalTypeRepository.existsByName(request.getName())) {
            throw new ApiException(ErrorCode.GOAL_TYPE_DUPLICATE, 
                "Goal type '" + request.getName() + "' đã tồn tại");
        }

        GoalType entity = goalTypeMapper.toEntity(request);
        GoalType saved = goalTypeRepository.saveAndFlush(entity);

        return goalTypeMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GoalTypeResponse> getAll() {
        return goalTypeRepository.findAll()
                .stream()
                .map(goalTypeMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public GoalTypeResponse getById(UUID id) {
        GoalType entity = goalTypeRepository.findById(id)
                .orElseThrow(() -> new ApiException(ErrorCode.GOAL_TYPE_NOT_FOUND, 
                    "Không tìm thấy goal type với ID: " + id));
        
        return goalTypeMapper.toResponse(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public GoalTypeResponse getByName(String name) {
        GoalType entity = goalTypeRepository.findByName(name)
                .orElseThrow(() -> new ApiException(ErrorCode.GOAL_TYPE_NOT_FOUND, 
                    "Không tìm thấy goal type: " + name));
        
        return goalTypeMapper.toResponse(entity);
    }

    @Override
    @Transactional
    public GoalTypeResponse update(UUID id, GoalTypeRequest request) {
        GoalType entity = goalTypeRepository.findById(id)
                .orElseThrow(() -> new ApiException(ErrorCode.GOAL_TYPE_NOT_FOUND, 
                    "Không tìm thấy goal type với ID: " + id));

        // Check if new name conflicts with existing (excluding current entity)
        if (!entity.getName().equals(request.getName()) && 
            goalTypeRepository.existsByName(request.getName())) {
            throw new ApiException(ErrorCode.GOAL_TYPE_DUPLICATE, 
                "Goal type '" + request.getName() + "' đã tồn tại");
        }

        goalTypeMapper.updateEntity(entity, request);
        GoalType updated = goalTypeRepository.saveAndFlush(entity);

        return goalTypeMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        if (!goalTypeRepository.existsById(id)) {
            throw new ApiException(ErrorCode.GOAL_TYPE_NOT_FOUND, 
                "Không tìm thấy goal type với ID: " + id);
        }
        
        goalTypeRepository.deleteById(id);
    }
}

package com.example.fitme.module.system_workout.service.musclegroup.impl;

import com.example.fitme.common.exception.ApiException;
import com.example.fitme.common.exception.ErrorCode;
import com.example.fitme.module.system_workout.dto.musclegroup.MuscleGroupRequest;
import com.example.fitme.module.system_workout.dto.musclegroup.MuscleGroupResponse;
import com.example.fitme.module.system_workout.entity.MuscleGroup;
import com.example.fitme.module.system_workout.mapper.MuscleGroupMapper;
import com.example.fitme.module.system_workout.repository.MuscleGroupRepository;
import com.example.fitme.module.system_workout.service.musclegroup.MuscleGroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implementation of MuscleGroupService.
 */
@Service
@RequiredArgsConstructor
public class MuscleGroupServiceImpl implements MuscleGroupService {

    private final MuscleGroupRepository muscleGroupRepository;
    private final MuscleGroupMapper muscleGroupMapper;
    private final com.example.fitme.module.system_workout.repository.ExerciseRepository exerciseRepository;

    @Override
    @Transactional
    public MuscleGroupResponse create(MuscleGroupRequest request) {
        if (muscleGroupRepository.existsByName(request.getName())) {
            throw new ApiException(ErrorCode.MUSCLE_GROUP_DUPLICATE, 
                "Muscle group '" + request.getName() + "' already exists");
        }

        MuscleGroup entity = muscleGroupMapper.toEntity(request);
        MuscleGroup saved = muscleGroupRepository.save(entity);
        
        return muscleGroupMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MuscleGroupResponse> getAll() {
        return muscleGroupRepository.findAll()
                .stream()
                .map(muscleGroupMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public MuscleGroupResponse getById(UUID id) {
        MuscleGroup entity = muscleGroupRepository.findById(id)
                .orElseThrow(() -> new ApiException(ErrorCode.MUSCLE_GROUP_NOT_FOUND, 
                    "Muscle group not found with ID: " + id));
        
        return muscleGroupMapper.toResponse(entity);
    }

    @Override
    @Transactional
    public MuscleGroupResponse update(UUID id, MuscleGroupRequest request) {
        MuscleGroup entity = muscleGroupRepository.findById(id)
                .orElseThrow(() -> new ApiException(ErrorCode.MUSCLE_GROUP_NOT_FOUND, 
                    "Muscle group not found with ID: " + id));

        if (!entity.getName().equals(request.getName()) && 
            muscleGroupRepository.existsByName(request.getName())) {
            throw new ApiException(ErrorCode.MUSCLE_GROUP_DUPLICATE, 
                "Muscle group '" + request.getName() + "' already exists");
        }

        muscleGroupMapper.updateEntity(entity, request);
        MuscleGroup updated = muscleGroupRepository.save(entity);
        
        return muscleGroupMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        if (!muscleGroupRepository.existsById(id)) {
            throw new ApiException(ErrorCode.MUSCLE_GROUP_NOT_FOUND, 
                "Muscle group not found with ID: " + id);
        }
        // Prevent deletion if there are exercises referencing this muscle group
        if (!exerciseRepository.findByMuscleGroupId(id).isEmpty()) {
            throw new ApiException(ErrorCode.FORBIDDEN_ACTION,
                    "Cannot delete muscle group: it is referenced by exercises");
        }

        muscleGroupRepository.deleteById(id);
    }
}

package com.example.fitme.module.system_workout.service.exercise.impl;

import com.example.fitme.common.exception.ApiException;
import com.example.fitme.common.exception.ErrorCode;
import com.example.fitme.module.system_workout.dto.exercise.CustomExerciseRequest;
import com.example.fitme.module.system_workout.dto.exercise.ExerciseRequest;
import com.example.fitme.module.system_workout.dto.exercise.ExerciseResponse;
import com.example.fitme.module.system_workout.entity.Exercise;
import com.example.fitme.module.system_workout.entity.MuscleGroup;
import com.example.fitme.module.system_workout.mapper.ExerciseMapper;
import com.example.fitme.module.system_workout.repository.ExerciseRepository;
import com.example.fitme.module.system_workout.repository.MuscleGroupRepository;
import com.example.fitme.module.system_workout.service.exercise.ExerciseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class ExerciseServiceImpl implements ExerciseService {

    private final ExerciseRepository exerciseRepository;
    private final MuscleGroupRepository muscleGroupRepository;
    private final ExerciseMapper exerciseMapper;
    private final com.example.fitme.module.system_workout.repository.WorkoutPlanExerciseRepository workoutPlanExerciseRepository;
    private final com.example.fitme.module.user_workout_plan.repository.UserWorkoutPlanExerciseRepository userWorkoutPlanExerciseRepository;

    @Override
    @Transactional
    public ExerciseResponse create(ExerciseRequest request) {
        if (exerciseRepository.existsByName(request.getName())) {
            throw new ApiException(ErrorCode.EXERCISE_DUPLICATE, 
                "Exercise '" + request.getName() + "' already exists");
        }

        Exercise entity = exerciseMapper.toEntity(request);
        
        // Set muscle group if provided
        if (request.getMuscleGroupId() != null) {
            MuscleGroup muscleGroup = muscleGroupRepository.findById(request.getMuscleGroupId())
                    .orElseThrow(() -> new ApiException(ErrorCode.MUSCLE_GROUP_NOT_FOUND, 
                        "Muscle group not found with ID: " + request.getMuscleGroupId()));
            entity.setMuscleGroup(muscleGroup);
        }
        
        Exercise saved = exerciseRepository.save(entity);
        
        return exerciseMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public ExerciseResponse createCustom(CustomExerciseRequest request) {
// check xem exercises đã tồn tại hay là chưa
        Exercise existing = exerciseRepository.findAllWithMuscleGroup().stream()
                .filter(e -> e.getName().equalsIgnoreCase(request.getName().trim()))
                .findFirst()
                .orElse(null);
                
        if (existing != null) {
            return exerciseMapper.toResponse(existing);
        }

        Exercise entity = new Exercise();
        entity.setName(request.getName().trim());
        entity.setDescription("Custom user created exercise");
        entity.setEquipment("Bất kỳ");

        // Use the first available muscle group as fallback
        List<MuscleGroup> allMuscleGroups = muscleGroupRepository.findAll();
        if (!allMuscleGroups.isEmpty()) {
            entity.setMuscleGroup(allMuscleGroups.get(0));
        }

        Exercise saved = exerciseRepository.save(entity);
        return exerciseMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExerciseResponse> getAll() {
        return exerciseRepository.findAllWithMuscleGroup()
                .stream()
                .map(exerciseMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ExerciseResponse getById(UUID id) {
        Exercise entity = exerciseRepository.findByIdWithMuscleGroup(id)
                .orElseThrow(() -> new ApiException(ErrorCode.EXERCISE_NOT_FOUND, 
                    "Exercise not found with ID: " + id));
        
        return exerciseMapper.toResponse(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExerciseResponse> getByMuscleGroupId(UUID muscleGroupId) {
        // Verify muscle group exists
        if (!muscleGroupRepository.existsById(muscleGroupId)) {
            throw new ApiException(ErrorCode.MUSCLE_GROUP_NOT_FOUND, 
                "Muscle group not found with ID: " + muscleGroupId);
        }
        
        return exerciseRepository.findByMuscleGroupId(muscleGroupId)
                .stream()
                .map(exerciseMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ExerciseResponse update(UUID id, ExerciseRequest request) {
        Exercise entity = exerciseRepository.findById(id)
                .orElseThrow(() -> new ApiException(ErrorCode.EXERCISE_NOT_FOUND, 
                    "Exercise not found with ID: " + id));

        if (!entity.getName().equals(request.getName()) && 
            exerciseRepository.existsByName(request.getName())) {
            throw new ApiException(ErrorCode.EXERCISE_DUPLICATE, 
                "Exercise '" + request.getName() + "' already exists");
        }

        exerciseMapper.updateEntity(entity, request);
        
        // Update muscle group if provided
        if (request.getMuscleGroupId() != null) {
            MuscleGroup muscleGroup = muscleGroupRepository.findById(request.getMuscleGroupId())
                    .orElseThrow(() -> new ApiException(ErrorCode.MUSCLE_GROUP_NOT_FOUND, 
                        "Muscle group not found with ID: " + request.getMuscleGroupId()));
            entity.setMuscleGroup(muscleGroup);
        } else {
            entity.setMuscleGroup(null);
        }
        
        Exercise updated = exerciseRepository.save(entity);
        
        return exerciseMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        if (!exerciseRepository.existsById(id)) {
            throw new ApiException(ErrorCode.EXERCISE_NOT_FOUND, 
                "Exercise not found with ID: " + id);
        }
        // Prevent deletion if referenced by any workout plan (system) or user plan
        if (workoutPlanExerciseRepository.existsByExerciseId(id) ||
                userWorkoutPlanExerciseRepository.existsByExerciseId(id)) {
            throw new ApiException(ErrorCode.FORBIDDEN_ACTION,
                    "Cannot delete exercise: it is referenced by workout plans or user plans");
        }

        exerciseRepository.deleteById(id);
    }
}

package com.example.fitme.module.system_workout.service.workoutplan.impl;

import com.example.fitme.common.exception.ApiException;
import com.example.fitme.common.exception.ErrorCode;
import com.example.fitme.module.system_goal.entity.GoalType;
import com.example.fitme.module.system_goal.repo.GoalTypeRepository;
import com.example.fitme.module.system_workout.dto.workoutplan.*;
import com.example.fitme.module.system_workout.entity.Exercise;
import com.example.fitme.module.system_workout.entity.WorkoutPlan;
import com.example.fitme.module.system_workout.entity.WorkoutPlanExercise;
import com.example.fitme.module.system_workout.mapper.WorkoutPlanMapper;
import com.example.fitme.module.system_workout.repository.ExerciseRepository;
import com.example.fitme.module.system_workout.repository.WorkoutPlanExerciseRepository;
import com.example.fitme.module.system_workout.repository.WorkoutPlanRepository;
import com.example.fitme.module.system_workout.service.workoutplan.SystemWorkoutPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implementation of SystemWorkoutPlanService.
 * Handles CRUD operations for system workout plan templates.
 */
@Service
@RequiredArgsConstructor
public class SystemWorkoutPlanServiceImpl implements SystemWorkoutPlanService {

    private final WorkoutPlanRepository workoutPlanRepository;
    private final WorkoutPlanExerciseRepository workoutPlanExerciseRepository;
    private final ExerciseRepository exerciseRepository;
    private final GoalTypeRepository goalTypeRepository;
    private final WorkoutPlanMapper workoutPlanMapper;

    @Override
    @Transactional
    public WorkoutPlanResponse create(WorkoutPlanRequest request) {
        // Check for duplicate plan name
        if (workoutPlanRepository.existsByName(request.getName())) {
            throw new ApiException(ErrorCode.WORKOUT_PLAN_DUPLICATE, 
                "System workout plan '" + request.getName() + "' already exists");
        }

        WorkoutPlan entity = workoutPlanMapper.toEntity(request);

        // Set goal type if provided
        if (request.getGoalTypeId() != null) {
            GoalType goalType = goalTypeRepository.findById(request.getGoalTypeId())
                    .orElseThrow(() -> new ApiException(ErrorCode.GOAL_TYPE_NOT_FOUND, 
                        "Goal type not found with ID: " + request.getGoalTypeId()));
            entity.setGoalType(goalType);
        }

        WorkoutPlan saved = workoutPlanRepository.save(entity);

        // Add exercises if provided
        if (request.getExercises() != null && !request.getExercises().isEmpty()) {
            List<WorkoutPlanExercise> exercises = new ArrayList<>();
            for (WorkoutPlanExerciseRequest exerciseRequest : request.getExercises()) {
                WorkoutPlanExercise wpe = createWorkoutPlanExercise(saved, exerciseRequest);
                exercises.add(wpe);
            }
            workoutPlanExerciseRepository.saveAll(exercises);
            saved.setExercises(exercises);
        }

        return workoutPlanMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WorkoutPlanSummaryResponse> getAllSystemPlans() {
        return workoutPlanRepository.findAllWithGoalType()
                .stream()
                .map(workoutPlanMapper::toSummaryResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<WorkoutPlanSummaryResponse> getSystemPlansByGoalType(UUID goalTypeId) {
        // Verify goal type exists
        if (!goalTypeRepository.existsById(goalTypeId)) {
            throw new ApiException(ErrorCode.GOAL_TYPE_NOT_FOUND, 
                "Goal type not found with ID: " + goalTypeId);
        }
        
        return workoutPlanRepository.findByGoalTypeId(goalTypeId)
                .stream()
                .map(workoutPlanMapper::toSummaryResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public WorkoutPlanResponse getById(UUID id) {
        WorkoutPlan entity = workoutPlanRepository.findByIdWithExercises(id)
                .orElseThrow(() -> new ApiException(ErrorCode.WORKOUT_PLAN_NOT_FOUND, 
                    "Workout plan not found with ID: " + id));
        
        // It's a system plan by model design

        return workoutPlanMapper.toResponse(entity);
    }

    @Override
    @Transactional
    public WorkoutPlanResponse update(UUID id, WorkoutPlanRequest request) {
        WorkoutPlan entity = workoutPlanRepository.findById(id)
                .orElseThrow(() -> new ApiException(ErrorCode.WORKOUT_PLAN_NOT_FOUND, 
                    "Workout plan not found with ID: " + id));

        // It's a system plan by model design

        // Check for duplicate name (excluding current)
        if (!entity.getName().equals(request.getName()) && 
            workoutPlanRepository.existsByName(request.getName())) {
            throw new ApiException(ErrorCode.WORKOUT_PLAN_DUPLICATE, 
                "System workout plan '" + request.getName() + "' already exists");
        }

        workoutPlanMapper.updateEntity(entity, request);

        // Update goal type
        if (request.getGoalTypeId() != null) {
            GoalType goalType = goalTypeRepository.findById(request.getGoalTypeId())
                    .orElseThrow(() -> new ApiException(ErrorCode.GOAL_TYPE_NOT_FOUND, 
                        "Goal type not found with ID: " + request.getGoalTypeId()));
            entity.setGoalType(goalType);
        } else {
            entity.setGoalType(null);
        }

        // Replace exercises if provided
        if (request.getExercises() != null) {
            // Clear existing exercises
            workoutPlanExerciseRepository.deleteByWorkoutPlanId(id);
            entity.getExercises().clear();

            // Add new exercises
            if (!request.getExercises().isEmpty()) {
                List<WorkoutPlanExercise> exercises = new ArrayList<>();
                for (WorkoutPlanExerciseRequest exerciseRequest : request.getExercises()) {
                    WorkoutPlanExercise wpe = createWorkoutPlanExercise(entity, exerciseRequest);
                    exercises.add(wpe);
                }
                workoutPlanExerciseRepository.saveAll(exercises);
                entity.setExercises(exercises);
            }
        }

        WorkoutPlan updated = workoutPlanRepository.save(entity);
        
        return workoutPlanMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        WorkoutPlan entity = workoutPlanRepository.findById(id)
                .orElseThrow(() -> new ApiException(ErrorCode.WORKOUT_PLAN_NOT_FOUND, 
                    "Workout plan not found with ID: " + id));

        // Verify it's a system plan

        workoutPlanRepository.delete(entity);
    }

    @Override
    @Transactional
    public WorkoutPlanResponse addExercise(UUID workoutPlanId, WorkoutPlanExerciseRequest request) {
        WorkoutPlan entity = workoutPlanRepository.findById(workoutPlanId)
                .orElseThrow(() -> new ApiException(ErrorCode.WORKOUT_PLAN_NOT_FOUND, 
                    "Workout plan not found with ID: " + workoutPlanId));

        // It's a system plan by model design

        WorkoutPlanExercise wpe = createWorkoutPlanExercise(entity, request);
        workoutPlanExerciseRepository.save(wpe);

        // Reload with all exercises
        return getById(workoutPlanId);
    }

    @Override
    @Transactional
    public void removeExercise(UUID workoutPlanId, UUID workoutPlanExerciseId) {
        // Verify workout plan exists
        if (!workoutPlanRepository.existsById(workoutPlanId)) {
            throw new ApiException(ErrorCode.WORKOUT_PLAN_NOT_FOUND,
                    "Workout plan not found with ID: " + workoutPlanId);
        }

        WorkoutPlanExercise wpe = workoutPlanExerciseRepository.findById(workoutPlanExerciseId)
                .orElseThrow(() -> new ApiException(ErrorCode.WORKOUT_PLAN_EXERCISE_NOT_FOUND, 
                    "Workout plan exercise not found with ID: " + workoutPlanExerciseId));

        // Verify exercise belongs to this workout plan
        if (!wpe.getWorkoutPlan().getId().equals(workoutPlanId)) {
            throw new ApiException(ErrorCode.FORBIDDEN_ACTION, 
                "Exercise does not belong to this workout plan");
        }

        workoutPlanExerciseRepository.delete(wpe);
    }

    @Override
    @Transactional
    public WorkoutPlanExerciseResponse updateExercise(UUID workoutPlanId, UUID workoutPlanExerciseId,
                                                       WorkoutPlanExerciseRequest request) {
        // Verify workout plan exists
        if (!workoutPlanRepository.existsById(workoutPlanId)) {
            throw new ApiException(ErrorCode.WORKOUT_PLAN_NOT_FOUND,
                    "Workout plan not found with ID: " + workoutPlanId);
        }

        WorkoutPlanExercise wpe = workoutPlanExerciseRepository.findById(workoutPlanExerciseId)
                .orElseThrow(() -> new ApiException(ErrorCode.WORKOUT_PLAN_EXERCISE_NOT_FOUND, 
                    "Workout plan exercise not found with ID: " + workoutPlanExerciseId));

        // Verify exercise belongs to this workout plan
        if (!wpe.getWorkoutPlan().getId().equals(workoutPlanId)) {
            throw new ApiException(ErrorCode.FORBIDDEN_ACTION, 
                "Exercise does not belong to this workout plan");
        }

        // Update exercise if changed
        if (request.getExerciseId() != null && 
            !request.getExerciseId().equals(wpe.getExercise().getId())) {
            Exercise exercise = exerciseRepository.findById(request.getExerciseId())
                    .orElseThrow(() -> new ApiException(ErrorCode.EXERCISE_NOT_FOUND, 
                        "Exercise not found with ID: " + request.getExerciseId()));
            wpe.setExercise(exercise);
        }

        // Update other fields
        if (request.getDayOfWeek() != null) wpe.setDayOfWeek(request.getDayOfWeek());
        if (request.getSets() != null) wpe.setSets(request.getSets());
        if (request.getReps() != null) wpe.setReps(request.getReps());
        if (request.getRestSeconds() != null) wpe.setRestSeconds(request.getRestSeconds());
        if (request.getDayIndex() != null) wpe.setDayIndex(request.getDayIndex());
        if (request.getWeekIndex() != null) wpe.setWeekIndex(request.getWeekIndex());
        if (request.getOrderIndex() != null) wpe.setOrderIndex(request.getOrderIndex());

        WorkoutPlanExercise updated = workoutPlanExerciseRepository.save(wpe);
        
        return workoutPlanMapper.toExerciseResponse(updated);
    }

    /**
     * Helper method to create WorkoutPlanExercise entity from request.
     */
    private WorkoutPlanExercise createWorkoutPlanExercise(WorkoutPlan workoutPlan, 
                                                           WorkoutPlanExerciseRequest request) {
        Exercise exercise = exerciseRepository.findById(request.getExerciseId())
                .orElseThrow(() -> new ApiException(ErrorCode.EXERCISE_NOT_FOUND, 
                    "Exercise not found with ID: " + request.getExerciseId()));

        return WorkoutPlanExercise.builder()
                .workoutPlan(workoutPlan)
                .exercise(exercise)
                .dayOfWeek(request.getDayOfWeek())
                .sets(request.getSets())
                .reps(request.getReps())
                .restSeconds(request.getRestSeconds())
                .dayIndex(request.getDayIndex())
                .weekIndex(request.getWeekIndex())
                .orderIndex(request.getOrderIndex())
                .build();
    }
}

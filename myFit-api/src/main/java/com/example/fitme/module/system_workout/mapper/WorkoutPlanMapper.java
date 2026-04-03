package com.example.fitme.module.system_workout.mapper;

import com.example.fitme.module.system_goal.dto.GoalTypeResponse;
import com.example.fitme.module.system_goal.entity.GoalType;
import com.example.fitme.module.system_workout.dto.workoutplan.*;
import com.example.fitme.module.system_workout.entity.WorkoutPlan;
import com.example.fitme.module.system_workout.entity.WorkoutPlanExercise;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper for WorkoutPlan entity and DTOs.
 */
@Component
@RequiredArgsConstructor
public class WorkoutPlanMapper {

    private final ExerciseMapper exerciseMapper;

    /**
     * Convert Request DTO to Entity for system workout plan.
     * Note: GoalType should be set separately after fetching from repository.
     */
    public WorkoutPlan toEntity(WorkoutPlanRequest request) {
        return WorkoutPlan.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();
    }

    /**
     * Update existing entity from Request DTO.
     */
    public void updateEntity(WorkoutPlan entity, WorkoutPlanRequest request) {
        entity.setName(request.getName());
        entity.setDescription(request.getDescription());
    }

    /**
     * Convert Entity to full Response DTO (with exercises).
     */
    public WorkoutPlanResponse toResponse(WorkoutPlan entity) {
        if (entity == null) {
            return null;
        }
        return WorkoutPlanResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .goalType(toGoalTypeResponse(entity.getGoalType()))
                .exercises(toExerciseResponses(entity.getExercises()))
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    /**
     * Convert Entity to Summary Response DTO (without exercises).
     */
    public WorkoutPlanSummaryResponse toSummaryResponse(WorkoutPlan entity) {
        if (entity == null) {
            return null;
        }
        return WorkoutPlanSummaryResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .goalType(toGoalTypeResponse(entity.getGoalType()))
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    /**
     * Convert WorkoutPlanExercise entity to Response DTO.
     */
    public WorkoutPlanExerciseResponse toExerciseResponse(WorkoutPlanExercise entity) {
        if (entity == null) {
            return null;
        }
        return WorkoutPlanExerciseResponse.builder()
                .id(entity.getId())
                .exercise(exerciseMapper.toResponse(entity.getExercise()))
                .dayOfWeek(entity.getDayOfWeek())
                .sets(entity.getSets())
                .reps(entity.getReps())
                .restSeconds(entity.getRestSeconds())
                .dayIndex(entity.getDayIndex())
                .weekIndex(entity.getWeekIndex())
                .orderIndex(entity.getOrderIndex())
                .build();
    }

    /**
     * Convert list of WorkoutPlanExercise entities to Response DTOs.
     */
    public List<WorkoutPlanExerciseResponse> toExerciseResponses(List<WorkoutPlanExercise> entities) {
        if (entities == null || entities.isEmpty()) {
            return Collections.emptyList();
        }
        return entities.stream()
                .map(this::toExerciseResponse)
                .collect(Collectors.toList());
    }

    /**
     * Convert GoalType entity to Response DTO.
     */
    private GoalTypeResponse toGoalTypeResponse(GoalType entity) {
        if (entity == null) {
            return null;
        }
        return GoalTypeResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}

package com.example.fitme.module.user_workout_plan.mapper;

import com.example.fitme.module.user_workout_plan.dto.UserWorkoutPlanExerciseRequest;
import com.example.fitme.module.user_workout_plan.dto.UserWorkoutPlanExerciseResponse;
import com.example.fitme.module.user_workout_plan.entity.UserWorkoutPlanExercise;
import com.example.fitme.module.user_workout_plan.entity.UserWorkoutPlan;
import com.example.fitme.module.system_workout.entity.Exercise;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Mapper for UserWorkoutPlanExercise entity and DTOs.
 */
@Component
public class UserWorkoutPlanExerciseMapper {

    /**
     * Convert request DTO + planId (from path variable) to entity.
     */
    public UserWorkoutPlanExercise toEntity(UUID planId, UserWorkoutPlanExerciseRequest request) {
        return UserWorkoutPlanExercise.builder()
                .userWorkoutPlan(UserWorkoutPlan.builder().id(planId).build())
                .exercise(Exercise.builder().id(request.getExerciseId()).build())
                .dayOfWeek(request.getDayOfWeek())
                .sets(request.getSets())
                .reps(request.getReps())
                .restSeconds(request.getRestSeconds())
                .dayIndex(request.getDayIndex())
                .weekIndex(request.getWeekIndex())
                .orderIndex(request.getOrderIndex())
                .build();
    }

    /**
     * Convert entity to response DTO.
     */
    public UserWorkoutPlanExerciseResponse toResponse(UserWorkoutPlanExercise entity) {
        return UserWorkoutPlanExerciseResponse.builder()
                .id(entity.getId())
                .userWorkoutPlanId(entity.getUserWorkoutPlan() != null ? entity.getUserWorkoutPlan().getId() : null)
                .exerciseId(entity.getExercise() != null ? entity.getExercise().getId() : null)
                .dayOfWeek(entity.getDayOfWeek())
                .sets(entity.getSets())
                .reps(entity.getReps())
                .restSeconds(entity.getRestSeconds())
                .dayIndex(entity.getDayIndex())
                .weekIndex(entity.getWeekIndex())
                .orderIndex(entity.getOrderIndex())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    /**
     * Apply update request to existing entity.
     */
    public void updateEntity(UserWorkoutPlanExercise entity, UserWorkoutPlanExerciseRequest request) {
        entity.setExercise(Exercise.builder().id(request.getExerciseId()).build());
        entity.setDayOfWeek(request.getDayOfWeek());
        entity.setSets(request.getSets());
        entity.setReps(request.getReps());
        entity.setRestSeconds(request.getRestSeconds());
        entity.setDayIndex(request.getDayIndex());
        entity.setWeekIndex(request.getWeekIndex());
        entity.setOrderIndex(request.getOrderIndex());
    }
}

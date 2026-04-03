package com.example.fitme.module.user_workout_plan.service.impl;

import com.example.fitme.common.exception.ApiException;
import com.example.fitme.common.exception.ErrorCode;
import com.example.fitme.module.user_workout_plan.dto.UserWorkoutPlanExerciseRequest;
import com.example.fitme.module.user_workout_plan.dto.UserWorkoutPlanExerciseResponse;
import com.example.fitme.module.user_workout_plan.dto.UserWorkoutPlanRequest;
import com.example.fitme.module.user_workout_plan.dto.UserWorkoutPlanResponse;
import com.example.fitme.module.user_workout_plan.entity.UserWorkoutPlan;
import com.example.fitme.module.user_workout_plan.entity.UserWorkoutPlanExercise;
import com.example.fitme.module.user_workout_plan.mapper.UserWorkoutPlanExerciseMapper;
import com.example.fitme.module.user_workout_plan.mapper.UserWorkoutPlanMapper;
import com.example.fitme.module.user_workout_plan.repository.UserWorkoutPlanExerciseRepository;
import com.example.fitme.module.user_workout_plan.repository.UserWorkoutPlanRepository;
import com.example.fitme.module.user_workout_plan.service.UserWorkoutPlanService;
import com.example.fitme.module.system_workout.entity.WorkoutPlan;
import com.example.fitme.module.system_workout.entity.WorkoutPlanExercise;
import com.example.fitme.module.system_workout.repository.WorkoutPlanExerciseRepository;
import com.example.fitme.module.system_workout.repository.WorkoutPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.fitme.common.utils.OwnershipValidator;

import java.util.List;
import java.util.UUID;
import com.example.fitme.module.authentication.entity.UserProfile;
import java.util.stream.Collectors;

/**
 * Implementation of UserWorkoutPlanService.
 *
 * Security: userId is always extracted from JWT at the Controller layer
 * and passed here — never trusted from client input.
 *
 * Ownership: Every write/read on a specific plan verifies that
 * plan.userId == the requesting userId. Violations throw FORBIDDEN.
 */
@Service
@RequiredArgsConstructor
public class UserWorkoutPlanServiceImpl implements UserWorkoutPlanService {

    private final UserWorkoutPlanRepository planRepository;
    private final UserWorkoutPlanExerciseRepository exerciseRepository;
    private final WorkoutPlanRepository systemPlanRepository;
    private final WorkoutPlanExerciseRepository systemExerciseRepository;
    private final UserWorkoutPlanMapper planMapper;
    private final UserWorkoutPlanExerciseMapper exerciseMapper;
    private final OwnershipValidator ownershipValidator;

    // =========================================================================
    // Plan operations
    // =========================================================================

    @Override
    @Transactional
    public UserWorkoutPlanResponse createPlan(UUID userId, UserWorkoutPlanRequest request) {
        // Authorization: requester must be owner (or admin)
        ownershipValidator.checkUserOwnership(userId);

        UserWorkoutPlan entity = planMapper.toEntity(userId, request);
        if (Boolean.TRUE.equals(entity.getIsActive())) {
            deactivateAllUserPlans(userId);
        }
        UserWorkoutPlan saved = planRepository.save(entity);
        return planMapper.toResponse(saved);
    }

    /**
     * Thực hiện clone một plan về và sở hữu bởi một user account
     */
    @Override
    @Transactional
    public UserWorkoutPlanResponse cloneFromSystemPlan(UUID userId, UUID systemPlanId) {
        // Authorization: requester must be owner (or admin)
        ownershipValidator.checkUserOwnership(userId);

        // 1. Verify that the source plan exists and is a system plan
        WorkoutPlan systemPlan = systemPlanRepository.findById(systemPlanId)
                .orElseThrow(() -> new ApiException(ErrorCode.WORKOUT_PLAN_NOT_FOUND,
                        "System plan not found: " + systemPlanId));

        // System plans are the only plans stored in WorkoutPlan entity in current model

        // 2. Deactivate all current active plans for this user
        deactivateAllUserPlans(userId);

        // 3. Resolve goalTypeId from the system plan's GoalType relationship
        UUID goalTypeId = (systemPlan.getGoalType() != null)
                ? systemPlan.getGoalType().getId()
                : null;

        // 4. Create the user plan (copy of system plan, NO source pointer)
        UserWorkoutPlan userPlan = UserWorkoutPlan.builder()
            .user(UserProfile.builder().id(userId).build())
            .name(systemPlan.getName())
            .description(systemPlan.getDescription())
            .goalTypeId(goalTypeId)
            .isActive(true)
            .build();

        UserWorkoutPlan savedPlan = planRepository.save(userPlan);

        // 5. Copy all exercises from the system plan
        List<WorkoutPlanExercise> systemExercises =
                systemExerciseRepository.findByWorkoutPlanIdOrdered(systemPlanId);

        List<UserWorkoutPlanExercise> userExercises = systemExercises.stream()
            .map(sysEx -> UserWorkoutPlanExercise.builder()
                .userWorkoutPlan(UserWorkoutPlan.builder().id(savedPlan.getId()).build())
                .exercise(com.example.fitme.module.system_workout.entity.Exercise.builder().id(sysEx.getExercise().getId()).build())
                .dayOfWeek(sysEx.getDayOfWeek())
                .sets(sysEx.getSets())
                .reps(sysEx.getReps())
                .restSeconds(sysEx.getRestSeconds())
                .dayIndex(sysEx.getDayIndex())
                .weekIndex(sysEx.getWeekIndex())
                .orderIndex(sysEx.getOrderIndex())
                .build())
            .collect(Collectors.toList());

        exerciseRepository.saveAll(userExercises);

        // 6. Return response with exercises populated
        List<UserWorkoutPlanExerciseResponse> exerciseResponses = userExercises.stream()
                .map(exerciseMapper::toResponse)
                .collect(Collectors.toList());

        UserWorkoutPlanResponse response = planMapper.toResponse(savedPlan);
        response.setExercises(exerciseResponses);
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserWorkoutPlanResponse> getMyPlans(UUID userId) {
        ownershipValidator.checkUserOwnership(userId);

        return planRepository.findByUserId(userId)
                .stream()
                .map(planMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public UserWorkoutPlanResponse getMyActivePlan(UUID userId) {
        ownershipValidator.checkUserOwnership(userId);

        UserWorkoutPlan plan = planRepository.findByUserIdAndIsActiveTrue(userId)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_WORKOUT_PLAN_NOT_FOUND,
                        "No active plan found for user: " + userId));
        return planMapper.toResponse(plan);
    }

    @Override
    @Transactional(readOnly = true)
    public UserWorkoutPlanResponse getPlanById(UUID userId, UUID planId) {
        ownershipValidator.checkUserOwnership(userId);

        UserWorkoutPlan plan = findAndVerifyOwnership(userId, planId);

        List<UserWorkoutPlanExerciseResponse> exercises =
                exerciseRepository.findByUserWorkoutPlanIdOrderByOrderIndex(planId)
                        .stream()
                        .map(exerciseMapper::toResponse)
                        .collect(Collectors.toList());

        UserWorkoutPlanResponse response = planMapper.toResponse(plan);
        response.setExercises(exercises);
        return response;
    }

    @Override
    @Transactional
    public UserWorkoutPlanResponse updatePlan(UUID userId, UUID planId, UserWorkoutPlanRequest request) {
        ownershipValidator.checkUserOwnership(userId);

        UserWorkoutPlan plan = findAndVerifyOwnership(userId, planId);
        boolean shouldActivate = Boolean.TRUE.equals(request.getIsActive());
        if (shouldActivate) {
            deactivateAllUserPlans(userId);
        }
        planMapper.updateEntity(plan, request);
        if (shouldActivate) {
            plan.setIsActive(true);
        }
        return planMapper.toResponse(planRepository.save(plan));
    }

    /**
     * Activate the specified plan and deactivate all others for this user.
     */
    @Override
    @Transactional
    public UserWorkoutPlanResponse activatePlan(UUID userId, UUID planId) {
        ownershipValidator.checkUserOwnership(userId);

        UserWorkoutPlan plan = findAndVerifyOwnership(userId, planId);
        deactivateAllUserPlans(userId);
        plan.setIsActive(true);
        return planMapper.toResponse(planRepository.save(plan));
    }

    @Override
    @Transactional
    public void deletePlan(UUID userId, UUID planId) {
        ownershipValidator.checkUserOwnership(userId);

        UserWorkoutPlan plan = findAndVerifyOwnership(userId, planId);
        
        // Soft delete the plan to preserve history of logged sessions
        plan.setIsDeleted(true);
        plan.setIsActive(false);
        planRepository.save(plan);
    }

    // =========================================================================
    // Exercise operations
    // =========================================================================

    @Override
    @Transactional
    public UserWorkoutPlanExerciseResponse addExercise(UUID userId, UUID planId,
            UserWorkoutPlanExerciseRequest request) {
        // Authorization: requester must be owner (or admin)
        ownershipValidator.checkUserOwnership(userId);
        findAndVerifyOwnership(userId, planId);

        UserWorkoutPlanExercise entity = exerciseMapper.toEntity(planId, request);
        return exerciseMapper.toResponse(exerciseRepository.save(entity));
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserWorkoutPlanExerciseResponse> getExercisesByPlan(UUID userId, UUID planId) {
        ownershipValidator.checkUserOwnership(userId);
        findAndVerifyOwnership(userId, planId);
        return exerciseRepository.findByUserWorkoutPlanIdOrderByOrderIndex(planId)
                .stream()
                .map(exerciseMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public UserWorkoutPlanExerciseResponse updateExercise(UUID userId, UUID planId,
            UUID exerciseId, UserWorkoutPlanExerciseRequest request) {
        ownershipValidator.checkUserOwnership(userId);
        findAndVerifyOwnership(userId, planId);

        UserWorkoutPlanExercise entity = exerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_WORKOUT_PLAN_EXERCISE_NOT_FOUND,
                        "Exercise entry not found: " + exerciseId));

        // Confirm this exercise belongs to the plan in the URL
        if (!entity.getUserWorkoutPlan().getId().equals(planId)) {
            throw new ApiException(ErrorCode.USER_WORKOUT_PLAN_FORBIDDEN,
                    "Exercise does not belong to this plan");
        }

        exerciseMapper.updateEntity(entity, request);
        return exerciseMapper.toResponse(exerciseRepository.save(entity));
    }

    @Override
    @Transactional
    public void removeExercise(UUID userId, UUID planId, UUID exerciseId) {
        ownershipValidator.checkUserOwnership(userId);
        findAndVerifyOwnership(userId, planId);

        UserWorkoutPlanExercise entity = exerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_WORKOUT_PLAN_EXERCISE_NOT_FOUND,
                        "Exercise entry not found: " + exerciseId));

        if (!entity.getUserWorkoutPlan().getId().equals(planId)) {
            throw new ApiException(ErrorCode.USER_WORKOUT_PLAN_FORBIDDEN,
                    "Exercise does not belong to this plan");
        }

        exerciseRepository.delete(entity);
    }


    private UserWorkoutPlan findAndVerifyOwnership(UUID userId, UUID planId) {
        UserWorkoutPlan plan = planRepository.findById(planId)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_WORKOUT_PLAN_NOT_FOUND,
                        "User workout plan not found: " + planId));

        if (!plan.getUser().getId().equals(userId)) {
            throw new ApiException(ErrorCode.USER_WORKOUT_PLAN_FORBIDDEN,
                    "You do not own this workout plan");
        }
        return plan;
    }

    private void deactivateAllUserPlans(UUID userId) {
        List<UserWorkoutPlan> activePlans = planRepository.findAllByUserIdAndIsActiveTrue(userId);
        if (activePlans.isEmpty()) {
            return;
        }
        activePlans.forEach(p -> p.setIsActive(false));
        planRepository.saveAll(activePlans);
        // Flush deactivations early so a subsequent insert/update can safely set one plan active.
        planRepository.flush();
    }
}

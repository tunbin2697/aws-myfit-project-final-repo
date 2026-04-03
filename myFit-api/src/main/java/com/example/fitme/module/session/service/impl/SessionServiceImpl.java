package com.example.fitme.module.session.service.impl;

import com.example.fitme.module.session.dto.*;
import com.example.fitme.module.session.dto.AddWorkoutLogRequest;
import com.example.fitme.module.session.dto.WorkoutLogResponse;
import com.example.fitme.module.session.entity.UserWorkoutSession;
import com.example.fitme.module.session.entity.WorkoutLog;
import com.example.fitme.module.authentication.entity.UserProfile;
import com.example.fitme.module.system_workout.entity.Exercise;
import com.example.fitme.module.session.repository.UserWorkoutSessionRepository;
import com.example.fitme.module.session.repository.WorkoutLogRepository;
import com.example.fitme.module.session.service.SessionService;
import com.example.fitme.common.exception.ApiException;
import com.example.fitme.common.exception.ErrorCode;
import com.example.fitme.module.user_workout_plan.entity.UserWorkoutPlan;
import com.example.fitme.common.utils.OwnershipValidator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class SessionServiceImpl implements SessionService {

    private final UserWorkoutSessionRepository sessionRepository;
    private final com.example.fitme.module.user_workout_plan.repository.UserWorkoutPlanRepository userWorkoutPlanRepository;
    private final WorkoutLogRepository workoutLogRepository;
    private final OwnershipValidator ownershipValidator;

    public SessionServiceImpl(UserWorkoutSessionRepository sessionRepository,
                              com.example.fitme.module.user_workout_plan.repository.UserWorkoutPlanRepository userWorkoutPlanRepository,
                              WorkoutLogRepository workoutLogRepository,
                              OwnershipValidator ownershipValidator) {
        this.sessionRepository = sessionRepository;
        this.userWorkoutPlanRepository = userWorkoutPlanRepository;
        this.workoutLogRepository = workoutLogRepository;
        this.ownershipValidator = ownershipValidator;
    }

    @Override
    public SessionResponse createSession(CreateSessionRequest request) {
        // Authorization: requester must be the owner (or admin)
        ownershipValidator.checkUserOwnership(request.getUserId());

        // If a planId is provided, verify it exists and belongs to the user
        if (request.getUserWorkoutPlanId() != null) {
            UserWorkoutPlan plan = userWorkoutPlanRepository.findById(request.getUserWorkoutPlanId())
                    .orElseThrow(() -> new ApiException(
                            ErrorCode.USER_WORKOUT_PLAN_NOT_FOUND,
                            "User workout plan not found: " + request.getUserWorkoutPlanId()));

            if (!plan.getUser().getId().equals(request.getUserId())) {
                throw new ApiException(
                        ErrorCode.USER_WORKOUT_PLAN_FORBIDDEN,
                        "Plan does not belong to the user");
            }
        }

        List<UserWorkoutSession> activeSessions = sessionRepository.findByUser_IdAndIsActiveTrue(request.getUserId());
        activeSessions.forEach(s -> s.setIsActive(false));

        UserWorkoutSession entity = UserWorkoutSession.builder()
            .user(UserProfile.builder().id(request.getUserId()).build())
            .userWorkoutPlan(request.getUserWorkoutPlanId() != null ? UserWorkoutPlan.builder().id(request.getUserWorkoutPlanId()).build() : null)
            .workoutDate(request.getWorkoutDate())
            .isActive(true)
            .weekIndex(request.getWeekIndex())
            .dayIndex(request.getDayIndex())
            .build();

        UserWorkoutSession saved = sessionRepository.save(entity);
        SessionResponse resp = new SessionResponse();
        resp.setId(saved.getId());
        resp.setUserId(saved.getUser().getId());
        resp.setUserWorkoutPlanId(saved.getUserWorkoutPlan() != null ? saved.getUserWorkoutPlan().getId() : null);
        resp.setWorkoutDate(saved.getWorkoutDate());
        resp.setIsActive(saved.getIsActive());
        resp.setWeekIndex(saved.getWeekIndex());
        resp.setDayIndex(saved.getDayIndex());
        return resp;
    }

    @Override
    public SessionResponse getSession(UUID sessionId) {
        UserWorkoutSession sess = sessionRepository.findById(sessionId)
            .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Session not found: " + sessionId));

        // Authorization: only owner (or admin) can view session
        ownershipValidator.checkUserOwnership(sess.getUser().getId());
        SessionResponse resp = new SessionResponse();
        resp.setId(sess.getId());
        resp.setUserId(sess.getUser().getId());
        resp.setUserWorkoutPlanId(sess.getUserWorkoutPlan() != null ? sess.getUserWorkoutPlan().getId() : null);
        resp.setWorkoutDate(sess.getWorkoutDate());
        resp.setIsActive(sess.getIsActive());
        resp.setWeekIndex(sess.getWeekIndex());
        resp.setDayIndex(sess.getDayIndex());

        // New log-based entries (performed sets)
        List<WorkoutLog> logs = workoutLogRepository.findByUserWorkoutSession_IdOrderByCreatedAt(sess.getId());
        resp.setLogs(logs.stream().map(l -> {
            WorkoutLogResponse wr = new WorkoutLogResponse();
            wr.setId(l.getId());
            wr.setSessionId(l.getUserWorkoutSession().getId());
            wr.setExerciseId(l.getExercise().getId());
            wr.setSetNumber(l.getSetNumber());
            wr.setReps(l.getReps());
            wr.setWeight(l.getWeight());
            wr.setDurationSeconds(l.getDurationSeconds());
            wr.setCreatedAt(l.getCreatedAt());
            return wr;
        }).collect(Collectors.toList()));

        return resp;
    }

    @Override
    public SessionResponse getActiveSessionByUser(UUID userId) {
        ownershipValidator.checkUserOwnership(userId);

        UserWorkoutSession sess = sessionRepository.findFirstByUser_IdAndIsActiveTrueOrderByCreatedAtDesc(userId)
                .orElseThrow(() -> new ApiException(
                        ErrorCode.RESOURCE_NOT_FOUND,
                        "No active session found for user: " + userId));

        SessionResponse resp = new SessionResponse();
        resp.setId(sess.getId());
        resp.setUserId(sess.getUser().getId());
        resp.setUserWorkoutPlanId(sess.getUserWorkoutPlan() != null ? sess.getUserWorkoutPlan().getId() : null);
        resp.setWorkoutDate(sess.getWorkoutDate());
        resp.setIsActive(sess.getIsActive());
        resp.setWeekIndex(sess.getWeekIndex());
        resp.setDayIndex(sess.getDayIndex());

        List<WorkoutLog> logs = workoutLogRepository.findByUserWorkoutSession_IdOrderByCreatedAt(sess.getId());
        resp.setLogs(logs.stream().map(l -> {
            WorkoutLogResponse wr = new WorkoutLogResponse();
            wr.setId(l.getId());
            wr.setSessionId(l.getUserWorkoutSession().getId());
            wr.setExerciseId(l.getExercise().getId());
            wr.setSetNumber(l.getSetNumber());
            wr.setReps(l.getReps());
            wr.setWeight(l.getWeight());
            wr.setDurationSeconds(l.getDurationSeconds());
            wr.setCreatedAt(l.getCreatedAt());
            return wr;
        }).collect(Collectors.toList()));

        return resp;
    }

    @Override
    public SessionResponse deactivateSession(UUID sessionId) {
        UserWorkoutSession sess = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ApiException(
                        ErrorCode.RESOURCE_NOT_FOUND,
                        "Session not found: " + sessionId));

        ownershipValidator.checkUserOwnership(sess.getUser().getId());
        sess.setIsActive(false);

        UserWorkoutSession saved = sessionRepository.save(sess);
        SessionResponse resp = new SessionResponse();
        resp.setId(saved.getId());
        resp.setUserId(saved.getUser().getId());
        resp.setUserWorkoutPlanId(saved.getUserWorkoutPlan() != null ? saved.getUserWorkoutPlan().getId() : null);
        resp.setWorkoutDate(saved.getWorkoutDate());
        resp.setIsActive(saved.getIsActive());
        resp.setWeekIndex(saved.getWeekIndex());
        resp.setDayIndex(saved.getDayIndex());
        return resp;
    }

    @Override
    public WorkoutLogResponse addLog(UUID sessionId, AddWorkoutLogRequest request) {
        // verify session exists
        UserWorkoutSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ApiException(
                        ErrorCode.RESOURCE_NOT_FOUND,
                        "Session not found: " + sessionId));
        // Authorization: requester must own the session (or be admin)
        ownershipValidator.checkUserOwnership(session.getUser().getId());

        WorkoutLog log = WorkoutLog.builder()
            .userWorkoutSession(UserWorkoutSession.builder().id(sessionId).build())
            .exercise(Exercise.builder().id(request.getExerciseId()).build())
                .setNumber(request.getSetNumber())
                .reps(request.getReps())
                .weight(request.getWeight())
                .durationSeconds(request.getDurationSeconds())
                .build();

        WorkoutLog saved = workoutLogRepository.save(log);

        WorkoutLogResponse resp = new WorkoutLogResponse();
        resp.setId(saved.getId());
        resp.setSessionId(saved.getUserWorkoutSession().getId());
        resp.setExerciseId(saved.getExercise().getId());
        resp.setSetNumber(saved.getSetNumber());
        resp.setReps(saved.getReps());
        resp.setWeight(saved.getWeight());
        resp.setDurationSeconds(saved.getDurationSeconds());
        resp.setCreatedAt(saved.getCreatedAt());
        return resp;
    }

    @Override
    public List<SessionResponse> listSessionsByUser(UUID userId) {
        // Authorization: requester must be owner (or admin)
        ownershipValidator.checkUserOwnership(userId);

        List<UserWorkoutSession> sessions = sessionRepository.findByUser_Id(userId);
        return sessions.stream().map(s -> {
            SessionResponse resp = new SessionResponse();
            resp.setId(s.getId());
            resp.setUserId(s.getUser().getId());
            resp.setUserWorkoutPlanId(s.getUserWorkoutPlan() != null ? s.getUserWorkoutPlan().getId() : null);
            resp.setWorkoutDate(s.getWorkoutDate());
            resp.setIsActive(s.getIsActive());
            resp.setWeekIndex(s.getWeekIndex());
            resp.setDayIndex(s.getDayIndex());
            return resp;
        }).collect(Collectors.toList());
    }
    @Override
    public List<SessionResponse> getSessionWithLogsByDate(UUID userId, java.time.LocalDate date) {
        // Authorization: requester must be owner (or admin)
        ownershipValidator.checkUserOwnership(userId);

        List<UserWorkoutSession> sessions = sessionRepository.findByUser_IdAndWorkoutDate(userId, date);
        return sessions.stream().map(sess -> {
            SessionResponse resp = new SessionResponse();
            resp.setId(sess.getId());
            resp.setUserId(sess.getUser().getId());
            resp.setUserWorkoutPlanId(sess.getUserWorkoutPlan() != null ? sess.getUserWorkoutPlan().getId() : null);
            resp.setWorkoutDate(sess.getWorkoutDate());
            resp.setIsActive(sess.getIsActive());
            resp.setWeekIndex(sess.getWeekIndex());
            resp.setDayIndex(sess.getDayIndex());

            // Populate logs
            List<WorkoutLog> logs = workoutLogRepository.findByUserWorkoutSession_IdOrderByCreatedAt(sess.getId());
            resp.setLogs(logs.stream().map(l -> {
                WorkoutLogResponse wr = new WorkoutLogResponse();
                wr.setId(l.getId());
                wr.setSessionId(l.getUserWorkoutSession().getId());
                wr.setExerciseId(l.getExercise().getId());
                wr.setSetNumber(l.getSetNumber());
                wr.setReps(l.getReps());
                wr.setWeight(l.getWeight());
                wr.setDurationSeconds(l.getDurationSeconds());
                wr.setCreatedAt(l.getCreatedAt());
                return wr;
            }).collect(Collectors.toList()));

            return resp;
        }).collect(Collectors.toList());
    }
}

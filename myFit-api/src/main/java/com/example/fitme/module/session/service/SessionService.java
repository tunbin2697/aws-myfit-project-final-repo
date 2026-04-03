package com.example.fitme.module.session.service;

import com.example.fitme.module.session.dto.*;
import com.example.fitme.module.session.dto.AddWorkoutLogRequest;
import com.example.fitme.module.session.dto.WorkoutLogResponse;

import java.util.List;
import java.util.UUID;

public interface SessionService {
    SessionResponse createSession(CreateSessionRequest request);
    SessionResponse getSession(UUID sessionId);
    SessionResponse getActiveSessionByUser(UUID userId);
    SessionResponse deactivateSession(UUID sessionId);
    WorkoutLogResponse addLog(UUID sessionId, AddWorkoutLogRequest request);
    List<SessionResponse> listSessionsByUser(UUID userId);
    List<SessionResponse> getSessionWithLogsByDate(UUID userId, java.time.LocalDate date);
}

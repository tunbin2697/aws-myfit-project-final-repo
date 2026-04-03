package com.example.fitme.module.session.controller;

import com.example.fitme.common.response.ApiResponse;
import com.example.fitme.module.session.dto.*;
import com.example.fitme.module.session.service.SessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class UserWorkoutSessionController {

    private final SessionService sessionService;

    @PostMapping
    public ResponseEntity<ApiResponse<SessionResponse>> createSession(@Valid @RequestBody CreateSessionRequest request) {
        SessionResponse resp = sessionService.createSession(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<SessionResponse>builder()
                        .code(1000)
                        .message("Session created")
                        .result(resp)
                        .timestamp(Instant.now())
                        .path("/api/sessions")
                        .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SessionResponse>> getSession(@PathVariable UUID id) {
        SessionResponse resp = sessionService.getSession(id);
        return ResponseEntity.ok(ApiResponse.<SessionResponse>builder()
                .code(1000)
                .message("Success")
                .result(resp)
                .timestamp(Instant.now())
                .path("/api/sessions/" + id)
                .build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<SessionResponse>>> listByUser(@PathVariable UUID userId) {
        List<SessionResponse> list = sessionService.listSessionsByUser(userId);
        return ResponseEntity.ok(ApiResponse.<List<SessionResponse>>builder()
                .code(1000)
                .message("Success")
                .result(list)
                .timestamp(Instant.now())
                .path("/api/sessions/user/" + userId)
                .build());
    }

    @GetMapping("/user/{userId}/by-date")
    public ResponseEntity<ApiResponse<List<SessionResponse>>> getSessionsByDate(
            @PathVariable UUID userId,
            @RequestParam @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate date) {
        List<SessionResponse> list = sessionService.getSessionWithLogsByDate(userId, date);
        return ResponseEntity.ok(ApiResponse.<List<SessionResponse>>builder()
                .code(1000)
                .message("Success")
                .result(list)
                .timestamp(Instant.now())
                .path("/api/sessions/user/" + userId + "/by-date")
                .build());
    }

        @GetMapping("/user/{userId}/active")
        public ResponseEntity<ApiResponse<SessionResponse>> getActiveSession(@PathVariable UUID userId) {
                SessionResponse resp = sessionService.getActiveSessionByUser(userId);
                return ResponseEntity.ok(ApiResponse.<SessionResponse>builder()
                                .code(1000)
                                .message("Success")
                                .result(resp)
                                .timestamp(Instant.now())
                                .path("/api/sessions/user/" + userId + "/active")
                                .build());
        }

        @PatchMapping("/{sessionId}/deactivate")
        public ResponseEntity<ApiResponse<SessionResponse>> deactivateSession(@PathVariable UUID sessionId) {
                SessionResponse resp = sessionService.deactivateSession(sessionId);
                return ResponseEntity.ok(ApiResponse.<SessionResponse>builder()
                                .code(1000)
                                .message("Session deactivated")
                                .result(resp)
                                .timestamp(Instant.now())
                                .path("/api/sessions/" + sessionId + "/deactivate")
                                .build());
        }


    @PostMapping("/{sessionId}/logs")
    public ResponseEntity<ApiResponse<WorkoutLogResponse>> addLog(@PathVariable UUID sessionId,
                                                                   @Valid @RequestBody AddWorkoutLogRequest request) {
        WorkoutLogResponse lr = sessionService.addLog(sessionId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<WorkoutLogResponse>builder()
                        .code(1000)
                        .message("Log added")
                        .result(lr)
                        .timestamp(Instant.now())
                        .path("/api/sessions/" + sessionId + "/logs")
                        .build());
    }

    
}

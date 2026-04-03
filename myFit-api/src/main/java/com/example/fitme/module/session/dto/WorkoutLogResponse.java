package com.example.fitme.module.session.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
public class WorkoutLogResponse {
    private UUID id;
    private UUID sessionId;
    private UUID exerciseId;
    private Integer setNumber;
    private Integer reps;
    private Float weight;
    private Integer durationSeconds;
    private LocalDateTime createdAt;
}

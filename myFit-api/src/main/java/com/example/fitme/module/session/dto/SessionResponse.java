package com.example.fitme.module.session.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
public class SessionResponse {
    private UUID id;
    private UUID userId;
    private UUID userWorkoutPlanId;
    private LocalDate workoutDate;
    private Boolean isActive;
    private Integer weekIndex;
    private Integer dayIndex;
    private List<com.example.fitme.module.session.dto.WorkoutLogResponse> logs;
}

package com.example.fitme.module.session.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
public class CreateSessionRequest {
    @NotNull(message = "User ID cannot be null")
    private UUID userId;

    @NotNull(message = "User workout plan ID cannot be null")
    private UUID userWorkoutPlanId;
    private LocalDate workoutDate;
    private Integer weekIndex;
    private Integer dayIndex;
}

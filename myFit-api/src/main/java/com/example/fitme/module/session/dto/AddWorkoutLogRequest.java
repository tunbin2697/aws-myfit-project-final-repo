package com.example.fitme.module.session.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
public class AddWorkoutLogRequest {
    @NotNull
    private UUID exerciseId;

    @NotNull
    private Integer setNumber;

    private Integer reps;
    private Float weight;
    private Integer durationSeconds;
}

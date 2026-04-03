package com.example.fitme.module.media.dto;

import lombok.Builder;
import lombok.Data;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class ImageResponse {
    private UUID id;
    private String url;
    private Boolean isThumbnail;
    private UUID foodId;
    private UUID workoutPlanId;
    private UUID exerciseId;
    private Instant createdAt;
    private Instant updatedAt;
}

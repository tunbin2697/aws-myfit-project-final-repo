package com.example.fitme.module.media.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.UUID;

@Data
public class ImageRequest {
    @NotBlank(message = "Image URL is required")
    private String url;
    
    private Boolean isThumbnail = false;
    
    private UUID foodId;
    private UUID workoutPlanId;
    private UUID exerciseId;
}

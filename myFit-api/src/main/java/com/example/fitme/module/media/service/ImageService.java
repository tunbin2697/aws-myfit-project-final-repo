package com.example.fitme.module.media.service;

import com.example.fitme.module.media.dto.ImageRequest;
import com.example.fitme.module.media.dto.ImageResponse;

import java.util.List;
import java.util.UUID;

public interface ImageService {
    ImageResponse create(ImageRequest request);
    ImageResponse findById(UUID id);
    List<ImageResponse> findByFoodId(UUID foodId);
    List<ImageResponse> findByWorkoutPlanId(UUID workoutPlanId);
    List<ImageResponse> findByExerciseId(UUID exerciseId);
    ImageResponse update(UUID id, ImageRequest request);
    void delete(UUID id);
}

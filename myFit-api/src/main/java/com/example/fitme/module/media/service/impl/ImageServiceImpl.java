package com.example.fitme.module.media.service.impl;

import com.example.fitme.module.food.entity.Food;
import com.example.fitme.module.food.repository.FoodRepository;
import com.example.fitme.module.media.dto.ImageRequest;
import com.example.fitme.module.media.dto.ImageResponse;
import com.example.fitme.module.media.entity.Image;
import com.example.fitme.module.media.repository.ImageRepository;
import com.example.fitme.module.media.service.ImageService;
import com.example.fitme.module.system_workout.entity.Exercise;
import com.example.fitme.module.system_workout.repository.ExerciseRepository;
import com.example.fitme.module.system_workout.entity.WorkoutPlan;
import com.example.fitme.module.system_workout.repository.WorkoutPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImageServiceImpl implements ImageService {

    private final ImageRepository imageRepository;
    private final FoodRepository foodRepository;
    private final WorkoutPlanRepository workoutPlanRepository;
    private final ExerciseRepository exerciseRepository;

    @Override
    @Transactional
    public ImageResponse create(ImageRequest request) {
        validateExclusiveArc(request);

        Image image = new Image();
        image.setUrl(request.getUrl());
        image.setIsThumbnail(request.getIsThumbnail());

        if (request.getFoodId() != null) {
            Food food = foodRepository.findById(request.getFoodId())
                    .orElseThrow(() -> new RuntimeException("Food not found"));
            image.setFood(food);
        }
        if (request.getWorkoutPlanId() != null) {
            WorkoutPlan wp = workoutPlanRepository.findById(request.getWorkoutPlanId())
                    .orElseThrow(() -> new RuntimeException("WorkoutPlan not found"));
            image.setWorkoutPlan(wp);
        }
        if (request.getExerciseId() != null) {
            Exercise ex = exerciseRepository.findById(request.getExerciseId())
                    .orElseThrow(() -> new RuntimeException("Exercise not found"));
            image.setExercise(ex);
        }

        Image saved = imageRepository.save(image);
        return mapToResponse(saved);
    }

    @Override
    public ImageResponse findById(UUID id) {
        Image image = imageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Image not found"));
        return mapToResponse(image);
    }

    @Override
    public List<ImageResponse> findByFoodId(UUID foodId) {
        return imageRepository.findByFoodId(foodId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ImageResponse> findByWorkoutPlanId(UUID workoutPlanId) {
        return imageRepository.findByWorkoutPlanId(workoutPlanId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ImageResponse> findByExerciseId(UUID exerciseId) {
        return imageRepository.findByExerciseId(exerciseId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ImageResponse update(UUID id, ImageRequest request) {
        validateExclusiveArc(request);

        Image image = imageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Image not found"));

        image.setUrl(request.getUrl());
        image.setIsThumbnail(request.getIsThumbnail());

        image.setFood(null);
        image.setWorkoutPlan(null);
        image.setExercise(null);

        if (request.getFoodId() != null) {
            Food food = foodRepository.findById(request.getFoodId())
                    .orElseThrow(() -> new RuntimeException("Food not found"));
            image.setFood(food);
        } else if (request.getWorkoutPlanId() != null) {
            WorkoutPlan wp = workoutPlanRepository.findById(request.getWorkoutPlanId())
                    .orElseThrow(() -> new RuntimeException("WorkoutPlan not found"));
            image.setWorkoutPlan(wp);
        } else if (request.getExerciseId() != null) {
            Exercise ex = exerciseRepository.findById(request.getExerciseId())
                    .orElseThrow(() -> new RuntimeException("Exercise not found"));
            image.setExercise(ex);
        }

        Image saved = imageRepository.save(image);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        if (!imageRepository.existsById(id)) {
            throw new RuntimeException("Image not found");
        }
        imageRepository.deleteById(id);
    }

    private void validateExclusiveArc(ImageRequest request) {
        int count = 0;
        if (request.getFoodId() != null) count++;
        if (request.getWorkoutPlanId() != null) count++;
        if (request.getExerciseId() != null) count++;
        
        if (count != 1) {
            throw new IllegalArgumentException("Image must be associated with exactly ONE entity (Food, WorkoutPlan, OR Exercise)");
        }
    }

    private ImageResponse mapToResponse(Image image) {
        return ImageResponse.builder()
                .id(image.getId())
                .url(image.getUrl())
                .isThumbnail(image.getIsThumbnail())
                .foodId(image.getFood() != null ? image.getFood().getId() : null)
                .workoutPlanId(image.getWorkoutPlan() != null ? image.getWorkoutPlan().getId() : null)
                .exerciseId(image.getExercise() != null ? image.getExercise().getId() : null)
                .createdAt(image.getCreatedAt())
                .updatedAt(image.getUpdatedAt())
                .build();
    }
}

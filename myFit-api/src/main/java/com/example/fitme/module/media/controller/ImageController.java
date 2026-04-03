package com.example.fitme.module.media.controller;

import com.example.fitme.common.response.ApiResponse;
import com.example.fitme.module.media.dto.ImageRequest;
import com.example.fitme.module.media.dto.ImageResponse;
import com.example.fitme.module.media.service.ImageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
public class ImageController {

    private final ImageService imageService;

    @PostMapping
    public ResponseEntity<ApiResponse<ImageResponse>> create(@Valid @RequestBody ImageRequest request) {
        ImageResponse response = imageService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<ImageResponse>builder()
                        .code(1000)
                        .message("Image created successfully")
                        .result(response)
                        .timestamp(Instant.now())
                        .path("/api/images")
                        .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ImageResponse>> getById(@PathVariable UUID id) {
        ImageResponse response = imageService.findById(id);
        return ResponseEntity.ok(
                ApiResponse.<ImageResponse>builder()
                        .code(1000)
                        .message("Success")
                        .result(response)
                        .timestamp(Instant.now())
                        .path("/api/images/" + id)
                        .build());
    }

    @GetMapping("/food/{foodId}")
    public ResponseEntity<ApiResponse<List<ImageResponse>>> getByFoodId(@PathVariable UUID foodId) {
        List<ImageResponse> response = imageService.findByFoodId(foodId);
        return ResponseEntity.ok(
                ApiResponse.<List<ImageResponse>>builder()
                        .code(1000)
                        .message("Success")
                        .result(response)
                        .timestamp(Instant.now())
                        .path("/api/images/food/" + foodId)
                        .build());
    }

    @GetMapping("/workout-plan/{workoutPlanId}")
    public ResponseEntity<ApiResponse<List<ImageResponse>>> getByWorkoutPlanId(@PathVariable UUID workoutPlanId) {
        List<ImageResponse> response = imageService.findByWorkoutPlanId(workoutPlanId);
        return ResponseEntity.ok(
                ApiResponse.<List<ImageResponse>>builder()
                        .code(1000)
                        .message("Success")
                        .result(response)
                        .timestamp(Instant.now())
                        .path("/api/images/workout-plan/" + workoutPlanId)
                        .build());
    }

    @GetMapping("/exercise/{exerciseId}")
    public ResponseEntity<ApiResponse<List<ImageResponse>>> getByExerciseId(@PathVariable UUID exerciseId) {
        List<ImageResponse> response = imageService.findByExerciseId(exerciseId);
        return ResponseEntity.ok(
                ApiResponse.<List<ImageResponse>>builder()
                        .code(1000)
                        .message("Success")
                        .result(response)
                        .timestamp(Instant.now())
                        .path("/api/images/exercise/" + exerciseId)
                        .build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ImageResponse>> update(@PathVariable UUID id, @Valid @RequestBody ImageRequest request) {
        ImageResponse response = imageService.update(id, request);
        return ResponseEntity.ok(
                ApiResponse.<ImageResponse>builder()
                        .code(1000)
                        .message("Image updated successfully")
                        .result(response)
                        .timestamp(Instant.now())
                        .path("/api/images/" + id)
                        .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        imageService.delete(id);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .code(1000)
                        .message("Image deleted successfully")
                        .result(null)
                        .timestamp(Instant.now())
                        .path("/api/images/" + id)
                        .build());
    }
}

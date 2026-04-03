package com.example.fitme.module.food.controller;

import com.example.fitme.common.response.ApiResponse;
import com.example.fitme.module.food.dtos.meal.MealRequest;
import com.example.fitme.module.food.dtos.meal.MealResponse;
import com.example.fitme.module.food.service.meal.MealService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/meals")
@RequiredArgsConstructor
public class MealController {

    private final MealService mealService;

    /**
     * Create new meal
     */
    @PostMapping
    public ResponseEntity<ApiResponse<MealResponse>> create(
            @Valid @RequestBody MealRequest request) {

        MealResponse response = mealService.create(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<MealResponse>builder()
                        .code(1000)
                        .message("Meal created successfully")
                        .result(response)
                        .timestamp(Instant.now())
                        .path("/api/meals")
                        .build());
    }

    /**
     * Get meal by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MealResponse>> getById(
            @PathVariable UUID id) {

        MealResponse response = mealService.findById(id);

        return ResponseEntity.ok(
                ApiResponse.<MealResponse>builder()
                        .code(1000)
                        .message("Success")
                        .result(response)
                        .timestamp(Instant.now())
                        .path("/api/meals/" + id)
                        .build());
    }

    /**
     * Get all meals with pagination
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<MealResponse>>> getAll(
            Pageable pageable) {

        Page<MealResponse> response = mealService.findAll(pageable);

        return ResponseEntity.ok(
                ApiResponse.<Page<MealResponse>>builder()
                        .code(1000)
                        .message("Success")
                        .result(response)
                        .timestamp(Instant.now())
                        .path("/api/meals")
                        .build());
    }

    /**
     * Get meals by date
     */
    @GetMapping("/by-date")
    public ResponseEntity<ApiResponse<List<MealResponse>>> getByDate(
            @RequestParam LocalDate date) {

        List<MealResponse> response = mealService.findByDate(date);

        return ResponseEntity.ok(
                ApiResponse.<List<MealResponse>>builder()
                        .code(1000)
                        .message("Success")
                        .result(response)
                        .timestamp(Instant.now())
                        .path("/api/meals/by-date?date=" + date)
                        .build());
    }

    /**
     * Get meals by meal type
     */
    @GetMapping("/by-type")
    public ResponseEntity<ApiResponse<List<MealResponse>>> getByType(
            @RequestParam String mealType) {

        List<MealResponse> response = mealService.findByMealType(mealType);

        return ResponseEntity.ok(
                ApiResponse.<List<MealResponse>>builder()
                        .code(1000)
                        .message("Success")
                        .result(response)
                        .timestamp(Instant.now())
                        .path("/api/meals/by-type?mealType=" + mealType)
                        .build());
    }

    /**
     * Update meal
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MealResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody MealRequest request) {

        MealResponse response = mealService.update(id, request);

        return ResponseEntity.ok(
                ApiResponse.<MealResponse>builder()
                        .code(1000)
                        .message("Meal updated successfully")
                        .result(response)
                        .timestamp(Instant.now())
                        .path("/api/meals/" + id)
                        .build());
    }

    /**
     * Delete meal
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID id) {

        mealService.delete(id);

        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .code(1000)
                        .message("Meal deleted successfully")
                        .result(null)
                        .timestamp(Instant.now())
                        .path("/api/meals/" + id)
                        .build());
    }
    @GetMapping("/user/{id}")
    public ResponseEntity<ApiResponse<List<MealResponse>>> getUserMeal(
            @PathVariable UUID id
    ){
        List<MealResponse> meals = mealService.findByUserId(id);

        return ResponseEntity.ok(
                ApiResponse.<List<MealResponse>>builder()
                        .code(1000)
                        .message("User meal found successfully")
                        .result(meals)
                        .timestamp(Instant.now())
                        .path("/user/" + id)
                        .build());

    }
}
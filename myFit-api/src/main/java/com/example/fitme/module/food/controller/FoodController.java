package com.example.fitme.module.food.controller;

import com.example.fitme.common.response.ApiResponse;
import com.example.fitme.module.food.dtos.food.FoodRequest;
import com.example.fitme.module.food.dtos.food.FoodResponse;
import com.example.fitme.module.food.service.food.FoodService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/foods")
@RequiredArgsConstructor
public class FoodController {

    private final FoodService foodService;

    /**
     * Create new food
     */
    @PostMapping
    public ResponseEntity<ApiResponse<FoodResponse>> create(
            @Valid @RequestBody FoodRequest request) {

        FoodResponse response = foodService.create(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<FoodResponse>builder()
                        .code(1000)
                        .message("Food created successfully")
                        .result(response)
                        .timestamp(Instant.now())
                        .path("/api/foods")
                        .build());
    }

    /**
     * Get food by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FoodResponse>> getById(
            @PathVariable UUID id) {

        FoodResponse response = foodService.findById(id);

        return ResponseEntity.ok(
                ApiResponse.<FoodResponse>builder()
                        .code(1000)
                        .message("Success")
                        .result(response)
                        .timestamp(Instant.now())
                        .path("/api/foods/" + id)
                        .build());
    }

    /**
     * Get all foods with pagination
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<FoodResponse>>> getAll(
            Pageable pageable) {

        Page<FoodResponse> response = foodService.findAll(pageable);

        return ResponseEntity.ok(
                ApiResponse.<Page<FoodResponse>>builder()
                        .code(1000)
                        .message("Success")
                        .result(response)
                        .timestamp(Instant.now())
                        .path("/api/foods")
                        .build());
    }

    /**
     * Search food by keyword
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<FoodResponse>>> search(
            @RequestParam String keyword) {

        List<FoodResponse> response = foodService.search(keyword);

        return ResponseEntity.ok(
                ApiResponse.<List<FoodResponse>>builder()
                        .code(1000)
                        .message("Success")
                        .result(response)
                        .timestamp(Instant.now())
                        .path("/api/foods/search?keyword=" + keyword)
                        .build());
    }

    /**
     * Update food
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<FoodResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody FoodRequest request) {

        FoodResponse response = foodService.update(id, request);

        return ResponseEntity.ok(
                ApiResponse.<FoodResponse>builder()
                        .code(1000)
                        .message("Food updated successfully")
                        .result(response)
                        .timestamp(Instant.now())
                        .path("/api/foods/" + id)
                        .build());
    }

    /**
     * Delete food
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID id) {

        foodService.delete(id);

        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .code(1000)
                        .message("Food deleted successfully")
                        .result(null)
                        .timestamp(Instant.now())
                        .path("/api/foods/" + id)
                        .build());
    }
}
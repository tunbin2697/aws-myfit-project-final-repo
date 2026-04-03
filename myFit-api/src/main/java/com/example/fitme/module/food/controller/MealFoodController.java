package com.example.fitme.module.food.controller;

import com.example.fitme.common.response.ApiResponse;
import com.example.fitme.module.food.dtos.meal_food.MealFoodRequest;
import com.example.fitme.module.food.dtos.meal_food.MealFoodResponse;
import com.example.fitme.module.food.service.meal_food.MealFoodService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/meal-foods")
@RequiredArgsConstructor
public class MealFoodController {

    private final MealFoodService mealFoodService;

    /**
     * Add food to meal
     */
    @PostMapping
    public ResponseEntity<ApiResponse<MealFoodResponse>> addFoodToMeal(
            @Valid @RequestBody MealFoodRequest request) {

        MealFoodResponse response =
                mealFoodService.addFoodToMeal(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<MealFoodResponse>builder()
                        .code(1000)
                        .message("Food added to meal successfully")
                        .result(response)
                        .timestamp(Instant.now())
                        .path("/api/meal-foods")
                        .build());
    }

    /**
     * Get all foods in a meal
     */
    @GetMapping("/meal/{mealId}")
    public ResponseEntity<ApiResponse<List<MealFoodResponse>>> getByMeal(
            @PathVariable UUID mealId) {

        List<MealFoodResponse> response =
                mealFoodService.getByMeal(mealId);

        return ResponseEntity.ok(
                ApiResponse.<List<MealFoodResponse>>builder()
                        .code(1000)
                        .message("Success")
                        .result(response)
                        .timestamp(Instant.now())
                        .path("/api/meal-foods/meal/" + mealId)
                        .build());
    }

    /**
     * Remove food from meal
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> remove(
            @PathVariable UUID id) {

        mealFoodService.remove(id);

        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .code(1000)
                        .message("Food removed from meal successfully")
                        .result(null)
                        .timestamp(Instant.now())
                        .path("/api/meal-foods/" + id)
                        .build());
    }
}
package com.example.fitme.module.food.controller;

import com.example.fitme.common.response.ApiResponse;
import com.example.fitme.module.food.dtos.daily_nutrition.DailyNutritionResponse;
import com.example.fitme.module.food.service.daily_nutrion.DailyNutrionService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/daily-nutrition")
@RequiredArgsConstructor
public class DailyNutritionController {

    @Autowired
    private DailyNutrionService dailyNutritionService;

    /**
     * Calculate and update daily nutrition for a specific date.
     */
    @PostMapping("/calculate")
    public ResponseEntity<ApiResponse<DailyNutritionResponse>> calculate(
            @RequestParam LocalDate date) {

        DailyNutritionResponse response =
                dailyNutritionService.calculateByDate(date);

        return ResponseEntity.ok(
                ApiResponse.<DailyNutritionResponse>builder()
                        .code(1000)
                        .message("Daily nutrition calculated successfully")
                        .result(response)
                        .timestamp(Instant.now())
                        .path("/api/daily-nutrition/calculate?date=" + date)
                        .build()
        );
    }

    /**
     * Get daily nutrition by date.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<DailyNutritionResponse>> getByDate(
            @RequestParam LocalDate date) {

        DailyNutritionResponse response =
                dailyNutritionService.getByDate(date);

        return ResponseEntity.ok(
                ApiResponse.<DailyNutritionResponse>builder()
                        .code(1000)
                        .message("Success")
                        .result(response)
                        .timestamp(Instant.now())
                        .path("/api/daily-nutrition?date=" + date)
                        .build()
        );
    }
}
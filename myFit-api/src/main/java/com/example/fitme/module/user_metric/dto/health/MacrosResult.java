package com.example.fitme.module.user_metric.dto.health;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Macronutrients result in grams.
 * Rounded to 2 decimal places for better UX.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MacrosResult {
    private Double protein; // grams
    private Double carbs;   // grams
    private Double fat;     // grams
}

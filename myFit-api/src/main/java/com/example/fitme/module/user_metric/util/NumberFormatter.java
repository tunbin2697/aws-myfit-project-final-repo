package com.example.fitme.module.user_metric.util;

/**
 * Utility for consistent number rounding across DTOs.
 * - BMI, BMR, TDEE: 1 decimal place (23.5)
 * - Macros (grams): 2 decimal places (125.67)
 */
public class NumberFormatter {

    /**
     * Round to 1 decimal place.
     * Used for: BMI, BMR, TDEE, Calorie Goal
     */
    public static double round1(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    /**
     * Round to 2 decimal places.
     * Used for: Protein, Carbs, Fat (grams)
     */
    public static double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    /**
     * Round to 0 decimal places (integer).
     * Used for: Age, display calories
     */
    public static int roundToInt(double value) {
        return (int) Math.round(value);
    }
}

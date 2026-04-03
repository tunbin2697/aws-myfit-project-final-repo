package com.example.fitme.module.user_metric.util;

import com.example.fitme.module.user_metric.enumType.ActivityLevel;
import com.example.fitme.module.user_metric.enumType.Gender;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

/**
 * Health metrics calculator using scientifically validated formulas.
 * All calculations use Double precision to avoid rounding errors.
 * 
 * Formulas:
 * - BMI: Weight(kg) / Height(m)²
 * - BMR: Mifflin-St Jeor equation
 * - TDEE: BMR × Activity Factor
 * - Macros: Calculated from TDEE (50% Protein, 20% Carb, 30% Fat)
 */
public class HealthMetricsCalculator {

    /**
     * Calculate BMI (Body Mass Index).
     * Formula: weight(kg) / height(m)²
     */
    public static double calculateBMI(double weightKg, double heightCm) {
        double heightM = heightCm / 100.0;
        return weightKg / (heightM * heightM);
    }

    /**
     * Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor equation.
     * 
     * Male:   BMR = (10 × kg) + (6.25 × cm) - (5 × age) + 5
     * Female: BMR = (10 × kg) + (6.25 × cm) - (5 × age) - 161
     */
    public static double calculateBMR(Gender gender, double weightKg, double heightCm, int age) {
        double base = (10 * weightKg) + (6.25 * heightCm) - (5 * age);
        return gender == Gender.MALE ? base + 5 : base - 161;
    }

    /**
     * Calculate TDEE (Total Daily Energy Expenditure).
     * Formula: BMR × Activity Factor
     * 
     * Uses enum embedded values - no switch-case needed!
     */
    public static double calculateTDEE(double bmr, ActivityLevel activityLevel) {
        return bmr * activityLevel.getFactor();
    }

    /**
     * Calculate macronutrients in grams from TDEE.
     * Split: 50% Protein, 20% Carb, 30% Fat
     * 
     * Conversion factors:
     * - Carbs/Protein: 4 calories per gram
     * - Fat: 9 calories per gram
     */
    public static MacrosResult calculateMacros(double tdee, @NotBlank String goalTypeName) {

        if (goalTypeName == null || goalTypeName.trim().isEmpty()) {
            throw new IllegalArgumentException("Goal type must not be blank");
        }

        String goal = goalTypeName.trim().toUpperCase();

        double calorieAdjustment;
        double proteinRatio;
        double carbRatio;
        double fatRatio;

        switch (goal) {
            case "CUTTING":
                calorieAdjustment = -0.20;
                proteinRatio = 0.40;
                carbRatio = 0.30;
                fatRatio = 0.30;
                break;

            case "MAINTAIN":
                calorieAdjustment = 0.0;
                proteinRatio = 0.30;
                carbRatio = 0.40;
                fatRatio = 0.30;
                break;

            case "BULKING":
            case "UP_POWER":
                calorieAdjustment = 0.15;
                proteinRatio = 0.30;
                carbRatio = 0.50;
                fatRatio = 0.20;
                break;

            default:
                throw new IllegalArgumentException("Invalid goal type: " + goalTypeName);
        }

        double adjustedCalories = tdee * (1 + calorieAdjustment);

        double protein = (adjustedCalories * proteinRatio) / 4;
        double carbs   = (adjustedCalories * carbRatio) / 4;
        double fat     = (adjustedCalories * fatRatio) / 9;

        return MacrosResult.builder()
                .protein(protein)
                .carbs(carbs)
                .fat(fat)
                .build();
    }
    /**
     * Calculate all metrics at once.
     * Returns complete calculation result.
     */
    public static CompleteCalculationResult calculateAll(
            Gender gender,
            double weightKg,
            double heightCm,
            int age,
            ActivityLevel activityLevel,
            @NotBlank String goalTypeName) {
        double bmi = calculateBMI(weightKg, heightCm);
        double bmr = calculateBMR(gender, weightKg, heightCm, age);
        double tdee = calculateTDEE(bmr, activityLevel);
        MacrosResult macros = calculateMacros(tdee,goalTypeName);

        return CompleteCalculationResult.builder()
                .bmi(bmi)
                .bmr(bmr)
                .tdee(tdee)
                .protein(macros.getProtein())
                .carbs(macros.getCarbs())
                .fat(macros.getFat())
                .build();
    }

    /**
     * Result object for macros calculation.
     */
    @Data
    @Builder
    @AllArgsConstructor
    public static class MacrosResult {
        private double protein;
        private double carbs;
        private double fat;
    }

    /**
     * Complete calculation result including all metrics.
     * No calorieGoal - macros calculated from TDEE only.
     */
    @Data
    @Builder
    @AllArgsConstructor
    public static class CompleteCalculationResult {
        private double bmi;
        private double bmr;
        private double tdee;
        private double protein;
        private double carbs;
        private double fat;
        private String goalTypeName;
    }
}

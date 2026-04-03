// Type definitions for MyFit API

// ========== Common Types ==========
export interface ApiResponse<T> {
    code: number;
    message: string;
    result: T;
    timestamp: string;
    path: string;
}

// ========== Enums ==========
export enum Gender {
    MALE = 'MALE',
    FEMALE = 'FEMALE'
}

export enum ActivityLevel {
    SEDENTARY = 'SEDENTARY',             // 1.2 - Ít vận động
    LIGHTLY_ACTIVE = 'LIGHTLY_ACTIVE',   // 1.375 - Nhẹ 1-3 ngày/tuần
    MODERATELY_ACTIVE = 'MODERATELY_ACTIVE', // 1.55 - Vừa 3-5 ngày/tuần
    VERY_ACTIVE = 'VERY_ACTIVE'          // 1.725 - Năng động 6-7 ngày/tuần
}

// Helper to get Vietnamese labels for ActivityLevel
export const ActivityLevelLabels: Record<ActivityLevel, string> = {
    [ActivityLevel.SEDENTARY]: 'Ít vận động',
    [ActivityLevel.LIGHTLY_ACTIVE]: 'Nhẹ (1-3 ngày/tuần)',
    [ActivityLevel.MODERATELY_ACTIVE]: 'Vừa phải (3-5 ngày/tuần)',
    [ActivityLevel.VERY_ACTIVE]: 'Năng động (6-7 ngày/tuần)'
};

export enum GoalTypes {
    CUTTING = 'cutting',
    BULKING = 'bulking',
    MAINTAIN = 'maintain',
    UP_POWER = 'up_power',
}

// ========== Goal Type ==========
export interface GoalTypeRequest {
    name: string;        // max 100 chars
    description: string; // max 255 chars
}

export interface GoalTypeResponse {
    id: string;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
}

// ========== Body Metric ==========
export interface BodyMetricRequest {
    userId: string;
    heightCm: number;      // 50-300
    weightKg: number;      // 20-500
    age: number;           // 10-120
    gender: Gender;
    activityLevel: ActivityLevel;
    goalTypeName: string;
}

export interface BodyMetricResponse {
    id: string;
    userId: string;
    heightCm: number;
    weightKg: number;
    age?: number;
    gender?: Gender;
    activityLevel?: ActivityLevel;
    createdAt: string;
    updatedAt: string;
}

// ========== Health Calculation ==========
export interface CalculateMetricsRequest {
    userId: string;
    gender: Gender;
    age: number;          // 10-120
    height: number;       // 50-300 cm
    weight: number;       // 20-500 kg
    activityLevel: ActivityLevel;
    goalTypes: GoalTypes;
}

export interface MacrosResult {
    protein: number;
    carbs: number;
    fat: number;
}

export interface HealthCalculationResponse {
    id: string;
    userId: string;
    gender: Gender;
    age: number;
    height: number;
    weight: number;
    activityLevel: ActivityLevel;
    bmi: number;
    bmr: number;
    tdee: number;
    macros: MacrosResult;
    createdAt: string;
    updatedAt: string;
}

// ========== Food & Meal Tracking ==========
export enum MealType {
    BREAKFAST = 'BREAKFAST',
    LUNCH = 'LUNCH',
    DINNER = 'DINNER',
    SNACK = 'SNACK',
}

export interface FoodResponse {
    id: string;
    name: string;
    imageUrl?: string | null;
    caloriesPer100g: number;
    proteinPer100g: number;
    carbsPer100g: number;
    fatsPer100g: number;
    unit: string;
    createdAt: string;
    updatedAt: string;
}

export interface MealRequest {
    user_id: string;
    date: string;
    mealType: MealType;
    note?: string;
}

export interface MealResponse {
    id: string;
    date: string;
    mealType: MealType;
    note?: string;
    createdAt: string;
    updatedAt: string;
}

export interface MealFoodRequest {
    mealId: string;
    foodId: string;
    quantity: number;
}

export interface MealFoodResponse {
    id: string;
    mealId: string;
    foodId: string;
    quantity: number;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
}

export interface DailyNutritionResponse {
    id: string;
    nutritionDate: string;
    totalProtein: number;
    totalCarbs: number;
    totalCalories: number;
    totalFats: number;
}

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

import { ActivityLevel, BodyMetricResponse, Gender } from '../types';

export const DEFAULT_DAILY_CALORIES_TARGET = 2500;

const getActivityFactor = (activityLevel?: ActivityLevel): number => {
    if (activityLevel === ActivityLevel.SEDENTARY) {
        return 1.2;
    } else if (activityLevel === ActivityLevel.LIGHTLY_ACTIVE) {
        return 1.375;
    } else if (activityLevel === ActivityLevel.MODERATELY_ACTIVE) {
        return 1.55;
    } else if (activityLevel === ActivityLevel.VERY_ACTIVE) {
        return 1.725;
    }

    return 1.2;
};

export const calculateDailyCaloriesTarget = (
    bodyMetric?: BodyMetricResponse | null,
    fallback = DEFAULT_DAILY_CALORIES_TARGET,
): number => {
    if (!bodyMetric) {
        return fallback;
    }

    const { gender, weightKg, heightCm, age, activityLevel } = bodyMetric;

    if (gender == null || weightKg == null || heightCm == null || age == null) {
        return fallback;
    }

    const base = (10 * weightKg) + (6.25 * heightCm) - (5 * age);
    const bmr = gender === Gender.MALE ? base + 5 : base - 161;
    const tdee = bmr * getActivityFactor(activityLevel);

    if (!Number.isFinite(tdee) || tdee <= 0) {
        return fallback;
    }

    return Math.round(tdee);
};

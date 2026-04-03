package com.example.fitme.module.user_metric.enumType;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * Activity level with embedded activity factors for TDEE calculation.
 * No switch-case needed - clean enum pattern.
 */
@Getter
@RequiredArgsConstructor
public enum ActivityLevel {
    SEDENTARY(1.2),           // Ít vận động
    LIGHTLY_ACTIVE(1.375),    // Nhẹ 1-3 ngày/tuần
    MODERATELY_ACTIVE(1.55),  // Vừa 3-5 ngày/tuần
    VERY_ACTIVE(1.725);       // Năng động 6-7 ngày/tuần

    private final double factor;
}

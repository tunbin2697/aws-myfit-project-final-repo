// Base configuration for all charts
export const CHART_CONFIG = {
    // Font settings
    font: {
        family: 'System',
        size: {
            xAxis: 10,
            yAxis: 10,
            legend: 12,
            title: 16,
            tooltip: 12,
        },
    },

    // Color palette
    colors: {
        weight: '#8B5CF6',      // Purple
        bmi: '#06B6D4',         // Cyan
        bmr: '#EC4899',         // Pink
        tdee: '#F97316',        // Orange
        healthy: '#10B981',     // Green
        warning: '#F59E0B',     // Amber
        danger: '#EF4444',      // Red
        neutral: '#6B7280',     // Gray

        // Chart elements
        grid: '#F3F4F6',
        axis: '#E5E7EB',
        background: '#FFFFFF',

        // MA line
        movingAverage: '#64748B', // Slate-600 (better outdoor contrast)
    },

    // BMI Zones
    bmiZones: {
        underweight: { color: '#3B82F6', min: 0, max: 18.5, label: 'Thiếu cân' },
        normal: { color: '#10B981', min: 18.5, max: 25, label: 'Bình thường' },
        overweight: { color: '#F59E0B', min: 25, max: 30, label: 'Thừa cân' },
        obese: { color: '#EF4444', min: 30, max: 50, label: 'Béo phì' },
    },

    // Chart dimensions
    dimensions: {
        height: 280,
        spacing: 16,
        barWidth: 24,
        dotSize: 6,
        strokeWidth: 3,
        maStrokeWidth: 2,
    },

    // Axis configuration
    axis: {
        xAxis: {
            labelColor: '#6B7280',
            labelFontSize: 10,
            color: '#E5E7EB',
        },
        yAxis: {
            labelColor: '#6B7280',
            labelFontSize: 10,
            color: '#E5E7EB',
            rulesColor: '#F3F4F6',
        },
    },

    // Animation
    animation: {
        duration: 800,
        easing: 'ease-in-out',
    },

    // Tooltip/Label configuration
    tooltip: {
        backgroundColor: '#FFFFFF',
        borderColor: '#E5E7EB',
        textColor: '#1F2937',
        fontSize: 12,
    },
};

// Helper to get gradient colors
export const getGradientColors = (baseColor: string) => {
    const gradients: Record<string, string[]> = {
        '#8B5CF6': ['#C4B5FD', '#8B5CF6'], // Purple gradient
        '#06B6D4': ['#A5F3FC', '#06B6D4'], // Cyan gradient
        '#EC4899': ['#FBCFE8', '#EC4899'], // Pink gradient
        '#F97316': ['#FED7AA', '#F97316'], // Orange gradient
    };

    return gradients[baseColor] || [baseColor, baseColor];
};

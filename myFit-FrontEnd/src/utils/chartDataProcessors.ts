import { BodyMetricResponse, HealthCalculationResponse } from '../types';

// ========== Time Range Types ==========
export type TimeRange = '7d' | '30d' | '90d' | 'all';

export interface TimeRangeOption {
    value: TimeRange;
    label: string;
    days?: number;
}

export const TIME_RANGE_OPTIONS: TimeRangeOption[] = [
    { value: '7d', label: '7 ngày', days: 7 },
    { value: '30d', label: '30 ngày', days: 30 },
    { value: '90d', label: '90 ngày', days: 90 },
    { value: 'all', label: 'Tất cả' },
];

// ========== Chart Data Types ==========
export interface ChartDataPoint {
    x: Date;
    y: number;
    label?: string;
}

// Gifted Charts format
export interface GiftedChartDataPoint {
    value: number;
    label?: string;
    labelComponent?: any;
    frontColor?: string;
    date?: Date;
}

export interface TrendAnalysis {
    change: number;
    percentChange: number;
    direction: 'up' | 'down' | 'stable';
    average: number;
    min: number;
    max: number;
}

// ========== Filter Data by Time Range ==========
export function filterByTimeRange<T extends { createdAt: string }>(
    data: T[],
    timeRange: TimeRange
): T[] {
    if (timeRange === 'all' || !data.length) {
        return data;
    }

    const now = new Date();
    const rangeOption = TIME_RANGE_OPTIONS.find(opt => opt.value === timeRange);
    const daysBack = rangeOption?.days || 0;
    const cutoffDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

    return data.filter(item => new Date(item.createdAt) >= cutoffDate);
}

// ========== Data Sampling (Group by period with AVERAGE) ==========
export function sampleDataByTimeRange(
    data: ChartDataPoint[],
    timeRange: TimeRange
): ChartDataPoint[] {
    if (data.length === 0) return [];

    const dataLength = data.length;

    // For 'all' with > 90 points, group by week
    if (timeRange === 'all' && dataLength > 90) {
        return groupByWeekAverage(data);
    }

    // For '90d' with > 90 points, group by 3 days
    if (timeRange === '90d' && dataLength > 90) {
        return groupByDaysAverage(data, 3);
    }

    // Otherwise return daily data
    return data;
}

// Group by week, taking AVERAGE (not last point)
function groupByWeekAverage(data: ChartDataPoint[]): ChartDataPoint[] {
    const grouped: Map<string, ChartDataPoint[]> = new Map();

    data.forEach(point => {
        const date = new Date(point.x);
        // Get Monday of that week
        const dayOfWeek = date.getDay();
        const monday = new Date(date);
        monday.setDate(date.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
        monday.setHours(0, 0, 0, 0);

        const weekKey = monday.toISOString().split('T')[0];

        if (!grouped.has(weekKey)) {
            grouped.set(weekKey, []);
        }
        grouped.get(weekKey)!.push(point);
    });

    return Array.from(grouped.entries()).map(([weekKey, points]) => {
        const avgValue = points.reduce((sum, p) => sum + p.y, 0) / points.length;
        return {
            x: new Date(weekKey),
            y: avgValue,
            label: `${avgValue.toFixed(1)}`,
        };
    }).sort((a, b) => a.x.getTime() - b.x.getTime());
}

// @pure - Do not mutate inputs
// Group by N days, taking AVERAGE
function groupByDaysAverage(data: ChartDataPoint[], days: number): ChartDataPoint[] {
    const result: ChartDataPoint[] = [];

    for (let i = 0; i < data.length; i += days) {
        const chunk = data.slice(i, i + days);
        const avgValue = chunk.reduce((sum, p) => sum + p.y, 0) / chunk.length;
        const midDate = chunk[Math.floor(chunk.length / 2)].x;

        result.push({
            x: midDate,
            y: avgValue,
            label: `${avgValue.toFixed(1)}`,
        });
    }

    return result;
}

// ========== Moving Average Calculation ==========
export function calculateMovingAverage(
    data: ChartDataPoint[],
    windowSize: number = 7
): ChartDataPoint[] {
    if (data.length === 0) return [];

    return data.map((point, index) => {
        const start = Math.max(0, index - windowSize + 1);
        const subset = data.slice(start, index + 1);
        const sum = subset.reduce((acc, curr) => acc + curr.y, 0);
        const avgValue = sum / subset.length;

        return {
            x: point.x,
            y: avgValue,
            label: `MA: ${avgValue.toFixed(1)}`,
        };
    });
}

// ========== Convert to Gifted Charts Format ==========
export function convertToGiftedChartsFormat(
    data: ChartDataPoint[],
    color?: string
): GiftedChartDataPoint[] {
    return data.map(point => ({
        value: point.y,
        label: formatChartDate(point.x, true),
        frontColor: color,
        date: point.x,
    }));
}

// ========== Process Body Metrics for Charts ==========
export function processWeightData(
    metrics: BodyMetricResponse[],
    timeRange: TimeRange = 'all'
): ChartDataPoint[] {
    const filtered = filterByTimeRange(metrics, timeRange);

    const chartData = filtered
        .map(metric => ({
            x: new Date(metric.createdAt),
            y: metric.weightKg,
            label: `${metric.weightKg.toFixed(1)} kg`,
        }))
        .reverse(); // Oldest first for charts

    return sampleDataByTimeRange(chartData, timeRange);
}

export function processHeightData(
    metrics: BodyMetricResponse[],
    timeRange: TimeRange = 'all'
): ChartDataPoint[] {
    const filtered = filterByTimeRange(metrics, timeRange);

    return filtered
        .map(metric => ({
            x: new Date(metric.createdAt),
            y: metric.heightCm,
            label: `${metric.heightCm.toFixed(0)} cm`,
        }))
        .reverse();
}

export function processBodyFatData(
    metrics: BodyMetricResponse[],
    timeRange: TimeRange = 'all'
): ChartDataPoint[] {
    // bodyFatPercent removed from BodyMetricResponse in BE commit 41bb775
    // Returning empty array to maintain API compatibility with callers
    return [];
}

// ========== Process Health Calculations for Charts ==========
export function processBMIData(
    calculations: HealthCalculationResponse[],
    timeRange: TimeRange = 'all'
): ChartDataPoint[] {
    const filtered = filterByTimeRange(calculations, timeRange);

    return filtered
        .map(calc => ({
            x: new Date(calc.createdAt),
            y: calc.bmi,
            label: `BMI ${calc.bmi.toFixed(1)}`,
        }))
        .reverse();
}

export function processBMRData(
    calculations: HealthCalculationResponse[],
    timeRange: TimeRange = 'all'
): ChartDataPoint[] {
    const filtered = filterByTimeRange(calculations, timeRange);

    return filtered
        .map(calc => ({
            x: new Date(calc.createdAt),
            y: calc.bmr,
            label: `${Math.round(calc.bmr)} cal`,
        }))
        .reverse();
}

export function processTDEEData(
    calculations: HealthCalculationResponse[],
    timeRange: TimeRange = 'all'
): ChartDataPoint[] {
    const filtered = filterByTimeRange(calculations, timeRange);

    return filtered
        .map(calc => ({
            x: new Date(calc.createdAt),
            y: calc.tdee,
            label: `${Math.round(calc.tdee)} cal`,
        }))
        .reverse();
}

// ========== Macros Processing ==========
export interface MacrosDataPoint {
    date: Date;
    protein: number;
    carbs: number;
    fat: number;
}

export function processMacrosData(
    calculations: HealthCalculationResponse[],
    timeRange: TimeRange = 'all'
): MacrosDataPoint[] {
    const filtered = filterByTimeRange(calculations, timeRange);

    return filtered
        .map(calc => ({
            date: new Date(calc.createdAt),
            protein: calc.macros.protein,
            carbs: calc.macros.carbs,
            fat: calc.macros.fat,
        }))
        .reverse();
}

// ========== Trend Analysis ==========
export function calculateTrend(data: ChartDataPoint[]): TrendAnalysis | null {
    if (data.length === 0) {
        return null;
    }

    const values = data.map(d => d.y);
    const first = values[0];
    const last = values[values.length - 1];
    const change = last - first;
    const percentChange = first !== 0 ? (change / first) * 100 : 0;

    let direction: 'up' | 'down' | 'stable' = 'stable';
    if (Math.abs(percentChange) > 1) {
        direction = change > 0 ? 'up' : 'down';
    }

    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    return {
        change,
        percentChange,
        direction,
        average,
        min,
        max,
    };
}

// ========== BMI Health Zone ==========
export type BMIZone = 'underweight' | 'normal' | 'overweight' | 'obese';

export interface BMIZoneInfo {
    zone: BMIZone;
    label: string;
    color: string;
    min: number;
    max: number;
}

export const BMI_ZONES: BMIZoneInfo[] = [
    { zone: 'underweight', label: 'Thiếu cân', color: '#3B82F6', min: 0, max: 18.5 },
    { zone: 'normal', label: 'Bình thường', color: '#10B981', min: 18.5, max: 25 },
    { zone: 'overweight', label: 'Thừa cân', color: '#F59E0B', min: 25, max: 30 },
    { zone: 'obese', label: 'Béo phì', color: '#EF4444', min: 30, max: 50 },
];

export function getBMIZone(bmi: number): BMIZoneInfo {
    return BMI_ZONES.find(zone => bmi >= zone.min && bmi < zone.max) || BMI_ZONES[3];
}

// ========== Date Formatting for Charts ==========
export function formatChartDate(date: Date, compact: boolean = false): string {
    if (compact) {
        return `${date.getDate()}/${date.getMonth() + 1}`;
    }

    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}

// Get smart X-axis labels (max 5 labels for small screens, evenly spaced)
export function getXAxisLabels(data: ChartDataPoint[], maxLabels: number = 5): string[] {
    if (data.length <= maxLabels) {
        return data.map(d => formatChartDate(d.x, true));
    }

    const step = Math.ceil(data.length / maxLabels);
    const labels: string[] = [];

    for (let i = 0; i < data.length; i += step) {
        labels.push(formatChartDate(data[i].x, true));
    }

    return labels;
}

// ========== Data Validation ==========
export function hasEnoughDataPoints(data: ChartDataPoint[], minimum: number = 2): boolean {
    return data.length >= minimum;
}

export function getDataGaps(data: ChartDataPoint[]): number {
    if (data.length < 2) return 0;

    const sortedData = [...data].sort((a, b) => a.x.getTime() - b.x.getTime());
    let gaps = 0;

    for (let i = 1; i < sortedData.length; i++) {
        const daysDiff = Math.floor(
            (sortedData[i].x.getTime() - sortedData[i - 1].x.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysDiff > 7) {
            gaps++;
        }
    }

    return gaps;
}

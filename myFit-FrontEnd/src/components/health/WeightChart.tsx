import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { BodyMetricResponse } from '../../types';
import {
    processWeightData,
    calculateTrend,
    calculateMovingAverage,
    hasEnoughDataPoints,
    TimeRange,
    TIME_RANGE_OPTIONS,
} from '../../utils/chartDataProcessors';
import { CHART_CONFIG } from '../../config/chartConfig';

interface WeightChartProps {
    metrics: BodyMetricResponse[];
    goalWeight?: number;
}

export const WeightChart: React.FC<WeightChartProps> = ({ metrics, goalWeight }) => {
    const { width: windowWidth } = useWindowDimensions();
    const [timeRange, setTimeRange] = useState<TimeRange>('30d');
    const [showMA, setShowMA] = useState(false);
    const [chartContainerWidth, setChartContainerWidth] = useState(0);

    // useMemo for performance - only recalculate when data or timeRange changes
    const { chartData, maData, trend, currentWeight, distanceToGoal } = useMemo(() => {
        const data = processWeightData(metrics, timeRange);
        const ma = calculateMovingAverage(data, 7);
        const trendAnalysis = calculateTrend(data);
        const latest = data.length > 0 ? data[data.length - 1].y : 0;
        const distance = goalWeight ? latest - goalWeight : null;

        return {
            chartData: data,
            maData: ma,
            trend: trendAnalysis,
            currentWeight: latest,
            distanceToGoal: distance,
        };
    }, [metrics, timeRange, goalWeight]);

    const hasData = hasEnoughDataPoints(chartData);

    if (!hasData) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>📊 Chưa có dữ liệu</Text>
                <Text style={styles.emptyText}>
                    Thêm cân nặng của bạn để xem biểu đồ theo dõi
                </Text>
            </View>
        );
    }

    // Prepare data for Gifted Charts
    const lineData = chartData.map(point => ({
        value: point.y,
        label: '', // We'll show custom labels
        dataPointText: `${point.y.toFixed(1)}`,
    }));

    const maLineData = showMA ? maData.map(point => ({
        value: point.y,
        label: '',
    })) : [];

    // Calculate Y-axis range
    const allValues = chartData.map(d => d.y);
    const minY = Math.min(...allValues);
    const maxY = Math.max(...allValues);
    const padding = (maxY - minY) * 0.1 || 5;

    // X-axis labels (smart sampling - max 5 for small screens)
    const xLabels = chartData.map((_, index) => {
        // Show label every N points depending on data length
        const interval = Math.max(1, Math.floor(chartData.length / 5));
        if (index % interval === 0 || index === chartData.length - 1) {
            const date = chartData[index].x;
            return `${date.getDate()}/${date.getMonth() + 1}`;
        }
        return '';
    });

    const resolvedContainerWidth = chartContainerWidth || Math.max(windowWidth - 64, 240);
    const minSpacing = 44;
    const computedChartWidth = chartData.length > 1
        ? Math.max(resolvedContainerWidth, (chartData.length - 1) * minSpacing + 20)
        : resolvedContainerWidth;
    const spacing = chartData.length > 1
        ? Math.max((computedChartWidth - 20) / (chartData.length - 1), minSpacing)
        : 50;

    return (
        <View style={styles.container}>
            {/* Header with Trend Info */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.title}>Cân nặng theo thời gian</Text>
                    {trend && (
                        <View style={styles.trendContainer}>
                            <Text style={styles.trendValue}>
                                {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'}{' '}
                                {Math.abs(trend.change).toFixed(1)} kg
                            </Text>
                            <Text
                                style={[
                                    styles.trendPercent,
                                    {
                                        color:
                                            trend.direction === 'down'
                                                ? CHART_CONFIG.colors.healthy
                                                : trend.direction === 'up'
                                                    ? CHART_CONFIG.colors.danger
                                                    : CHART_CONFIG.colors.neutral,
                                    },
                                ]}
                            >
                                ({trend.percentChange > 0 ? '+' : ''}
                                {trend.percentChange.toFixed(1)}%)
                            </Text>
                        </View>
                    )}
                </View>

                {/* Goal Distance Indicator */}
                {goalWeight && distanceToGoal !== null && (
                    <View style={[styles.goalBadge, {
                        backgroundColor: distanceToGoal > 0 ? '#FEF3C7' : distanceToGoal < 0 ? '#DCFCE7' : '#F3F4F6'
                    }]}>
                        <Text style={styles.goalLabel}>🎯 Mục tiêu: {goalWeight} kg</Text>
                        <Text style={[styles.goalDistance, {
                            color: distanceToGoal > 0 ? '#F59E0B' : distanceToGoal < 0 ? '#10B981' : '#6B7280'
                        }]}>
                            {distanceToGoal > 0 ? `Còn ${Math.abs(distanceToGoal).toFixed(1)} kg nữa!` :
                                distanceToGoal < 0 ? `Vượt ${Math.abs(distanceToGoal).toFixed(1)} kg!` :
                                    'Đã đạt mục tiêu! 🎉'}
                        </Text>
                    </View>
                )}

                {trend && (
                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>TB</Text>
                            <Text style={styles.statValue}>{trend.average.toFixed(1)} kg</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Min</Text>
                            <Text style={styles.statValue}>{trend.min.toFixed(1)} kg</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Max</Text>
                            <Text style={styles.statValue}>{trend.max.toFixed(1)} kg</Text>
                        </View>
                    </View>
                )}
            </View>

            {/* Time Range Filters */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterScroll}
                contentContainerStyle={styles.filterContainer}
            >
                {TIME_RANGE_OPTIONS.map((option) => (
                    <TouchableOpacity
                        key={option.value}
                        style={[
                            styles.filterButton,
                            timeRange === option.value && styles.filterButtonActive,
                        ]}
                        onPress={() => setTimeRange(option.value)}
                    >
                        <Text
                            style={[
                                styles.filterText,
                                timeRange === option.value && styles.filterTextActive,
                            ]}
                        >
                            {option.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* MA Toggle */}
            <TouchableOpacity
                style={styles.maToggle}
                onPress={() => setShowMA(!showMA)}
                activeOpacity={0.7}
            >
                <View style={[styles.checkbox, showMA && styles.checkboxActive]}>
                    {showMA && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.maToggleText}>
                    Hiển thị xu hướng 7 ngày (Trung bình trượt)
                </Text>
            </TouchableOpacity>

            {/* Chart */}
            <View
                style={styles.chartContainer}
                onLayout={(event) => {
                    const nextWidth = event.nativeEvent.layout.width;
                    if (nextWidth > 0 && nextWidth !== chartContainerWidth) {
                        setChartContainerWidth(nextWidth);
                    }
                }}
            >
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.chartScrollContent}
                    style={styles.chartScroll}
                >
                    <LineChart
                    data={lineData}
                    data2={showMA ? maLineData : undefined}
                    width={computedChartWidth}
                    height={CHART_CONFIG.dimensions.height}

                    // Y-axis config
                    yAxisOffset={minY - padding}
                    maxValue={maxY + padding}
                    noOfSections={5}
                    yAxisColor={CHART_CONFIG.axis.yAxis.color}
                    yAxisThickness={1}
                    yAxisLabelWidth={40}
                    yAxisTextStyle={{
                        color: CHART_CONFIG.axis.yAxis.labelColor,
                        fontSize: CHART_CONFIG.font.size.yAxis,
                    }}

                    // X-axis config
                    xAxisColor={CHART_CONFIG.axis.xAxis.color}
                    xAxisThickness={1}
                    xAxisLabelTexts={xLabels}
                    xAxisLabelTextStyle={{
                        color: CHART_CONFIG.axis.xAxis.labelColor,
                        fontSize: CHART_CONFIG.font.size.xAxis,
                        width: 40,
                        textAlign: 'center',
                    }}

                    // Grid
                    rulesType="solid"
                    rulesColor={CHART_CONFIG.colors.grid}

                    // Main line styling
                    color={CHART_CONFIG.colors.weight}
                    thickness={CHART_CONFIG.dimensions.strokeWidth}
                    startFillColor={CHART_CONFIG.colors.weight}
                    endFillColor="rgba(139, 92, 246, 0.1)"
                    startOpacity={0.4}
                    endOpacity={0.1}
                    areaChart
                    curved

                    // Data points
                    dataPointsColor={CHART_CONFIG.colors.weight}
                    dataPointsRadius={CHART_CONFIG.dimensions.dotSize}
                    textColor={CHART_CONFIG.tooltip.textColor}
                    textFontSize={CHART_CONFIG.font.size.tooltip}
                    textShiftY={-10}
                    textShiftX={-10}

                    // MA line styling (if shown)
                    color2={CHART_CONFIG.colors.movingAverage}
                    thickness2={CHART_CONFIG.dimensions.maStrokeWidth}
                    dataPointsColor2={CHART_CONFIG.colors.movingAverage}
                    dataPointsRadius2={3}
                    strokeDashArray2={[6, 4]} // Dashed line

                    // Goal Weight Reference Line
                    showReferenceLine1={goalWeight !== undefined}
                    referenceLine1Position={goalWeight}
                    referenceLine1Config={{
                        color: CHART_CONFIG.colors.warning,
                        thickness: 2,
                        dashWidth: 4,
                        dashGap: 4,
                        labelText: `Mục tiêu: ${goalWeight} kg`,
                        labelTextStyle: {
                            color: CHART_CONFIG.colors.warning,
                            fontSize: 10,
                            fontWeight: '600',
                        },
                    }}

                    // Animation
                    animateOnDataChange
                    animationDuration={CHART_CONFIG.animation.duration}

                    // Spacing
                    spacing={spacing}
                    initialSpacing={10}
                    endSpacing={10}
                    />
                </ScrollView>
            </View>

            {/* Legend */}
            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: CHART_CONFIG.colors.weight }]} />
                    <Text style={styles.legendText}>Cân nặng</Text>
                </View>
                {showMA && (
                    <View style={styles.legendItem}>
                        <View style={[styles.legendLine, { backgroundColor: CHART_CONFIG.colors.movingAverage }]} />
                        <Text style={styles.legendText}>Xu hướng 7 ngày</Text>
                    </View>
                )}
                {goalWeight && (
                    <View style={styles.legendItem}>
                        <View style={[styles.legendLineDashed, { borderColor: CHART_CONFIG.colors.warning }]} />
                        <Text style={styles.legendText}>Mục tiêu ({goalWeight} kg)</Text>
                    </View>
                )}
            </View>

            {/* Info Note for MA */}
            {showMA && (
                <View style={styles.infoNote}>
                    <Text style={styles.infoNoteText}>
                        💡 Đường xu hướng giúp xem biến động dài hạn, không phản ánh cân nặng hiện tại
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    header: {
        marginBottom: 16,
    },
    headerLeft: {
        marginBottom: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    trendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    trendValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    trendPercent: {
        fontSize: 14,
        fontWeight: '500',
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 16,
    },
    statItem: {
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 11,
        color: '#6B7280',
        marginBottom: 2,
    },
    statValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
    },
    filterScroll: {
        marginBottom: 12,
    },
    filterContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    filterButtonActive: {
        backgroundColor: CHART_CONFIG.colors.weight,
        borderColor: CHART_CONFIG.colors.weight,
    },
    filterText: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    filterTextActive: {
        color: 'white',
    },
    maToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        gap: 10,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxActive: {
        backgroundColor: CHART_CONFIG.colors.weight,
        borderColor: CHART_CONFIG.colors.weight,
    },
    checkmark: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    maToggleText: {
        fontSize: 14,
        color: '#4B5563',
    },
    chartContainer: {
        marginVertical: 16,
        width: '100%',
        overflow: 'hidden',
    },
    chartScroll: {
        width: '100%',
    },
    chartScrollContent: {
        minWidth: '100%',
    },
    legend: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 16,
        marginTop: 12,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    legendLine: {
        width: 20,
        height: 3,
        borderRadius: 1.5,
    },
    legendLineDashed: {
        width: 20,
        height: 0,
        borderTopWidth: 2,
        borderStyle: 'dashed',
    },
    legendText: {
        fontSize: 12,
        color: '#6B7280',
    },
    goalBadge: {
        borderRadius: 12,
        padding: 12,
        marginTop: 8,
        marginBottom: 8,
    },
    goalLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    goalDistance: {
        fontSize: 15,
        fontWeight: 'bold',
    },
    infoNote: {
        backgroundColor: '#EFF6FF',
        borderRadius: 8,
        padding: 10,
        marginTop: 12,
    },
    infoNoteText: {
        fontSize: 11,
        color: '#1E40AF',
        lineHeight: 16,
    },
    emptyContainer: {
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        padding: 40,
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
    },
});

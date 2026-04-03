import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { HealthCalculationResponse } from '../../types';
import {
    processBMIData,
    calculateTrend,
    hasEnoughDataPoints,
    TimeRange,
    TIME_RANGE_OPTIONS,
    getBMIZone,
    BMI_ZONES,
    ChartDataPoint,
} from '../../utils/chartDataProcessors';
import { CHART_CONFIG } from '../../config/chartConfig';

interface BMITrendChartProps {
    calculations: HealthCalculationResponse[];
    goalBMI?: number;
}

const SCREEN_WIDTH = Dimensions.get('window').width;

export const BMITrendChart: React.FC<BMITrendChartProps> = ({ calculations, goalBMI }) => {
    const [timeRange, setTimeRange] = useState<TimeRange>('30d');

    // useMemo for performance
    const { chartData, trend, currentBMI, currentZone } = useMemo(() => {
        const data = processBMIData(calculations, timeRange);
        const trendAnalysis = calculateTrend(data);
        const latestBMI = data.length > 0 ? data[data.length - 1].y : 0;
        const zone = getBMIZone(latestBMI);

        return {
            chartData: data,
            trend: trendAnalysis,
            currentBMI: latestBMI,
            currentZone: zone,
        };
    }, [calculations, timeRange]);

    const hasData = hasEnoughDataPoints(chartData);

    if (!hasData) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>📊 Chưa có dữ liệu</Text>
                <Text style={styles.emptyText}>
                    Thực hiện tính toán sức khỏe để xem biểu đồ BMI
                </Text>
            </View>
        );
    }

    // Prepare data for Gifted Charts with color-coded dots
    const lineData = chartData.map(point => {
        const zone = getBMIZone(point.y);
        return {
            value: point.y,
            label: '',
            dataPointText: `${point.y.toFixed(1)}`,
            dataPointColor: zone.color,
        };
    });

    // Calculate Y-axis range
    const minY = Math.min(16, ...chartData.map(d => d.y));
    const maxY = Math.max(32, ...chartData.map(d => d.y));
    const padding = 2;

    // Smart X-axis labels
    const xLabels = chartData.map((_, index) => {
        const interval = Math.max(1, Math.floor(chartData.length / 7));
        if (index % interval === 0 || index === chartData.length - 1) {
            const date = chartData[index].x;
            return `${date.getDate()}/${date.getMonth() + 1}`;
        }
        return '';
    });

    return (
        <View style={styles.container}>
            {/* Header with Current BMI Badge */}
            <View style={styles.header}>
                <Text style={styles.title}>BMI theo thời gian</Text>

                <View style={[styles.bmiBadge, { backgroundColor: currentZone.color + '20' }]}>
                    <Text style={styles.bmiLabel}>BMI hiện tại</Text>
                    <Text style={[styles.bmiValue, { color: currentZone.color }]}>
                        {currentBMI.toFixed(1)}
                    </Text>
                    <View style={[styles.zoneBadge, { backgroundColor: currentZone.color }]}>
                        <Text style={styles.zoneText}>{currentZone.label}</Text>
                    </View>
                </View>

                {/* Trend Info */}
                {trend && (
                    <View style={styles.trendContainer}>
                        <Text style={styles.trendLabel}>Thay đổi:</Text>
                        <Text
                            style={[
                                styles.trendValue,
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
                            {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'}{' '}
                            {Math.abs(trend.change).toFixed(1)} ({trend.percentChange > 0 ? '+' : ''}
                            {trend.percentChange.toFixed(1)}%)
                        </Text>
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

            {/* Chart */}
            <View style={styles.chartContainer}>
                <LineChart
                    data={lineData}
                    width={SCREEN_WIDTH - 60}
                    height={CHART_CONFIG.dimensions.height}

                    // Y-axis config
                    yAxisOffset={minY - padding}
                    maxValue={maxY + padding}
                    noOfSections={6}
                    yAxisColor={CHART_CONFIG.axis.yAxis.color}
                    yAxisThickness={1}
                    yAxisLabelWidth={35}
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

                    // Reference Lines for BMI Zones
                    showReferenceLine1
                    referenceLine1Position={18.5}
                    referenceLine1Config={{
                        color: CHART_CONFIG.bmiZones.underweight.color,
                        thickness: 2,
                        dashWidth: 6,
                        dashGap: 4,
                        labelText: '18.5',
                        labelTextStyle: {
                            color: CHART_CONFIG.bmiZones.underweight.color,
                            fontSize: 10,
                            fontWeight: '600',
                        },
                    }}

                    showReferenceLine2
                    referenceLine2Position={25}
                    referenceLine2Config={{
                        color: CHART_CONFIG.bmiZones.overweight.color,
                        thickness: 2,
                        dashWidth: 6,
                        dashGap: 4,
                        labelText: '25',
                        labelTextStyle: {
                            color: CHART_CONFIG.bmiZones.overweight.color,
                            fontSize: 10,
                            fontWeight: '600',
                        },
                    }}

                    showReferenceLine3
                    referenceLine3Position={30}
                    referenceLine3Config={{
                        color: CHART_CONFIG.bmiZones.obese.color,
                        thickness: 2,
                        dashWidth: 6,
                        dashGap: 4,
                        labelText: '30',
                        labelTextStyle: {
                            color: CHART_CONFIG.bmiZones.obese.color,
                            fontSize: 10,
                            fontWeight: '600',
                        },
                    }}

                    // Main line styling
                    color={CHART_CONFIG.colors.bmi}
                    thickness={CHART_CONFIG.dimensions.strokeWidth}
                    startFillColor={CHART_CONFIG.colors.bmi}
                    endFillColor="rgba(6, 182, 212, 0.1)"
                    startOpacity={0.3}
                    endOpacity={0.05}
                    areaChart
                    curved

                    // Data points (color-coded by zone via dataPointColor in data)
                    dataPointsRadius={CHART_CONFIG.dimensions.dotSize + 1}
                    textColor={CHART_CONFIG.tooltip.textColor}
                    textFontSize={CHART_CONFIG.font.size.tooltip}
                    textShiftY={-10}
                    textShiftX={-10}

                    // Animation
                    animateOnDataChange
                    animationDuration={CHART_CONFIG.animation.duration}

                    // Spacing
                    spacing={chartData.length > 1 ? (SCREEN_WIDTH - 95) / (chartData.length - 1) : 50}
                    initialSpacing={10}
                    endSpacing={10}

                    // Pointer config
                    pointerConfig={{
                        pointerStripColor: '#E5E7EB',
                        pointerStripWidth: 2,
                        strokeDashArray: [4, 4],
                        radius: 6,
                        pointerLabelWidth: 100,
                        pointerLabelHeight: 50,
                        pointerLabelComponent: (items: any) => {
                            const bmiValue = items[0]?.value || 0;
                            const zone = getBMIZone(bmiValue);
                            return (
                                <View style={styles.tooltip}>
                                    <Text style={[styles.tooltipBMI, { color: zone.color }]}>
                                        BMI: {bmiValue.toFixed(1)}
                                    </Text>
                                    <Text style={[styles.tooltipZone, { color: zone.color }]}>
                                        {zone.label}
                                    </Text>
                                </View>
                            );
                        },
                    }}
                />
            </View>

            {/* Zone Legend */}
            <View style={styles.legendContainer}>
                <Text style={styles.legendTitle}>Phân loại BMI:</Text>
                <View style={styles.legendItems}>
                    {BMI_ZONES.map((zone) => (
                        <View key={zone.zone} style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: zone.color }]} />
                            <Text style={styles.legendText}>
                                {zone.label} ({zone.min}-{zone.max < 50 ? zone.max : '+'})
                            </Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Statistics */}
            {trend && (
                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Trung bình</Text>
                        <Text style={styles.statValue}>{trend.average.toFixed(1)}</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Thấp nhất</Text>
                        <Text style={styles.statValue}>{trend.min.toFixed(1)}</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Cao nhất</Text>
                        <Text style={styles.statValue}>{trend.max.toFixed(1)}</Text>
                    </View>
                </View>
            )}

            {/* Info Note */}
            <View style={styles.infoNote}>
                <Text style={styles.infoNoteText}>
                    💡 BMI chỉ là chỉ số tham khảo. Người tập thể thao có thể có BMI cao hơn do khối lượng cơ.
                </Text>
            </View>
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
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 12,
    },
    bmiBadge: {
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        marginBottom: 12,
    },
    bmiLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
    },
    bmiValue: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    zoneBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    zoneText: {
        fontSize: 12,
        fontWeight: '600',
        color: 'white',
    },
    trendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    trendLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    trendValue: {
        fontSize: 15,
        fontWeight: '600',
    },
    filterScroll: {
        marginBottom: 16,
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
        backgroundColor: CHART_CONFIG.colors.bmi,
        borderColor: CHART_CONFIG.colors.bmi,
    },
    filterText: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    filterTextActive: {
        color: 'white',
    },
    chartContainer: {
        alignItems: 'center',
        marginVertical: 16,
    },
    tooltip: {
        backgroundColor: 'white',
        padding: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    tooltipBMI: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    tooltipZone: {
        fontSize: 11,
        fontWeight: '600',
    },
    legendContainer: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 12,
        marginTop: 8,
    },
    legendTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 8,
    },
    legendItems: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
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
    legendText: {
        fontSize: 11,
        color: '#4B5563',
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 11,
        color: '#6B7280',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
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

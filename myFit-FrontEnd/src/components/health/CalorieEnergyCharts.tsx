import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { HealthCalculationResponse } from '../../types';
import {
    processBMRData,
    processTDEEData,
    calculateTrend,
    calculateMovingAverage,
    hasEnoughDataPoints,
    TimeRange,
    TIME_RANGE_OPTIONS,
    ChartDataPoint,
} from '../../utils/chartDataProcessors';
import { CHART_CONFIG } from '../../config/chartConfig';

interface CalorieEnergyChartsProps {
    calculations: HealthCalculationResponse[];
}

type ChartMode = 'bmr' | 'tdee' | 'both';

const SCREEN_WIDTH = Dimensions.get('window').width;

export const CalorieEnergyCharts: React.FC<CalorieEnergyChartsProps> = ({ calculations }) => {
    const [timeRange, setTimeRange] = useState<TimeRange>('30d');
    const [chartMode, setChartMode] = useState<ChartMode>('both');
    const [showTDEEMA, setShowTDEEMA] = useState(false);

    // useMemo for performance
    const { bmrData, tdeeData, tdeeMAData, bmrTrend, tdeeTrend } = useMemo(() => {
        const bmr = processBMRData(calculations, timeRange);
        const tdee = processTDEEData(calculations, timeRange);
        const tdeeMA = calculateMovingAverage(tdee, 7);
        const bmrTrendAnalysis = calculateTrend(bmr);
        const tdeeTrendAnalysis = calculateTrend(tdee);

        return {
            bmrData: bmr,
            tdeeData: tdee,
            tdeeMAData: tdeeMA,
            bmrTrend: bmrTrendAnalysis,
            tdeeTrend: tdeeTrendAnalysis,
        };
    }, [calculations, timeRange]);

    const hasData = hasEnoughDataPoints(bmrData) || hasEnoughDataPoints(tdeeData);

    if (!hasData) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>📊 Chưa có dữ liệu</Text>
                <Text style={styles.emptyText}>
                    Thực hiện tính toán sức khỏe để xem biểu đồ năng lượng
                </Text>
            </View>
        );
    }

    // Determine which data to show
    const showBMR = chartMode === 'bmr' || chartMode === 'both';
    const showTDEE = chartMode === 'tdee' || chartMode === 'both';

    // Prepare data for Gifted Charts
    const bmrLineData = showBMR ? bmrData.map(point => ({
        value: point.y,
        label: '',
        dataPointText: `${Math.round(point.y)}`,
    })) : [];

    const tdeeLineData = showTDEE ? tdeeData.map(point => ({
        value: point.y,
        label: '',
        dataPointText: `${Math.round(point.y)}`,
    })) : [];

    const tdeeMALineData = showTDEE && showTDEEMA ? tdeeMAData.map(point => ({
        value: point.y,
        label: '',
    })) : [];

    // Calculate Y-axis range (combine all visible data)
    const allValues = [
        ...(showBMR ? bmrData.map(d => d.y) : []),
        ...(showTDEE ? tdeeData.map(d => d.y) : []),
    ];
    const minY = Math.min(...allValues);
    const maxY = Math.max(...allValues);
    const padding = (maxY - minY) * 0.15 || 200; // More padding for energy charts

    // Smart X-axis labels
    const dataLength = Math.max(bmrData.length, tdeeData.length);
    const xLabels = Array.from({ length: dataLength }, (_, index) => {
        const interval = Math.max(1, Math.floor(dataLength / 7));
        if (index % interval === 0 || index === dataLength - 1) {
            const date = (showBMR ? bmrData : tdeeData)[index]?.x;
            if (date) return `${date.getDate()}/${date.getMonth() + 1}`;
        }
        return '';
    });

    // Custom tooltip renderer
    const renderCustomTooltip = (items: any) => {
        if (!items || items.length === 0) return null;

        return (
            <View style={styles.tooltip}>
                {showBMR && chartMode === 'both' && (
                    <View style={styles.tooltipRow}>
                        <View style={[styles.tooltipDot, { backgroundColor: CHART_CONFIG.colors.bmr }]} />
                        <Text style={styles.tooltipText}>BMR: {Math.round(items[0]?.value || 0)} cal</Text>
                    </View>
                )}
                {showTDEE && (
                    <View style={styles.tooltipRow}>
                        <View style={[styles.tooltipDot, { backgroundColor: CHART_CONFIG.colors.tdee }]} />
                        <Text style={styles.tooltipText}>
                            TDEE: {Math.round(chartMode === 'both' ? (items[1]?.value || 0) : (items[0]?.value || 0))} cal
                        </Text>
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Năng lượng & Chuyển hóa</Text>

                {/* Current Values */}
                <View style={styles.currentValues}>
                    {showBMR && bmrTrend && (
                        <View style={styles.valueCard}>
                            <View style={[styles.colorBar, { backgroundColor: CHART_CONFIG.colors.bmr }]} />
                            <Text style={styles.valueLabel}>BMR hiện tại</Text>
                            <Text style={styles.valueNumber}>{Math.round(bmrData[bmrData.length - 1]?.y || 0)}</Text>
                            <Text style={styles.valueUnit}>cal/ngày</Text>
                        </View>
                    )}

                    {showTDEE && tdeeTrend && (
                        <View style={styles.valueCard}>
                            <View style={[styles.colorBar, { backgroundColor: CHART_CONFIG.colors.tdee }]} />
                            <Text style={styles.valueLabel}>TDEE hiện tại</Text>
                            <Text style={styles.valueNumber}>{Math.round(tdeeData[tdeeData.length - 1]?.y || 0)}</Text>
                            <Text style={styles.valueUnit}>cal/ngày</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Chart Mode Toggle */}
            <View style={styles.modeToggleContainer}>
                <TouchableOpacity
                    style={[styles.modeButton, chartMode === 'bmr' && styles.modeButtonActive]}
                    onPress={() => setChartMode('bmr')}
                >
                    <Text style={[styles.modeButtonText, chartMode === 'bmr' && styles.modeButtonTextActive]}>
                        BMR
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.modeButton, chartMode === 'tdee' && styles.modeButtonActive]}
                    onPress={() => setChartMode('tdee')}
                >
                    <Text style={[styles.modeButtonText, chartMode === 'tdee' && styles.modeButtonTextActive]}>
                        TDEE
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.modeButton, chartMode === 'both' && styles.modeButtonActive]}
                    onPress={() => setChartMode('both')}
                >
                    <Text style={[styles.modeButtonText, chartMode === 'both' && styles.modeButtonTextActive]}>
                        So sánh
                    </Text>
                </TouchableOpacity>
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

            {/* TDEE MA Toggle */}
            {showTDEE && (
                <TouchableOpacity
                    style={styles.maToggle}
                    onPress={() => setShowTDEEMA(!showTDEEMA)}
                    activeOpacity={0.7}
                >
                    <View style={[styles.checkbox, showTDEEMA && styles.checkboxActive]}>
                        {showTDEEMA && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.maToggleText}>
                        Hiển thị xu hướng TDEE 7 ngày
                    </Text>
                </TouchableOpacity>
            )}

            {/* Chart */}
            <View style={styles.chartContainer}>
                <LineChart
                    // Data configuration
                    data={showBMR ? bmrLineData : tdeeLineData}
                    data2={chartMode === 'both' && showTDEE ? tdeeLineData : (showTDEEMA ? tdeeMALineData : undefined)}
                    width={SCREEN_WIDTH - 60}
                    height={CHART_CONFIG.dimensions.height}

                    // Y-axis config
                    yAxisOffset={Math.floor(minY - padding)}
                    maxValue={Math.ceil(maxY + padding)}
                    noOfSections={5}
                    yAxisColor={CHART_CONFIG.axis.yAxis.color}
                    yAxisThickness={1}
                    yAxisLabelWidth={50}
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
                        width: 50,
                        textAlign: 'center',
                    }}

                    // Grid
                    rulesType="solid"
                    rulesColor={CHART_CONFIG.colors.grid}

                    // Line 1 styling (BMR or TDEE depending on mode)
                    color={showBMR ? CHART_CONFIG.colors.bmr : CHART_CONFIG.colors.tdee}
                    thickness={CHART_CONFIG.dimensions.strokeWidth}
                    startFillColor={showBMR ? CHART_CONFIG.colors.bmr : CHART_CONFIG.colors.tdee}
                    endFillColor={showBMR ? 'rgba(236, 72, 153, 0.1)' : 'rgba(249, 115, 22, 0.1)'}
                    startOpacity={0.3}
                    endOpacity={0.05}
                    areaChart
                    curved

                    // Data points
                    dataPointsColor={showBMR ? CHART_CONFIG.colors.bmr : CHART_CONFIG.colors.tdee}
                    dataPointsRadius={CHART_CONFIG.dimensions.dotSize}
                    textColor={CHART_CONFIG.tooltip.textColor}
                    textFontSize={CHART_CONFIG.font.size.tooltip}
                    textShiftY={-10}
                    textShiftX={-15}

                    // Line 2 styling (TDEE in comparison mode, or TDEE MA)
                    color2={showTDEEMA ? CHART_CONFIG.colors.movingAverage : CHART_CONFIG.colors.tdee}
                    thickness2={showTDEEMA ? CHART_CONFIG.dimensions.maStrokeWidth : CHART_CONFIG.dimensions.strokeWidth}
                    startFillColor2={chartMode === 'both' ? CHART_CONFIG.colors.tdee : undefined}
                    endFillColor2={chartMode === 'both' ? 'rgba(249, 115, 22, 0.1)' : undefined}
                    startOpacity2={chartMode === 'both' ? 0.3 : 0}
                    endOpacity2={chartMode === 'both' ? 0.05 : 0}
                    dataPointsColor2={showTDEEMA ? CHART_CONFIG.colors.movingAverage : CHART_CONFIG.colors.tdee}
                    dataPointsRadius2={showTDEEMA ? 3 : CHART_CONFIG.dimensions.dotSize}
                    strokeDashArray2={showTDEEMA ? [6, 4] : undefined}

                    // Animation
                    animateOnDataChange
                    animationDuration={CHART_CONFIG.animation.duration}

                    // Spacing
                    spacing={dataLength > 1 ? (SCREEN_WIDTH - 100) / (dataLength - 1) : 50}
                    initialSpacing={10}
                    endSpacing={10}

                    // Pointer config for tooltip
                    pointerConfig={{
                        pointerStripColor: '#E5E7EB',
                        pointerStripWidth: 2,
                        strokeDashArray: [4, 4],
                        pointerColor: CHART_CONFIG.colors.weight,
                        radius: 6,
                        pointerLabelWidth: 120,
                        pointerLabelHeight: 60,
                        pointerLabelComponent: renderCustomTooltip,
                    }}
                />
            </View>

            {/* Legend */}
            <View style={styles.legend}>
                {showBMR && (
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: CHART_CONFIG.colors.bmr }]} />
                        <Text style={styles.legendText}>BMR (Trao đổi chất cơ bản)</Text>
                    </View>
                )}
                {showTDEE && (
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: CHART_CONFIG.colors.tdee }]} />
                        <Text style={styles.legendText}>TDEE (Tổng năng lượng tiêu thụ)</Text>
                    </View>
                )}
                {showTDEE && showTDEEMA && (
                    <View style={styles.legendItem}>
                        <View style={[styles.legendLine, { backgroundColor: CHART_CONFIG.colors.movingAverage }]} />
                        <Text style={styles.legendText}>Xu hướng TDEE 7 ngày</Text>
                    </View>
                )}
            </View>

            {/* Trend Stats */}
            {(bmrTrend || tdeeTrend) && (
                <View style={styles.statsSection}>
                    {showBMR && bmrTrend && (
                        <View style={styles.statCard}>
                            <Text style={styles.statTitle}>📊 BMR</Text>
                            <View style={styles.statRow}>
                                <Text style={styles.statLabel}>Trung bình:</Text>
                                <Text style={styles.statValue}>{Math.round(bmrTrend.average)} cal</Text>
                            </View>
                            <View style={styles.statRow}>
                                <Text style={styles.statLabel}>Thay đổi:</Text>
                                <Text style={[
                                    styles.statValue,
                                    { color: bmrTrend.direction === 'up' ? CHART_CONFIG.colors.danger : CHART_CONFIG.colors.healthy }
                                ]}>
                                    {bmrTrend.change > 0 ? '+' : ''}{Math.round(bmrTrend.change)} cal
                                </Text>
                            </View>
                        </View>
                    )}

                    {showTDEE && tdeeTrend && (
                        <View style={styles.statCard}>
                            <Text style={styles.statTitle}>🔥 TDEE</Text>
                            <View style={styles.statRow}>
                                <Text style={styles.statLabel}>Trung bình:</Text>
                                <Text style={styles.statValue}>{Math.round(tdeeTrend.average)} cal</Text>
                            </View>
                            <View style={styles.statRow}>
                                <Text style={styles.statLabel}>Biến động:</Text>
                                <Text style={styles.statValue}>
                                    {Math.round(tdeeTrend.min)} - {Math.round(tdeeTrend.max)} cal
                                </Text>
                            </View>
                        </View>
                    )}
                </View>
            )}

            {/* Info Box */}
            <View style={styles.infoBox}>
                <Text style={styles.infoTitle}>💡 Hướng dẫn sử dụng</Text>
                <Text style={styles.infoText}>
                    • <Text style={styles.infoBold}>BMR</Text>: Năng lượng cơ thể cần khi nghỉ ngơi{'\n'}
                    • <Text style={styles.infoBold}>TDEE</Text>: Tổng năng lượng tiêu thụ trong ngày{'\n'}
                    • <Text style={styles.infoBold}>Giảm cân</Text>: Ăn ít hơn TDEE 300-500 cal/ngày{'\n'}
                    • <Text style={styles.infoBold}>Tăng cân</Text>: Ăn nhiều hơn TDEE 300-500 cal/ngày
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
    currentValues: {
        flexDirection: 'row',
        gap: 12,
    },
    valueCard: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 12,
        position: 'relative',
        overflow: 'hidden',
    },
    colorBar: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
    },
    valueLabel: {
        fontSize: 11,
        color: '#6B7280',
        marginBottom: 4,
    },
    valueNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    valueUnit: {
        fontSize: 11,
        color: '#9CA3AF',
    },
    modeToggleContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    modeButton: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    modeButtonActive: {
        backgroundColor: '#8B5CF6',
        borderColor: '#8B5CF6',
    },
    modeButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6B7280',
    },
    modeButtonTextActive: {
        color: 'white',
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
        backgroundColor: CHART_CONFIG.colors.tdee,
        borderColor: CHART_CONFIG.colors.tdee,
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
        alignItems: 'center',
        marginVertical: 16,
    },
    tooltip: {
        backgroundColor: 'white',
        padding: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    tooltipRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginVertical: 2,
    },
    tooltipDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    tooltipText: {
        fontSize: 12,
        color: '#1F2937',
        fontWeight: '500',
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
    legendText: {
        fontSize: 11,
        color: '#6B7280',
    },
    statsSection: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 12,
    },
    statTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 8,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
    },
    statValue: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1F2937',
    },
    infoBox: {
        backgroundColor: '#EFF6FF',
        borderRadius: 12,
        padding: 12,
        marginTop: 16,
    },
    infoTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1E40AF',
        marginBottom: 6,
    },
    infoText: {
        fontSize: 12,
        color: '#1E40AF',
        lineHeight: 18,
    },
    infoBold: {
        fontWeight: '600',
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

import React, { useCallback, useMemo, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    Image,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
    Flame,
    Dumbbell,
    User,
    TrendingUp,
    HeartPulse,
    CalendarDays,
    Ruler,
    Scale,
    ArrowUpRight,
    Target,
    Activity,
} from 'lucide-react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { Card, CardContent } from '../../components/ui/Card';
import { Progress } from '../../components/ui/Progress';
import { Skeleton } from '../../components/ui/Skeleton';
import { useAppSelector } from '../../hooks/redux';
import { getMealFoodsByMealId, getMealsByUser } from '../../services/foodService';
import { getLatestHealthCalculation } from '../../services/healthCalculationService';
import { getLatestBodyMetric } from '../../services/bodyMetricService';
import { getMyActivePlan } from '../../services/userWorkoutPlanService';
import { getSession, getSessionsByUser } from '../../services/sessionService';
import type { BodyMetricResponse, HealthCalculationResponse } from '../../types';
import type { SessionResponse, UserWorkoutPlan } from '../../types/workout';
import { calculateDailyCaloriesTarget, DEFAULT_DAILY_CALORIES_TARGET } from '../../utils/calories';

const formatLocalDate = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

const getStartOfWeek = (d: Date): Date => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    date.setDate(date.getDate() + diff);
    date.setHours(0, 0, 0, 0);
    return date;
};

const getEndOfWeek = (d: Date): Date => {
    const start = getStartOfWeek(d);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return end;
};

const formatShortDate = (dateStr?: string): string => {
    if (!dateStr) return '--';
    try {
        const d = new Date(dateStr.length === 10 ? `${dateStr}T00:00:00` : dateStr);
        return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    } catch {
        return '--';
    }
};

type HomeNutritionSummary = {
    totalProtein: number;
    totalCarbs: number;
    totalCalories: number;
    totalFats: number;
};

const WEEKLY_SESSION_TARGET = 4;

function HomeDashboardSkeleton() {
    return (
        <View className="gap-4">
            {[0, 1, 2].map((idx) => (
                <Card key={idx} className="shadow-sm border border-gray-100 bg-white">
                    <CardContent className="p-5">
                        <View className="flex-row items-start justify-between mb-4">
                            <View>
                                <Skeleton className="h-5 w-40 mb-2" />
                                <Skeleton className="h-3 w-28" />
                            </View>
                            <Skeleton className="w-10 h-10 rounded-xl" />
                        </View>
                        <Skeleton className="h-20 w-full rounded-xl mb-3" />
                        <Skeleton className="h-2 w-full mb-3" />
                        <View className="flex-row gap-2 mb-3">
                            <Skeleton className="h-14 flex-1 rounded-xl" />
                            <Skeleton className="h-14 flex-1 rounded-xl" />
                            <Skeleton className="h-14 flex-1 rounded-xl" />
                        </View>
                        <Skeleton className="h-8 w-28 rounded-full" />
                    </CardContent>
                </Card>
            ))}
        </View>
    );
}

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const user = useAppSelector((state) => state.auth.user);

    const currentUserId = useMemo(() => {
        if (!user) return '';
        return user.id || user.userId || user.user_id || user.sub || '';
    }, [user]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [dailyNutrition, setDailyNutrition] = useState<HomeNutritionSummary | null>(null);
    const [latestHealth, setLatestHealth] = useState<HealthCalculationResponse | null>(null);
    const [latestBodyMetric, setLatestBodyMetric] = useState<BodyMetricResponse | null>(null);
    const [activePlan, setActivePlan] = useState<UserWorkoutPlan | null>(null);
    const [weekSessions, setWeekSessions] = useState<SessionResponse[]>([]);

    const loadDashboard = useCallback(async (isRefresh = false) => {
        if (!currentUserId) {
            setLoading(false);
            setRefreshing(false);
            return;
        }

        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const now = new Date();
            const today = formatLocalDate(now);
            const from = formatLocalDate(getStartOfWeek(now));
            const to = formatLocalDate(getEndOfWeek(now));

            const [meals, health, bodyMetric, plan, sessions] = await Promise.all([
                getMealsByUser(currentUserId).catch(() => []),
                getLatestHealthCalculation(currentUserId).catch(() => null),
                getLatestBodyMetric(currentUserId).catch(() => null),
                getMyActivePlan().catch(() => null),
                getSessionsByUser(currentUserId, { from, to }).catch(() => []),
            ]);

            const todayMeals = (meals ?? []).filter(meal => meal?.date?.slice(0, 10) === today);
            const mealFoods = await Promise.all(
                todayMeals.map(meal => getMealFoodsByMealId(meal.id).catch(() => [])),
            );
            const flatMealFoods = mealFoods.flat();

            const nutrition: HomeNutritionSummary = flatMealFoods.reduce(
                (acc, item) => {
                    acc.totalCalories += item.calories ?? 0;
                    acc.totalProtein += item.protein ?? 0;
                    acc.totalCarbs += item.carbs ?? 0;
                    acc.totalFats += item.fats ?? 0;
                    return acc;
                },
                { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFats: 0 },
            );

            const detailedSessions = await Promise.all(
                (sessions ?? []).map(async session => {
                    try {
                        return await getSession(session.id);
                    } catch {
                        return session;
                    }
                }),
            );

            setDailyNutrition(nutrition);
            setLatestHealth(health);
            setLatestBodyMetric(bodyMetric);
            setActivePlan(plan);
            setWeekSessions(detailedSessions);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [currentUserId]);

    useFocusEffect(
        useCallback(() => {
            loadDashboard();
        }, [loadDashboard]),
    );

    const weekLogCount = useMemo(() => {
        return weekSessions.reduce((sum, session) => sum + (session.logs?.length ?? 0), 0);
    }, [weekSessions]);

    const latestSessionDate = useMemo(() => {
        if (!weekSessions.length) return '--';
        const sorted = [...weekSessions].sort((a, b) => b.workoutDate.localeCompare(a.workoutDate));
        return formatShortDate(sorted[0]?.workoutDate);
    }, [weekSessions]);

    const protein = Math.round(dailyNutrition?.totalProtein ?? 0);
    const carbs = Math.round(dailyNutrition?.totalCarbs ?? 0);
    const fat = Math.round(dailyNutrition?.totalFats ?? 0);
    const calories = Math.round(dailyNutrition?.totalCalories ?? 0);
    const dailyCaloriesTarget = calculateDailyCaloriesTarget(latestBodyMetric, DEFAULT_DAILY_CALORIES_TARGET);
    const caloriesPercent = Math.min(100, Math.round((calories / dailyCaloriesTarget) * 100));
    const weeklySessionPercent = Math.min(100, Math.round((weekSessions.length / WEEKLY_SESSION_TARGET) * 100));
    const bmi = latestHealth?.bmi ? latestHealth.bmi.toFixed(1) : '--';
    const tdee = latestHealth?.tdee ? Math.round(latestHealth.tdee) : '--';
    const displayName = user?.name || user?.username || user?.email?.split('@')?.[0] || 'bạn';

  return (
    <View className="flex-1 bg-gray-50">
                <ScrollView
                    contentContainerStyle={{ paddingBottom: 110 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => loadDashboard(true)}
                            colors={['#f97316']}
                        />
                    }
                >
            <View className="rounded-b-[32px] overflow-hidden">
            <LinearGradient
                colors={['#f97316', '#ef4444']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="pb-20"
            >
                <SafeAreaView edges={['top', 'left', 'right']} className="p-6">
                    <View className="flex-row justify-between items-center mb-6">
                        <View className="flex-1">
                                                        <Text className="text-3xl font-bold text-white">Xin chào, {displayName}! 👋</Text>
                            <Text className="text-white/80 mt-1 text-base">
                              {formatLocalDate(new Date())}
                            </Text>
                        </View>
                        <TouchableOpacity 
                            className="ml-4"
                            onPress={() => navigation.navigate('Profile')}
                            activeOpacity={0.7}
                        >
                            {user?.picture ? (
                                <Image
                                    source={{ uri: user.picture }}
                                    className="w-12 h-12 rounded-full border-2 border-white/50"
                                    resizeMode="cover"
                                />
                            ) : (
                                <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center border-2 border-white/30">
                                    <User color="white" size={24} />
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View className="flex-row justify-between gap-3">
                        <View className="flex-1 bg-white/20 rounded-2xl p-4 items-center">
                            <View className="w-9 h-9 rounded-full bg-white/20 items-center justify-center mb-2">
                                <Flame color="white" size={18} />
                            </View>
                            <Text className="text-2xl font-bold text-white">{calories}</Text>
                            <Text className="text-xs text-white/80">Kcal hôm nay</Text>
                        </View>
                        <View className="flex-1 bg-white/20 rounded-2xl p-4 items-center">
                            <View className="w-9 h-9 rounded-full bg-white/20 items-center justify-center mb-2">
                                <Dumbbell color="white" size={18} />
                            </View>
                            <Text className="text-2xl font-bold text-white">{weekSessions.length}</Text>
                            <Text className="text-xs text-white/80">Buổi tuần này</Text>
                        </View>
                        <View className="flex-1 bg-white/20 rounded-2xl p-4 items-center">
                            <View className="w-9 h-9 rounded-full bg-white/20 items-center justify-center mb-2">
                                <HeartPulse color="white" size={18} />
                            </View>
                            <Text className="text-2xl font-bold text-white">{bmi}</Text>
                            <Text className="text-xs text-white/80">BMI mới nhất</Text>
                        </View>
                    </View>
                </SafeAreaView>
            </LinearGradient>
            </View>

            <View className="px-6 -mt-12">
                                {loading ? (
                                    <HomeDashboardSkeleton />
                                ) : (
                                    <View className="gap-4">
                                        <Card className="shadow-sm border border-orange-100 bg-white">
                                            <CardContent className="p-5">
                                                <View className="flex-row items-start justify-between mb-4">
                                                    <View>
                                                        <Text className="text-gray-900 font-bold text-lg">Dinh dưỡng hôm nay</Text>
                                                        <Text className="text-gray-500 text-xs mt-1">Theo bữa ăn đã ghi trong ngày</Text>
                                                    </View>
                                                    <View className="bg-orange-100 rounded-xl p-2.5">
                                                        <Flame color="#f97316" size={18} />
                                                    </View>
                                                </View>

                                                <View className="bg-orange-50 rounded-xl px-4 py-3 mb-3">
                                                    <View className="flex-row items-end justify-between">
                                                        <View>
                                                            <Text className="text-orange-700 text-xs">Năng lượng đã nạp</Text>
                                                            <Text className="text-gray-900 font-bold text-2xl mt-1">{calories} kcal</Text>
                                                        </View>
                                                        <View className="items-end">
                                                            <Text className="text-orange-700 text-xs">Mục tiêu</Text>
                                                            <Text className="text-orange-800 font-semibold text-sm">{dailyCaloriesTarget} kcal</Text>
                                                        </View>
                                                    </View>
                                                    <Progress
                                                        value={caloriesPercent}
                                                        className="h-2 bg-orange-100 mt-3"
                                                        indicatorClassName="bg-orange-500"
                                                    />
                                                </View>

                                                <View className="flex-row gap-2 mb-4">
                                                    <View className="flex-1 bg-red-50 rounded-xl px-3 py-2">
                                                        <Text className="text-[11px] text-red-500 font-semibold">Protein</Text>
                                                        <Text className="text-gray-900 font-bold mt-1">{protein}g</Text>
                                                    </View>
                                                    <View className="flex-1 bg-amber-50 rounded-xl px-3 py-2">
                                                        <Text className="text-[11px] text-amber-600 font-semibold">Carb</Text>
                                                        <Text className="text-gray-900 font-bold mt-1">{carbs}g</Text>
                                                    </View>
                                                    <View className="flex-1 bg-cyan-50 rounded-xl px-3 py-2">
                                                        <Text className="text-[11px] text-cyan-600 font-semibold">Fat</Text>
                                                        <Text className="text-gray-900 font-bold mt-1">{fat}g</Text>
                                                    </View>
                                                </View>

                                                <TouchableOpacity
                                                    className="self-start border border-orange-200 rounded-full px-3 py-1.5 flex-row items-center"
                                                    onPress={() => navigation.navigate('Diet', { screen: 'DietMain' })}
                                                >
                                                    <Text className="text-orange-600 text-xs font-semibold">Xem chi tiết</Text>
                                                    <ArrowUpRight color="#ea580c" size={13} style={{ marginLeft: 6 }} />
                                                </TouchableOpacity>
                                            </CardContent>
                                        </Card>

                                        <Card className="shadow-sm border border-blue-100 bg-white">
                                            <CardContent className="p-5">
                                                <View className="flex-row items-start justify-between mb-3">
                                                    <View className="flex-1 mr-3">
                                                        <Text className="text-gray-900 font-bold text-lg">Tập luyện</Text>
                                                        <Text className="text-gray-500 text-xs mt-1" numberOfLines={1}>
                                                            {activePlan?.name ? `Plan hiện tại: ${activePlan.name}` : 'Chưa có plan đang kích hoạt'}
                                                        </Text>
                                                    </View>
                                                    <View className="bg-blue-100 rounded-xl p-2.5">
                                                        <Dumbbell color="#2563eb" size={18} />
                                                    </View>
                                                </View>

                                                <View className="bg-blue-50 rounded-xl px-4 py-3 mb-3">
                                                    <View className="flex-row items-center justify-between mb-2">
                                                        <View className="flex-row items-center">
                                                            <Target color="#2563eb" size={14} />
                                                            <Text className="text-blue-700 text-xs ml-1">Tiến độ tuần</Text>
                                                        </View>
                                                        <Text className="text-blue-800 text-xs font-semibold">
                                                            {weekSessions.length}/{WEEKLY_SESSION_TARGET} buổi
                                                        </Text>
                                                    </View>
                                                    <Progress
                                                        value={weeklySessionPercent}
                                                        className="h-2 bg-blue-100"
                                                        indicatorClassName="bg-blue-500"
                                                    />
                                                </View>

                                                <View className="flex-row gap-3 mb-4">
                                                    <View className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
                                                        <Text className="text-[11px] text-gray-500">Buổi tuần này</Text>
                                                        <Text className="text-gray-900 font-semibold mt-1">{weekSessions.length}</Text>
                                                    </View>
                                                    <View className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
                                                        <Text className="text-[11px] text-gray-500">Tổng set ghi nhận</Text>
                                                        <Text className="text-gray-900 font-semibold mt-1">{weekLogCount}</Text>
                                                    </View>
                                                    <View className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
                                                        <Text className="text-[11px] text-gray-500">Lần tập gần nhất</Text>
                                                        <Text className="text-gray-900 font-semibold mt-1">{latestSessionDate}</Text>
                                                    </View>
                                                </View>

                                                <TouchableOpacity
                                                    className="self-start border border-blue-200 rounded-full px-3 py-1.5 flex-row items-center"
                                                    onPress={() => navigation.navigate('Workout', { screen: 'PlanDetail' })}
                                                >
                                                    <Text className="text-blue-600 text-xs font-semibold">Xem chi tiết</Text>
                                                    <ArrowUpRight color="#2563eb" size={13} style={{ marginLeft: 6 }} />
                                                </TouchableOpacity>
                                            </CardContent>
                                        </Card>

                                        {/* Health summary */}
                                        <Card className="shadow-sm border border-emerald-100 bg-white">
                                            <CardContent className="p-5">
                                                <View className="flex-row items-start justify-between mb-3">
                                                    <View>
                                                        <Text className="text-gray-900 font-bold text-lg">Sức khỏe</Text>
                                                        <Text className="text-gray-500 text-xs mt-1">Dữ liệu gần nhất từ chỉ số cơ thể và tính toán</Text>
                                                    </View>
                                                    <View className="bg-emerald-100 rounded-xl p-2.5">
                                                        <TrendingUp color="#059669" size={18} />
                                                    </View>
                                                </View>

                                                <View className="flex-row gap-3 mb-4">
                                                    <View className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
                                                        <View className="flex-row items-center gap-1">
                                                            <Scale color="#6b7280" size={12} />
                                                            <Text className="text-[11px] text-gray-500">Cân nặng</Text>
                                                        </View>
                                                        <Text className="text-gray-900 font-semibold mt-1">
                                                            {latestBodyMetric?.weightKg ? `${latestBodyMetric.weightKg} kg` : '--'}
                                                        </Text>
                                                    </View>
                                                    <View className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
                                                        <View className="flex-row items-center gap-1">
                                                            <Ruler color="#6b7280" size={12} />
                                                            <Text className="text-[11px] text-gray-500">Chiều cao</Text>
                                                        </View>
                                                        <Text className="text-gray-900 font-semibold mt-1">
                                                            {latestBodyMetric?.heightCm ? `${latestBodyMetric.heightCm} cm` : '--'}
                                                        </Text>
                                                    </View>
                                                    <View className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
                                                        <View className="flex-row items-center gap-1">
                                                            <CalendarDays color="#6b7280" size={12} />
                                                            <Text className="text-[11px] text-gray-500">TDEE</Text>
                                                        </View>
                                                        <Text className="text-gray-900 font-semibold mt-1">{tdee === '--' ? '--' : `${tdee} kcal`}</Text>
                                                    </View>
                                                </View>

                                                <View className="flex-row justify-between mb-4 bg-emerald-50 rounded-xl px-3 py-2 items-center">
                                                    <View className="flex-row items-center">
                                                        <Activity color="#059669" size={14} />
                                                        <Text className="text-emerald-700 text-sm ml-1">BMI mới nhất</Text>
                                                    </View>
                                                    <Text className="text-emerald-800 font-semibold">{bmi}</Text>
                                                </View>

                                                <TouchableOpacity
                                                    className="self-start border border-emerald-200 rounded-full px-3 py-1.5 flex-row items-center"
                                                    onPress={() => navigation.navigate('Health', { screen: 'HealthDashboard' })}
                                                >
                                                    <Text className="text-emerald-600 text-xs font-semibold">Xem chi tiết</Text>
                                                    <ArrowUpRight color="#059669" size={13} style={{ marginLeft: 6 }} />
                                                </TouchableOpacity>
                                            </CardContent>
                                        </Card>
                                    </View>
                                )}

            </View>
        </ScrollView>
    </View>
  );
}

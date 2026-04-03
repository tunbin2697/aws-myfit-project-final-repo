import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
    ArrowLeft,
    Target,
    Dumbbell,
    CheckCircle2,
    ChevronRight,
} from 'lucide-react-native';

import { getAllGoalTypes } from '../../services/goalTypeService';
import { getWorkoutPlansByGoalType, getWorkoutPlanById } from '../../services/workoutService';
import { cloneFromSystemPlan } from '../../services/userWorkoutPlanService';
import type { GoalType, WorkoutPlanSummary, WorkoutPlan } from '../../types/workout';
import { notifyAlert } from '../../utils/notification';
import { Skeleton } from '../../components/ui/Skeleton';

function SuggestedPlanSkeleton() {
    return (
        <View className="gap-4">
            {[0, 1, 2].map((idx) => (
                <View key={idx} className="bg-white rounded-2xl overflow-hidden">
                    <Skeleton className="h-1.5 w-full" />
                    <View className="p-5">
                        <View className="flex-row justify-between items-start mb-2 gap-3">
                            <Skeleton className="h-5 w-48" />
                            <Skeleton className="w-14 h-14 rounded-xl" />
                        </View>
                        <Skeleton className="h-5 w-20 rounded-full mb-2" />
                        <Skeleton className="h-3 w-full mb-1" />
                        <Skeleton className="h-3 w-4/5 mb-3" />
                        <View className="flex-row gap-4">
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-3 w-24" />
                        </View>
                    </View>
                </View>
            ))}
        </View>
    );
}


const GOAL_META: Record<string, { icon: string; color: string; gradient: [string, string] }> = {
    'Giảm cân': { icon: '🔥', color: '#f97316', gradient: ['#f97316', '#ef4444'] },
    'Tăng cơ': { icon: '💪', color: '#9333ea', gradient: ['#9333ea', '#ec4899'] },
    'Duy trì sức khỏe': { icon: '⚖️', color: '#22c55e', gradient: ['#22c55e', '#10b981'] },
};
const DEFAULT_META = { icon: '🎯', color: '#3b82f6', gradient: ['#3b82f6', '#06b6d4'] as [string, string] };
export function SuggestedPlanScreen({ navigation }: any) {
    const [step, setStep] = useState<'goal' | 'plans' | 'detail'>('goal');
    const [goalTypes, setGoalTypes] = useState<GoalType[]>([]);
    const [selectedGoal, setSelectedGoal] = useState<GoalType | null>(null);
    const [plans, setPlans] = useState<WorkoutPlanSummary[]>([]);
    const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null);
    const [loading, setLoading] = useState(false);
    const [cloning, setCloning] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const data = await getAllGoalTypes();
                setGoalTypes(data ?? []);
            } catch (e) {
                notifyAlert('Lỗi', 'Không thể tải loại mục tiêu');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleSelectGoal = useCallback(async (goal: GoalType) => {
        setSelectedGoal(goal);
        setStep('plans');
        setLoading(true);
        try {
            const data = await getWorkoutPlansByGoalType(goal.id);
            setPlans(data ?? []);
        } catch (e) {
            notifyAlert('Lỗi', 'Không thể tải kế hoạch');
        } finally {
            setLoading(false);
        }
    }, []);

    const handleSelectPlan = useCallback(async (plan: WorkoutPlanSummary) => {
        setStep('detail');
        setLoading(true);
        try {
            const detail = await getWorkoutPlanById(plan.id);
            setSelectedPlan(detail);
        } catch {
            notifyAlert('Lỗi', 'Không thể tải chi tiết kế hoạch');
        } finally {
            setLoading(false);
        }
    }, []);

    const handleClone = useCallback(async () => {
        if (!selectedPlan) return;
        setCloning(true);
        try {
            await cloneFromSystemPlan(selectedPlan.id);
            navigation.navigate('MyPlans');
        } catch {
            notifyAlert('Lỗi', 'Không thể áp dụng kế hoạch. Vui lòng thử lại.');
        } finally {
            setCloning(false);
        }
    }, [selectedPlan, navigation]);

    const handleBack = () => {
        if (step === 'detail') { setStep('plans'); setSelectedPlan(null); }
        else if (step === 'plans') { setStep('goal'); setSelectedGoal(null); setPlans([]); }
        else navigation.goBack();
    };

    const meta = selectedGoal
        ? (GOAL_META[selectedGoal.name] ?? DEFAULT_META)
        : DEFAULT_META;

    return (
        <View className="flex-1 bg-gray-50">
            <View className="rounded-b-[32px] overflow-hidden">
            <LinearGradient
                colors={meta.gradient as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="pb-8"
            >
                <SafeAreaView edges={['top', 'left', 'right']} className="px-6 pt-4">
                    <View className="flex-row items-center gap-4 mb-4">
                        <TouchableOpacity
                            onPress={handleBack}
                            className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
                        >
                            <ArrowLeft color="white" size={20} />
                        </TouchableOpacity>
                        <View className="flex-1">
                            <Text className="text-2xl font-bold text-white">
                                {step === 'goal' ? 'Chọn mục tiêu' :
                                    step === 'plans' ? selectedGoal?.name :
                                        'Chi tiết kế hoạch'}
                            </Text>
                            <Text className="text-white/80 text-sm">
                                {step === 'goal' ? 'Bước 1/3 — Mục tiêu của bạn là gì?' :
                                    step === 'plans' ? 'Bước 2/3 — Chọn kế hoạch phù hợp' :
                                        'Bước 3/3 — Xem chi tiết và áp dụng'}
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row gap-2 mb-2">
                        {['goal', 'plans', 'detail'].map(s => (
                            <View
                                key={s}
                                className={`h-2 rounded-full transition-all ${step === s ? 'w-8 bg-white' : 'w-2 bg-white/40'}`}
                            />
                        ))}
                    </View>
                </SafeAreaView>
            </LinearGradient>
            </View>

            <ScrollView className="flex-1 px-6 pt-6" contentContainerStyle={{ paddingBottom: 170 }}>
                {loading ? (
                    <SuggestedPlanSkeleton />
                ) : (
                    <>
                        {step === 'goal' && (
                            <View className="gap-4">
                                <Text className="text-gray-500 mb-2">
                                    Hệ thống sẽ gợi ý kế hoạch tập luyện phù hợp nhất với bạn
                                </Text>
                                {goalTypes.map((goal, index) => {
                                    const gMeta = GOAL_META[goal.name] ?? DEFAULT_META;
                                    return (
                                        <Animated.View key={goal.id} entering={FadeInDown.delay(index * 100)}>
                                            <TouchableOpacity
                                                onPress={() => handleSelectGoal(goal)}
                                                className="bg-white rounded-2xl p-5 flex-row items-center"
                                                style={{ elevation: 3, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }}
                                                activeOpacity={0.7}
                                            >
                                                <View className="w-14 h-14 rounded-2xl items-center justify-center mr-4" style={{ backgroundColor: gMeta.color + '20' }}>
                                                    <Text className="text-3xl">{gMeta.icon}</Text>
                                                </View>
                                                <View className="flex-1">
                                                    <Text className="text-lg font-bold text-gray-900">{goal.name}</Text>
                                                    {goal.description && (
                                                        <Text className="text-sm text-gray-500 mt-0.5">{goal.description}</Text>
                                                    )}
                                                </View>
                                                <ChevronRight color="#9ca3af" size={20} />
                                            </TouchableOpacity>
                                        </Animated.View>
                                    );
                                })}
                            </View>
                        )}

                        {step === 'plans' && (
                            <View className="gap-4">
                                {plans.length === 0 ? (
                                    <View className="items-center py-16">
                                        <Text className="text-4xl mb-4">🔍</Text>
                                        <Text className="text-gray-700 font-bold text-lg">Chưa có kế hoạch</Text>
                                        <Text className="text-gray-500 text-center mt-2">
                                            Admin chưa tạo kế hoạch cho mục tiêu này
                                        </Text>
                                    </View>
                                ) : (
                                    plans.map((plan, index) => (
                                        <Animated.View key={plan.id} entering={FadeInDown.delay(index * 100)}>
                                            <TouchableOpacity
                                                onPress={() => handleSelectPlan(plan)}
                                                className="bg-white rounded-2xl overflow-hidden"
                                                style={{ elevation: 3, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }}
                                                activeOpacity={0.7}
                                            >
                                                <View className="h-1.5" style={{ backgroundColor: meta.color }} />
                                                <View className="p-5">
                                                    <View className="flex-row justify-between items-start mb-2 gap-3">
                                                        <View className="flex-1">
                                                            <Text className="text-lg font-bold text-gray-900">{plan.name}</Text>
                                                        </View>
                                                        {plan.imageUrl ? (
                                                            <Image
                                                                source={{ uri: plan.imageUrl }}
                                                                className="w-14 h-14 rounded-xl"
                                                                resizeMode="cover"
                                                            />
                                                        ) : (
                                                            <View className="px-2 py-1 rounded-full self-start" style={{ backgroundColor: meta.color + '20' }}>
                                                                <Text className="text-xs font-semibold" style={{ color: meta.color }}>
                                                                    {plan.exerciseCount} bài
                                                                </Text>
                                                            </View>
                                                        )}
                                                    </View>

                                                    <View className="mb-2">
                                                        <View className="px-2 py-1 rounded-full self-start" style={{ backgroundColor: meta.color + '20' }}>
                                                            <Text className="text-xs font-semibold" style={{ color: meta.color }}>
                                                                {plan.exerciseCount} bài
                                                            </Text>
                                                        </View>
                                                    </View>

                                                    {plan.description && (
                                                        <Text className="text-gray-500 text-sm">{plan.description}</Text>
                                                    )}
                                                    <View className="flex-row items-center mt-3 gap-4">
                                                        <View className="flex-row items-center gap-1">
                                                            <Dumbbell color="#9ca3af" size={14} />
                                                            <Text className="text-xs text-gray-400">{plan.exerciseCount} exercises</Text>
                                                        </View>
                                                        <View className="flex-row items-center gap-1">
                                                            <Target color="#9ca3af" size={14} />
                                                            <Text className="text-xs text-gray-400">{plan.goalType?.name}</Text>
                                                        </View>
                                                    </View>
                                                </View>
                                            </TouchableOpacity>
                                        </Animated.View>
                                    ))
                                )}
                            </View>
                        )}

                        {/* ─── Step 3: Chi tiết Plan ─── */}
                        {step === 'detail' && selectedPlan && (
                            <View>
                                {/* Plan info card */}
                                <View className="bg-white rounded-2xl p-5 mb-4" style={{ elevation: 3, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }}>
                                    {selectedPlan.imageUrl && (
                                        <Image
                                            source={{ uri: selectedPlan.imageUrl }}
                                            className="w-full h-40 rounded-2xl mb-4"
                                            resizeMode="cover"
                                        />
                                    )}

                                    <Text className="text-xl font-bold text-gray-900 mb-1">{selectedPlan.name}</Text>
                                    {selectedPlan.description && (
                                        <Text className="text-gray-500 text-sm mb-4">{selectedPlan.description}</Text>
                                    )}
                                    <View className="flex-row gap-4">
                                        <View className="flex-1 bg-orange-50 rounded-xl p-3 items-center">
                                            <Dumbbell color="#f97316" size={20} />
                                            <Text className="text-xl font-bold text-gray-900 mt-1">{selectedPlan.exercises?.length ?? 0}</Text>
                                            <Text className="text-xs text-gray-500">Bài tập</Text>
                                        </View>
                                        <View className="flex-1 bg-blue-50 rounded-xl p-3 items-center">
                                            <Target color="#3b82f6" size={20} />
                                            <Text className="text-sm font-bold text-gray-900 mt-1">{selectedPlan.goalType?.name}</Text>
                                            <Text className="text-xs text-gray-500">Mục tiêu</Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Exercises list */}
                                <Text className="text-base font-bold text-gray-900 mb-3">Danh sách bài tập</Text>
                                <View className="gap-3">
                                    {selectedPlan.exercises?.map((ex, index) => (
                                        <Animated.View key={ex.id} entering={FadeInDown.delay(index * 80)}>
                                            <View className="bg-white rounded-xl p-4 flex-row items-center" style={{ elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 1 } }}>
                                                <View className="w-9 h-9 rounded-full items-center justify-center mr-3" style={{ backgroundColor: meta.color }}>
                                                    <Text className="text-white font-bold text-sm">{index + 1}</Text>
                                                </View>
                                                <View className="flex-1 mr-2">
                                                    <Text className="font-semibold text-gray-900">{ex.exercise.name}</Text>
                                                    <Text className="text-xs text-gray-500 mt-0.5">
                                                        {ex.sets} sets × {ex.reps} reps  •  Nghỉ {ex.restSeconds}s
                                                    </Text>
                                                </View>
                                                {ex.exercise.imageUrl ? (
                                                    <Image
                                                        source={{ uri: ex.exercise.imageUrl }}
                                                        className="w-14 h-14 rounded-lg"
                                                        resizeMode="cover"
                                                    />
                                                ) : (
                                                    <View className="bg-gray-100 px-2 py-1 rounded-lg">
                                                        <Text className="text-xs text-gray-600">{ex.exercise.muscleGroup?.name}</Text>
                                                    </View>
                                                )}
                                            </View>
                                        </Animated.View>
                                    ))}
                                </View>

                                {/* Benefits */}
                                <View className="bg-white rounded-2xl p-5 mt-4" style={{ elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 1 } }}>
                                    <Text className="font-bold text-gray-900 mb-3">Lợi ích khi áp dụng</Text>
                                    {[
                                        'Được thiết kế dựa trên mục tiêu của bạn',
                                        'Cân bằng cường độ và thời gian nghỉ',
                                        'Có thể tùy chỉnh sau khi áp dụng',
                                    ].map((benefit, i) => (
                                        <View key={i} className="flex-row items-start gap-2 mb-2">
                                            <CheckCircle2 color="#22c55e" size={16} style={{ marginTop: 2 }} />
                                            <Text className="text-gray-600 text-sm flex-1">{benefit}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}
                    </>
                )}
            </ScrollView>

            {/* Fixed bottom CTA (chỉ hiện ở step detail) */}
            {step === 'detail' && selectedPlan && (
                <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 pt-4 pb-24">
                    <View className="gap-3">
                        <TouchableOpacity
                            onPress={handleClone}
                            disabled={cloning}
                            className="rounded-2xl py-4 items-center justify-center flex-row gap-2"
                            style={{ backgroundColor: meta.color, opacity: cloning ? 0.7 : 1 }}
                            activeOpacity={0.8}
                        >
                            {cloning ? (
                                <ActivityIndicator color="white" size="small" />
                            ) : (
                                <CheckCircle2 color="white" size={20} />
                            )}
                            <Text className="text-white font-bold text-base">
                                {cloning ? 'Đang áp dụng...' : 'Áp dụng kế hoạch này'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
}

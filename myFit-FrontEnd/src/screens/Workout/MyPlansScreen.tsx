import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
    ArrowLeft,
    Plus,
    Dumbbell,
    Target,
    CheckCircle2,
    Circle,
    Zap,
    Trash2,
    ChevronRight,
} from 'lucide-react-native';
import { useDispatch } from 'react-redux';
import { bumpPlansReloadKey } from '../../store/uiSlice';
import { Skeleton } from '../../components/ui/Skeleton';

import { getMyPlans, activatePlan, deletePlan, updatePlan } from '../../services/userWorkoutPlanService';
import { confirmAction } from '../../utils/confirm';
import type { UserWorkoutPlan } from '../../types/workout';
import { notifyAlert } from '../../utils/notification';

function MyPlansSkeleton() {
    return (
        <View>
            <View className="mb-5">
                <Skeleton className="h-4 w-28 mb-3" />
                <View className="bg-white rounded-2xl overflow-hidden">
                    <Skeleton className="h-28 w-full" />
                    <View className="px-5 py-4">
                        <View className="flex-row gap-3">
                            <Skeleton className="h-10 flex-1 rounded-xl" />
                            <Skeleton className="h-10 flex-1 rounded-xl" />
                        </View>
                    </View>
                </View>
            </View>

            <Skeleton className="h-4 w-24 mb-3" />
            {[0, 1].map((idx) => (
                <View key={idx} className="bg-white rounded-2xl p-4 mb-3">
                    <View className="flex-row items-center justify-between mb-2">
                        <Skeleton className="h-5 w-44" />
                        <Skeleton className="h-5 w-12 rounded-full" />
                    </View>
                    <Skeleton className="h-3 w-3/4 mb-3" />
                    <View className="flex-row gap-2">
                        <Skeleton className="h-10 flex-1 rounded-xl" />
                        <Skeleton className="h-10 flex-1 rounded-xl" />
                    </View>
                </View>
            ))}
        </View>
    );
}


export function MyPlansScreen({ navigation }: any) {
    const dispatch = useDispatch();
    const skipInitialFocusRef = useRef(true);
    const [plans, setPlans] = useState<UserWorkoutPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activating, setActivating] = useState<string | null>(null);
    const [showCreateMenu, setShowCreateMenu] = useState(false);


    const fetchPlans = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        try {
            const data = await getMyPlans();
            setPlans(data ?? []);
        } catch (e) {
            notifyAlert('Lỗi', 'Không thể tải danh sách kế hoạch');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchPlans();
    }, [fetchPlans]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            if (skipInitialFocusRef.current) {
                skipInitialFocusRef.current = false;
                return;
            }
            fetchPlans();
        });
        return unsubscribe;
    }, [navigation, fetchPlans]);

    const handleActivate = useCallback(async (plan: UserWorkoutPlan) => {
        if (plan.isActive) return;
        console.log('[MyPlans] handleActivate', plan.id);
        setActivating(plan.id);
        try {
            await activatePlan(plan.id);
            await new Promise(resolve => setTimeout(resolve, 300));
            setPlans(prev => prev.map(p => ({ ...p, isActive: p.id === plan.id })));
            dispatch(bumpPlansReloadKey());
            fetchPlans();
        } catch (err: any) {
            console.error('[MyPlans] activatePlan failed', err?.message ?? err);
            notifyAlert('Lỗi kích hoạt', err?.message ?? 'Không thể kích hoạt kế hoạch. Vui lòng thử lại.');
        } finally {
            setActivating(null);
        }
    }, [fetchPlans]);

    const handleDelete = useCallback((plan: UserWorkoutPlan) => {
        confirmAction(
            'Xóa kế hoạch',
            `Bạn có chắc muốn xóa "${plan.name}"?`,
            async () => {
                try {
                    await deletePlan(plan.id);
                    setPlans(prev => prev.filter(p => p.id !== plan.id));
                } catch {
                    console.error('delete plan failed', plan.id);
                }
            },
            'Xóa',
            'Hủy'
        );
    }, []);

    const handleDeactivate = useCallback((plan: UserWorkoutPlan) => {
        if (!plan.isActive) return;

        confirmAction(
            'Ngừng kích hoạt kế hoạch',
            `Bạn muốn ngừng kích hoạt "${plan.name}"?`,
            async () => {
                try {
                    setActivating(plan.id);
                    await updatePlan(plan.id, {
                        name: plan.name,
                        description: plan.description ?? undefined,
                        goalTypeId: plan.goalTypeId ?? undefined,
                        isActive: false,
                    });

                    setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, isActive: false } : p));
                    dispatch(bumpPlansReloadKey());
                    fetchPlans();
                } catch (err: any) {
                    notifyAlert('Lỗi', err?.message || 'Không thể ngừng kích hoạt kế hoạch.');
                } finally {
                    setActivating(null);
                }
            },
            'Ngừng kích hoạt',
            'Hủy'
        );
    }, [dispatch, fetchPlans]);

    const activePlan = plans.find(p => p.isActive);

    return (
        <View className="flex-1 bg-gray-50">
            <View className="rounded-b-[32px] overflow-hidden">
            <LinearGradient
                colors={['#f97316', '#ef4444']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="pb-8"
            >
                <SafeAreaView edges={['top', 'left', 'right']} className="px-6 pt-4">
                    <View className="flex-row items-center justify-between mb-2">
                        <View className="flex-row items-center gap-3">
                            <TouchableOpacity
                                onPress={() => navigation.navigate("PlanDetail")}
                                className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
                            >
                                <ArrowLeft color="white" size={18} />
                            </TouchableOpacity>
                            <View>
                                <Text className="text-2xl font-bold text-white">Kế hoạch của tôi</Text>
                                <Text className="text-white/80 text-sm">{plans.length} kế hoạch</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={() => setShowCreateMenu(prev => !prev)}
                            className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
                            activeOpacity={0.8}
                        >
                            <Plus color="white" size={18} />
                        </TouchableOpacity>
                    </View>

                    {showCreateMenu && (
                        <View className="items-end mt-1">
                            <View className="bg-white rounded-xl p-2 min-w-[150px]" style={{ elevation: 4 }}>
                                <TouchableOpacity
                                    onPress={() => {
                                        setShowCreateMenu(false);
                                        navigation.navigate('CreatePlan');
                                    }}
                                    className="px-3 py-2 rounded-lg"
                                    activeOpacity={0.7}
                                >
                                    <Text className="text-gray-800 font-semibold">Tạo plan</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        setShowCreateMenu(false);
                                        navigation.navigate('SuggestedPlan');
                                    }}
                                    className="px-3 py-2 rounded-lg"
                                    activeOpacity={0.7}
                                >
                                    <Text className="text-gray-800 font-semibold">Clone</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </SafeAreaView>
            </LinearGradient>
            </View>

            <ScrollView
                className="flex-1 px-6 pt-6"
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchPlans(true)} colors={['#f97316']} />}
            >
                {loading ? (
                    <MyPlansSkeleton />
                ) : plans.length === 0 ? (
                    <View className="items-center py-16">
                        <View className="w-20 h-20 bg-orange-100 rounded-full items-center justify-center mb-4">
                            <Dumbbell color="#f97316" size={36} />
                        </View>
                        <Text className="text-xl font-bold text-gray-900 mb-2">Chưa có kế hoạch nào</Text>
                        <Text className="text-gray-500 text-center mb-6">
                            Hãy tìm và áp dụng một kế hoạch tập luyện phù hợp với mục tiêu của bạn
                        </Text>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('SuggestedPlan')}
                            className="bg-orange-500 px-6 py-3 rounded-2xl flex-row items-center gap-2"
                            activeOpacity={0.8}
                        >
                            <Zap color="white" size={18} />
                            <Text className="text-white font-bold">Clone kế hoạch</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('CreatePlan')}
                            className="mt-3 bg-white border border-orange-200 px-6 py-3 rounded-2xl flex-row items-center gap-2"
                            activeOpacity={0.8}
                        >
                            <Plus color="#f97316" size={18} />
                            <Text className="text-orange-600 font-bold">Tạo kế hoạch của bạn</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        {activePlan && (
                            <View className="mb-5">
                                <Text className="text-sm font-bold text-gray-500 uppercase mb-3">Đang áp dụng</Text>
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('PlanDetail', { planId: activePlan.id, planName: activePlan.name })}
                                    className="bg-white rounded-2xl overflow-hidden"
                                    style={{ elevation: 4, shadowColor: '#f97316', shadowOpacity: 0.2, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } }}
                                    activeOpacity={0.7}
                                >
                                    <LinearGradient
                                        colors={['#f97316', '#ef4444']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        className="px-5 pt-5 pb-4"
                                    >
                                        <View className="flex-row items-start justify-between">
                                            <View className="flex-1 mr-3">
                                                <View className="flex-row items-center gap-2 mb-1">
                                                    <CheckCircle2 color="white" size={16} />
                                                    <Text className="text-white/90 text-xs font-semibold uppercase">Active</Text>
                                                </View>
                                                <Text className="text-white text-xl font-bold">{activePlan.name}</Text>
                                                {activePlan.description && (
                                                    <Text className="text-white/80 text-sm mt-1">{activePlan.description}</Text>
                                                )}
                                            </View>
                                            <ChevronRight color="white" size={20} />
                                        </View>
                                    </LinearGradient>
                                    <View className="px-5 py-4 flex-row gap-3 border-t border-gray-100">
                                        <TouchableOpacity
                                            onPress={() => handleDeactivate(activePlan)}
                                            disabled={activating === activePlan.id}
                                            className="flex-1 bg-gray-100 py-2.5 rounded-xl items-center justify-center"
                                        >
                                            {activating === activePlan.id ? (
                                                <ActivityIndicator size="small" color="#6b7280" />
                                            ) : (
                                                <Text className="text-gray-700 font-bold text-sm">Ngừng kích hoạt</Text>
                                            )}
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => handleDelete(activePlan)}
                                            className="flex-1 bg-red-50 py-2.5 rounded-xl items-center justify-center"
                                        >
                                            <Text className="text-red-600 font-bold text-sm">Xóa kế hoạch</Text>
                                        </TouchableOpacity>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Inactive plans */}
                        {plans.filter(p => !p.isActive).length > 0 && (
                            <View>
                                <Text className="text-sm font-bold text-gray-500 uppercase mb-3">Kế hoạch khác</Text>
                                <View className="gap-3">
                                    {plans.filter(p => !p.isActive).map((plan, index) => (
                                        <Animated.View key={plan.id} entering={FadeInDown.delay(index * 80)}>
                                            {/* Use View + separate pressable area to avoid nested TouchableOpacity touch conflicts on web */}
                                            <View
                                                className="bg-white rounded-2xl p-4 flex-row items-center"
                                                style={{ elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 1 } }}
                                            >
                                                {/* Tappable area: navigate to plan detail */}
                                                <TouchableOpacity
                                                    onPress={() => navigation.navigate('PlanDetail', { planId: plan.id, planName: plan.name })}
                                                    className="flex-row items-center flex-1"
                                                    activeOpacity={0.7}
                                                >
                                                    <View className="w-10 h-10 bg-gray-100 rounded-xl items-center justify-center mr-3">
                                                        <Dumbbell color="#9ca3af" size={20} />
                                                    </View>
                                                    <View className="flex-1">
                                                        <Text className="font-semibold text-gray-900">{plan.name}</Text>
                                                        {plan.description && (
                                                            <Text className="text-xs text-gray-400 mt-0.5">{plan.description}</Text>
                                                        )}
                                                    </View>
                                                </TouchableOpacity>
                                                {/* Action buttons — separate from the nav touch */}
                                                <View className="flex-row gap-2 ml-2">
                                                    <TouchableOpacity
                                                        onPress={() => handleActivate(plan)}
                                                        disabled={activating === plan.id}
                                                        className="bg-orange-50 px-3 py-1.5 rounded-xl"
                                                    >
                                                        {activating === plan.id ? (
                                                            <ActivityIndicator size="small" color="#f97316" />
                                                        ) : (
                                                            <Text className="text-orange-600 text-xs font-bold">Kích hoạt</Text>
                                                        )}
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        onPress={() => handleDelete(plan)}
                                                        className="bg-red-50 p-1.5 rounded-xl"
                                                    >
                                                        <Trash2 color="#ef4444" size={16} />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </Animated.View>
                                    ))}
                                </View>
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
        </View>
    );
}

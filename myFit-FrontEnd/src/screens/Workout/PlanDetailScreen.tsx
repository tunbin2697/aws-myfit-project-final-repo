import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { getItem, deleteItem } from '../../utils/storage';
import {
    ArrowLeft,
    Dumbbell,
    Clock,
    Calendar,
    Play,
    CheckCircle2,
    ChevronRight,
    Plus,
    Pencil,
    Info
} from 'lucide-react-native';

import { getPlanById, activatePlan, getMyActivePlan } from '../../services/userWorkoutPlanService';
import { getUserProfileFromStorage } from '../../services/authService';
import { createSession, getActiveSessionByUser, deactivateSession } from '../../services/sessionService';
import { getExercisesLite as getExercises, getExerciseImagesByIds } from '../../services/workoutService';
import { setExerciseNameCache } from '../../store/uiSlice';
import type { UserWorkoutPlan, UserWorkoutPlanExercise, Exercise } from '../../types/workout';
import { notifyAlert } from '../../utils/notification';
import { Skeleton } from '../../components/ui/Skeleton';

const DAY_LABELS: Record<number, string> = {
    1: 'Thứ 2', 2: 'Thứ 3', 3: 'Thứ 4', 4: 'Thứ 5',
    5: 'Thứ 6', 6: 'Thứ 7', 7: 'CN',
};
const DAY_BY_LABEL: Record<string, number> = Object.fromEntries(
    Object.entries(DAY_LABELS).map(([day, label]) => [label, Number(day)])
);
const ALL_DAYS = [1, 2, 3, 4, 5, 6, 7];

const getTodayDayOfWeek = (): number => {
    const day = new Date().getDay();
    return day === 0 ? 7 : day;
};

const formatLocalDate = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

function PlanDetailSkeleton() {
    return (
        <View className="flex-1 bg-gray-50">
            <View className="rounded-b-[32px] overflow-hidden">
                <LinearGradient
                    colors={['#f97316', '#ef4444']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="pb-6"
                >
                    <SafeAreaView edges={['top', 'left', 'right']} className="px-6 pt-4">
                        <Skeleton className="h-8 w-56 mb-3 bg-white/30" />
                        <View className="flex-row gap-3 mb-4 px-2">
                            {[0, 1, 2, 3].map((idx) => (
                                <Skeleton key={idx} className="h-16 flex-1 rounded-xl bg-white/20" />
                            ))}
                        </View>
                        <Skeleton className="h-20 w-full rounded-2xl bg-white/20" />
                    </SafeAreaView>
                </LinearGradient>
            </View>

            <ScrollView className="flex-1 px-6 pt-4">
                <View className="flex-row gap-2 mb-4">
                    {[0, 1, 2, 3].map((idx) => (
                        <Skeleton key={idx} className="h-9 w-14 rounded-full" />
                    ))}
                </View>
                {[0, 1, 2].map((idx) => (
                    <View key={idx} className="bg-white rounded-2xl p-4 mb-3">
                        <View className="flex-row items-center mb-2">
                            <Skeleton className="w-12 h-12 rounded-xl mr-3" />
                            <View className="flex-1">
                                <Skeleton className="h-4 w-40 mb-2" />
                                <Skeleton className="h-3 w-24" />
                            </View>
                        </View>
                        <Skeleton className="h-3 w-4/5" />
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

export function PlanDetailScreen({ route, navigation }: any) {
    const insets = useSafeAreaInsets();
    const reduxDispatch = useDispatch();

    const { planId, startSession: autoStart } = route.params ?? {};

    const [plan, setPlan] = useState<UserWorkoutPlan | null>(null);
    const [exerciseNames, setExerciseNames] = useState<Record<string, string>>({});
    const [exerciseImages, setExerciseImages] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState(getTodayDayOfWeek());
    const [startingSession, setStartingSession] = useState(false);
    const [endingSession, setEndingSession] = useState(false);
    const [showInfo, setShowInfo] = useState(false);

    const [pendingSession, setPendingSession] = useState<{
        sessionId: string;
        planId?: string;
        dayLabel: string;
        dayOfWeek?: number;
        planName: string;
    } | null>(null);
    const runtimeStateKey = 'workout_session_runtime';
    const loadRequestRef = useRef(0);
    const isFirstPlansReloadRef = useRef(true);

    const loadData = useCallback(async () => {
        const loadId = ++loadRequestRef.current;
        setLoading(true);
        try {
            let planData: UserWorkoutPlan | null = null;

            if (planId) {
                planData = await getPlanById(planId);
            } else {
                const active = await getMyActivePlan();
                if (active) {
                    planData = await getPlanById(active.id);
                }
            }

            if (!planData) {
                setPlan(null);
                setExerciseNames({});
                setLoading(false);
                return;
            }

            const exerciseData = await getExercises().catch(() => [] as Exercise[]);
            const nameMap: Record<string, string> = {};
            const imageMap: Record<string, string> = {};
            exerciseData.forEach(ex => { nameMap[ex.id] = ex.name; });
            exerciseData.forEach(ex => {
                if (ex.imageUrl) {
                    imageMap[ex.id] = ex.imageUrl;
                }
            });
            setExerciseNames(nameMap);
            setExerciseImages(imageMap);

            const exerciseIds = exerciseData.map(ex => ex.id).filter(Boolean);
            if (exerciseIds.length > 0) {
                void getExerciseImagesByIds(exerciseIds).then(fetchedImages => {
                    if (loadRequestRef.current !== loadId) return;
                    setExerciseImages(prev => {
                        const merged = { ...prev };
                        Object.entries(fetchedImages).forEach(([id, url]) => {
                            if (url) merged[id] = url;
                        });
                        return merged;
                    });
                });
            }

            reduxDispatch(setExerciseNameCache(nameMap));
            setPlan(planData);
        } catch (e) {
            console.error('Failed to load plan detail', e);
            notifyAlert('Lỗi', 'Không thể tải chi tiết kế hoạch');
        } finally {
            setLoading(false);
        }
    }, [planId, reduxDispatch]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const plansReloadKey = useSelector((s: RootState) => s.ui.plansReloadKey);
    useEffect(() => {
        if (isFirstPlansReloadRef.current) {
            isFirstPlansReloadRef.current = false;
            return;
        }
        loadData();
    }, [plansReloadKey, loadData]);

    useEffect(() => {
        if (autoStart && plan && !loading) {
            handleStartSession();
        }
    }, [autoStart, plan, loading]);

    const checkPendingSession = useCallback(async () => {
        if (!plan) return;
        try {
            const raw = await getItem('active_session');
            if (!raw) { setPendingSession(null); return; }
            const saved = JSON.parse(raw);

            if (!saved?.sessionId || saved.planId !== plan.id) {
                setPendingSession(null);
                return;
            }

            const [progressRaw, runtimeRaw] = await Promise.all([
                getItem(`session_progress_${saved.sessionId}`),
                getItem(runtimeStateKey),
            ]);

            const runtimeSessionId = runtimeRaw
                ? (() => {
                    try {
                        return JSON.parse(runtimeRaw)?.sessionId;
                    } catch {
                        return null;
                    }
                })()
                : null;

            const hasLocalProgress = Boolean(progressRaw) || runtimeSessionId === saved.sessionId;

            if (!hasLocalProgress) {
                await deleteItem('active_session').catch(() => { });
                setPendingSession(null);
                return;
            }

            setPendingSession(saved);
        } catch {
            setPendingSession(null);
        }
    }, [plan]);

    useEffect(() => {
        checkPendingSession();
    }, [checkPendingSession]);

    useEffect(() => {
        const unsub = navigation.addListener('focus', checkPendingSession);
        return unsub;
    }, [navigation, checkPendingSession]);

    const exercisesByDay = useCallback((): Record<number, UserWorkoutPlanExercise[]> => {
        if (!plan?.exercises) return {};
        const grouped: Record<number, UserWorkoutPlanExercise[]> = {};
        plan.exercises.forEach(ex => {
            const day = ex.dayOfWeek ?? 1;
            if (!grouped[day]) grouped[day] = [];
            grouped[day].push(ex);
        });
        Object.values(grouped).forEach(exs => exs.sort((a, b) => a.orderIndex - b.orderIndex));
        return grouped;
    }, [plan]);

    const dayMap = exercisesByDay();
    const hasPlan = !!plan;
    const activeDays = Object.keys(dayMap).map(Number).sort((a, b) => a - b);
    const todayExercises = dayMap[selectedDay] ?? [];
    const pendingDay = pendingSession
        ? (pendingSession.dayOfWeek ?? DAY_BY_LABEL[pendingSession.dayLabel] ?? selectedDay)
        : selectedDay;
    const pendingDayExercises = dayMap[pendingDay] ?? [];

    const getExerciseName = (exerciseId: string): string => {
        return exerciseNames[exerciseId] ?? `Exercise (${exerciseId.slice(0, 8)}...)`;
    };

    const getExerciseImage = (exerciseId: string): string | undefined => {
        return exerciseImages[exerciseId];
    };

    const continuePendingSession = useCallback(() => {
        if (!pendingSession) return;
        navigation.navigate('WorkoutSession', {
            sessionId: pendingSession.sessionId,
            planId: plan?.id,
            exercises: pendingDayExercises.map(ex => ({
                id: ex.id,
                exerciseId: ex.exerciseId,
                name: getExerciseName(ex.exerciseId),
                sets: ex.sets,
                repsTarget: ex.reps,
                restSeconds: ex.restSeconds,
                orderIndex: ex.orderIndex,
            })),
            dayLabel: pendingSession.dayLabel,
            dayOfWeek: pendingDay,
            planName: pendingSession.planName,
            forceContinue: true,
        });
    }, [pendingSession, navigation, plan?.id, pendingDayExercises, pendingDay, getExerciseName]);

    const clearPendingSessionLocal = useCallback(async (sessionId?: string) => {
        if (sessionId) {
            await deleteItem(`session_progress_${sessionId}`).catch(() => { });
        }
        await deleteItem(runtimeStateKey).catch(() => { });
        await deleteItem('active_session').catch(() => { });
        setPendingSession(null);
    }, []);

    const endSessionById = useCallback(async (sessionId: string) => {
        if (endingSession) return;

        setEndingSession(true);
        try {
            await deactivateSession(sessionId);
            await clearPendingSessionLocal(sessionId);
            notifyAlert('Thành công', 'Đã kết thúc buổi tập đang dở.');
        } catch {
            notifyAlert('Lỗi', 'Không thể kết thúc buổi tập. Vui lòng thử lại.');
        } finally {
            setEndingSession(false);
        }
    }, [endingSession, clearPendingSessionLocal]);

    const endPendingSession = useCallback(async () => {
        if (!pendingSession || endingSession) return;

        notifyAlert(
            'Kết thúc buổi tập?',
            'Buổi tập hiện tại sẽ dừng lại và bạn cần bắt đầu buổi mới vào lần sau.',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Kết thúc buổi tập',
                    style: 'destructive',
                    onPress: () => endSessionById(pendingSession.sessionId),
                },
            ]
        );
    }, [pendingSession, endingSession, endSessionById]);

    const handleEditPlan = useCallback(async () => {
        if (!plan) return;

        try {
            const userProfile = await getUserProfileFromStorage();
            if (!userProfile?.id) {
                notifyAlert('Lỗi', 'Không xác định người dùng. Vui lòng đăng nhập lại.');
                return;
            }

            const activeSession = await getActiveSessionByUser(userProfile.id);
            if (!activeSession) {
                navigation.navigate('PlanEdit', { planId: plan.id });
                return;
            }

            const canContinueFromHere = pendingSession?.sessionId === activeSession.id;

            notifyAlert(
                'Không thể sửa kế hoạch lúc này',
                'Bạn đang có buổi tập đang diễn ra. Hãy hoàn thành hoặc kết thúc buổi tập trước khi sửa kế hoạch.',
                canContinueFromHere
                    ? [
                        { text: 'Đóng', style: 'cancel' },
                        {
                            text: 'Tiếp tục buổi tập',
                            style: 'default',
                            onPress: continuePendingSession,
                        },
                        {
                            text: 'Kết thúc buổi tập',
                            style: 'destructive',
                            onPress: () => endSessionById(activeSession.id),
                        },
                    ]
                    : [
                        { text: 'Đóng', style: 'cancel' },
                        {
                            text: 'Kết thúc buổi tập',
                            style: 'destructive',
                            onPress: () => endSessionById(activeSession.id),
                        },
                    ]
            );
        } catch {
            notifyAlert('Lỗi', 'Không kiểm tra được trạng thái buổi tập. Vui lòng thử lại.');
        }
    }, [plan, navigation, pendingSession, continuePendingSession, endSessionById]);

    const createAndStartNewSession = useCallback(async () => {
        if (!plan || todayExercises.length === 0) {
            notifyAlert('Thông báo', 'Hôm nay không có bài tập theo lịch. Chọn ngày khác để bắt đầu.');
            return;
        }
        setStartingSession(true);
        try {
            const today = new Date();
            const userProfile = await getUserProfileFromStorage();
            if (!userProfile || !userProfile.id) {
                notifyAlert('Lỗi', 'Không xác định người dùng. Vui lòng đăng xuất và đăng nhập lại.');
                setStartingSession(false);
                return;
            }

            const payload = {
                userId: userProfile.id,
                userWorkoutPlanId: plan.id,
                workoutDate: formatLocalDate(today),
                weekIndex: 0,
                dayIndex: todayExercises[0]?.dayIndex ?? 0,
            };
            const session = await createSession(payload as any);
            const sessionId = session.id;

            const combinedExercises = [
                ...todayExercises.map(ex => ({
                    id: ex.id,
                    exerciseId: ex.exerciseId,
                    name: getExerciseName(ex.exerciseId),
                    sets: ex.sets,
                    repsTarget: ex.reps,
                    restSeconds: ex.restSeconds,
                    orderIndex: ex.orderIndex,
                })),
            ];

            navigation.navigate('WorkoutSession', {
                sessionId,
                planId: plan.id,
                exercises: combinedExercises,
                dayLabel: DAY_LABELS[selectedDay],
                dayOfWeek: selectedDay,
                planName: plan.name,
                forceContinue: false,
            });
        } catch (e) {
            notifyAlert('Lỗi', 'Không thể bắt đầu buổi tập. Vui lòng thử lại.');
        } finally {
            setStartingSession(false);
        }
    }, [plan, todayExercises, selectedDay, exerciseNames, navigation]);

    const handleStartSession = useCallback(async () => {
        if (!pendingSession) {
            await createAndStartNewSession();
            return;
        }

        notifyAlert(
            'Đã có buổi tập đang dở',
            `${pendingSession.planName} · ${pendingSession.dayLabel}. Bạn muốn tiếp tục hay bắt đầu buổi mới?`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Tiếp tục',
                    style: 'default',
                    onPress: continuePendingSession,
                },
                {
                    text: 'Tạo buổi mới',
                    style: 'destructive',
                    onPress: async () => {
                        await clearPendingSessionLocal(pendingSession.sessionId);
                        await createAndStartNewSession();
                    },
                },
            ]
        );
    }, [pendingSession, createAndStartNewSession, continuePendingSession, clearPendingSessionLocal]);

    if (loading) {
        return <PlanDetailSkeleton />;
    }

    return (
        <View className="flex-1 bg-gray-50">
            <View className={hasPlan ? 'rounded-b-[32px] overflow-hidden' : 'rounded-b-[24px] overflow-hidden'}>
            <LinearGradient
                colors={['#f97316', '#ef4444']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className={hasPlan ? 'pb-6' : 'pb-3'}
            >
                <SafeAreaView edges={['top', 'left', 'right']} className={hasPlan ? 'px-6 pt-4' : 'px-6 pt-3'}>
                    <View className={hasPlan ? 'flex-col gap-4 mb-4' : 'flex-col gap-3 mb-2'}>
                        <View>
                            <Text className="text-2xl font-bold text-white text-left">{plan?.name ?? 'Kế hoạch của tôi'}</Text>
                            {!hasPlan && (
                                <Text className="text-white/85 text-sm mt-1">Bạn chưa có kế hoạch đang áp dụng</Text>
                            )}
                        </View>

                        <View className={hasPlan ? 'flex-row gap-3 mb-4 px-2' : 'flex-row gap-3 px-2'}>
                            {plan && (
                                <TouchableOpacity
                                    onPress={handleEditPlan}
                                    className="flex-1 bg-white/15 rounded-xl p-3 items-center justify-center"
                                    activeOpacity={0.7}
                                >
                                    <Pencil color="white" size={24} className="mb-1" />
                                    <Text className="text-white/80 text-xs font-semibold">Sửa</Text>
                                </TouchableOpacity>
                            )}

                            {plan && (
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('MyPlans')}
                                    className="flex-1 bg-white/15 rounded-xl p-3 items-center justify-center"
                                    activeOpacity={0.7}
                                >
                                    <Plus color="white" size={24} className="mb-1" />
                                    <Text className="text-white/80 text-xs font-semibold">Thêm</Text>
                                </TouchableOpacity>
                            )}

                            {plan && (
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('SessionCalendar')}
                                    className="flex-1 bg-white/15 rounded-xl p-3 items-center justify-center"
                                    activeOpacity={0.7}
                                >
                                    <Calendar color="white" size={24} className="mb-1" />
                                    <Text className="text-white/80 text-xs font-semibold">Lịch sử</Text>
                                </TouchableOpacity>
                            )}

                            {plan && (
                                <TouchableOpacity
                                    onPress={() => setShowInfo(!showInfo)}
                                    className={`flex-1 rounded-xl p-3 items-center justify-center ${showInfo ? 'bg-white' : 'bg-white/15'}`}
                                    activeOpacity={0.7}
                                >
                                    <Info color={showInfo ? '#f97316' : 'white'} size={24} className="mb-1" />
                                    <Text className={`${showInfo ? 'text-orange-500' : 'text-white/80'} text-xs font-semibold`}>Info</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {/* Info Tooltip */}
                    {showInfo && (
                        <Animated.View entering={FadeInDown} className="bg-white/10 rounded-2xl p-4 mb-4 border border-white/20">
                            {plan?.description && (
                                <View className="mb-4 pb-4 border-b border-white/10">
                                    <Text className="text-white/60 text-xs uppercase font-bold mb-1">Mô tả</Text>
                                    <Text className="text-white text-sm leading-5">{plan.description}</Text>
                                </View>
                            )}
                            <View className="flex-row gap-3">
                                <View className="flex-1 bg-white/10 rounded-xl p-3 items-center">
                                    <Text className="text-white font-bold text-lg">{plan?.exercises?.length ?? 0}</Text>
                                    <Text className="text-white/60 text-xs">Tổng bài</Text>
                                </View>
                                <View className="flex-1 bg-white/10 rounded-xl p-3 items-center">
                                    <Text className="text-white font-bold text-lg">{activeDays.length}</Text>
                                    <Text className="text-white/60 text-xs">Ngày/tuần</Text>
                                </View>
                            </View>
                        </Animated.View>
                    )}


                    {hasPlan && (
                        <>
                            {/* Day tabs */}
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ gap: 8, paddingRight: 8 }}
                            >
                                {ALL_DAYS.map(day => {
                                    const hasExercises = !!dayMap[day]?.length;
                                    const isSelected = selectedDay === day;
                                    const isToday = day === getTodayDayOfWeek();
                                    return (
                                        <TouchableOpacity
                                            key={day}
                                            onPress={() => setSelectedDay(day)}
                                            className={`px-4 py-2 rounded-full border ${isSelected
                                                ? 'bg-white border-white'
                                                : hasExercises ? 'bg-white/20 border-white/40' : 'bg-white/10 border-transparent'
                                                }`}
                                        >
                                            <Text className={`font-semibold text-sm ${isSelected ? 'text-orange-600' : 'text-white'}`}>
                                                {DAY_LABELS[day]}{isToday ? ' 📍' : ''}
                                            </Text>
                                            {hasExercises && !isSelected && (
                                                <View className="w-1 h-1 bg-white rounded-full mx-auto mt-1" />
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </>
                    )}
                </SafeAreaView>
            </LinearGradient>
            </View>

            {!hasPlan ? (
                <View className="flex-1 px-6 pt-8 items-center">
                    <View className="w-20 h-20 bg-orange-100 rounded-full items-center justify-center mb-4">
                        <Dumbbell color="#f97316" size={32} />
                    </View>
                    <Text className="text-gray-900 font-bold text-lg mb-2">Bạn chưa có kế hoạch hoạt động</Text>
                    <Text className="text-gray-500 text-sm text-center mb-6">
                        Đi tới danh sách kế hoạch để chọn hoặc tạo kế hoạch phù hợp.
                    </Text>

                    <View className="w-full gap-3">
                        <TouchableOpacity
                            onPress={() => navigation.navigate('MyPlans')}
                            className="bg-orange-500 rounded-2xl py-3.5 items-center"
                            activeOpacity={0.8}
                        >
                            <Text className="text-white font-bold">Đi tới kế hoạch của tôi</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
            <>
            {/* Exercise list */}
            <ScrollView
                className="flex-1 px-6 pt-5"
                contentContainerStyle={{ paddingBottom: insets.bottom + 180 }}
            >
                {/* ── Continue session banner ── */}
                {pendingSession && (
                    <View className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-4 flex-row items-center gap-3">
                        <TouchableOpacity
                            onPress={continuePendingSession}
                            className="flex-1 flex-row items-center gap-3"
                            activeOpacity={0.8}
                        >
                            <View className="w-10 h-10 bg-orange-500 rounded-full items-center justify-center">
                                <Play color="white" size={16} fill="white" />
                            </View>
                            <View className="flex-1">
                                <Text className="font-bold text-orange-700 text-sm">
                                    Tiếp tục buổi tập đang dở
                                </Text>
                                <Text className="text-orange-400 text-xs mt-0.5">
                                    {pendingSession.planName} · {pendingSession.dayLabel}
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={endPendingSession}
                            disabled={endingSession}
                            className="px-3 py-1.5 rounded-full bg-red-50 border border-red-200"
                            activeOpacity={0.8}
                        >
                            <Text className="text-red-500 text-xs font-bold">
                                {endingSession ? 'Đang kết thúc...' : 'Kết thúc buổi tập'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-base font-bold text-gray-900">
                        {DAY_LABELS[selectedDay]} — {todayExercises.length} bài tập
                    </Text>
                    {selectedDay === getTodayDayOfWeek() && (
                        <View className="bg-orange-100 px-2 py-1 rounded-full">
                            <Text className="text-orange-600 text-xs font-bold">Hôm nay</Text>
                        </View>
                    )}

                </View>

                {todayExercises.length === 0 ? (
                    <View className="items-center py-12">
                        <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-3">
                            <Calendar color="#9ca3af" size={28} />
                        </View>
                        <Text className="text-gray-700 font-bold text-base">Ngày nghỉ 🌿</Text>
                        <Text className="text-gray-400 text-sm text-center mt-2">
                            Hôm nay không có bài tập. Hãy nghỉ ngơi và phục hồi!
                        </Text>
                    </View>
                ) : (
                    <View className="gap-3">
                        {todayExercises.map((ex, index) => (
                            <Animated.View key={ex.id} entering={FadeInDown.delay(index * 80)}>
                                <View
                                    className="bg-white rounded-xl p-4 flex-row items-center mb-0"
                                    style={{ elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 1 } }}
                                >
                                    {getExerciseImage(ex.exerciseId) ? (
                                        <Image
                                            source={{ uri: getExerciseImage(ex.exerciseId) }}
                                            className="w-12 h-12 rounded-xl mr-4"
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <View className="w-10 h-10 bg-orange-500 rounded-xl items-center justify-center mr-4">
                                            <Text className="text-white font-bold">{index + 1}</Text>
                                        </View>
                                    )}
                                    <View className="flex-1">
                                        <Text className="font-bold text-gray-900 text-base">
                                            {getExerciseName(ex.exerciseId)}
                                        </Text>
                                        <View className="flex-row gap-3 mt-1">
                                            <View className="flex-row items-center gap-1">
                                                <Dumbbell color="#9ca3af" size={12} />
                                                <Text className="text-xs text-gray-500">{ex.sets} sets × {ex.reps} reps</Text>
                                            </View>
                                            <View className="flex-row items-center gap-1">
                                                <Clock color="#9ca3af" size={12} />
                                                <Text className="text-xs text-gray-500">Nghỉ {ex.restSeconds}s</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </Animated.View>
                        ))}

                    </View>
                )}
            </ScrollView>

            {/* Fixed bottom button */}
            <View
                className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 pt-4 pb-24"
            >
                <TouchableOpacity
                    onPress={handleStartSession}
                    disabled={startingSession || todayExercises.length === 0}
                    className="rounded-2xl py-4 items-center justify-center flex-row gap-2"
                    style={{
                        backgroundColor: todayExercises.length > 0 ? '#f97316' : '#d1d5db',
                        opacity: startingSession ? 0.8 : 1,
                    }}
                    activeOpacity={0.8}
                >
                    {startingSession ? (
                        <ActivityIndicator color="white" size="small" />
                    ) : (
                        <Play color="white" size={20} fill="white" />
                    )}
                    <Text className="text-white font-bold text-lg">
                        {startingSession ? 'Đang chuẩn bị...' :
                            todayExercises.length > 0 ? `Bắt đầu tập — ${DAY_LABELS[selectedDay]}` : 'Hôm nay không có bài tập'}
                    </Text>
                </TouchableOpacity>
            </View>
            </>
            )}
        </View>
    );
}

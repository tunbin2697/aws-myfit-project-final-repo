import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, ChevronUp, ChevronDown, Trash2, Plus } from 'lucide-react-native';

import {
    getPlanExercises,
    updatePlanExercise,
    removePlanExercise,
    addExerciseToPlan,
    getPlanById,
} from '../../services/userWorkoutPlanService';
import { getExercisesLite as getSystemExercises, getExerciseImagesByIds } from '../../services/workoutService';
import { confirmAction } from '../../utils/confirm';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { setPlanEditorDay, bumpPlansReloadKey } from '../../store/uiSlice';
import type { UserWorkoutPlanExercise } from '../../types/workout';
import { notifyAlert } from '../../utils/notification';
import { Skeleton } from '../../components/ui/Skeleton';

const DAY_LABELS: Record<number, string> = {
    1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat', 7: 'Sun',
};

function PlanEditSkeleton() {
    return (
        <View className="flex-1 bg-gray-50">
            <View className="rounded-b-[24px] overflow-hidden">
                <LinearGradient colors={["#f97316", "#ef4444"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} className="pb-6">
                    <SafeAreaView edges={["top", "left", "right"]} className="px-4 pt-4">
                        <View className="flex-row items-center justify-between">
                            <Skeleton className="w-10 h-10 rounded-full bg-white/30" />
                            <Skeleton className="h-6 w-44 bg-white/30" />
                            <Skeleton className="w-10 h-10 rounded-full bg-white/30" />
                        </View>
                        <View className="flex-row gap-2 py-3">
                            {[0, 1, 2, 3, 4].map((idx) => (
                                <Skeleton key={idx} className="h-8 w-12 rounded-full bg-white/30" />
                            ))}
                        </View>
                    </SafeAreaView>
                </LinearGradient>
            </View>
            <ScrollView className="flex-1 px-4 py-4">
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-3 w-28 mb-4" />
                {[0, 1, 2].map((idx) => (
                    <View key={idx} className="bg-white rounded-xl p-4 mb-3">
                        <View className="flex-row items-center">
                            <Skeleton className="w-12 h-12 rounded-xl mr-3" />
                            <View className="flex-1">
                                <Skeleton className="h-4 w-40 mb-2" />
                                <Skeleton className="h-3 w-24" />
                            </View>
                        </View>
                        <View className="flex-row gap-2 mt-3">
                            <Skeleton className="h-8 w-20 rounded-lg" />
                            <Skeleton className="h-8 w-20 rounded-lg" />
                            <Skeleton className="h-8 w-20 rounded-lg" />
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

export function PlanEditScreen({ route, navigation }: any) {
    const { planId } = route.params ?? {};
    const [loading, setLoading] = useState(true);
    const [exercises, setExercises] = useState<UserWorkoutPlanExercise[]>([]);
    const [selectedDay, setSelectedDay] = useState<number>(() => {
        const today = new Date().getDay();
        return today === 0 ? 7 : today;
    });

    const [planName, setPlanName] = useState<string | null>(null);
    const [systemExercises, setSystemExercises] = useState<Record<string, string>>({});
    const [systemExerciseImages, setSystemExerciseImages] = useState<Record<string, string>>({});
    const dispatch = useDispatch<AppDispatch>();
    const editorDay = useSelector((s: RootState) => s.ui.planEditorDay);
    const originalExercisesRef = useRef<UserWorkoutPlanExercise[] | null>(null);
    const skipInitialFocusRef = useRef(true);
    const loadRequestRef = useRef(0);
    const [deletedIds, setDeletedIds] = useState<string[]>([]);

    const load = useCallback(async () => {
        const loadId = ++loadRequestRef.current;
        if (!planId) {
            setExercises([]);
            setPlanName(null);
            setDeletedIds([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const planDetail = await getPlanById(planId).catch(() => null as any);
            let data = planDetail?.exercises ?? null;
            if (!data) {
                data = await getPlanExercises(planId);
            }
            setExercises(data ?? []);
            originalExercisesRef.current = (data ?? []).map((d: UserWorkoutPlanExercise) => ({ ...d }));
            setDeletedIds([]);
            setPlanName(planDetail?.name ?? null);
            const sys = await getSystemExercises().catch(() => [] as any[]);
            const map: Record<string, string> = {};
            sys.forEach((s: any) => { map[s.id] = s.name; });
            setSystemExercises(map);

            const exerciseIds = sys.map((s: any) => s.id).filter(Boolean);
            if (exerciseIds.length > 0) {
                void getExerciseImagesByIds(exerciseIds).then(imageMap => {
                    if (loadRequestRef.current !== loadId) return;
                    const resolvedImageMap: Record<string, string> = {};
                    Object.entries(imageMap).forEach(([id, url]) => {
                        if (url) resolvedImageMap[id] = url;
                    });
                    setSystemExerciseImages(resolvedImageMap);
                });
            } else {
                setSystemExerciseImages({});
            }

        } catch (e) {
            console.error('load plan exercises', e);
            notifyAlert('Lỗi', 'Không thể tải bài tập');
        } finally {
            setLoading(false);
        }
    }, [planId]);

    useEffect(() => { load(); }, [load]);

    useEffect(() => {
        const unsub = navigation.addListener('focus', () => {
            if (skipInitialFocusRef.current) {
                skipInitialFocusRef.current = false;
                return;
            }
            load();
        });
        return unsub;
    }, [navigation, load]);

    useEffect(() => {
        if (editorDay) setSelectedDay(editorDay);
    }, [editorDay]);

    const exercisesForDay = exercises.filter(e => (e.dayOfWeek ?? 1) === selectedDay).sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));

    const changeOrder = (ex: UserWorkoutPlanExercise, direction: 'up' | 'down') => {
        const list = exercisesForDay;
        const idx = list.findIndex(x => x.id === ex.id);
        if (idx === -1) return;
        const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (swapIdx < 0 || swapIdx >= list.length) return;
        const swap = list[swapIdx];

        setExercises(prev => {
            const all = prev.map(p => ({ ...p }));
            const ai = all.findIndex(x => x.id === ex.id);
            const bi = all.findIndex(x => x.id === swap.id);
            if (ai === -1 || bi === -1) return prev;
            const aOrder = all[ai].orderIndex ?? idx;
            const bOrder = all[bi].orderIndex ?? swapIdx;
            all[ai].orderIndex = bOrder;
            all[bi].orderIndex = aOrder;
            return all;
        });
    };

    const updateField = (ex: UserWorkoutPlanExercise, field: 'sets' | 'reps' | 'restSeconds', delta: number) => {
        const current = (ex as any)[field] ?? 0;
        const newVal = Math.max(0, current + delta);
        setExercises(prev => prev.map(x => x.id === ex.id ? { ...x, [field]: newVal } : x));
    };

    const handleDelete = (ex: UserWorkoutPlanExercise) => {
        confirmAction(
            'Xóa bài tập',
            'Bạn có chắc muốn xóa bài tập này khỏi kế hoạch?',
            () => {
                setDeletedIds(prev => Array.from(new Set<string>([...prev, ex.id])));
                setExercises(prev => prev.filter(p => p.id !== ex.id));
            },
            'Xóa',
            'Hủy'
        );
    };

    const hasPendingChanges = () => {
        const original = originalExercisesRef.current ?? [];
        if (deletedIds.length > 0) return true;
        if (original.length !== exercises.length) return true;
        const origMap: Record<string, UserWorkoutPlanExercise> = {};
        original.forEach(o => { origMap[o.id] = o; });
        for (const ex of exercises) {
            const o = origMap[ex.id];
            if (!o) return true;
            if (o.sets !== ex.sets || o.reps !== ex.reps || o.restSeconds !== ex.restSeconds || (o.orderIndex ?? 0) !== (ex.orderIndex ?? 0) || o.dayOfWeek !== ex.dayOfWeek) return true;
        }
        return false;
    };

    const handleCancelChanges = () => {
        if (originalExercisesRef.current) {
            setExercises(originalExercisesRef.current.map(d => ({ ...d })));
        }
        setDeletedIds([]);
    };

    const handleSaveChanges = async () => {
        if (!planId) return;
        setLoading(true);
        try {
            for (const id of deletedIds) {
                try { await removePlanExercise(planId, id); } catch (e) { console.error('delete failed', id, e); }
            }

            const original = originalExercisesRef.current ?? [];
            const origMap: Record<string, UserWorkoutPlanExercise> = {};
            original.forEach(o => { origMap[o.id] = o; });

            for (const ex of exercises) {
                const o = origMap[ex.id];
                if (!o) continue;
                const changed = o.sets !== ex.sets || o.reps !== ex.reps || o.restSeconds !== ex.restSeconds || (o.orderIndex ?? 0) !== (ex.orderIndex ?? 0) || o.dayOfWeek !== ex.dayOfWeek;
                if (changed) {
                    try {
                        await updatePlanExercise(planId, ex.id, {
                            exerciseId: ex.exerciseId,
                            dayOfWeek: ex.dayOfWeek ?? undefined,
                            sets: ex.sets,
                            reps: ex.reps,
                            restSeconds: ex.restSeconds,
                            orderIndex: ex.orderIndex,
                            dayIndex: ex.dayIndex ?? undefined,
                            weekIndex: ex.weekIndex ?? undefined,
                        });
                    } catch (e) { console.error('update failed', ex.id, e); }
                }
            }

            dispatch(bumpPlansReloadKey());
            await load();
            setDeletedIds([]);
        } catch (e) {
            notifyAlert('Lỗi', 'Không thể lưu thay đổi.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <PlanEditSkeleton />;

    if (!planId) return (
        <View className="flex-1 items-center justify-center bg-gray-50 px-6">
            <Text className="text-gray-700 font-semibold text-base text-center">Không có kế hoạch để chỉnh sửa</Text>
            <TouchableOpacity onPress={() => navigation.goBack()} className="mt-4 bg-orange-500 px-4 py-2 rounded-xl">
                <Text className="text-white font-semibold">Quay lại</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View className="flex-1 bg-gray-50">
            <View className="rounded-b-[24px] overflow-hidden">
            <LinearGradient colors={["#f97316", "#ef4444"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} className="pb-6">
                <SafeAreaView edges={["top", "left", "right"]} className="px-4 pt-4">
                    <View className="flex-row items-center justify-between">
                        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
                            <ArrowLeft color="white" size={18} />
                        </TouchableOpacity>
                        <Text className="text-white font-bold text-lg">Chỉnh sửa kế hoạch</Text>
                        {hasPendingChanges() ? (
                            <View className="flex-row items-center gap-2">
                                <TouchableOpacity onPress={handleCancelChanges} disabled={loading} className="px-3 py-1 rounded-full bg-white/10">
                                    <Text className="text-white">Hủy</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleSaveChanges} disabled={loading} className="px-3 py-1 rounded-full bg-white">
                                    <Text className="text-orange-600 font-semibold">{loading ? 'Đang lưu...' : 'Lưu'}</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View className="w-10 h-10" />
                        )}
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 12 }}>
                        {[1, 2, 3, 4, 5, 6, 7].map(d => (
                            <TouchableOpacity key={d} onPress={() => { setSelectedDay(d); dispatch(setPlanEditorDay(d)); }} className={`px-3 py-2 rounded-full ${selectedDay === d ? 'bg-white' : 'bg-white/10'}`}>
                                <Text className={`${selectedDay === d ? 'text-orange-600' : 'text-white'}`}>{DAY_LABELS[d]}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </SafeAreaView>
            </LinearGradient>
            </View>

            <ScrollView className="flex-1 px-4 py-4" contentContainerStyle={{ paddingBottom: 100 }}>
                <View className="mb-4 flex-row justify-between items-center">
                    <View>
                        <Text className="text-base font-bold text-gray-900">{planName ?? 'Kế hoạch'}</Text>
                        <Text className="text-sm text-gray-500">Bài tập — {DAY_LABELS[selectedDay]}</Text>
                    </View>
                    <TouchableOpacity className="flex-row items-center gap-2" onPress={() => navigation.navigate('PlanExercisePicker', { planId, dayOfWeek: selectedDay })}>
                        <Plus color="#f97316" size={16} />
                        <Text className="text-orange-600 font-semibold">Thêm từ hệ thống</Text>
                    </TouchableOpacity>
                </View>

                {exercisesForDay.length === 0 ? (
                    <View className="items-center py-12">
                        <Text className="text-gray-500">Không có bài tập cho ngày này</Text>
                    </View>
                ) : (
                    exercisesForDay.map((ex, idx) => (
                        <View key={ex.id} className="bg-white rounded-xl p-4 mb-3" style={{ elevation: 2 }}>
                            <View className="flex-row justify-between items-start">
                                <View style={{ flex: 1 }}>
                                    <View className="flex-row items-center">
                                        {systemExerciseImages[ex.exerciseId] ? (
                                            <Image
                                                source={{ uri: systemExerciseImages[ex.exerciseId] }}
                                                className="w-12 h-12 rounded-xl mr-3"
                                                resizeMode="cover"
                                            />
                                        ) : (
                                            <View className="w-12 h-12 rounded-xl mr-3 bg-orange-100 items-center justify-center">
                                                <Text className="text-orange-500 font-bold text-base">
                                                    {(systemExercises[ex.exerciseId] ?? 'E').charAt(0).toUpperCase()}
                                                </Text>
                                            </View>
                                        )}

                                        <View style={{ flex: 1 }}>
                                            <Text className="font-bold text-gray-900">{systemExercises[ex.exerciseId] ?? ex.exerciseId}</Text>
                                            <Text className="text-xs text-gray-500 mt-1">Order: {(ex.orderIndex ?? 0)}</Text>
                                        </View>
                                    </View>
                                </View>
                                <View className="flex-row items-center gap-2">
                                    <TouchableOpacity onPress={() => changeOrder(ex, 'up')} className="p-2 bg-gray-100 rounded-full">
                                        <ChevronUp size={18} color="#374151" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => changeOrder(ex, 'down')} className="p-2 bg-gray-100 rounded-full">
                                        <ChevronDown size={18} color="#374151" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View className="flex-row items-center justify-between mt-3">
                                <View className="flex-row items-center gap-3">
                                    <View className="items-center">
                                        <Text className="text-xs text-gray-500">Sets</Text>
                                        <View className="flex-row items-center gap-2 mt-1">
                                            <TouchableOpacity onPress={() => updateField(ex, 'sets', -1)} className="px-2 py-1 bg-gray-100 rounded">
                                                <Text>-</Text>
                                            </TouchableOpacity>
                                            <Text className="font-bold">{ex.sets ?? 0}</Text>
                                            <TouchableOpacity onPress={() => updateField(ex, 'sets', 1)} className="px-2 py-1 bg-gray-100 rounded">
                                                <Text>+</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <View className="items-center">
                                        <Text className="text-xs text-gray-500">Reps</Text>
                                        <View className="flex-row items-center gap-2 mt-1">
                                            <TouchableOpacity onPress={() => updateField(ex, 'reps', -1)} className="px-2 py-1 bg-gray-100 rounded">
                                                <Text>-</Text>
                                            </TouchableOpacity>
                                            <Text className="font-bold">{ex.reps ?? 0}</Text>
                                            <TouchableOpacity onPress={() => updateField(ex, 'reps', 1)} className="px-2 py-1 bg-gray-100 rounded">
                                                <Text>+</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <View className="items-center">
                                        <Text className="text-xs text-gray-500">Rest</Text>
                                        <View className="flex-row items-center gap-2 mt-1">
                                            <TouchableOpacity onPress={() => updateField(ex, 'restSeconds', -5)} className="px-2 py-1 bg-gray-100 rounded">
                                                <Text>-</Text>
                                            </TouchableOpacity>
                                            <Text className="font-bold">{ex.restSeconds ?? 0}s</Text>
                                            <TouchableOpacity onPress={() => updateField(ex, 'restSeconds', 5)} className="px-2 py-1 bg-gray-100 rounded">
                                                <Text>+</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>

                                <TouchableOpacity onPress={() => handleDelete(ex)} className="p-2 bg-red-50 rounded">
                                    <Trash2 color="#ef4444" size={18} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
}

export default PlanEditScreen;

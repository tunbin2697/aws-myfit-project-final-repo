import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft } from 'lucide-react-native';

import { getExercisesLite as getSystemExercises, getExerciseImagesByIds } from '../../services/workoutService';
import { addExerciseToPlan, getPlanExercises } from '../../services/userWorkoutPlanService';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../store';
import { setPlanEditorDay, bumpPlansReloadKey } from '../../store/uiSlice';
import type { Exercise } from '../../types/workout';
import { notifyAlert } from '../../utils/notification';
import { Skeleton } from '../../components/ui/Skeleton';

function PlanExercisePickerSkeleton() {
    return (
        <View className="flex-1 bg-gray-50">
            <View className="rounded-b-[24px] overflow-hidden">
                <LinearGradient colors={["#f97316", "#ef4444"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} className="pb-6">
                    <SafeAreaView edges={["top", "left", "right"]} className="px-4 pt-4">
                        <View className="flex-row items-center">
                            <Skeleton className="w-10 h-10 rounded-full bg-white/30 mr-3" />
                            <Skeleton className="h-6 w-44 bg-white/30" />
                        </View>
                    </SafeAreaView>
                </LinearGradient>
            </View>
            <ScrollView className="flex-1 px-4 py-4" contentContainerStyle={{ paddingBottom: 72 }}>
                {[0, 1, 2, 3].map((idx) => (
                    <View key={idx} className="bg-white rounded-xl p-4 mb-3">
                        <View className="flex-row items-center">
                            <Skeleton className="w-14 h-14 rounded-lg mr-3" />
                            <View className="flex-1">
                                <Skeleton className="h-5 w-40 mb-2" />
                                <Skeleton className="h-3 w-3/4" />
                            </View>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

export function PlanExercisePicker({ route, navigation }: any) {
    const { planId, dayOfWeek } = route.params ?? {};
    const [loading, setLoading] = useState(true);
    const [exercises, setExercises] = useState<Exercise[]>([]);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            setLoading(true);
            try {
                const data = await getSystemExercises();
                const list = data ?? [];
                setExercises(list);

                const ids = list.map(exercise => exercise.id);
                if (ids.length > 0) {
                    void getExerciseImagesByIds(ids).then(imageMap => {
                        if (cancelled) return;
                        setExercises(prev => prev.map(exercise => ({
                            ...exercise,
                            imageUrl: imageMap[exercise.id] ?? exercise.imageUrl ?? null,
                        })));
                    });
                }
            } catch (e) {
                notifyAlert('Lỗi', 'Không thể tải danh sách bài tập');
            } finally { setLoading(false); }
        };
        load();

        return () => {
            cancelled = true;
        };
    }, []);

    const dispatch = useDispatch<AppDispatch>();

    const handleAdd = async (exercise: Exercise) => {
        if (!planId) return;
        try {
            const existing = await getPlanExercises(planId).catch(() => [] as any[]);
            const maxOrder = existing.filter(e => (e.dayOfWeek ?? 1) === (dayOfWeek ?? 1)).reduce((m, x) => Math.max(m, x.orderIndex ?? 0), -1);

            await addExerciseToPlan(planId, {
                exerciseId: exercise.id,
                dayOfWeek: dayOfWeek ?? 1,
                sets: 3,
                reps: 10,
                restSeconds: 60,
                dayIndex: 0,
                weekIndex: 0,
                orderIndex: maxOrder + 1,
            } as any);
            dispatch(setPlanEditorDay(dayOfWeek ?? 1));
            dispatch(bumpPlansReloadKey());
            navigation.goBack();
        } catch (e) {
            notifyAlert('Lỗi', 'Không thể thêm bài tập');
        }
    };

    if (loading) return <PlanExercisePickerSkeleton />;

    return (
        <View className="flex-1 bg-gray-50">
            <View className="rounded-b-[24px] overflow-hidden">
            <LinearGradient colors={["#f97316","#ef4444"]} start={{x:0,y:0}} end={{x:1,y:0}} className="pb-6">
                <SafeAreaView edges={["top","left","right"]} className="px-4 pt-4">
                    <View className="flex-row items-center">
                        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 bg-white/20 rounded-full items-center justify-center mr-3">
                            <ArrowLeft color="white" size={18} />
                        </TouchableOpacity>
                        <Text className="text-white font-bold text-lg">Chọn bài tập hệ thống</Text>
                    </View>
                </SafeAreaView>
            </LinearGradient>
            </View>

            <ScrollView className="flex-1 px-4 py-4" contentContainerStyle={{ paddingBottom: 72 }}>
                {exercises.map(ex => (
                    <TouchableOpacity key={ex.id} onPress={() => handleAdd(ex)} className="bg-white rounded-xl p-4 mb-3">
                        <View className="flex-row items-center">
                            {ex.imageUrl ? (
                                <Image
                                    source={{ uri: ex.imageUrl }}
                                    className="w-14 h-14 rounded-lg mr-3"
                                    resizeMode="cover"
                                />
                            ) : (
                                <View className="w-14 h-14 rounded-lg mr-3 bg-orange-100 items-center justify-center">
                                    <Text className="text-orange-500 font-bold text-lg">{ex.name.charAt(0)}</Text>
                                </View>
                            )}

                            <View className="flex-1">
                                <Text className="font-bold text-gray-900">{ex.name}</Text>
                                {ex.description && <Text className="text-xs text-gray-500 mt-1">{ex.description}</Text>}
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

export default PlanExercisePicker;

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft, Dumbbell, CheckCircle2, Calendar } from 'lucide-react-native';
import { useSelector } from 'react-redux';

import { getSession } from '../../services/sessionService';
import { getExercisesLite as getExercises } from '../../services/workoutService';
import { mergeExerciseNameCache } from '../../store/uiSlice';
import type { RootState } from '../../store';
import type { WorkoutLogResponse, SessionResponse } from '../../types/workout';
import { useDispatch } from 'react-redux';
import { Skeleton } from '../../components/ui/Skeleton';

function SessionDetailSkeleton() {
    return (
        <View className="flex-1 bg-gray-50">
            <View className="rounded-b-[28px] overflow-hidden">
                <LinearGradient
                    colors={['#f97316', '#ef4444']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="pb-5"
                >
                    <SafeAreaView edges={['top', 'left', 'right']} className="px-5 pt-3">
                        <View className="flex-row items-center gap-3 mb-4">
                            <Skeleton className="w-10 h-10 rounded-full bg-white/30" />
                            <View className="flex-1">
                                <Skeleton className="h-6 w-36 mb-2 bg-white/30" />
                                <Skeleton className="h-3 w-28 bg-white/30" />
                            </View>
                            <Skeleton className="w-5 h-5 rounded bg-white/30" />
                        </View>
                        <View className="flex-row gap-3">
                            <Skeleton className="h-16 flex-1 rounded-xl bg-white/20" />
                            <Skeleton className="h-16 flex-1 rounded-xl bg-white/20" />
                            <Skeleton className="h-16 flex-1 rounded-xl bg-white/20" />
                        </View>
                    </SafeAreaView>
                </LinearGradient>
            </View>

            <ScrollView className="flex-1 px-5 pt-5">
                {[0, 1, 2].map((idx) => (
                    <View key={idx} className="bg-white rounded-2xl p-4 mb-3">
                        <View className="flex-row items-center mb-3">
                            <Skeleton className="w-9 h-9 rounded-xl mr-3" />
                            <View className="flex-1">
                                <Skeleton className="h-5 w-40 mb-2" />
                                <Skeleton className="h-3 w-32" />
                            </View>
                        </View>
                        <Skeleton className="h-9 w-full rounded-xl mb-2" />
                        <Skeleton className="h-9 w-full rounded-xl" />
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

function groupBy<T>(arr: T[], key: (item: T) => string): Record<string, T[]> {
    return arr.reduce<Record<string, T[]>>((acc, item) => {
        const k = key(item);
        if (!acc[k]) acc[k] = [];
        acc[k].push(item);
        return acc;
    }, {});
}

/** Parse YYYY-MM-DD as local date (avoids UTC midnight offset). */
function parseLocalDate(s: string): Date {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d);
}

function formatDate(dateStr: string): string {
    try {
        const d = dateStr.length === 10 ? parseLocalDate(dateStr) : new Date(dateStr);
        return d.toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    } catch {
        return dateStr;
    }
}

function formatTime(isoStr: string): string {
    try {
        const d = new Date(isoStr);
        return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch {
        return '';
    }
}

interface ExerciseLogCardProps {
    exerciseName: string;
    logs: WorkoutLogResponse[];
    index: number;
}

function ExerciseLogCard({ exerciseName, logs, index }: ExerciseLogCardProps) {
    const totalReps = logs.reduce((s, l) => s + (l.reps ?? 0), 0);
    const maxWeight = logs.reduce((max, l) => Math.max(max, l.weight ?? 0), 0);

    return (
        <Animated.View entering={FadeInDown.delay(index * 60)}>
            <View
                className="bg-white rounded-2xl p-4 mb-3"
                style={{
                    elevation: 2,
                    shadowColor: '#000',
                    shadowOpacity: 0.06,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 2 },
                }}
            >
                <View className="flex-row items-center mb-3">
                    <View className="w-9 h-9 bg-orange-500 rounded-xl items-center justify-center mr-3">
                        <Text className="text-white font-bold text-sm">{index + 1}</Text>
                    </View>
                    <View className="flex-1">
                        <Text className="font-bold text-gray-900 text-base">{exerciseName}</Text>
                        <Text className="text-gray-400 text-xs">
                            {logs.length} sets · {totalReps} reps tổng
                            {maxWeight > 0 ? ` · max ${maxWeight}kg` : ''}
                        </Text>
                    </View>
                    <Dumbbell color="#f97316" size={18} />
                </View>

                <View className="gap-1.5">
                    {logs.map((log, i) => (
                        <View
                            key={log.id}
                            className="flex-row items-center bg-gray-50 rounded-xl px-3 py-2"
                        >
                            <View className="w-6 h-6 bg-green-100 rounded-full items-center justify-center mr-3">
                                <CheckCircle2 color="#22c55e" size={12} />
                            </View>
                            <Text className="text-gray-700 font-semibold text-sm flex-1">
                                Set {log.setNumber}: {log.reps ?? '—'} reps
                                {log.weight ? ` @ ${log.weight}kg` : ''}
                                {log.durationSeconds ? ` · ${log.durationSeconds}s` : ''}
                            </Text>
                            <Text className="text-gray-400 text-xs">
                                {log.createdAt ? formatTime(log.createdAt) : ''}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>
        </Animated.View>
    );
}

export function SessionDetailScreen({ route, navigation }: any) {
    const { sessionId } = route.params ?? {};
    const reduxDispatch = useDispatch();

    const cachedNames = useSelector((s: RootState) => s.ui.exerciseNameCache);
    const [session, setSession] = useState<SessionResponse | null>(null);
    const [exerciseMap, setExerciseMap] = useState<Record<string, string>>(cachedNames);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!sessionId) return;
        (async () => {
            setLoading(true);
            try {
                const [sess, exercises] = await Promise.all([
                    getSession(sessionId),
                    Object.keys(cachedNames).length > 0
                        ? Promise.resolve(null)
                        : getExercises().catch(() => null),
                ]);
                setSession(sess);

                if (exercises) {
                    const map: Record<string, string> = {};
                    exercises.forEach((e: any) => { map[e.id] = e.name; });
                    setExerciseMap(prev => ({ ...prev, ...map }));
                    reduxDispatch(mergeExerciseNameCache(map));
                }
            } catch (e) {
                console.error('Failed to load session detail', e);
            } finally {
                setLoading(false);
            }
        })();
    }, [sessionId]);

    const getExName = (id: string) =>
        exerciseMap[id] ?? cachedNames[id] ?? `Exercise (${id.slice(0, 8)}…)`;

    const grouped = session
        ? groupBy(session.logs ?? [], l => l.exerciseId)
        : {};
    const exerciseIds = Object.keys(grouped);

    const totalSets = session?.logs?.length ?? 0;
    const totalReps = session?.logs?.reduce((s, l) => s + (l.reps ?? 0), 0) ?? 0;

    if (loading) {
        return <SessionDetailSkeleton />;
    }

    return (
        <View className="flex-1 bg-gray-50">
            <View className="rounded-b-[28px] overflow-hidden">
            <LinearGradient
                colors={['#f97316', '#ef4444']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="pb-5"
            >
                <SafeAreaView edges={['top', 'left', 'right']} className="px-5 pt-3">
                    <View className="flex-row items-center gap-3 mb-4">
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
                        >
                            <ArrowLeft color="white" size={20} />
                        </TouchableOpacity>
                        <View className="flex-1">
                            <Text className="text-white font-bold text-lg">Chi tiết buổi tập</Text>
                            {session?.workoutDate && (
                                <Text className="text-white/70 text-xs mt-0.5">
                                    {formatDate(session.workoutDate)}
                                </Text>
                            )}
                        </View>
                        <Calendar color="white" size={20} />
                    </View>

                    <View className="flex-row gap-3">
                        <View className="flex-1 bg-white/15 rounded-xl p-3 items-center">
                            <Text className="text-white font-bold text-lg">
                                {exerciseIds.length}
                            </Text>
                            <Text className="text-white/70 text-xs">Bài tập</Text>
                        </View>
                        <View className="flex-1 bg-white/15 rounded-xl p-3 items-center">
                            <Text className="text-white font-bold text-lg">{totalSets}</Text>
                            <Text className="text-white/70 text-xs">Sets</Text>
                        </View>
                        <View className="flex-1 bg-white/15 rounded-xl p-3 items-center">
                            <Text className="text-white font-bold text-lg">{totalReps}</Text>
                            <Text className="text-white/70 text-xs">Reps</Text>
                        </View>
                    </View>
                </SafeAreaView>
            </LinearGradient>
            </View>

            <ScrollView
                className="flex-1 px-5 pt-5"
                contentContainerStyle={{
                    paddingBottom: Platform.OS === 'web' ? 80 : 40,
                }}
            >
                {exerciseIds.length === 0 ? (
                    <View className="items-center py-16">
                        <Text className="text-gray-400 text-base">Chưa có log nào trong buổi tập này.</Text>
                    </View>
                ) : (
                    exerciseIds.map((exerciseId, i) => (
                        <ExerciseLogCard
                            key={exerciseId}
                            exerciseName={getExName(exerciseId)}
                            logs={grouped[exerciseId].sort((a, b) => a.setNumber - b.setNumber)}
                            index={i}
                        />
                    ))
                )}
            </ScrollView>
        </View>
    );
}

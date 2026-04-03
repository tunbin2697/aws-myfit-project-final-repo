import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    FadeIn,
    SlideInRight,
} from 'react-native-reanimated';
import {
    CheckCircle2,
    ChevronRight,
    ArrowLeft,
    SkipForward,
} from 'lucide-react-native';
import { setItem, getItem, deleteItem } from '../../utils/storage';
import { confirmAction } from '../../utils/confirm';
import { useDispatch, useSelector } from 'react-redux';
import { notifyAlert } from '../../utils/notification';

import { addWorkoutLog, getSession, deactivateSession } from '../../services/sessionService';
import type { AddWorkoutLogRequest } from '../../types/workout';
import {
    initializeSession,
    restoreSessionState,
    logSetStart,
    logSetSuccess,
    logSetFailure,
    finishRest,
    skipExercise,
    skipSet,
    resetSession,
    CompletedSet,
    SessionExercise
} from '../../store/workoutSessionSlice';
import type { RootState } from '../../store';

// Components
import { RestTimer } from './components/RestTimer';
import { LogSetSheet } from './components/LogSetSheet';
import { ActiveExerciseCard } from './components/ActiveExerciseCard';

const isSetForExercise = (
    set: CompletedSet,
    exercise: SessionExercise | undefined
): boolean => {
    if (!exercise) return false;
    if (set.sessionExerciseId) {
        return set.sessionExerciseId === exercise.id;
    }
    return set.exerciseId === exercise.exerciseId;
};

const mapServerLogsToCompletedSets = (
    logs: Array<{
        exerciseId: string;
        setNumber: number;
        reps: number | null;
        weight: number | null;
        createdAt?: string;
    }>,
    sessionExercises: SessionExercise[]
): CompletedSet[] => {
    const assignedSetsBySessionExercise: Record<string, Set<number>> = {};
    const orderedLogs = [...logs].sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return ta - tb;
    });

    return orderedLogs.map(log => {
        const candidates = sessionExercises.filter(
            ex => ex.exerciseId === log.exerciseId && log.setNumber <= ex.sets
        );

        let chosenExercise = candidates.find(ex => {
            const used = assignedSetsBySessionExercise[ex.id] ?? new Set<number>();
            return !used.has(log.setNumber) && used.size < ex.sets;
        });

        if (!chosenExercise) {
            chosenExercise =
                candidates.find(ex => {
                    const used = assignedSetsBySessionExercise[ex.id] ?? new Set<number>();
                    return used.size < ex.sets;
                }) ??
                candidates[0] ??
                sessionExercises.find(ex => ex.exerciseId === log.exerciseId);
        }

        if (chosenExercise) {
            if (!assignedSetsBySessionExercise[chosenExercise.id]) {
                assignedSetsBySessionExercise[chosenExercise.id] = new Set<number>();
            }
            assignedSetsBySessionExercise[chosenExercise.id].add(log.setNumber);
        }

        return {
            sessionExerciseId: chosenExercise?.id,
            exerciseId: log.exerciseId,
            setNumber: log.setNumber,
            reps: log.reps ?? 0,
            weight: log.weight ?? null,
        };
    });
};

// ─────────────────────────────────────────
// Main WorkoutSession Screen
// ─────────────────────────────────────────
export function WorkoutSessionScreen({ route, navigation }: any) {
    const {
        sessionId: routeSessionId,
        exercises: rawExercises,
        dayLabel,
        dayOfWeek,
        planName,
        forceContinue = false,
    } = route.params ?? {};

    const reduxDispatch = useDispatch();
    
    // Select from Redux store
    const {
        sessionId: reduxSessionId,
        currentExIndex,
        currentSet,
        completedSets,
        phase,
        restSeconds,
        exercises,
        isSavingLog
    } = useSelector((state: RootState) => state.workoutSession);
    

    const [logSheetVisible, setLogSheetVisible] = useState(false);
    const [isSkipping, setIsSkipping] = useState(false);
    const [isHydrating, setIsHydrating] = useState(true);

    const resolvedSessionId = routeSessionId ?? reduxSessionId ?? null;
    const progressKey = `session_progress_${resolvedSessionId ?? 'unsaved'}`;
    const runtimeStateKey = 'workout_session_runtime';

    // Initialize Redux state on mount
    useEffect(() => {
        if (routeSessionId && rawExercises) {
            reduxDispatch(initializeSession({
                sessionId: routeSessionId,
                planId: route.params?.planId,
                planName,
                dayLabel,
                exercises: rawExercises
            }));
        }
    }, [routeSessionId, rawExercises, route.params?.planId, planName, dayLabel, reduxDispatch]);

    const currentExercise = exercises[currentExIndex];
    const completedSetsForCurrentExercise = completedSets.filter(set =>
        isSetForExercise(set, currentExercise)
    );
    const isLastExercise = currentExIndex === exercises.length - 1;
    const totalSetsAll = exercises.reduce((s: number, e: SessionExercise) => s + (e.sets || 0), 0);
    const totalSetsCompleted = completedSets.length;
    const progressPct = totalSetsAll > 0 ? (totalSetsCompleted / totalSetsAll) * 100 : 0;
    
    // ── Persist active session key so PlanDetail can show "continue" banner ──
    useEffect(() => {
        if (!resolvedSessionId) return;
        setItem(
            'active_session',
            JSON.stringify({
                sessionId: resolvedSessionId,
                planId: route.params?.planId ?? null,
                dayLabel,
                dayOfWeek: dayOfWeek ?? null,
                planName,
            })
        ).catch(() => { });
    }, [resolvedSessionId, dayLabel, dayOfWeek, planName, route.params?.planId]);

    // ── Persist runtime progress snapshot (Redux-compatible fields) ──
    useEffect(() => {
        if (!resolvedSessionId || phase === 'done' || isHydrating) return;
        setItem(
            runtimeStateKey,
            JSON.stringify({
                sessionId: resolvedSessionId,
                currentExIndex,
                currentSet,
            })
        ).catch(() => { });
    }, [resolvedSessionId, currentExIndex, currentSet, phase, isHydrating]);
    
    // ── Restore progress on mount ──
    useEffect(() => {
        if (!resolvedSessionId || exercises.length === 0) return;
        let mounted = true;
        setIsHydrating(true);
        (async () => {
            try {
                const [raw, runtimeRaw] = await Promise.all([
                    getItem(progressKey),
                    getItem(runtimeStateKey),
                ]);

                const localState = raw
                    ? (JSON.parse(raw) as {
                        currentExIndex: number;
                        currentSet: number;
                    })
                    : runtimeRaw
                        ? (() => {
                            const parsed = JSON.parse(runtimeRaw) as {
                                sessionId?: string;
                                currentExIndex?: number;
                                currentSet?: number;
                            };
                            if (parsed.sessionId !== resolvedSessionId) return null;
                            return {
                                currentExIndex: parsed.currentExIndex ?? 0,
                                currentSet: parsed.currentSet ?? 1,
                            };
                        })()
                        : null;

                if (!localState) return;
                
                // Fetch server logs as ground truth for completedSets
                const serverSession = await getSession(resolvedSessionId);
                const serverSets = mapServerLogsToCompletedSets(
                    serverSession.logs ?? [],
                    exercises
                );
                
                if (!mounted) return;

                const hasMeaningfulProgress =
                    serverSets.length > 0 ||
                    (localState.currentExIndex ?? 0) > 0 ||
                    (localState.currentSet ?? 1) > 1;

                if (!hasMeaningfulProgress) {
                    return;
                }
                
                const doRestore = () => {
                    reduxDispatch(restoreSessionState({
                        sessionId: resolvedSessionId,
                        currentExIndex: localState.currentExIndex ?? 0,
                        currentSet: localState.currentSet ?? 1,
                        completedSets: serverSets,
                    }));
                };
                const doFresh = async () => {
                    // Clear session keys so PlanDetail banner disappears immediately
                    await deleteItem(progressKey).catch(() => { });
                    await deleteItem(runtimeStateKey).catch(() => { });
                    await deleteItem('active_session').catch(() => { });
                    reduxDispatch(restoreSessionState({
                        sessionId: resolvedSessionId,
                        currentExIndex: 0,
                        currentSet: 1,
                        completedSets: [],
                    }));
                };

                if (!forceContinue && !routeSessionId) {
                    await doFresh();
                    return;
                }

                doRestore();
            } catch {
                /* ignore — network fail, start fresh */
            } finally {
                if (mounted) {
                    setIsHydrating(false);
                }
            }
        })();
        return () => {
            mounted = false;
        };
    }, [resolvedSessionId, progressKey, runtimeStateKey, reduxDispatch, forceContinue, routeSessionId, exercises]);
    
    // ── Persist UI state (not completedSets) after every transition ──
    useEffect(() => {
        if (!resolvedSessionId || phase === 'done' || isHydrating) return;
        const saveState = async () => {
            try {
                await setItem(
                    progressKey,
                    JSON.stringify({ currentExIndex, currentSet })
                );
            } catch {}
        };
        saveState();
    }, [currentExIndex, currentSet, phase, resolvedSessionId, progressKey, isHydrating]);
    
    // ── Cleanup when done ──
    const cleanupSession = useCallback(async () => {
        if (resolvedSessionId) {
            await deactivateSession(resolvedSessionId).catch(() => { });
            await deleteItem(progressKey).catch(() => { });
            await deleteItem(runtimeStateKey).catch(() => { });
            await deleteItem('active_session').catch(() => { });
            reduxDispatch(resetSession());
        }
    }, [resolvedSessionId, progressKey, runtimeStateKey, reduxDispatch]);
    
    // ── Save a log entry ──
    const saveLog = useCallback(
        async (reps: number, weight: number | null) => {
            if (!currentExercise) return;
            
            reduxDispatch(logSetStart());
            
            try {
                const req: AddWorkoutLogRequest = {
                    exerciseId: currentExercise.exerciseId,
                    setNumber: currentSet,
                    reps,
                    weight: weight ?? undefined,
                };
                if (resolvedSessionId) {
                    await addWorkoutLog(resolvedSessionId, req);
                }
                
                const newSet: CompletedSet = {
                    sessionExerciseId: currentExercise.id,
                    exerciseId: currentExercise.exerciseId,
                    setNumber: currentSet,
                    reps,
                    weight,
                };
                
                setLogSheetVisible(false);
                
                const allSetsForExDone = currentSet + 1 > currentExercise.sets;
                
                reduxDispatch(logSetSuccess({
                    set: newSet,
                    exerciseTotalSets: currentExercise.sets,
                    isLastExercise,
                    restSecs: currentExercise.restSeconds ?? 60,
                }));
                
                if (allSetsForExDone && isLastExercise) {
                    await cleanupSession();
                }
            } catch {
                reduxDispatch(logSetFailure());
                notifyAlert('Lỗi', 'Không thể lưu kết quả. Vui lòng thử lại.');
            }
        },
        [currentExercise, currentSet, isLastExercise, resolvedSessionId, cleanupSession, reduxDispatch]
    );
    
    // ── Rest Done ──
    const handleRestDone = useCallback(() => {
        reduxDispatch(finishRest());
    }, [reduxDispatch]);

    // ── Skip set ──
    const handleSkipSet = useCallback(() => {
        if (isSkipping || !currentExercise) return;
        confirmAction(
            'Bỏ qua set',
            `Bỏ qua Set ${currentSet} của bài "${currentExercise.name}"?`,
            async () => {
                setIsSkipping(true);
                try {
                    const exerciseTotalSets = currentExercise.sets;
                    const isLastEx = isLastExercise;
                    const isLastSetOfEx = currentSet >= exerciseTotalSets;

                    // If last set of THIS exercise, check if we modify cleanup logic
                    if (isLastSetOfEx && isLastEx) {
                        await cleanupSession();
                    } else {
                        // Calculate next state for persistence
                        // If last set of current exercise -> next exercise, set 1
                        // Else -> same exercise, next set
                        const nextIndex = isLastSetOfEx ? currentExIndex + 1 : currentExIndex;
                        const nextSet = isLastSetOfEx ? 1 : currentSet + 1;
                        
                        await setItem(
                            progressKey,
                            JSON.stringify({
                                currentExIndex: nextIndex,
                                currentSet: nextSet,
                            })
                        );
                    }

                    reduxDispatch(skipSet({ 
                        exerciseTotalSets, 
                        isLastExercise: isLastEx 
                    }));
                } finally {
                    setIsSkipping(false);
                }
            },
            'Bỏ qua',
            'Hủy'
        );
    }, [
        isSkipping,
        isLastExercise,
        currentExercise,
        currentExIndex,
        currentSet,
        progressKey,
        cleanupSession,
        reduxDispatch
    ]);

    // ── Done Screen ──
    useEffect(() => {
        if (phase === 'done') {
            navigation.replace('WorkoutSuccess', {
                sessionId: resolvedSessionId,
                dayLabel,
                planName,
                exercisesCount: exercises.length,
                setsCompleted: completedSets.length,
                totalReps: completedSets.reduce((s, c) => s + c.reps, 0),
                planId: route.params?.planId,
            });
        }
    }, [phase, navigation, resolvedSessionId, dayLabel, planName, exercises.length, completedSets, route.params?.planId]);

    // Render nothing while redirecting
    if (phase === 'done') {
        return <View className="flex-1 bg-white" />;
    }

    if (!currentExercise) {
        return (
            <View className="flex-1 items-center justify-center">
                <Text className="text-gray-500">
                   {exercises.length === 0 ? 'Đang tải...' : 'Không có bài tập nào.'}
                </Text> 
                <TouchableOpacity onPress={() => navigation.goBack()} className="mt-4">
                    <Text className="text-orange-500 font-bold">Quay lại</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="rounded-b-[32px] overflow-hidden">
            <LinearGradient
                colors={['#1f2937', '#111827']}
                className="pb-6"
            >
                <SafeAreaView edges={['top', 'left', 'right']} className="px-6 pt-4">
                    <View className="flex-row items-center justify-between mb-4">
                        <TouchableOpacity
                            onPress={() =>
                                confirmAction(
                                    'Dừng buổi tập?',
                                    'Tiến độ đã ghi sẽ được lưu. Bạn có thể tiếp tục sau.',
                                    () => navigation.goBack(),
                                    'Dừng lại',
                                    'Tiếp tục tập'
                                )
                            }
                            className="w-10 h-10 bg-white/10 rounded-full items-center justify-center"
                        >
                            <ArrowLeft color="white" size={20} />
                        </TouchableOpacity>
                        <View className="items-center">
                            <Text className="text-white font-bold text-base">{dayLabel}</Text>
                            <Text className="text-gray-400 text-xs">{planName}</Text>
                        </View>
                        <TouchableOpacity
                            onPress={handleSkipSet}
                            disabled={isSkipping}
                            className="w-10 h-10 bg-white/10 rounded-full items-center justify-center"
                            style={{ opacity: isSkipping ? 0.5 : 1 }}
                        >
                            <SkipForward color="#9ca3af" size={20} />
                        </TouchableOpacity>
                    </View>

                    {/* Progress bar */}
                    <View className="bg-white/10 rounded-full h-2 mb-2">
                        <View
                            className="bg-orange-400 h-2 rounded-full"
                            style={{ width: `${Math.min(100, Math.round(progressPct))}%` }}
                        />
                    </View>
                    <Text className="text-gray-400 text-xs text-center">
                        {totalSetsCompleted}/{totalSetsAll} sets hoàn thành (
                        {Math.round(progressPct)}%)
                    </Text>
                </SafeAreaView>
            </LinearGradient>
            </View>

            <ScrollView
                className="flex-1 px-6 pt-5"
                contentContainerStyle={{
                    paddingBottom: Platform.OS === 'web' ? 160 : 160,
                }}
            >
                {/* REST PHASE */}
                {phase === 'rest' && (
                    <Animated.View
                        entering={FadeIn}
                        className="bg-white rounded-3xl p-6 mb-4 items-center"
                        style={{
                            elevation: 4,
                            shadowColor: '#000',
                            shadowOpacity: 0.1,
                            shadowRadius: 12,
                            shadowOffset: { width: 0, height: 4 },
                        }}
                    >
                        <RestTimer seconds={restSeconds} onDone={handleRestDone} />
                    </Animated.View>
                )}


                {/* WORKOUT PHASE */}
                {phase === 'workout' && currentExercise && (
                    <ActiveExerciseCard
                        exercise={currentExercise}
                        exIndex={currentExIndex}
                        totalExercises={exercises.length}
                        currentSet={currentSet}
                        completedSets={completedSets}
                    />
                )}

                {/* Exercise queue (next 2) */}
                {exercises.length > 1 && currentExIndex < exercises.length - 1 && (
                    <View className="mt-2 mb-4">
                        <Text className="text-sm font-bold text-gray-500 uppercase mb-3">
                            Bài tiếp theo
                        </Text>
                        <View className="gap-2">
                            {exercises
                                .slice(currentExIndex + 1, currentExIndex + 3)
                                .map((ex, i) => (
                                    <View
                                        key={ex.id}
                                        className="bg-white rounded-xl p-3 flex-row items-center"
                                        style={{
                                            opacity: 1 - i * 0.3,
                                            elevation: 1,
                                            shadowColor: '#000',
                                            shadowOpacity: 0.04,
                                            shadowRadius: 4,
                                            shadowOffset: { width: 0, height: 1 },
                                        }}
                                    >
                                        <View
                                            className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${i === 0 ? 'bg-orange-100' : 'bg-gray-100'
                                                }`}
                                        >
                                            <ChevronRight
                                                color={i === 0 ? '#f97316' : '#9ca3af'}
                                                size={14}
                                            />
                                        </View>
                                        <View className="flex-1">
                                            <View className="flex-row items-center gap-2">
                                                <Text className="text-gray-700 font-semibold text-sm">
                                                    {ex.name}
                                                </Text>
                                                {ex.isExtra && (
                                                    <View className="bg-orange-100 px-1.5 py-0.5 rounded-full">
                                                        <Text className="text-orange-600 text-[9px] font-bold">
                                                            EXTRA
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>
                                            <Text className="text-gray-400 text-xs">
                                                {ex.sets} sets × {ex.repsTarget} reps
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                        </View>
                    </View>
                )}

                {/* Completed sets for current exercise */}
                {completedSetsForCurrentExercise.length > 0 && (
                        <View className="mt-2">
                            <Text className="text-sm font-bold text-gray-500 uppercase mb-3">
                                Sets đã hoàn thành
                            </Text>
                            {completedSetsForCurrentExercise.map((set, i) => (
                                    <View
                                        key={set.setNumber + '-' + i}
                                        className="bg-green-50 rounded-xl p-3 flex-row items-center mb-2"
                                    >
                                        <CheckCircle2
                                            color="#22c55e"
                                            size={16}
                                            style={{ marginRight: 10 }}
                                        />
                                        <Text className="text-green-700 font-semibold text-sm flex-1">
                                            Set {set.setNumber}: {set.reps} reps
                                            {set.weight ? ` @ ${set.weight}kg` : ''}
                                        </Text>
                                    </View>
                                ))}
                        </View>
                    )}
            </ScrollView>

            {/* Fixed CTA */}
            {phase === 'workout' && (
                <View
                    className="absolute left-0 right-0 bg-white border-t border-gray-100 px-6 pt-4"
                    style={{
                        bottom: 0,
                        paddingBottom: Platform.OS === 'web' ? 90 : 90,
                        zIndex: 1000,
                    }}
                >
                    <TouchableOpacity
                        onPress={() => setLogSheetVisible(true)}
                        className="bg-orange-500 rounded-2xl py-4 items-center justify-center flex-row gap-2"
                        activeOpacity={0.8}
                    >
                        <CheckCircle2 color="white" size={22} />
                        <Text className="text-white font-bold text-lg">
                            Hoàn thành Set {currentSet}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Log Set Bottom Sheet */}
            <LogSetSheet
                visible={logSheetVisible}
                exerciseName={currentExercise?.name ?? ''}
                setNumber={currentSet}
                defaultReps={currentExercise?.repsTarget ?? 10}
                onClose={() => setLogSheetVisible(false)}
                onSave={saveLog}
                saving={isSavingLog} // Use Redux state
            />

        </View>
    );
}

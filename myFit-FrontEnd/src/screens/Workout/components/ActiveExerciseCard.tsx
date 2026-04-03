import React from 'react';
import { View, Text } from 'react-native';
import Animated, { SlideInRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { CheckCircle2, Dumbbell, Timer, Zap } from 'lucide-react-native';
import type { SessionExercise, CompletedSet } from '../../../store/workoutSessionSlice';

interface ActiveExerciseCardProps {
    exercise: SessionExercise;
    exIndex: number;
    totalExercises: number;
    currentSet: number;
    completedSets: CompletedSet[];
}

export function ActiveExerciseCard({
    exercise,
    exIndex,
    totalExercises,
    currentSet,
    completedSets,
}: ActiveExerciseCardProps) {
    if (!exercise) return null;

    return (
        <Animated.View key={`ex-${exIndex}`} entering={SlideInRight}>
            <View
                className="bg-white rounded-3xl overflow-hidden mb-4"
                style={{
                    elevation: 5,
                    shadowColor: '#f97316',
                    shadowOpacity: 0.15,
                    shadowRadius: 16,
                    shadowOffset: { width: 0, height: 6 },
                }}
            >
                <LinearGradient
                    colors={['#f97316', '#ef4444']}
                    className="px-6 pt-6 pb-5"
                >
                    <View className="flex-row justify-between items-start mb-3">
                        <View className="bg-white/20 px-3 py-1 rounded-full flex-row items-center gap-1.5">
                            <Text className="text-white/90 text-xs font-semibold">
                                Bài {exIndex + 1}/{totalExercises}
                            </Text>
                            {exercise.isExtra && (
                                <View className="bg-white/30 px-1.5 py-0.5 rounded-full">
                                    <Text className="text-white text-[9px] font-bold">
                                        EXTRA
                                    </Text>
                                </View>
                            )}
                        </View>
                        <View className="bg-white/20 px-3 py-1 rounded-full">
                            <Text className="text-white/90 text-xs font-semibold">
                                Set {currentSet}/{exercise.sets}
                            </Text>
                        </View>
                    </View>
                    <Text className="text-white text-3xl font-bold mb-1">
                        {exercise.name}
                    </Text>
                    <Text className="text-white/80 text-base">
                        Mục tiêu: {exercise.repsTarget} reps / set
                    </Text>
                </LinearGradient>

                {/* Set indicators */}
                <View className="flex-row gap-2 px-6 py-4 bg-gray-50">
                    {Array.from({ length: exercise.sets }, (_, i) => {
                        const setNum = i + 1;
                        const isDone = completedSets.some(
                            c =>
                                (c.sessionExerciseId
                                    ? c.sessionExerciseId === exercise.id
                                    : c.exerciseId === exercise.exerciseId) &&
                                c.setNumber === setNum
                        );
                        const isCurrent = setNum === currentSet;
                        return (
                            <View
                                key={setNum}
                                className={`flex-1 py-3 rounded-xl items-center border-2 ${isDone
                                    ? 'bg-green-500 border-green-500'
                                    : isCurrent
                                        ? 'bg-orange-500 border-orange-500'
                                        : 'bg-white border-gray-200'
                                    }`}
                            >
                                {isDone ? (
                                    <CheckCircle2 color="white" size={16} />
                                ) : (
                                    <Text
                                        className={`font-bold text-sm ${isCurrent ? 'text-white' : 'text-gray-400'
                                            }`}
                                    >
                                        {setNum}
                                    </Text>
                                )}
                            </View>
                        );
                    })}
                </View>

                {/* Stats */}
                <View className="flex-row px-6 pb-5 gap-4">
                    <View className="flex-1 bg-orange-50 rounded-xl p-3 items-center">
                        <Dumbbell color="#f97316" size={18} />
                        <Text className="text-gray-900 font-bold mt-1">
                            {exercise.repsTarget}
                        </Text>
                        <Text className="text-gray-400 text-xs">reps</Text>
                    </View>
                    <View className="flex-1 bg-blue-50 rounded-xl p-3 items-center">
                        <Timer color="#3b82f6" size={18} />
                        <Text className="text-gray-900 font-bold mt-1">
                            {exercise.restSeconds}s
                        </Text>
                        <Text className="text-gray-400 text-xs">nghỉ</Text>
                    </View>
                    <View className="flex-1 bg-green-50 rounded-xl p-3 items-center">
                        <Zap color="#22c55e" size={18} />
                        <Text className="text-gray-900 font-bold mt-1">
                            {Math.max(0, exercise.sets - currentSet + 1)}
                        </Text>
                        <Text className="text-gray-400 text-xs">sets còn</Text>
                    </View>
                </View>
            </View>
        </Animated.View>
    );
}

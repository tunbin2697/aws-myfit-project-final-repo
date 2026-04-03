import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Trophy } from 'lucide-react-native';

export interface WorkoutSuccessParams {
    sessionId?: string;
    dayLabel?: string;
    planName?: string;
    exercisesCount: number;
    setsCompleted: number;
    totalReps: number;
    planId?: string;
}

export function WorkoutSuccessScreen({ route, navigation }: any) {
    const {
        sessionId,
        dayLabel,
        planName,
        exercisesCount,
        setsCompleted,
        totalReps,
        planId,
    } = (route.params as WorkoutSuccessParams) ?? {};

    // Prevent going back to the session screen
    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            // Navigate to home or plan detail instead of back to session
             navigation.getParent()?.navigate('Home');
            return true;
        });
        return () => backHandler.remove();
    }, [navigation]);

    return (
        <View className="flex-1 bg-gray-50">
            <View className="rounded-b-[48px] overflow-hidden">
            <LinearGradient
                colors={['#f97316', '#ef4444']}
                className="flex-1 justify-center"
            >
                <SafeAreaView className="items-center px-6 w-full">
                    <Animated.View entering={FadeIn.delay(200)} className="items-center">
                        <View className="w-28 h-28 bg-white/20 rounded-full items-center justify-center mb-6">
                            <Trophy color="white" size={56} />
                        </View>
                        <Text className="text-4xl font-bold text-white mb-2 text-center">
                            Xuất sắc! 🎉
                        </Text>
                        <Text className="text-white/80 text-lg text-center mb-1">
                            Bạn đã hoàn thành buổi tập {dayLabel}
                        </Text>
                        <Text className="text-white/60 text-sm text-center">
                            {planName}
                        </Text>
                    </Animated.View>

                    <Animated.View
                        entering={FadeInDown.delay(400)}
                        className="bg-white/20 rounded-3xl p-6 mt-8 w-full flex-row justify-around"
                    >
                        <View className="items-center">
                            <Text className="text-3xl font-bold text-white">
                                {exercisesCount}
                            </Text>
                            <Text className="text-white/70 text-sm">Bài tập</Text>
                        </View>
                        <View className="w-px bg-white/30 h-full" />
                        <View className="items-center">
                            <Text className="text-3xl font-bold text-white">
                                {setsCompleted}
                            </Text>
                            <Text className="text-white/70 text-sm">Sets</Text>
                        </View>
                        <View className="w-px bg-white/30 h-full" />
                        <View className="items-center">
                            <Text className="text-3xl font-bold text-white">
                                {totalReps}
                            </Text>
                            <Text className="text-white/70 text-sm">Reps</Text>
                        </View>
                    </Animated.View>
                </SafeAreaView>
            </LinearGradient>
            </View>

            <View className="px-6 pt-6 pb-[100px] gap-3">
                {sessionId && (
                    <TouchableOpacity
                        onPress={() =>
                            navigation.navigate('SessionDetail', { sessionId })
                        }
                        className="bg-orange-500 rounded-2xl py-4 items-center"
                        activeOpacity={0.8}
                    >
                        <Text className="text-white font-bold text-lg">
                            Xem chi tiết buổi tập
                        </Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    onPress={() => {
                        if (planId) {
                            navigation.navigate('PlanDetail', { planId });
                        } else {
                            navigation.getParent()?.navigate('MyPlans');
                        }
                    }}
                    className="border border-gray-200 rounded-2xl py-4 items-center"
                    activeOpacity={0.7}
                >
                    <Text className="text-gray-600 font-semibold">
                        Xem kế hoạch tập
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => navigation.getParent()?.navigate('Home')}
                    className="border border-gray-200 rounded-2xl py-4 items-center"
                    activeOpacity={0.7}
                >
                    <Text className="text-gray-600 font-semibold">Về trang chủ</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

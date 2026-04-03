import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

interface RestTimerProps {
    seconds: number;
    onDone: () => void;
}

export function RestTimer({ seconds, onDone }: RestTimerProps) {
    const [remaining, setRemaining] = useState(seconds);
    // Use a ref so that a new onDone reference never restarts the timer
    const onDoneRef = useRef(onDone);
    useEffect(() => { onDoneRef.current = onDone; }, [onDone]);

    useEffect(() => {
        if (remaining <= 0) {
            onDoneRef.current();
            return;
        }
        const t = setTimeout(() => setRemaining(r => r - 1), 1000);
        return () => clearTimeout(t);
    }, [remaining]);

    const arcColor = remaining > 10 ? '#22c55e' : remaining > 5 ? '#f97316' : '#ef4444';

    return (
        <Animated.View entering={FadeIn} className="items-center py-6">
            <View
                className="w-28 h-28 rounded-full border-4 items-center justify-center mb-3"
                style={{ borderColor: arcColor }}
            >
                <Text style={{ color: arcColor }} className="text-3xl font-bold">
                    {remaining}
                </Text>
                <Text className="text-xs text-gray-500">giây</Text>
            </View>
            <Text className="text-gray-600 font-medium mb-3">Nghỉ ngơi</Text>
            <TouchableOpacity
                onPress={() => onDoneRef.current()}
                className="bg-gray-100 px-5 py-2 rounded-full"
                activeOpacity={0.7}
            >
                <Text className="text-gray-600 font-semibold text-sm">
                    Bỏ qua thời gian nghỉ
                </Text>
            </TouchableOpacity>
        </Animated.View>
    );
}

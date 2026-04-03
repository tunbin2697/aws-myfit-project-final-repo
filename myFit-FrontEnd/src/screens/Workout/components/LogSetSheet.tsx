import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { X, CheckCircle2 } from 'lucide-react-native';
import { notifyAlert } from '../../../utils/notification';

export interface LogSetSheetProps {
    visible: boolean;
    exerciseName: string;
    setNumber: number;
    defaultReps: number;
    onClose: () => void;
    onSave: (reps: number, weight: number | null) => void;
    saving: boolean;
}

export function LogSetSheet({
    visible,
    exerciseName,
    setNumber,
    defaultReps,
    onClose,
    onSave,
    saving,
}: LogSetSheetProps) {
    const [reps, setReps] = useState(String(defaultReps));
    const [weight, setWeight] = useState('');

    useEffect(() => {
        if (visible) {
            setReps(String(defaultReps));
            setWeight('');
        }
    }, [visible, defaultReps]);

    const handleSave = () => {
        const r = parseInt(reps, 10);
        if (!r || r <= 0) {
            notifyAlert('Lỗi', 'Vui lòng nhập số reps hợp lệ');
            return;
        }
        const w = weight ? parseFloat(weight) : null;
        onSave(r, w);
    };

    return (
        <Modal
            visible={visible}
            transparent={false}
            animationType="slide"
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <Animated.View
                    entering={FadeInUp}
                    className="bg-white rounded-t-3xl px-6 pt-5 pb-8"
                >
                    <View className="w-10 h-1 bg-gray-200 rounded-full self-center mb-4" />

                    <View className="flex-row justify-between items-center mb-4">
                        <View>
                            <Text className="text-xs text-gray-400 uppercase font-semibold">
                                Ghi kết quả
                            </Text>
                            <Text className="text-xl font-bold text-gray-900">
                                {exerciseName}
                            </Text>
                            <Text className="text-gray-500 text-sm">Set {setNumber}</Text>
                        </View>
                        <TouchableOpacity
                            onPress={onClose}
                            className="w-8 h-8 items-center justify-center"
                        >
                            <X color="#9ca3af" size={20} />
                        </TouchableOpacity>
                    </View>

                    {/* Reps */}
                    <View className="mb-4">
                        <Text className="text-sm font-semibold text-gray-700 mb-2">
                            Số reps thực tế *
                        </Text>
                        <View className="flex-row gap-2 mb-2">
                            {[-2, -1, +1, +2].map(delta => (
                                <TouchableOpacity
                                    key={delta}
                                    onPress={() =>
                                        setReps(r =>
                                            String(Math.max(1, (parseInt(r, 10) || 0) + delta))
                                        )
                                    }
                                    className="flex-1 bg-gray-100 py-2.5 rounded-xl items-center"
                                >
                                    <Text className="font-bold text-gray-700 text-sm">
                                        {delta > 0 ? `+${delta}` : delta}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TextInput
                            value={reps}
                            onChangeText={setReps}
                            keyboardType="number-pad"
                            className="border-2 border-orange-200 rounded-xl px-4 py-3 text-center text-2xl font-bold text-gray-900 bg-orange-50"
                            selectTextOnFocus
                        />
                    </View>

                    {/* Weight */}
                    <View className="mb-6">
                        <Text className="text-sm font-semibold text-gray-700 mb-2">
                            Tạ (kg) — tuỳ chọn
                        </Text>
                        <TextInput
                            value={weight}
                            onChangeText={setWeight}
                            keyboardType="decimal-pad"
                            placeholder="0.0"
                            placeholderTextColor="#9ca3af"
                            className="border border-gray-200 rounded-xl px-4 py-3 text-center text-xl font-bold text-gray-900 bg-gray-50"
                            selectTextOnFocus
                        />
                    </View>

                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={saving}
                        className="bg-orange-500 rounded-2xl py-4 items-center flex-row justify-center gap-2"
                        style={{ opacity: saving ? 0.7 : 1 }}
                        activeOpacity={0.8}
                    >
                        {saving ? (
                            <ActivityIndicator color="white" size="small" />
                        ) : (
                            <CheckCircle2 color="white" size={20} />
                        )}
                        <Text className="text-white font-bold text-base">
                            {saving ? 'Đang lưu...' : 'Xác nhận set này'}
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

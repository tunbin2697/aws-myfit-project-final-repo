import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft } from 'lucide-react-native';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../store';

import { createMyPlan } from '../../services/userWorkoutPlanService';
import { getAllGoalTypes } from '../../services/goalTypeService';
import type { GoalTypeResponse } from '../../types';
import { bumpPlansReloadKey } from '../../store/uiSlice';
import { notifyAlert } from '../../utils/notification';

export function CreatePlanScreen({ navigation }: any) {
    const dispatch = useDispatch<AppDispatch>();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [goalTypes, setGoalTypes] = useState<GoalTypeResponse[]>([]);
    const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
    const [loadingGoals, setLoadingGoals] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        (async () => {
            setLoadingGoals(true);
            try {
                const data = await getAllGoalTypes();
                setGoalTypes(data ?? []);
            } catch {
                notifyAlert('Lỗi', 'Không thể tải danh sách mục tiêu.');
            } finally {
                setLoadingGoals(false);
            }
        })();
    }, []);

    const handleCreate = async () => {
        const trimmedName = name.trim();
        if (!trimmedName) {
            notifyAlert('Thiếu thông tin', 'Vui lòng nhập tên kế hoạch.');
            return;
        }

        if (!selectedGoalId) {
            notifyAlert('Thiếu thông tin', 'Vui lòng chọn mục tiêu cho kế hoạch.');
            return;
        }

        setSaving(true);
        try {
            const created = await createMyPlan({
                name: trimmedName,
                description: description.trim() || undefined,
                goalTypeId: selectedGoalId,
                isActive: true,
            });

            dispatch(bumpPlansReloadKey());

            navigation.replace('PlanEdit', { planId: created.id });
        } catch (e: any) {
            notifyAlert('Lỗi', e?.message || 'Không thể tạo kế hoạch mới.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <View className="flex-1 bg-gray-50">
            <View className="rounded-b-[28px] overflow-hidden">
            <LinearGradient
                colors={['#f97316', '#ef4444']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="pb-6"
            >
                <SafeAreaView edges={['top', 'left', 'right']} className="px-6 pt-4">
                    <View className="flex-row items-center mb-2">
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            className="w-10 h-10 bg-white/20 rounded-full items-center justify-center mr-3"
                        >
                            <ArrowLeft color="white" size={18} />
                        </TouchableOpacity>
                        <View>
                            <Text className="text-2xl font-bold text-white">Tạo kế hoạch</Text>
                            <Text className="text-white/80 text-sm">Tạo plan cá nhân để tự thiết kế</Text>
                        </View>
                    </View>
                </SafeAreaView>
            </LinearGradient>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                className="flex-1"
            >
                <View className="px-6 pt-6 gap-4">
                    <View>
                        <Text className="text-sm font-semibold text-gray-700 mb-2">Mục tiêu *</Text>
                        {loadingGoals ? (
                            <View className="bg-white border border-gray-200 rounded-xl py-3 items-center">
                                <ActivityIndicator color="#f97316" size="small" />
                            </View>
                        ) : goalTypes.length === 0 ? (
                            <View className="bg-white border border-gray-200 rounded-xl px-4 py-3">
                                <Text className="text-gray-500 text-sm">Không có mục tiêu khả dụng.</Text>
                            </View>
                        ) : (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                                {goalTypes.map(goal => {
                                    const isSelected = selectedGoalId === goal.id;
                                    return (
                                        <TouchableOpacity
                                            key={goal.id}
                                            onPress={() => setSelectedGoalId(goal.id)}
                                            className={`px-4 py-2.5 rounded-full border ${isSelected ? 'bg-orange-500 border-orange-500' : 'bg-white border-gray-200'}`}
                                            activeOpacity={0.8}
                                        >
                                            <Text className={`font-semibold text-sm ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                                                {goal.name}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        )}
                    </View>

                    <View>
                        <Text className="text-sm font-semibold text-gray-700 mb-2">Tên kế hoạch *</Text>
                        <TextInput
                            value={name}
                            onChangeText={setName}
                            placeholder="Ví dụ: Push Pull Legs 5 buổi"
                            className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
                            maxLength={120}
                        />
                    </View>

                    <View>
                        <Text className="text-sm font-semibold text-gray-700 mb-2">Mô tả (tuỳ chọn)</Text>
                        <TextInput
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Mục tiêu, lịch tập, ghi chú..."
                            className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 min-h-[110px]"
                            multiline
                            textAlignVertical="top"
                            maxLength={400}
                        />
                    </View>

                    <TouchableOpacity
                        onPress={handleCreate}
                        disabled={saving || loadingGoals || goalTypes.length === 0}
                        className="bg-orange-500 rounded-2xl py-4 items-center justify-center"
                        style={{ opacity: (saving || loadingGoals || goalTypes.length === 0) ? 0.8 : 1 }}
                        activeOpacity={0.8}
                    >
                        {saving ? (
                            <ActivityIndicator color="white" size="small" />
                        ) : (
                            <Text className="text-white font-bold text-base">Tạo và thiết kế bài tập</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

export default CreatePlanScreen;

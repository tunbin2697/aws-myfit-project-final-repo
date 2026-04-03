import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Check, Target } from 'lucide-react-native';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { GoalTypeRequest, GoalTypeResponse } from '../../types';
import { createGoalType, updateGoalType } from '../../services/goalTypeService';
import { notifyAlert } from '../../utils/notification';

interface Props {
    navigation: any;
    route?: {
        params?: {
            goalType?: GoalTypeResponse;
        };
    };
}

export function GoalTypeFormScreen({ navigation, route }: Props) {
    const existingGoalType = route?.params?.goalType;
    const isEditing = !!existingGoalType;

    const [name, setName] = useState(existingGoalType?.name || '');
    const [description, setDescription] = useState(existingGoalType?.description || '');
    const [loading, setLoading] = useState(false);

    const validate = (): boolean => {
        if (!name.trim()) {
            notifyAlert('Lỗi', 'Vui lòng nhập tên goal');
            return false;
        }
        if (name.length > 100) {
            notifyAlert('Lỗi', 'Tên goal không được vượt quá 100 ký tự');
            return false;
        }
        if (!description.trim()) {
            notifyAlert('Lỗi', 'Vui lòng nhập mô tả');
            return false;
        }
        if (description.length > 255) {
            notifyAlert('Lỗi', 'Mô tả không được vượt quá 255 ký tự');
            return false;
        }
        return true;
    };

    const handleSave = async () => {
        if (!validate()) return;

        setLoading(true);
        try {
            const data: GoalTypeRequest = {
                name: name.trim(),
                description: description.trim()
            };

            if (isEditing && existingGoalType) {
                await updateGoalType(existingGoalType.id, data);
                notifyAlert('Thành công', 'Đã cập nhật goal type');
            } else {
                await createGoalType(data);
                notifyAlert('Thành công', 'Đã tạo goal type mới');
            }

            navigation.goBack();
        } catch (error: any) {
            notifyAlert('Lỗi', error.message || 'Không thể lưu goal type');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <LinearGradient
                colors={['#f97316', '#ef4444']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
            >
                <SafeAreaView edges={['top', 'left', 'right']}>
                    <View className="px-6 py-4 flex-row items-center justify-between">
                        <TouchableOpacity 
                            onPress={() => navigation.goBack()} 
                            className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
                        >
                            <ArrowLeft size={22} color="white" />
                        </TouchableOpacity>
                        <View className="flex-1 mx-4">
                            <Text className="text-xl font-bold text-white text-center">
                                {isEditing ? 'Sửa Goal Type' : 'Tạo Goal Type'}
                            </Text>
                        </View>
                        <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
                            <Target size={20} color="white" />
                        </View>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            {/* Form */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
                        <View className="space-y-6">
                            <Input
                                label="Tên Goal *"
                                value={name}
                                onChangeText={setName}
                                placeholder="Ví dụ: Giảm cân"
                                maxLength={100}
                                autoFocus
                            />

                            <View>
                                <Input
                                    label="Mô tả *"
                                    value={description}
                                    onChangeText={setDescription}
                                    placeholder="Mô tả chi tiết về goal này"
                                    multiline
                                    numberOfLines={4}
                                    maxLength={255}
                                    className="h-24"
                                    style={{ textAlignVertical: 'top' }}
                                />
                                <Text className="text-xs text-gray-500 mt-1 text-right">
                                    {description.length}/255
                                </Text>
                            </View>

                            <Button
                                onPress={handleSave}
                                disabled={loading}
                                className="mt-4"
                            >
                                {loading ? 'Đang lưu...' : '💾 Lưu Goal'}
                            </Button>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
        </View>
    );
}

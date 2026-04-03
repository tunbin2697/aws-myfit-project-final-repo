import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Activity } from 'lucide-react-native';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { BodyMetricRequest, BodyMetricResponse, Gender, GoalTypeResponse } from '../../types';
import { createBodyMetric, updateBodyMetric } from '../../services/bodyMetricService';
import { getUserProfileFromStorage } from '../../services/authService';
import { getAllGoalTypes } from '../../services/goalTypeService';
import { useAppSelector } from '../../hooks/redux';
import { notifyAlert } from '../../utils/notification';

interface Props {
    navigation: any;
    route?: {
        params?: {
            metric?: BodyMetricResponse;
        };
    };
}

export function BodyMetricFormScreen({ navigation, route }: Props) {
    const existingMetric = route?.params?.metric;
    const isEditing = !!existingMetric;
    const user = useAppSelector(state => state.auth.user);

    const [heightCm, setHeightCm] = useState(existingMetric?.heightCm?.toString() || '');
    const [weightKg, setWeightKg] = useState(existingMetric?.weightKg?.toString() || '');
    const [activityLevel, setActivityLevel] = useState(existingMetric?.activityLevel || 'SEDENTARY');
    const [goalTypes, setGoalTypes] = useState<GoalTypeResponse[]>([]);
    const [goalTypeName, setGoalTypeName] = useState('');
    const [loading, setLoading] = useState(false);

    const parseGender = (value?: string): Gender | null => {
        const upper = (value || '').toUpperCase();
        if (upper === Gender.MALE) return Gender.MALE;
        if (upper === Gender.FEMALE) return Gender.FEMALE;
        return null;
    };

    const getAgeFromBirthdate = (birthdate?: string): number | null => {
        if (!birthdate) return null;
        const date = new Date(birthdate);
        if (Number.isNaN(date.getTime())) return null;

        const now = new Date();
        let result = now.getFullYear() - date.getFullYear();
        const beforeBirthday =
            now.getMonth() < date.getMonth() ||
            (now.getMonth() === date.getMonth() && now.getDate() < date.getDate());

        if (beforeBirthday) result -= 1;
        return result >= 0 ? result : null;
    };

    const profileGender = parseGender(user?.gender);
    const profileAge = getAgeFromBirthdate(user?.birthdate);

    React.useEffect(() => {
        (async () => {
            const goals = await getAllGoalTypes().catch(() => []);
            setGoalTypes(goals);
            if (goals.length > 0) {
                setGoalTypeName(goals[0].name);
            }
        })();
    }, []);

    const validate = (): boolean => {
        const height = parseFloat(heightCm);
        const weight = parseFloat(weightKg);
        if (!heightCm || isNaN(height)) {
            notifyAlert('Lỗi', 'Vui lòng nhập chiều cao hợp lệ');
            return false;
        }
        if (height < 50 || height > 300) {
            notifyAlert('Lỗi', 'Chiều cao phải từ 50 đến 300 cm');
            return false;
        }

        if (!weightKg || isNaN(weight)) {
            notifyAlert('Lỗi', 'Vui lòng nhập cân nặng hợp lệ');
            return false;
        }
        if (weight < 20 || weight > 500) {
            notifyAlert('Lỗi', 'Cân nặng phải từ 20 đến 500 kg');
            return false;
        }

        if (!profileAge || !profileGender) {
            notifyAlert('Lỗi', 'Vui lòng cập nhật Ngày sinh và Giới tính trong hồ sơ cá nhân.');
            return false;
        }

        if (!goalTypeName) {
            notifyAlert('Lỗi', 'Vui lòng chọn mục tiêu.');
            return false;
        }

        return true;
    };

    const handleSave = async () => {
        if (!validate()) return;

        setLoading(true);
        try {
            const profile = await getUserProfileFromStorage();
            if (!profile?.id) {
                notifyAlert('Lỗi', 'Không xác định người dùng. Vui lòng đăng xuất và đăng nhập lại.');
                return;
            }
            const data: BodyMetricRequest = {
                userId: profile.id,
                heightCm: parseFloat(heightCm),
                weightKg: parseFloat(weightKg),
                age: profileAge as number,
                gender: profileGender as Gender,
                activityLevel: activityLevel as any,
                goalTypeName,
            };

            if (isEditing && existingMetric) {
                await updateBodyMetric(existingMetric.id, data);
                notifyAlert('Thành công', 'Đã cập nhật số đo');
            } else {
                await createBodyMetric(data);
                notifyAlert('Thành công', 'Đã lưu số đo mới');
            }

            navigation.goBack();
        } catch (error: any) {
            notifyAlert('Lỗi', error.message || 'Không thể lưu số đo');
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
                                {isEditing ? 'Sửa số đo' : 'Nhập số đo cơ thể'}
                            </Text>
                        </View>
                        <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
                            <Activity size={20} color="white" />
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
                            <View>
                                <Input
                                    label="📏 Chiều cao (cm) *"
                                    value={heightCm}
                                    onChangeText={setHeightCm}
                                    placeholder="170"
                                    keyboardType="numeric"
                                    autoFocus
                                />
                                <Text className="text-xs text-gray-500 mt-1">💡 Từ 50 đến 300 cm</Text>
                            </View>

                            <View>
                                <Input
                                    label="⚖️ Cân nặng (kg) *"
                                    value={weightKg}
                                    onChangeText={setWeightKg}
                                    placeholder="65"
                                    keyboardType="numeric"
                                />
                                <Text className="text-xs text-gray-500 mt-1">💡 Từ 20 đến 500 kg</Text>
                            </View>

                            <View>
                                <Text className="text-sm font-semibold text-gray-700 mb-2">Thông tin cá nhân dùng để tính</Text>
                                <View className="bg-orange-50 border border-orange-100 rounded-xl p-3">
                                    <Text className="text-sm text-orange-700">
                                        Giới tính: {profileGender === Gender.MALE ? 'Nam' : profileGender === Gender.FEMALE ? 'Nữ' : 'Chưa cập nhật'}
                                    </Text>
                                    <Text className="text-sm text-orange-700 mt-1">
                                        Tuổi: {profileAge ?? 'Chưa cập nhật'}
                                    </Text>
                                    <TouchableOpacity onPress={() => navigation.navigate('Profile')} className="mt-2 self-start px-3 py-1.5 rounded bg-orange-500">
                                        <Text className="text-xs text-white font-semibold">Cập nhật hồ sơ</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View>
                                <Text className="text-sm font-semibold text-gray-700 mb-2">Mục tiêu</Text>
                                <View className="flex-row flex-wrap gap-2">
                                    {goalTypes.map(goal => (
                                        <TouchableOpacity
                                            key={goal.id}
                                            onPress={() => setGoalTypeName(goal.name)}
                                            className={`px-3 py-2 rounded ${goalTypeName === goal.name ? 'bg-orange-200' : 'bg-gray-100'}`}
                                        >
                                            <Text className="text-sm">{goal.name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View>
                                <Text className="text-sm font-semibold text-gray-700 mb-2">Mức độ hoạt động</Text>
                                <View className="flex-row flex-wrap gap-2">
                                    <TouchableOpacity onPress={() => setActivityLevel('SEDENTARY')} className={`px-3 py-2 rounded ${activityLevel === 'SEDENTARY' ? 'bg-orange-200' : 'bg-gray-100'}`}>
                                        <Text className="text-xs">Ít vận động</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => setActivityLevel('LIGHTLY_ACTIVE')} className={`px-3 py-2 rounded ${activityLevel === 'LIGHTLY_ACTIVE' ? 'bg-orange-200' : 'bg-gray-100'}`}>
                                        <Text className="text-xs">Nhẹ</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => setActivityLevel('MODERATELY_ACTIVE')} className={`px-3 py-2 rounded ${activityLevel === 'MODERATELY_ACTIVE' ? 'bg-orange-200' : 'bg-gray-100'}`}>
                                        <Text className="text-xs">Vừa phải</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => setActivityLevel('VERY_ACTIVE')} className={`px-3 py-2 rounded ${activityLevel === 'VERY_ACTIVE' ? 'bg-orange-200' : 'bg-gray-100'}`}>
                                        <Text className="text-xs">Năng động</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <Button
                                onPress={handleSave}
                                disabled={loading}
                                className="mt-4"
                            >
                                {loading ? 'Đang lưu...' : '💾 Lưu số đo'}
                            </Button>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
        </View>
    );
}

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Target, Plus, Edit2, Trash2, ArrowLeft } from 'lucide-react-native';
import { Card, CardContent } from '../../components/ui/Card';
import { GoalTypeResponse } from '../../types';
import { getAllGoalTypes, deleteGoalType } from '../../services/goalTypeService';
import { notifyAlert } from '../../utils/notification';
import { confirmAction } from '../../utils/confirm';
import { Skeleton } from '../../components/ui/Skeleton';

function GoalTypeListSkeleton() {
    return (
        <View className="space-y-4">
            {[0, 1, 2].map((idx) => (
                <Card key={idx} className="border-none shadow-md">
                    <CardContent className="p-4">
                        <View className="flex-row items-start mb-3">
                            <Skeleton className="w-10 h-10 rounded-full mr-3" />
                            <View className="flex-1">
                                <Skeleton className="h-5 w-40 mb-2" />
                                <Skeleton className="h-3 w-full mb-1" />
                                <Skeleton className="h-3 w-3/4" />
                            </View>
                        </View>
                        <View className="flex-row gap-2 pt-3 border-t border-gray-100">
                            <Skeleton className="h-10 flex-1 rounded-lg" />
                            <Skeleton className="h-10 flex-1 rounded-lg" />
                        </View>
                    </CardContent>
                </Card>
            ))}
        </View>
    );
}

export function GoalTypeListScreen({ navigation }: any) {
    const [goalTypes, setGoalTypes] = useState<GoalTypeResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadGoalTypes = async () => {
        try {
            setLoading(true);
            const data = await getAllGoalTypes();
            setGoalTypes(data);
        } catch (error: any) {
            notifyAlert('Lỗi', error.message || 'Không thể tải danh sách goal types');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadGoalTypes();
        setRefreshing(false);
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadGoalTypes();
        });

        return unsubscribe;
    }, [navigation]);

    const handleDelete = (id: string, name: string) => {
        confirmAction(
            'Xác nhận xóa',
            `Bạn có chắc chắn muốn xóa "${name}"?`,
            async () => {
                try {
                    await deleteGoalType(id);
                    notifyAlert('Thành công', 'Đã xóa goal type');
                    loadGoalTypes();
                } catch (error: any) {
                    notifyAlert('Lỗi', error.message || 'Không thể xóa goal type');
                }
            },
            'Xóa',
            'Hủy'
        );
    };

    return (
        <View className="flex-1 bg-gray-50">
            <LinearGradient
                colors={['#f97316', '#ef4444']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
            >
                <SafeAreaView edges={['top', 'left', 'right']}>
                    <View className="px-6 py-4 flex-row items-center justify-between">
                        <View className="flex-row items-center flex-1">
                            <TouchableOpacity 
                                onPress={() => navigation.goBack()} 
                                className="w-10 h-10 bg-white/20 rounded-full items-center justify-center mr-3"
                            >
                                <ArrowLeft size={22} color="white" />
                            </TouchableOpacity>
                            <View>
                                <Text className="text-xl font-bold text-white">Goal Types</Text>
                                <Text className="text-white/70 text-sm">Quản lý mục tiêu</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('GoalTypeForm')}
                            className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
                            activeOpacity={0.7}
                        >
                            <Plus color="white" size={22} />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                    {loading && !refreshing ? (
                        <GoalTypeListSkeleton />
                    ) : goalTypes.length === 0 ? (
                        <View className="items-center py-12">
                            <Target color="#9ca3af" size={48} className="mb-4" />
                            <Text className="text-lg text-gray-500 mb-2">Chưa có goal type nào</Text>
                            <Text className="text-sm text-gray-400">Nhấn nút + để tạo mới</Text>
                        </View>
                    ) : (
                        <View className="space-y-4">
                            {goalTypes.map((goalType) => (
                                <Card key={goalType.id} className="border-none shadow-md">
                                    <CardContent className="p-4">
                                        <View className="flex-row items-start mb-3">
                                            <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center mr-3">
                                                <Target color="#f97316" size={20} />
                                            </View>
                                            <View className="flex-1">
                                                <Text className="text-lg font-bold text-gray-900 mb-1">
                                                    {goalType.name}
                                                </Text>
                                                <Text className="text-sm text-gray-600">
                                                    {goalType.description}
                                                </Text>
                                            </View>
                                        </View>

                                        <View className="flex-row gap-2 pt-3 border-t border-gray-100">
                                            <TouchableOpacity
                                                onPress={() => navigation.navigate('GoalTypeForm', { goalType })}
                                                className="flex-1 flex-row items-center justify-center bg-blue-50 rounded-lg py-2"
                                                activeOpacity={0.7}
                                            >
                                                <Edit2 color="#3b82f6" size={16} />
                                                <Text className="ml-2 text-blue-600 font-medium">Sửa</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                onPress={() => handleDelete(goalType.id, goalType.name)}
                                                className="flex-1 flex-row items-center justify-center bg-red-50 rounded-lg py-2"
                                                activeOpacity={0.7}
                                            >
                                                <Trash2 color="#ef4444" size={16} />
                                                <Text className="ml-2 text-red-600 font-medium">Xóa</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </CardContent>
                                </Card>
                            ))}
                        </View>
                    )}
                </ScrollView>
        </View>
    );
}

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Activity, Plus, Edit2, Trash2, TrendingUp, ArrowLeft } from 'lucide-react-native';
import { Card, CardContent } from '../../components/ui/Card';
import { WeightChart } from '../../components/health/WeightChart';
import { BodyMetricResponse } from '../../types';
import { getUserBodyMetrics, deleteBodyMetric, getLatestBodyMetric } from '../../services/bodyMetricService';
import { getUserProfileFromStorage } from '../../services/authService';
import { notifyAlert } from '../../utils/notification';
import { confirmAction } from '../../utils/confirm';
import { Skeleton } from '../../components/ui/Skeleton';

function BodyMetricListSkeleton() {
    return (
        <View className="space-y-4">
            <Card className="border-2 border-orange-100 shadow-sm">
                <CardContent className="p-4">
                    <View className="flex-row items-center mb-3">
                        <Skeleton className="w-6 h-6 rounded-full" />
                        <Skeleton className="h-5 w-40 ml-2" />
                    </View>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-4/5" />
                </CardContent>
            </Card>

            <Card className="shadow-sm">
                <CardContent className="p-4">
                    <Skeleton className="h-5 w-32 mb-3" />
                    <Skeleton className="h-40 w-full rounded-xl" />
                </CardContent>
            </Card>

            <View className="mt-4">
                <Skeleton className="h-5 w-24 mb-3" />
                {[0, 1, 2].map((idx) => (
                    <Card key={idx} className="border-none shadow-sm mb-3">
                        <CardContent className="p-3">
                            <Skeleton className="h-4 w-40 mb-2" />
                            <Skeleton className="h-3 w-28 mb-3" />
                            <View className="flex-row gap-2">
                                <Skeleton className="h-9 flex-1 rounded-lg" />
                                <Skeleton className="h-9 flex-1 rounded-lg" />
                            </View>
                        </CardContent>
                    </Card>
                ))}
            </View>
        </View>
    );
}

export function BodyMetricListScreen({ navigation }: any) {
    const [metrics, setMetrics] = useState<BodyMetricResponse[]>([]);
    const [latestMetric, setLatestMetric] = useState<BodyMetricResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadMetrics = async () => {
        try {
            setLoading(true);
            const profile = await getUserProfileFromStorage();
            if (!profile?.id) {
                notifyAlert('Lỗi', 'Không xác định người dùng. Vui lòng đăng xuất và đăng nhập lại.');
                setMetrics([]);
                setLatestMetric(null);
                return;
            }
            const data = await getUserBodyMetrics(profile.id);
            setMetrics(data);

            if (data.length > 0) {
                const latest = await getLatestBodyMetric(profile.id);
                setLatestMetric(latest);
            }
        } catch (error: any) {
            notifyAlert('Lỗi', error.message || 'Không thể tải dữ liệu số đo');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadMetrics();
        setRefreshing(false);
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadMetrics();
        });

        return unsubscribe;
    }, [navigation]);

    const handleDelete = (id: string) => {
        confirmAction(
            'Xác nhận xóa',
            'Bạn có chắc chắn muốn xóa số đo này?',
            async () => {
                try {
                    await deleteBodyMetric(id);
                    notifyAlert('Thành công', 'Đã xóa số đo');
                    loadMetrics();
                } catch (error: any) {
                    notifyAlert('Lỗi', error.message || 'Không thể xóa số đo');
                }
            },
            'Xóa',
            'Hủy'
        );
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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
                                <Text className="text-xl font-bold text-white">Số đo cơ thể</Text>
                                <Text className="text-white/70 text-sm">Theo dõi chiều cao, cân nặng</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('BodyMetricForm')}
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
                    <BodyMetricListSkeleton />
                ) : metrics.length === 0 ? (
                    <View className="items-center py-12">
                        <Activity color="#9ca3af" size={48} className="mb-4" />
                        <Text className="text-lg text-gray-500 mb-2">Chưa có số đo nào</Text>
                        <Text className="text-sm text-gray-400">Nhấn nút + để thêm số đo</Text>
                    </View>
                ) : (
                    <View className="space-y-4">
                        {latestMetric && (
                            <Card className="border-2 border-orange-500 shadow-lg">
                                <CardContent className="p-4">
                                    <View className="flex-row items-center mb-3">
                                        <TrendingUp color="#f97316" size={24} />
                                        <Text className="text-lg font-bold text-orange-600 ml-2">
                                            SỐ ĐO MỚI NHẤT
                                        </Text>
                                    </View>
                                    <View className="space-y-2">
                                        <View className="flex-row justify-between">
                                            <Text className="text-gray-600">Chiều cao:</Text>
                                            <Text className="font-bold text-gray-900">{latestMetric.heightCm} cm</Text>
                                        </View>
                                        <View className="flex-row justify-between">
                                            <Text className="text-gray-600">Cân nặng:</Text>
                                            <Text className="font-bold text-gray-900">{latestMetric.weightKg} kg</Text>
                                        </View>

                                        <View className="flex-row justify-between pt-2 border-t border-gray-200">
                                            <Text className="text-xs text-gray-500">{formatDate(latestMetric.createdAt)}</Text>
                                        </View>
                                    </View>
                                </CardContent>
                            </Card>
                        )}

                        <WeightChart metrics={metrics} />
                        <View className="mt-4">
                            <Text className="text-lg font-bold text-gray-900 mb-3">📜 Lịch sử</Text>
                            <View className="space-y-3">
                                {metrics.map((metric) => (
                                    <Card key={metric.id} className="border-none shadow-sm">
                                        <CardContent className="p-3">
                                            <View className="flex-row items-center justify-between mb-2">
                                                <Text className="text-sm font-medium text-gray-900">
                                                    📅 {formatDate(metric.createdAt)}
                                                </Text>
                                            </View>
                                            <Text className="text-sm text-gray-600 mb-3">
                                                {metric.heightCm}cm | {metric.weightKg}kg
                                            </Text>

                                            <View className="flex-row gap-2">
                                                <TouchableOpacity
                                                    onPress={() => navigation.navigate('BodyMetricForm', { metric })}
                                                    className="flex-1 flex-row items-center justify-center bg-blue-50 rounded-lg py-2"
                                                    activeOpacity={0.7}
                                                >
                                                    <Edit2 color="#3b82f6" size={14} />
                                                    <Text className="ml-1 text-blue-600 text-sm font-medium">Sửa</Text>
                                                </TouchableOpacity>

                                                <TouchableOpacity
                                                    onPress={() => handleDelete(metric.id)}
                                                    className="flex-1 flex-row items-center justify-center bg-red-50 rounded-lg py-2"
                                                    activeOpacity={0.7}
                                                >
                                                    <Trash2 color="#ef4444" size={14} />
                                                    <Text className="ml-1 text-red-600 text-sm font-medium">Xóa</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </CardContent>
                                    </Card>
                                ))}
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

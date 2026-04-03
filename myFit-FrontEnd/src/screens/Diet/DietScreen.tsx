import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, RefreshControl, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Plus, Coffee, Sun, Moon, Apple, Calendar } from 'lucide-react-native';

import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Progress } from '../../components/ui/Progress';
import { Skeleton } from '../../components/ui/Skeleton';
import {
    addFoodToMeal,
    ensureDailyMeals,
    getFoodsLite,
    getFoodImagesByIds,
    getMealFoodsByMealId,
} from '../../services/foodService';
import { getLatestBodyMetric } from '../../services/bodyMetricService';
import type { BodyMetricResponse, FoodResponse, MealFoodResponse, MealResponse } from '../../types';
import { MealType } from '../../types';
import { useAppSelector } from '../../hooks/redux';
import { calculateDailyCaloriesTarget, DEFAULT_DAILY_CALORIES_TARGET } from '../../utils/calories';
import { notifyAlert } from '../../utils/notification';

const MEAL_META: Record<MealType, {
    label: string;
    max: number;
    icon: typeof Coffee;
    startColor: string;
    endColor: string;
}> = {
    [MealType.BREAKFAST]: {
        label: 'Bữa sáng',
        max: 600,
        icon: Coffee,
        startColor: '#fbbf24',
        endColor: '#fb923c',
    },
    [MealType.LUNCH]: {
        label: 'Bữa trưa',
        max: 800,
        icon: Sun,
        startColor: '#fb923c',
        endColor: '#f87171',
    },
    [MealType.SNACK]: {
        label: 'Bữa chiều',
        max: 400,
        icon: Apple,
        startColor: '#4ade80',
        endColor: '#34d399',
    },
    [MealType.DINNER]: {
        label: 'Bữa tối',
        max: 700,
        icon: Moon,
        startColor: '#60a5fa',
        endColor: '#818cf8',
    },
};

const MEAL_ORDER: MealType[] = [
    MealType.BREAKFAST,
    MealType.LUNCH,
    MealType.SNACK,
    MealType.DINNER,
];

function DietScreenSkeleton() {
    return (
        <View className="flex-1 bg-gray-50">
            <View className="rounded-b-[32px] overflow-hidden">
                <LinearGradient colors={['#f97316', '#ef4444']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} className="pb-6">
                    <SafeAreaView edges={['top', 'left', 'right']} className="px-6 pt-4">
                        <View className="flex-row items-center gap-4 mb-6">
                            <Skeleton className="w-10 h-10 rounded-full bg-white/30" />
                            <Skeleton className="h-7 w-44 bg-white/30" />
                            <Skeleton className="w-10 h-10 rounded-full bg-white/30 ml-auto" />
                        </View>
                        <View className="bg-white/20 rounded-2xl p-6">
                            <Skeleton className="h-6 w-24 self-center mb-3 bg-white/30" />
                            <Skeleton className="h-10 w-28 self-center mb-2 bg-white/30" />
                            <Skeleton className="h-2 w-full mb-3 bg-white/30" />
                            <Skeleton className="h-4 w-36 self-center bg-white/30" />
                        </View>
                    </SafeAreaView>
                </LinearGradient>
            </View>
            <ScrollView className="flex-1 px-6 pt-4" contentContainerStyle={{ paddingBottom: 100 }}>
                <View className="flex-row justify-between items-center mb-4 mt-2">
                    <Skeleton className="h-6 w-36" />
                    <Skeleton className="h-8 w-24 rounded-lg" />
                </View>
                {[0, 1, 2, 3].map((idx) => (
                    <Card key={idx} className="mb-4">
                        <CardContent className="p-4">
                            <View className="flex-row items-center justify-between mb-3">
                                <Skeleton className="h-5 w-28" />
                                <Skeleton className="h-5 w-16" />
                            </View>
                            <Skeleton className="h-10 w-full rounded-xl" />
                        </CardContent>
                    </Card>
                ))}
            </ScrollView>
        </View>
    );
}

export function DietScreen({ navigation }: any) {
    const user = useAppSelector(state => state.auth.user);

    const currentUserId = useMemo(() => {
        if (!user) return '';
        return user.id || user.userId || user.user_id || user.sub || '';
    }, [user]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [addingFood, setAddingFood] = useState(false);

    const [foods, setFoods] = useState<FoodResponse[]>([]);
    const [latestBodyMetric, setLatestBodyMetric] = useState<BodyMetricResponse | null>(null);
    const [mealsByType, setMealsByType] = useState<Record<MealType, MealResponse | null>>({
        [MealType.BREAKFAST]: null,
        [MealType.LUNCH]: null,
        [MealType.SNACK]: null,
        [MealType.DINNER]: null,
    });
    const [mealFoodsByMealId, setMealFoodsByMealId] = useState<Record<string, MealFoodResponse[]>>({});

    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedMealType, setSelectedMealType] = useState<MealType>(MealType.BREAKFAST);
    const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [quantityText, setQuantityText] = useState('100');

    const foodNameById = useMemo(() => {
        const map: Record<string, string> = {};
        foods.forEach(food => {
            map[food.id] = food.name;
        });
        return map;
    }, [foods]);

    const filteredFoods = useMemo(() => {
        if (!searchKeyword.trim()) return foods;
        const keyword = searchKeyword.trim().toLowerCase();
        return foods.filter(food => food.name.toLowerCase().includes(keyword));
    }, [foods, searchKeyword]);

    const mealCards = useMemo(() => {
        return MEAL_ORDER.map(type => {
            const meta = MEAL_META[type];
            const meal = mealsByType[type];
            const mealFoods = meal ? (mealFoodsByMealId[meal.id] ?? []) : [];
            const calories = mealFoods.reduce((sum, item) => sum + (item.calories ?? 0), 0);

            return {
                mealType: type,
                meal,
                mealFoods,
                calories,
                ...meta,
            };
        });
    }, [mealsByType, mealFoodsByMealId]);

    const totalCalories = mealCards.reduce((sum, meal) => sum + meal.calories, 0);
    const targetCalories = calculateDailyCaloriesTarget(latestBodyMetric, DEFAULT_DAILY_CALORIES_TARGET);
    const remainingCalories = targetCalories - totalCalories;

    const loadRequestRef = React.useRef(0);

    const loadDietData = async (isRefresh = false) => {
        if (!currentUserId) {
            setLoading(false);
            setRefreshing(false);
            notifyAlert('Lỗi', 'Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
            return;
        }

        const loadId = ++loadRequestRef.current;

        try {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);

            const today = new Date();

            const [ensuredMeals, foodList, bodyMetric] = await Promise.all([
                ensureDailyMeals(today, currentUserId),
                getFoodsLite(0, 200).catch(() => [] as FoodResponse[]),
                getLatestBodyMetric(currentUserId).catch(() => null),
            ]);

            const byType: Record<MealType, MealResponse | null> = {
                [MealType.BREAKFAST]: null,
                [MealType.LUNCH]: null,
                [MealType.SNACK]: null,
                [MealType.DINNER]: null,
            };

            ensuredMeals.forEach(meal => {
                byType[meal.mealType] = meal;
            });

            const mealFoodsEntries = await Promise.all(
                ensuredMeals.map(async meal => {
                    const items = await getMealFoodsByMealId(meal.id).catch(() => [] as MealFoodResponse[]);
                    return [meal.id, items] as const;
                }),
            );

            const mealFoodsMap: Record<string, MealFoodResponse[]> = Object.fromEntries(mealFoodsEntries);

            setMealsByType(byType);
            setMealFoodsByMealId(mealFoodsMap);
            setFoods(foodList);
            setLatestBodyMetric(bodyMetric);
            const foodIds = foodList.map(f => f.id);
            if (foodIds.length > 0) {
                void getFoodImagesByIds(foodIds).then(imageMap => {
                    if (loadRequestRef.current !== loadId) return;
                    setFoods(prev => prev.map(food => ({
                        ...food,
                        imageUrl: imageMap[food.id] ?? food.imageUrl ?? null,
                    })));
                });
            }
        } catch (error: any) {
            notifyAlert('Lỗi', error?.message || 'Không thể tải dữ liệu dinh dưỡng.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadDietData();
    }, [currentUserId]);

    const openAddFoodModal = (mealType?: MealType) => {
        if (mealType) {
            setSelectedMealType(mealType);
        }
        setSelectedFoodId(null);
        setSearchKeyword('');
        setQuantityText('100');
        setShowAddModal(true);
    };

    const handleAddFood = async () => {
        if (addingFood) return;

        const meal = mealsByType[selectedMealType];
        if (!meal) {
            notifyAlert('Lỗi', 'Không tìm thấy bữa ăn tương ứng. Vui lòng thử tải lại.');
            return;
        }
        if (!selectedFoodId) {
            notifyAlert('Lỗi', 'Vui lòng chọn một món ăn.');
            return;
        }

        const quantity = Number(quantityText);
        if (!Number.isFinite(quantity) || quantity <= 0) {
            notifyAlert('Lỗi', 'Số lượng không hợp lệ.');
            return;
        }

        try {
            setAddingFood(true);
            await addFoodToMeal({
                mealId: meal.id,
                foodId: selectedFoodId,
                quantity,
            });

            setShowAddModal(false);
            await loadDietData(true);
        } catch (error: any) {
            notifyAlert('Lỗi', error?.message || 'Không thể thêm món vào bữa ăn.');
        } finally {
            setAddingFood(false);
        }
    };

    if (loading) {
        return <DietScreenSkeleton />;
    }

  return (
    <View className="flex-1 bg-gray-50">
            <View className="rounded-b-[32px] overflow-hidden">
                <LinearGradient
                    colors={['#f97316', '#ef4444']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="pb-6"
                >
                    <SafeAreaView edges={['top', 'left', 'right']} className="px-6 pt-4">
                        <View className="flex-row items-center gap-4 mb-6">
                            <Button
                                variant="ghost"
                                size="icon"
                                onPress={() => navigation.goBack()}
                                className="bg-white/10"
                            >
                                <ArrowLeft color="white" size={24} />
                            </Button>
                            <Text className="text-2xl font-bold text-white flex-1">Quản lý Calo</Text>
                            <Button
                                variant="ghost"
                                size="icon"
                                onPress={() => navigation.navigate('DietHistory')}
                                className="bg-white/10"
                            >
                                <Calendar color="white" size={22} />
                            </Button>
                        </View>

                        <View className="bg-white/20 rounded-2xl p-6">
                            <View className="items-center mb-4">
                                <Text className="text-white/80 text-sm mb-1">Hôm nay</Text>
                                <Text className="text-4xl font-bold text-white">{totalCalories}</Text>
                                <Text className="text-white/80 text-sm">/ {targetCalories} kcal</Text>
                            </View>
                            <Progress
                                value={(totalCalories / targetCalories) * 100}
                                className="h-2 bg-white/20"
                                indicatorClassName="bg-white"
                            />
                            <Text className="text-center text-sm text-white/90 mt-3">
                                Còn lại: {remainingCalories} kcal
                            </Text>
                        </View>
                    </SafeAreaView>
                </LinearGradient>
            </View>

            <ScrollView
                className="flex-1 px-6 pt-4"
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => loadDietData(true)}
                        colors={['#f97316']}
                    />
                }
            >
                <View className="flex-row justify-between items-center mb-4 mt-2">
                    <Text className="text-lg font-bold text-gray-900">Bữa ăn hôm nay</Text>
                    <Button
                        size="sm"
                        className="bg-orange-500 flex-row items-center h-8 px-3"
                        onPress={() => openAddFoodModal()}
                    >
                        <Plus color="white" size={16} className="mr-1" />
                        <Text className="text-white font-medium text-xs">Thêm món</Text>
                    </Button>
                </View>

                <View className="space-y-4">
                    {mealCards.map((meal) => {
                        const Icon = meal.icon;
                        const percentage = (meal.calories / meal.max) * 100;

                        return (
                            <Card key={meal.mealType} className="border-0 shadow-sm mb-4 overflow-hidden">
                                <View className="flex-row">
                                    <LinearGradient
                                        colors={[meal.startColor, meal.endColor]}
                                        className="w-20 items-center justify-center"
                                    >
                                        <Icon color="white" size={32} />
                                    </LinearGradient>
                                    <CardContent className="flex-1 p-4 bg-white">
                                        <View className="flex-row justify-between items-start mb-2">
                                            <Text className="font-bold text-gray-900 text-base">{meal.label}</Text>
                                            <Text className="text-sm text-gray-500">
                                                {Math.round(meal.calories)}/{meal.max} kcal
                                            </Text>
                                        </View>
                                        <Progress value={percentage} className="h-2" />

                                        <View className="mt-3 gap-1">
                                            {meal.mealFoods.length === 0 ? (
                                                <Text className="text-gray-400 text-xs">Chưa có món ăn nào.</Text>
                                            ) : (
                                                meal.mealFoods.slice(0, 3).map(item => (
                                                    <Text key={item.id} className="text-gray-500 text-xs" numberOfLines={1} ellipsizeMode="tail">
                                                        • {foodNameById[item.foodId] ?? 'Món ăn'} ({Math.round(item.quantity)}g) — {Math.round(item.calories)} kcal
                                                    </Text>
                                                ))
                                            )}
                                        </View>

                                        <TouchableOpacity className="mt-3" onPress={() => openAddFoodModal(meal.mealType)}>
                                            <Text className="text-orange-500 text-xs font-bold">THÊM MÓN</Text>
                                        </TouchableOpacity>
                                    </CardContent>
                                </View>
                            </Card>
                        );
                    })}
                </View>
            </ScrollView>

            <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={() => setShowAddModal(false)}>
                <View className="flex-1 bg-black/40 justify-end">
                    <View className="bg-white rounded-t-3xl px-5 pt-5 pb-8 max-h-[85%]">
                        <Text className="text-lg font-bold text-gray-900 mb-3">Thêm món vào bữa ăn</Text>

                        <View className="flex-row flex-wrap gap-2 mb-3">
                            {MEAL_ORDER.map(type => (
                                <TouchableOpacity
                                    key={type}
                                    onPress={() => setSelectedMealType(type)}
                                    className={`px-3 py-2 rounded-full border ${selectedMealType === type ? 'bg-orange-500 border-orange-500' : 'bg-white border-gray-200'}`}
                                >
                                    <Text className={`${selectedMealType === type ? 'text-white' : 'text-gray-700'} text-xs font-semibold`}>
                                        {MEAL_META[type].label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TextInput
                            value={searchKeyword}
                            onChangeText={setSearchKeyword}
                            placeholder="Tìm món ăn..."
                            className="bg-gray-100 rounded-xl px-4 py-3 mb-3"
                        />

                        <View className="flex-row items-center mb-3">
                            <Text className="text-gray-700 mr-2">Khối lượng (g):</Text>
                            <TextInput
                                value={quantityText}
                                onChangeText={setQuantityText}
                                keyboardType="decimal-pad"
                                className="flex-1 bg-gray-100 rounded-xl px-3 py-2"
                            />
                        </View>

                        <ScrollView className="max-h-60 mb-4">
                            {filteredFoods.map(food => (
                                <TouchableOpacity
                                    key={food.id}
                                    onPress={() => setSelectedFoodId(food.id)}
                                    className={`px-3 py-3 rounded-xl mb-2 border ${selectedFoodId === food.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white'}`}
                                >
                                    <View className="flex-row items-center">
                                        {food.imageUrl ? (
                                            <Image
                                                source={{ uri: food.imageUrl }}
                                                className="w-12 h-12 rounded-lg mr-3"
                                                resizeMode="cover"
                                            />
                                        ) : (
                                            <View className="w-12 h-12 rounded-lg mr-3 bg-orange-100 items-center justify-center">
                                                <Apple color="#f97316" size={18} />
                                            </View>
                                        )}

                                        <View className="flex-1">
                                            <Text className="text-gray-900 font-semibold">{food.name}</Text>
                                            <Text className="text-gray-500 text-xs mt-1">
                                                {Math.round(food.caloriesPer100g)} kcal · P {Math.round(food.proteinPer100g)}g · C {Math.round(food.carbsPer100g)}g · F {Math.round(food.fatsPer100g)}g / 100g
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                            {filteredFoods.length === 0 && (
                                <Text className="text-gray-400 text-center py-4">Không tìm thấy món ăn phù hợp.</Text>
                            )}
                        </ScrollView>

                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={() => setShowAddModal(false)}
                                className="flex-1 border border-gray-200 rounded-2xl py-3 items-center"
                            >
                                <Text className="text-gray-600 font-semibold">Đóng</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleAddFood}
                                disabled={addingFood}
                                className="flex-1 bg-orange-500 rounded-2xl py-3 items-center"
                                style={{ opacity: addingFood ? 0.8 : 1 }}
                            >
                                <Text className="text-white font-semibold">{addingFood ? 'Đang thêm...' : 'Thêm món'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
    </View>
  );
}

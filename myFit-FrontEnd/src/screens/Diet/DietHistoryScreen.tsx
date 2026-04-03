import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react-native';

import { useAppSelector } from '../../hooks/redux';
import {
  getFoods,
  getMealFoodsByMealId,
  getMealsByUser,
} from '../../services/foodService';
import type { FoodResponse, MealFoodResponse, MealResponse } from '../../types';
import { MealType } from '../../types';
import { notifyAlert } from '../../utils/notification';
import { Skeleton } from '../../components/ui/Skeleton';

const DAYS_OF_WEEK = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const MONTH_LABELS = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
];

const MEAL_ORDER: MealType[] = [
  MealType.BREAKFAST,
  MealType.LUNCH,
  MealType.SNACK,
  MealType.DINNER,
];

const MEAL_LABEL: Record<MealType, string> = {
  [MealType.BREAKFAST]: 'Bữa sáng',
  [MealType.LUNCH]: 'Bữa trưa',
  [MealType.SNACK]: 'Bữa chiều',
  [MealType.DINNER]: 'Bữa tối',
};

function toLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const d = new Date(year, month, 1);
  while (d.getMonth() === month) {
    days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
}

function parseMealDate(meal: MealResponse): string {
  return meal.date.slice(0, 10);
}

export function DietHistoryScreen({ navigation }: any) {
  const user = useAppSelector(state => state.auth.user);

  const userId = useMemo(() => {
    if (!user) return '';
    return user.id || user.userId || user.user_id || user.sub || '';
  }, [user]);

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(toLocalDate(today));

  const [loadingMonth, setLoadingMonth] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [allFoods, setAllFoods] = useState<FoodResponse[]>([]);
  const [monthlyMeals, setMonthlyMeals] = useState<MealResponse[]>([]);
  const [selectedMealFoods, setSelectedMealFoods] = useState<Record<string, MealFoodResponse[]>>({});

  const foodNameById = useMemo(() => {
    const map: Record<string, string> = {};
    allFoods.forEach(food => {
      map[food.id] = food.name;
    });
    return map;
  }, [allFoods]);

  const mealsByDate = useMemo(() => {
    return monthlyMeals.reduce<Record<string, MealResponse[]>>((acc, meal) => {
      const key = parseMealDate(meal);
      if (!acc[key]) acc[key] = [];
      acc[key].push(meal);
      return acc;
    }, {});
  }, [monthlyMeals]);

  const selectedMeals = useMemo(() => {
    const list = mealsByDate[selectedDate] ?? [];
    return [...list].sort((a, b) => MEAL_ORDER.indexOf(a.mealType) - MEAL_ORDER.indexOf(b.mealType));
  }, [mealsByDate, selectedDate]);

  const loadMonthData = useCallback(async () => {
    if (!userId) return;

    setLoadingMonth(true);
    try {
      const [meals, foods] = await Promise.all([
        getMealsByUser(userId),
        getFoods(0, 300).catch(() => []),
      ]);

      const monthMeals = meals.filter(meal => {
        const d = parseLocalDate(parseMealDate(meal));
        return d.getFullYear() === viewYear && d.getMonth() === viewMonth;
      });

      setMonthlyMeals(monthMeals);
      setAllFoods(foods);
    } catch (error: any) {
      notifyAlert('Lỗi', error?.message || 'Không thể tải lịch sử bữa ăn.');
      setMonthlyMeals([]);
    } finally {
      setLoadingMonth(false);
    }
  }, [userId, viewYear, viewMonth]);

  useEffect(() => {
    loadMonthData();
  }, [loadMonthData]);

  useEffect(() => {
    if (!userId || selectedMeals.length === 0) {
      setSelectedMealFoods({});
      return;
    }

    (async () => {
      setLoadingDetail(true);
      try {
        const entries = await Promise.all(
          selectedMeals.map(async meal => {
            const foods = await getMealFoodsByMealId(meal.id).catch(() => [] as MealFoodResponse[]);
            return [meal.id, foods] as const;
          }),
        );

        setSelectedMealFoods(Object.fromEntries(entries));
      } finally {
        setLoadingDetail(false);
      }
    })();
  }, [userId, selectedMeals]);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewYear(y => y - 1);
      setViewMonth(11);
      return;
    }
    setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewYear(y => y + 1);
      setViewMonth(0);
      return;
    }
    setViewMonth(m => m + 1);
  };

  const days = getDaysInMonth(viewYear, viewMonth);
  const firstDayOfWeek = days[0]?.getDay() ?? 0;
  const paddingDays = Array(firstDayOfWeek).fill(null);

  return (
    <View className="flex-1 bg-gray-50">
      <View className="rounded-b-[28px] overflow-hidden">
        <LinearGradient
          colors={['#f97316', '#ef4444']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="pb-5"
        >
          <SafeAreaView edges={['top', 'left', 'right']} className="px-5 pt-3">
            <View className="flex-row items-center gap-3 mb-5">
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
              >
                <ArrowLeft color="white" size={20} />
              </TouchableOpacity>
              <Text className="text-white font-bold text-lg flex-1">Lịch sử bữa ăn</Text>
              <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
                <Calendar color="white" size={18} />
              </View>
            </View>

            <View className="flex-row items-center justify-between mb-4">
              <TouchableOpacity
                onPress={prevMonth}
                className="w-8 h-8 bg-white/20 rounded-full items-center justify-center"
              >
                <ChevronLeft color="white" size={18} />
              </TouchableOpacity>
              <Text className="text-white font-bold text-base">
                {MONTH_LABELS[viewMonth]} {viewYear}
              </Text>
              <TouchableOpacity
                onPress={nextMonth}
                className="w-8 h-8 bg-white/20 rounded-full items-center justify-center"
              >
                <ChevronRight color="white" size={18} />
              </TouchableOpacity>
            </View>

            <View className="flex-row mb-2">
              {DAYS_OF_WEEK.map(d => (
                <View key={d} className="flex-1 items-center">
                  <Text className="text-white/70 text-xs font-semibold">{d}</Text>
                </View>
              ))}
            </View>

            {loadingMonth ? (
              <View className="h-32 justify-center px-2">
                {Array.from({ length: 3 }).map((_, row) => (
                  <View key={row} className="flex-row mb-2">
                    {Array.from({ length: 7 }).map((__, col) => (
                      <View key={`${row}-${col}`} className="flex-1 items-center">
                        <Skeleton className="w-7 h-7 rounded-full bg-white/35" />
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            ) : (
              (() => {
                const cells = [...paddingDays, ...days];
                const weeks: (Date | null)[][] = [];
                for (let i = 0; i < cells.length; i += 7) {
                  weeks.push(cells.slice(i, i + 7) as (Date | null)[]);
                }

                return weeks.map((week, wi) => (
                  <View key={wi} className="flex-row mb-1">
                    {week.map((date, di) => {
                      if (!date) {
                        return <View key={`pad-${di}`} className="flex-1 h-9" />;
                      }

                      const dateStr = toLocalDate(date);
                      const isToday = dateStr === toLocalDate(today);
                      const isSelected = dateStr === selectedDate;
                      const hasMeals = (mealsByDate[dateStr]?.length ?? 0) > 0;

                      return (
                        <TouchableOpacity
                          key={dateStr}
                          onPress={() => setSelectedDate(dateStr)}
                          className="flex-1 h-9 items-center justify-center"
                          activeOpacity={0.7}
                        >
                          <View
                            className={`w-8 h-8 rounded-full items-center justify-center ${
                              isSelected ? 'bg-white' : isToday ? 'bg-white/30' : 'bg-transparent'
                            }`}
                          >
                            <Text
                              className={`text-sm font-semibold ${
                                isSelected ? 'text-orange-600' : 'text-white'
                              }`}
                            >
                              {date.getDate()}
                            </Text>
                          </View>
                          {hasMeals && (
                            <View
                              className={`w-1 h-1 rounded-full mt-0.5 ${
                                isSelected ? 'bg-orange-500' : 'bg-white'
                              }`}
                            />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ));
              })()
            )}
          </SafeAreaView>
        </LinearGradient>
      </View>

      <ScrollView className="flex-1 px-5 pt-5" contentContainerStyle={{ paddingBottom: 100 }}>
        <Text className="text-sm font-bold text-gray-500 uppercase mb-3">
          {parseLocalDate(selectedDate).toLocaleDateString('vi-VN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </Text>

        {loadingDetail ? (
          <View className="py-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <View key={idx} className="bg-white rounded-2xl p-4 mb-3">
                <View className="flex-row items-center mb-3">
                  <Skeleton className="w-10 h-10 rounded-full mr-3" />
                  <View className="flex-1">
                    <Skeleton className="h-4 w-28 mb-2" />
                    <Skeleton className="h-3 w-36" />
                  </View>
                </View>
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-4/5" />
              </View>
            ))}
          </View>
        ) : selectedMeals.length === 0 ? (
          <View className="items-center py-12">
            <Text className="text-gray-400 text-base">Không có dữ liệu bữa ăn ngày này.</Text>
          </View>
        ) : (
          selectedMeals.map(meal => {
            const mealFoods = selectedMealFoods[meal.id] ?? [];
            const totalCalories = mealFoods.reduce((sum, item) => sum + (item.calories ?? 0), 0);

            return (
              <View
                key={meal.id}
                className="bg-white rounded-2xl p-4 flex-col mb-3"
                style={{
                  elevation: 2,
                  shadowColor: '#000',
                  shadowOpacity: 0.06,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 2 },
                }}
              >
                <View className="flex-row items-center mb-2">
                  <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center mr-3">
                    <Clock color="#f97316" size={18} />
                  </View>
                  <View className="flex-1">
                    <Text className="font-bold text-gray-900">{MEAL_LABEL[meal.mealType]}</Text>
                    <Text className="text-gray-400 text-xs mt-0.5">
                      {mealFoods.length} món · {Math.round(totalCalories)} kcal
                    </Text>
                  </View>
                </View>

                {mealFoods.length > 0 && (
                  <View className="bg-gray-50 rounded-xl p-3 mt-1">
                    {mealFoods.slice(0, 4).map(item => (
                      <View key={item.id} className="flex-row justify-between mb-1">
                        <Text className="text-gray-600 text-xs font-medium flex-1" numberOfLines={1}>
                          • {foodNameById[item.foodId] ?? 'Món ăn'} ({Math.round(item.quantity)}g)
                        </Text>
                        <Text className="text-gray-400 text-xs">{Math.round(item.calories)} kcal</Text>
                      </View>
                    ))}
                    {mealFoods.length > 4 && (
                      <Text className="text-gray-400 text-xs italic mt-1">
                        + {mealFoods.length - 4} món khác
                      </Text>
                    )}
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft, Plus, Coffee, Sun, Moon, Apple } from 'lucide-react-native';

import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Progress } from '../../components/ui/Progress';

interface CaloriesScreenProps {
  onBack: () => void;
}

export function CaloriesScreen({ onBack }: CaloriesScreenProps) {
  const [meals] = useState([
    { id: 1, name: 'Bữa sáng', calories: 450, max: 600, icon: Coffee, color: 'from-yellow-400 to-orange-400' },
    { id: 2, name: 'Bữa trưa', calories: 720, max: 800, icon: Sun, color: 'from-orange-400 to-red-400' },
    { id: 3, name: 'Bữa chiều', calories: 320, max: 400, icon: Apple, color: 'from-green-400 to-emerald-400' },
    { id: 4, name: 'Bữa tối', calories: 0, max: 700, icon: Moon, color: 'from-blue-400 to-indigo-400' },
  ]);

  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const targetCalories = 2500;
  const remainingCalories = targetCalories - totalCalories;

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <LinearGradient
        colors={['#f97316', '#ef4444']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="p-6 pb-12 rounded-b-[2rem]"
      >
        <SafeAreaView edges={['top']}>
          <View className="flex-row items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onPress={onBack}
              className="bg-white/10"
            >
              <ArrowLeft color="white" size={24} />
            </Button>
            <Text className="text-2xl font-bold text-white">Quản lý Calo</Text>
          </View>

          {/* Stats */}
          <View className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
            <View className="items-center mb-4">
              <Text className="text-white/80 text-sm mb-1">Hôm nay</Text>
              <Text className="text-4xl font-bold text-white">{totalCalories}</Text>
              <Text className="text-white/80 text-sm">/ {targetCalories} kcal</Text>
            </View>
            <Progress
              value={(totalCalories / targetCalories) * 100}
              className="h-2 bg-white/20"
            />
            <Text className="text-center text-sm text-white/90 mt-3">
              Còn lại: {remainingCalories} kcal
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView className="flex-1 px-6 -mt-6">
        {/* Meals */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-bold text-gray-900">Bữa ăn hôm nay</Text>
          <Button className="bg-orange-500 h-9" textClassName="text-white">
            <Plus color="white" size={16} /> Thêm món
          </Button>
        </View>

        <View className="space-y-4 mb-8">
          {meals.map((meal, index) => {
            const Icon = meal.icon;
            const percentage = (meal.calories / meal.max) * 100;

            return (
              <Animated.View
                key={meal.id}
                entering={FadeInDown.delay(index * 100)}
              >
                <Card className="border-0 shadow-md overflow-hidden">
                  <CardContent className="p-0">
                    <View className="flex-row">
                      <LinearGradient
                        colors={meal.color === 'from-yellow-400 to-orange-400' ? ['#facc15', '#f97316'] :
                          meal.color === 'from-orange-400 to-red-400' ? ['#fb923c', '#ef4444'] :
                            meal.color === 'from-green-400 to-emerald-400' ? ['#4ade80', '#10b981'] :
                              ['#60a5fa', '#6366f1']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="w-20 items-center justify-center"
                      >
                        <Icon color="white" size={32} />
                      </LinearGradient>
                      <View className="flex-1 p-4">
                        <View className="flex-row justify-between items-start mb-2">
                          <Text className="font-bold text-gray-900">
                            {meal.name}
                          </Text>
                          <Text className="text-sm text-gray-500">
                            {meal.calories}/{meal.max} kcal
                          </Text>
                        </View>
                        <Progress value={percentage} className="h-2 mb-2" />
                        <Button
                          variant="ghost"
                          className="h-8 px-2 text-orange-600"
                        >
                          <Plus color="#f97316" size={16} />
                          <Text className="text-orange-600 ml-1">Thêm món ăn</Text>
                        </Button>
                      </View>
                    </View>
                  </CardContent>
                </Card>
              </Animated.View>
            );
          })}
        </View>

        {/* Food Suggestions */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Gợi ý thực phẩm
          </Text>
          <View className="flex-row gap-4">
            {[
              { name: 'Salad gà', cal: 320, img: 'https://images.unsplash.com/photo-1708987379841-2badb0d3a95a?w=400' },
              { name: 'Cơm gạo lứt', cal: 280, img: 'https://images.unsplash.com/photo-1708987379841-2badb0d3a95a?w=400' },
            ].map((food, index) => (
              <Card key={index} className="flex-1 border-0 shadow-md overflow-hidden">
                <CardContent className="p-0">
                  <Image
                    source={{ uri: food.img }}
                    className="w-full h-32"
                    resizeMode="cover"
                  />
                  <View className="p-3">
                    <Text className="font-semibold text-gray-900 text-sm">
                      {food.name}
                    </Text>
                    <Text className="text-xs text-gray-500 mt-1">{food.cal} kcal</Text>
                    <Button
                      className="w-full mt-2 bg-orange-500 h-8"
                      textClassName="text-white"
                    >
                      <Plus color="white" size={12} /> Thêm
                    </Button>
                  </View>
                </CardContent>
              </Card>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

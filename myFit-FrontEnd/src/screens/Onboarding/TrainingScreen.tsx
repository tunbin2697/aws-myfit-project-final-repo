import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft, Plus, Check } from 'lucide-react-native';

import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';

interface TrainingScreenProps {
  onBack: () => void;
}

export function TrainingScreen({ onBack }: TrainingScreenProps) {
  const [selectedDay, setSelectedDay] = useState('Thứ 2');
  const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];

  const workoutPlan: Record<string, Array<{ name: string; sets: string; completed: boolean }>> = {
    'Thứ 2': [
      { name: 'Bench Press', sets: '4x12', completed: false },
      { name: 'Dumbbell Flyes', sets: '3x15', completed: false },
      { name: 'Shoulder Press', sets: '4x10', completed: false },
      { name: 'Lateral Raises', sets: '3x12', completed: false },
    ],
    'Thứ 3': [
      { name: 'Squat', sets: '4x10', completed: false },
      { name: 'Leg Press', sets: '3x12', completed: false },
      { name: 'Lunges', sets: '3x10', completed: false },
    ],
    'Thứ 4': [{ name: 'Nghỉ ngơi', sets: '', completed: false }],
    'Thứ 5': [
      { name: 'Pull-ups', sets: '4x8', completed: false },
      { name: 'Barbell Rows', sets: '4x10', completed: false },
      { name: 'Bicep Curls', sets: '3x12', completed: false },
    ],
    'Thứ 6': [
      { name: 'Deadlift', sets: '4x8', completed: false },
      { name: 'Leg Curls', sets: '3x12', completed: false },
      { name: 'Calf Raises', sets: '3x15', completed: false },
    ],
    'Thứ 7': [
      { name: 'Cardio HIIT', sets: '20 min', completed: false },
      { name: 'Core Workout', sets: '15 min', completed: false },
    ],
    CN: [{ name: 'Nghỉ ngơi', sets: '', completed: false }],
  };

  const exercises = workoutPlan[selectedDay] || [];

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <LinearGradient
        colors={['#f97316', '#ef4444']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="p-6 pb-8 rounded-b-[2rem]"
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
            <Text className="text-2xl font-bold text-white">Kế hoạch tập luyện</Text>
          </View>

          {/* Days Selector */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
            {days.map((day) => (
              <TouchableOpacity
                key={day}
                onPress={() => setSelectedDay(day)}
                className={`px-4 py-2 rounded-full ${selectedDay === day
                    ? 'bg-white'
                    : 'bg-white/20'
                  }`}
                activeOpacity={0.7}
              >
                <Text className={`font-semibold ${selectedDay === day ? 'text-orange-600' : 'text-white'}`}>
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView className="flex-1 px-6 -mt-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-bold text-gray-900">{selectedDay}</Text>
          <Button className="bg-orange-500 h-9" textClassName="text-white">
            <Plus color="white" size={16} /> Thêm bài tập
          </Button>
        </View>

        {exercises.length === 0 || exercises[0].name === 'Nghỉ ngơi' ? (
          <Card className="border-0 shadow-md">
            <CardContent className="p-8 items-center">
              <View className="w-16 h-16 bg-orange-100 rounded-full items-center justify-center mb-4">
                <Check color="#f97316" size={32} />
              </View>
              <Text className="font-bold text-gray-900 mb-2">Ngày nghỉ ngơi</Text>
              <Text className="text-gray-600 text-sm text-center">
                Hãy thư giãn và phục hồi cơ thể bạn
              </Text>
            </CardContent>
          </Card>
        ) : (
          <View className="space-y-3">
            {exercises.map((exercise, index) => (
              <Animated.View
                key={index}
                entering={FadeInDown.delay(index * 100)}
              >
                <Card className="border-0 shadow-md">
                  <CardContent className="p-4">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-3">
                        <View className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-400 rounded-full items-center justify-center">
                          <Text className="text-white font-bold">{index + 1}</Text>
                        </View>
                        <View>
                          <Text className="font-bold text-gray-900">
                            {exercise.name}
                          </Text>
                          {exercise.sets && (
                            <Text className="text-sm text-gray-500">
                              {exercise.sets}
                            </Text>
                          )}
                        </View>
                      </View>
                      <Button variant="ghost" size="icon">
                        <Check color="#9ca3af" size={20} />
                      </Button>
                    </View>
                  </CardContent>
                </Card>
              </Animated.View>
            ))}
          </View>
        )}

        {/* Weekly Stats */}
        <Card className="mt-8 mb-6 border-0 shadow-md">
          <CardContent className="p-6">
            <Text className="font-bold text-gray-900 mb-4">
              Thống kê tuần này
            </Text>
            <View className="flex-row justify-around">
              <View className="items-center">
                <Text className="text-3xl font-bold text-orange-600">5</Text>
                <Text className="text-sm text-gray-500 mt-1">Buổi tập</Text>
              </View>
              <View className="items-center">
                <Text className="text-3xl font-bold text-orange-600">180</Text>
                <Text className="text-sm text-gray-500 mt-1">Phút</Text>
              </View>
              <View className="items-center">
                <Text className="text-3xl font-bold text-orange-600">42</Text>
                <Text className="text-sm text-gray-500 mt-1">Bài tập</Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Achievements */}
        <View className="mb-6">
          <Text className="font-bold text-gray-900 mb-3">Thành tích</Text>
          <View className="flex-row flex-wrap gap-2">
            <View className="bg-gradient-to-r from-yellow-400 to-orange-400 px-4 py-2 rounded-full">
              <Text className="text-white font-medium">🔥 Chuỗi 7 ngày</Text>
            </View>
            <View className="bg-gradient-to-r from-green-400 to-emerald-400 px-4 py-2 rounded-full">
              <Text className="text-white font-medium">💪 50 bài tập</Text>
            </View>
            <View className="bg-gradient-to-r from-blue-400 to-indigo-400 px-4 py-2 rounded-full">
              <Text className="text-white font-medium">⭐ Người mới</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

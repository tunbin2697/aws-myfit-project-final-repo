import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput as RNTextInput } from 'react-native';
import Slider from '@react-native-community/slider';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  User,
  Activity,
  Target,
  Utensils,
  Dumbbell,
  Users,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Ruler,
  Weight,
  Briefcase,
  Home,
  MapPin,
  Clock,
  Apple,
} from 'lucide-react-native';

import { Button } from '../../components/ui/Button';
import { WheelPicker } from '../../components/ui/WheelPicker';

interface OnboardingData {
  // Step 1
  gender: 'male' | 'female' | null;
  dateOfBirth: string;
  day: string;
  month: string;
  year: string;
  height: number;
  weight: number;
  // Step 2
  activityLevel: string;
  jobType: string;
  // Step 3
  mainGoal: string;
  targetWeight: number;
  targetAreas: string[];
  // Step 4
  diet: string;
  allergies: string[];
  allergiesOther: string;
  mealsPerDay: number;
  waterIntake: number;
  // Step 5
  experienceLevel: string;
  workoutLocations: string[];
  frequency: number;
  duration: number;
}

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
  onBack: () => void;
}

export function OnboardingFlow({ onComplete, onBack }: OnboardingFlowProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    gender: null,
    dateOfBirth: '06/15/2000', // Initial value matching day/month/year
    day: '15',
    month: '06',
    year: '2000',
    height: 170,
    weight: 70,
    activityLevel: '',
    jobType: '',
    mainGoal: '',
    targetWeight: 65,
    targetAreas: [],
    diet: '',
    allergies: [],
    allergiesOther: '',
    mealsPerDay: 3,
    waterIntake: 2,
    experienceLevel: '',
    workoutLocations: [],
    frequency: 3,
    duration: 45,
  });

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onComplete(data);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onBack();
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return data.gender !== null && data.dateOfBirth && data.height && data.weight;
      case 2:
        return data.activityLevel && data.jobType;
      case 3:
        return data.mainGoal && data.targetWeight && data.targetAreas.length > 0;
      case 4:
        return data.diet;
      case 5:
        return data.experienceLevel && data.workoutLocations.length > 0 && data.frequency && data.duration;
      default:
        return false;
    }
  };

  const toggleArrayItem = (array: string[], item: string) => {
    if (array.includes(item)) {
      return array.filter((i) => i !== item);
    }
    return [...array, item];
  };

  return (
    <LinearGradient
      colors={['#f97316', '#ef4444', '#ec4899']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex-1"
    >
      {/* Progress Bar */}
      <View className="bg-white/10 backdrop-blur-sm">
        <View className="h-1 bg-white/20">
          <Animated.View
            className="h-full bg-white rounded-r-full"
            style={{ width: `${progress}%` }}
          />
        </View>
        <View className="px-6 py-4 flex-row justify-between items-center">
          <TouchableOpacity onPress={handlePrevious}>
            <ChevronLeft color="white" size={24} />
          </TouchableOpacity>
          <Text className="text-white font-semibold">
            Bước {step} / {totalSteps}
          </Text>
          <View className="w-6" />
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-6 py-8">
        {step === 1 && <Step1 data={data} updateData={updateData} key="step1" />}
        {step === 2 && <Step2 data={data} updateData={updateData} key="step2" />}
        {step === 3 && <Step3 data={data} updateData={updateData} toggleArrayItem={toggleArrayItem} key="step3" />}
        {step === 4 && <Step4 data={data} updateData={updateData} key="step4" />}
        {step === 5 && <Step5 data={data} updateData={updateData} toggleArrayItem={toggleArrayItem} key="step5" />}
      </ScrollView>

      {/* Next Button */}
      <View className="p-6 bg-white/10 backdrop-blur-sm">
        <Button
          onPress={handleNext}
          disabled={!isStepValid()}
          className={`w-full h-14 rounded-2xl ${isStepValid()
            ? 'bg-white'
            : 'bg-white/30'
            }`}
          textClassName={`font-bold text-lg ${isStepValid() ? 'text-red-500' : 'text-white/50'
            }`}
        >
          {step < totalSteps ? (
            <View className="flex-row items-center justify-center gap-2">
              <Text className={`font-bold text-lg ${isStepValid() ? 'text-red-500' : 'text-white/50'}`}>
                Tiếp theo
              </Text>
              <ChevronRight color={isStepValid() ? '#ef4444' : '#fff'} size={20} />
            </View>
          ) : (
            'Hoàn thành'
          )}
        </Button>
      </View>
    </LinearGradient>
  );
}

// Step 1: The Basics
function Step1({ data, updateData }: any) {
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
  const years = Array.from({ length: 2026 - 1900 + 1 }, (_, i) => String(2026 - i));

  const handlePickerChange = (type: 'day' | 'month' | 'year', value: string | number) => {
    const updates: any = { [type]: String(value) };

    const newDay = type === 'day' ? String(value) : data.day;
    const newMonth = type === 'month' ? String(value) : data.month;
    const newYear = type === 'year' ? String(value) : data.year;

    updates.dateOfBirth = `${newMonth}/${newDay}/${newYear}`;
    updateData(updates);
  };

  return (
    <Animated.View
      entering={FadeInRight}
      exiting={FadeOutLeft}
      className="space-y-6"
    >
      <View className="text-center mb-8">
        <Text className="text-3xl font-bold text-white mb-2">Thông tin cơ bản</Text>
        <Text className="text-white/80">Hãy cho chúng tôi biết về bạn</Text>
      </View>

      {/* Gender */}
      <View className="mb-6">
        <Text className="text-white font-semibold flex-row items-center gap-2 mb-3">
          <Users color="white" size={20} />
          {' '}Giới tính
        </Text>
        <View className="flex-row gap-4">
          <TouchableOpacity
            onPress={() => updateData({ gender: 'male' })}
            className={`flex-1 rounded-2xl p-6 items-center justify-center ${data.gender === 'male' ? 'bg-white/30' : 'bg-white/20'
              }`}
            activeOpacity={0.7}
          >
            <User color="white" size={48} />
            <Text className="text-white font-bold mt-3 text-lg">Nam</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => updateData({ gender: 'female' })}
            className={`flex-1 rounded-2xl p-6 items-center justify-center ${data.gender === 'female' ? 'bg-white/30' : 'bg-white/20'
              }`}
            activeOpacity={0.7}
          >
            <User color="white" size={48} />
            <Text className="text-white font-bold mt-3 text-lg">Nữ</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Date of Birth */}
      <View className="mb-6">
        <Text className="text-white font-semibold flex-row items-center gap-2 mb-3">
          <Calendar color="white" size={20} />
          {' '}Ngày sinh
        </Text>
        <View className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
          <View className="flex-row justify-between gap-2 items-center h-[170px]">
            {/* Day */}
            <View className="flex-1 items-center">
              <Text className="text-white/60 text-sm mb-2 text-center">Ngày</Text>
              <WheelPicker
                items={days}
                value={data.day}
                onChange={(val) => handlePickerChange('day', val)}
                height={130}
                itemHeight={40}
              />
            </View>

            {/* Month */}
            <View className="flex-1 items-center">
              <Text className="text-white/60 text-sm mb-2 text-center">Tháng</Text>
              <WheelPicker
                items={months}
                value={data.month}
                onChange={(val) => handlePickerChange('month', val)}
                height={130}
                itemHeight={40}
              />
            </View>

            {/* Year */}
            <View className="flex-1 items-center pr-2">
              <Text className="text-white/60 text-sm mb-2 text-center">Năm</Text>
              <WheelPicker
                items={years}
                value={data.year}
                onChange={(val) => handlePickerChange('year', val)}
                height={130}
                itemHeight={40}
              />
            </View>
          </View>
        </View>
      </View>

      {/* Height */}
      <View className="mb-6">
        <Text className="text-white font-semibold flex-row items-center gap-2 mb-3">
          <Ruler color="white" size={20} />
          {' '}Chiều cao: {data.height} cm
        </Text>
        <Slider
          minimumValue={140}
          maximumValue={220}
          value={data.height}
          onValueChange={(value) => updateData({ height: Math.round(value) })}
          minimumTrackTintColor="white"
          maximumTrackTintColor="rgba(255,255,255,0.2)"
          thumbTintColor="white"
        />
        <View className="flex-row justify-between">
          <Text className="text-white/60 text-sm">140 cm</Text>
          <Text className="text-white/60 text-sm">220 cm</Text>
        </View>
      </View>

      {/* Weight */}
      <View className="mb-6">
        <Text className="text-white font-semibold flex-row items-center gap-2 mb-3">
          <Weight color="white" size={20} />
          {' '}Cân nặng: {data.weight} kg
        </Text>
        <Slider
          minimumValue={40}
          maximumValue={150}
          value={data.weight}
          onValueChange={(value) => updateData({ weight: Math.round(value) })}
          minimumTrackTintColor="white"
          maximumTrackTintColor="rgba(255,255,255,0.2)"
          thumbTintColor="white"
        />
        <View className="flex-row justify-between">
          <Text className="text-white/60 text-sm">40 kg</Text>
          <Text className="text-white/60 text-sm">150 kg</Text>
        </View>
      </View>
    </Animated.View>
  );
}

// Step 2: Activity & Lifestyle
function Step2({ data, updateData }: any) {
  const activityLevels = [
    { value: 'sedentary', label: 'Ít vận động', desc: 'Ít hoặc không tập luyện' },
    { value: 'light', label: 'Nhẹ nhàng', desc: 'Tập 1-3 ngày/tuần' },
    { value: 'moderate', label: 'Trung bình', desc: 'Tập 3-5 ngày/tuần' },
    { value: 'active', label: 'Năng động', desc: 'Tập 6-7 ngày/tuần' },
    { value: 'super', label: 'Cực kỳ năng động', desc: 'Vận động viên/Công việc nặng' },
  ];

  const jobTypes = [
    { value: 'desk', label: 'Văn phòng', icon: Briefcase, desc: 'Ngồi nhiều' },
    { value: 'standing', label: 'Đứng/Di chuyển', icon: Activity, desc: 'Hoạt động vừa' },
    { value: 'manual', label: 'Lao động nặng', icon: Dumbbell, desc: 'Hoạt động nhiều' },
  ];

  return (
    <Animated.View
      entering={FadeInRight}
      exiting={FadeOutLeft}
      className="space-y-6"
    >
      <View className="text-center mb-8">
        <Text className="text-3xl font-bold text-white mb-2">Hoạt động & Lối sống</Text>
        <Text className="text-white/80">Mức độ hoạt động hàng ngày của bạn</Text>
      </View>

      {/* Activity Level */}
      <View className="mb-6">
        <Text className="text-white font-semibold flex-row items-center gap-2 mb-3">
          <Activity color="white" size={20} />
          {' '}Mức độ hoạt động
        </Text>
        <View className="space-y-3">
          {activityLevels.map((level) => (
            <TouchableOpacity
              key={level.value}
              onPress={() => updateData({ activityLevel: level.value })}
              className={`w-full p-4 rounded-2xl ${data.activityLevel === level.value
                ? 'bg-white'
                : 'bg-white/20'
                }`}
              activeOpacity={0.7}
            >
              <Text className={`font-semibold ${data.activityLevel === level.value ? 'text-red-500' : 'text-white'}`}>
                {level.label}
              </Text>
              <Text className={`text-sm ${data.activityLevel === level.value ? 'text-red-400' : 'text-white/60'}`}>
                {level.desc}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Job Type */}
      <View className="mb-6">
        <Text className="text-white font-semibold flex-row items-center gap-2 mb-3">
          <Briefcase color="white" size={20} />
          {' '}Loại công việc
        </Text>
        <View className="space-y-3">
          {jobTypes.map((job) => {
            const Icon = job.icon;
            return (
              <TouchableOpacity
                key={job.value}
                onPress={() => updateData({ jobType: job.value })}
                className={`w-full p-4 rounded-2xl flex-row items-center gap-4 ${data.jobType === job.value
                  ? 'bg-white'
                  : 'bg-white/20'
                  }`}
                activeOpacity={0.7}
              >
                <Icon color={data.jobType === job.value ? '#ef4444' : 'white'} size={32} />
                <View className="flex-1">
                  <Text className={`font-semibold ${data.jobType === job.value ? 'text-red-500' : 'text-white'}`}>
                    {job.label}
                  </Text>
                  <Text className={`text-sm ${data.jobType === job.value ? 'text-red-400' : 'text-white/60'}`}>
                    {job.desc}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </Animated.View>
  );
}

// Step 3: Goals
function Step3({ data, updateData, toggleArrayItem }: any) {
  const goals = [
    { value: 'loss', label: 'Giảm cân', icon: '📉' },
    { value: 'gain', label: 'Tăng cơ', icon: '💪' },
    { value: 'maintain', label: 'Duy trì', icon: '⚖️' },
  ];

  const targetAreas = [
    { value: 'belly', label: 'Bụng' },
    { value: 'arms', label: 'Tay' },
    { value: 'legs', label: 'Chân' },
    { value: 'chest', label: 'Ngực' },
    { value: 'back', label: 'Lưng' },
    { value: 'fullbody', label: 'Toàn thân' },
  ];

  return (
    <Animated.View
      entering={FadeInRight}
      exiting={FadeOutLeft}
      className="space-y-6"
    >
      <View className="text-center mb-8">
        <Text className="text-3xl font-bold text-white mb-2">Mục tiêu của bạn</Text>
        <Text className="text-white/80">Bạn muốn đạt được điều gì?</Text>
      </View>

      {/* Main Goal */}
      <View className="mb-6">
        <Text className="text-white font-semibold mb-3">
          <Target color="white" size={20} /> Mục tiêu chính
        </Text>
        <View className="flex-row gap-3">
          {goals.map((goal) => (
            <TouchableOpacity
              key={goal.value}
              onPress={() => updateData({ mainGoal: goal.value })}
              className={`flex-1 p-4 rounded-2xl items-center ${data.mainGoal === goal.value
                ? 'bg-white'
                : 'bg-white/20'
                }`}
              activeOpacity={0.7}
            >
              <Text className="text-3xl mb-2">{goal.icon}</Text>
              <Text className={`font-semibold text-sm ${data.mainGoal === goal.value ? 'text-red-500' : 'text-white'}`}>
                {goal.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Target Weight */}
      <View className="mb-6">
        <Text className="text-white font-semibold mb-3">
          <Weight color="white" size={20} /> Cân nặng mục tiêu: {data.targetWeight} kg
        </Text>
        <Slider
          minimumValue={40}
          maximumValue={150}
          value={data.targetWeight}
          onValueChange={(value) => updateData({ targetWeight: Math.round(value) })}
          minimumTrackTintColor="white"
          maximumTrackTintColor="rgba(255,255,255,0.2)"
          thumbTintColor="white"
        />
        <View className="flex-row justify-between">
          <Text className="text-white/60 text-sm">40 kg</Text>
          <Text className="text-white/60 text-sm">150 kg</Text>
        </View>
      </View>

      {/* Target Areas */}
      <View className="mb-6">
        <Text className="text-white font-semibold mb-3">Vùng tập trung</Text>
        <View className="flex-row flex-wrap gap-2">
          {targetAreas.map((area) => (
            <TouchableOpacity
              key={area.value}
              onPress={() => updateData({ targetAreas: toggleArrayItem(data.targetAreas, area.value) })}
              className={`py-3 px-4 rounded-xl ${data.targetAreas.includes(area.value)
                ? 'bg-white'
                : 'bg-white/20'
                }`}
              activeOpacity={0.7}
            >
              <Text className={`text-sm font-medium ${data.targetAreas.includes(area.value) ? 'text-red-500' : 'text-white'}`}>
                {area.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

// Step 4: Nutrition
function Step4({ data, updateData }: any) {
  const diets = [
    { id: 'balanced', name: 'Cân bằng', icon: Utensils },
    { id: 'low-carb', name: 'Low Carb', icon: Apple },
    { id: 'high-protein', name: 'High Protein', icon: Dumbbell },
    { id: 'vegetarian', name: 'Chay', icon: Apple },
    { id: 'vegan', name: 'Thuần chay', icon: Apple },
  ];

  return (
    <Animated.View
      entering={FadeInRight}
      exiting={FadeOutLeft}
      className="space-y-6"
    >
      <View className="text-center mb-8">
        <Text className="text-3xl font-bold text-white mb-2">
          Thói quen dinh dưỡng
        </Text>
        <Text className="text-white/80">Chế độ ăn uống của bạn</Text>
      </View>

      {/* Diet Preference */}
      <View className="mb-6">
        <Text className="text-white font-semibold mb-3">
          <Utensils color="white" size={20} /> Chế độ ăn
        </Text>
        <View className="flex-row flex-wrap gap-3">
          {diets.map((diet) => {
            const Icon = diet.icon;
            return (
              <TouchableOpacity
                key={diet.id}
                onPress={() => updateData({ diet: diet.id })}
                className={`w-[48%] p-4 rounded-2xl items-center ${data.diet === diet.id
                  ? 'bg-white'
                  : 'bg-white/20'
                  }`}
                activeOpacity={0.7}
              >
                <Icon color={data.diet === diet.id ? '#ef4444' : 'white'} size={32} />
                <Text className={`font-semibold text-sm mt-2 ${data.diet === diet.id ? 'text-red-500' : 'text-white'}`}>
                  {diet.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </Animated.View>
  );
}

// Step 5: Fitness Experience
function Step5({ data, updateData, toggleArrayItem }: any) {
  const experienceLevels = [
    { value: 'beginner', label: 'Mới bắt đầu', desc: '0-6 tháng', icon: '🌱' },
    { value: 'intermediate', label: 'Trung cấp', desc: '6-24 tháng', icon: '💪' },
    { value: 'advanced', label: 'Nâng cao', desc: '2+ năm', icon: '🏆' },
  ];

  const locations = [
    { value: 'gym', label: 'Phòng gym', icon: Dumbbell },
    { value: 'home', label: 'Tại nhà', icon: Home },
    { value: 'park', label: 'Công viên', icon: MapPin },
  ];

  const durations = [30, 45, 60, 90];

  return (
    <Animated.View
      entering={FadeInRight}
      exiting={FadeOutLeft}
      className="space-y-6"
    >
      <View className="text-center mb-8">
        <Text className="text-3xl font-bold text-white mb-2">Kinh nghiệm tập luyện</Text>
        <Text className="text-white/80">Bạn đã tập được bao lâu?</Text>
      </View>

      {/* Experience Level */}
      <View className="mb-6">
        <Text className="text-white font-semibold mb-3">
          <Dumbbell color="white" size={20} /> Trình độ
        </Text>
        <View className="space-y-3">
          {experienceLevels.map((level) => (
            <TouchableOpacity
              key={level.value}
              onPress={() => updateData({ experienceLevel: level.value })}
              className={`w-full p-4 rounded-2xl flex-row items-center gap-4 ${data.experienceLevel === level.value
                ? 'bg-white'
                : 'bg-white/20'
                }`}
              activeOpacity={0.7}
            >
              <Text className="text-3xl">{level.icon}</Text>
              <View className="flex-1">
                <Text className={`font-semibold ${data.experienceLevel === level.value ? 'text-red-500' : 'text-white'}`}>
                  {level.label}
                </Text>
                <Text className={`text-sm ${data.experienceLevel === level.value ? 'text-red-400' : 'text-white/60'}`}>
                  {level.desc}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Workout Locations */}
      <View className="mb-6">
        <Text className="text-white font-semibold mb-3">Địa điểm tập</Text>
        <View className="flex-row gap-3">
          {locations.map((location) => {
            const Icon = location.icon;
            return (
              <TouchableOpacity
                key={location.value}
                onPress={() =>
                  updateData({ workoutLocations: toggleArrayItem(data.workoutLocations, location.value) })
                }
                className={`flex-1 p-4 rounded-2xl items-center ${data.workoutLocations.includes(location.value)
                  ? 'bg-white'
                  : 'bg-white/20'
                  }`}
                activeOpacity={0.7}
              >
                <Icon color={data.workoutLocations.includes(location.value) ? '#ef4444' : 'white'} size={32} />
                <Text className={`font-semibold text-xs mt-2 ${data.workoutLocations.includes(location.value) ? 'text-red-500' : 'text-white'}`}>
                  {location.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Frequency */}
      <View className="mb-6">
        <Text className="text-white font-semibold mb-3">
          <Calendar color="white" size={20} /> Tần suất: {data.frequency} ngày/tuần
        </Text>
        <Slider
          minimumValue={1}
          maximumValue={7}
          step={1}
          value={data.frequency}
          onValueChange={(value) => updateData({ frequency: Math.round(value) })}
          minimumTrackTintColor="white"
          maximumTrackTintColor="rgba(255,255,255,0.2)"
          thumbTintColor="white"
        />
        <View className="flex-row justify-between">
          <Text className="text-white/60 text-sm">1 ngày</Text>
          <Text className="text-white/60 text-sm">7 ngày</Text>
        </View>
      </View>

      {/* Duration */}
      <View className="mb-6">
        <Text className="text-white font-semibold mb-3">
          <Clock color="white" size={20} /> Thời lương mỗi buổi
        </Text>
        <View className="flex-row gap-3">
          {durations.map((duration) => (
            <TouchableOpacity
              key={duration}
              onPress={() => updateData({ duration })}
              className={`flex-1 py-4 rounded-2xl ${data.duration === duration
                ? 'bg-white'
                : 'bg-white/20'
                }`}
              activeOpacity={0.7}
            >
              <Text className={`font-bold text-center ${data.duration === duration ? 'text-red-500' : 'text-white'}`}>
                {duration}m
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Animated.View>
  );
}
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, ArrowRight, Activity } from 'lucide-react-native';

import { WheelPicker } from '../../components/ui/WheelPicker';
import { Skeleton } from '../../components/ui/Skeleton';
import { MacrosDisplay } from '../../components/health';
import { getLatestBodyMetric, createBodyMetric } from '../../services/bodyMetricService';
import { getLatestHealthCalculation, calculateMetrics } from '../../services/healthCalculationService';
import { getAllGoalTypes } from '../../services/goalTypeService';
import { getUserProfileFromStorage } from '../../services/authService';
import {
  ActivityLevel,
  ActivityLevelLabels,
  BodyMetricResponse,
  Gender,
  GoalTypeResponse,
  GoalTypes,
  HealthCalculationResponse,
} from '../../types';
import { getBMIZone } from '../../utils/chartDataProcessors';
import { cn } from '../../utils/cn';
import { notifyAlert } from '../../utils/notification';
import { useAppSelector } from '../../hooks/redux';

const parseGender = (gender?: string): Gender | null => {
  const value = (gender || '').toUpperCase();
  if (value === Gender.MALE) return Gender.MALE;
  if (value === Gender.FEMALE) return Gender.FEMALE;
  return null;
};

const getAgeFromBirthdate = (birthdate?: string): number | null => {
  if (!birthdate) return null;
  const date = new Date(birthdate);
  if (Number.isNaN(date.getTime())) return null;

  const now = new Date();
  let age = now.getFullYear() - date.getFullYear();
  const beforeBirthday =
    now.getMonth() < date.getMonth() ||
    (now.getMonth() === date.getMonth() && now.getDate() < date.getDate());

  if (beforeBirthday) age -= 1;
  return age >= 0 ? age : null;
};

const normalizeGoalName = (goalName?: string) =>
  (goalName || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const mapGoalToEnum = (goalName?: string): GoalTypes => {
  const normalized = normalizeGoalName(goalName);
  if (Object.values(GoalTypes).includes(normalized as GoalTypes)) return normalized as GoalTypes;
  if (normalized.includes('giam can') || normalized.includes('cut') || normalized.includes('lose')) {
    return GoalTypes.CUTTING;
  }
  if (normalized.includes('tang co') || normalized.includes('bulk') || normalized.includes('gain') || normalized.includes('muscle')) {
    return GoalTypes.BULKING;
  }
  if (normalized.includes('tang suc manh') || normalized.includes('power') || normalized.includes('strength')) {
    return GoalTypes.UP_POWER;
  }
  if (normalized.includes('duy tri') || normalized.includes('maintain')) return GoalTypes.MAINTAIN;
  return GoalTypes.MAINTAIN;
};

function HealthDashboardSkeleton() {
  return (
    <View className="flex-1 bg-gray-50">
      <View className="rounded-b-[32px] overflow-hidden">
        <LinearGradient colors={['#f97316', '#ef4444']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          <SafeAreaView edges={['top', 'left', 'right']}>
            <View className="flex-row items-center px-6 py-4">
              <Skeleton className="w-10 h-10 rounded-full bg-white/30 mr-3" />
              <View className="flex-1">
                <Skeleton className="h-6 w-36 mb-2 bg-white/30" />
                <Skeleton className="h-3 w-28 bg-white/30" />
              </View>
              <Skeleton className="w-10 h-10 rounded-full bg-white/30" />
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        <Skeleton className="h-5 w-40 mb-2" />
        <Skeleton className="h-3 w-32 mb-4" />
        <View className="flex-row flex-wrap gap-3 mb-5">
          {[0, 1, 2, 3].map((idx) => (
            <View key={idx} className="bg-white rounded-2xl p-4 flex-1 min-w-[47%] shadow-sm">
              <Skeleton className="h-3 w-20 mb-2" />
              <Skeleton className="h-9 w-24" />
            </View>
          ))}
        </View>
        <View className="bg-white rounded-2xl p-4 mb-5 shadow-sm">
          <Skeleton className="h-5 w-40 mb-3" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </View>
        <View className="bg-white rounded-2xl p-4 shadow-sm">
          <Skeleton className="h-5 w-32 mb-3" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </View>
      </ScrollView>
    </View>
  );
}

export function HealthDashboardScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const user = useAppSelector(state => state.auth.user);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [latestBodyMetric, setLatestBodyMetric] = useState<BodyMetricResponse | null>(null);
  const [latestCalculation, setLatestCalculation] = useState<HealthCalculationResponse | null>(null);
  const [goalTypes, setGoalTypes] = useState<GoalTypeResponse[]>([]);

  const [bodyHeight, setBodyHeight] = useState(170);
  const [bodyWeight, setBodyWeight] = useState(70);
  const [bodyActivity, setBodyActivity] = useState<ActivityLevel>(ActivityLevel.SEDENTARY);
  const [selectedGoalTypeName, setSelectedGoalTypeName] = useState('');

  const profileGender = useMemo(() => parseGender(user?.gender), [user?.gender]);
  const profileAge = useMemo(() => getAgeFromBirthdate(user?.birthdate), [user?.birthdate]);

  const loadData = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);

      const profile = await getUserProfileFromStorage();
      if (!profile?.id) {
        setLatestBodyMetric(null);
        setLatestCalculation(null);
        setGoalTypes([]);
        return;
      }

      const [body, calc, goals] = await Promise.all([
        getLatestBodyMetric(profile.id).catch(() => null),
        getLatestHealthCalculation(profile.id).catch(() => null),
        getAllGoalTypes().catch(() => []),
      ]);

      setLatestBodyMetric(body ?? null);
      setLatestCalculation(calc ?? null);
      setGoalTypes(goals ?? []);

      if (!selectedGoalTypeName && Array.isArray(goals) && goals.length > 0) {
        setSelectedGoalTypeName(goals[0].name);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!latestBodyMetric) return;
    if (typeof latestBodyMetric.heightCm === 'number') setBodyHeight(Math.round(latestBodyMetric.heightCm));
    if (typeof latestBodyMetric.weightKg === 'number') setBodyWeight(Math.round(latestBodyMetric.weightKg));
    if (latestBodyMetric.activityLevel) setBodyActivity(latestBodyMetric.activityLevel);
  }, [latestBodyMetric]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData(true);
  };

  const submitAddAndCalculate = async () => {
    try {
      setSubmitting(true);
      const profile = await getUserProfileFromStorage();

      if (!profile?.id) {
        notifyAlert('Lỗi', 'Không xác định người dùng. Vui lòng đăng nhập lại.');
        return;
      }

      if (!profileGender || !profileAge) {
        notifyAlert('Thiếu thông tin', 'Vui lòng cập nhật Giới tính và Ngày sinh trong hồ sơ cá nhân.');
        navigation.navigate('Profile');
        return;
      }

      if (!selectedGoalTypeName) {
        notifyAlert('Thiếu mục tiêu', 'Vui lòng chọn mục tiêu trước khi tính toán.');
        return;
      }

      await createBodyMetric({
        userId: profile.id,
        heightCm: bodyHeight,
        weightKg: bodyWeight,
        age: profileAge,
        gender: profileGender,
        activityLevel: bodyActivity,
        goalTypeName: selectedGoalTypeName,
      });

      await calculateMetrics({
        userId: profile.id,
        gender: profileGender,
        age: profileAge,
        height: bodyHeight,
        weight: bodyWeight,
        activityLevel: bodyActivity,
        goalTypes: mapGoalToEnum(selectedGoalTypeName),
      });

      await loadData();
      notifyAlert('Thành công', 'Đã lưu chỉ số và tính toán sức khỏe.');
    } catch (error: any) {
      notifyAlert('Lỗi', error?.message || 'Không thể lưu và tính toán.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <HealthDashboardSkeleton />;
  }

  const bmiZone = latestCalculation ? getBMIZone(latestCalculation.bmi) : null;

  return (
    <View className="flex-1 bg-gray-50">
      <View className="rounded-b-[32px] overflow-hidden">
        <LinearGradient colors={['#f97316', '#ef4444']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          <SafeAreaView edges={['top', 'left', 'right']}>
            <View className="flex-row items-center px-6 py-4">
              <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 bg-white/20 rounded-full items-center justify-center mr-3">
                <ArrowLeft size={22} color="white" />
              </TouchableOpacity>
              <View className="flex-1">
                <Text className="text-xl font-bold text-white">Dashboard</Text>
                <Text className="text-sm text-white/70">Tổng quan sức khỏe</Text>
              </View>
              <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
                <Activity size={20} color="white" />
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#f97316']} />}
      >
        <View className="mb-4">
          <Text className="text-lg font-bold text-gray-800 mb-1">📊 Tổng quan</Text>
          <Text className="text-xs text-gray-500">
            {latestBodyMetric ? `Cập nhật: ${new Date(latestBodyMetric.createdAt).toLocaleDateString('vi-VN')}` : 'Chưa có dữ liệu'}
          </Text>
        </View>

        <View className="flex-row flex-wrap gap-3 mb-5">
          <View className="bg-white rounded-2xl p-4 flex-1 min-w-[47%] shadow-sm">
            <Text className="text-xs text-gray-500 mb-2">Cân nặng</Text>
            <Text className="text-3xl font-bold text-gray-800">{latestBodyMetric ? `${latestBodyMetric.weightKg.toFixed(1)} kg` : '--'}</Text>
          </View>
          <View className="bg-white rounded-2xl p-4 flex-1 min-w-[47%] shadow-sm">
            <Text className="text-xs text-gray-500 mb-2">Chiều cao</Text>
            <Text className="text-3xl font-bold text-gray-800">{latestBodyMetric ? `${latestBodyMetric.heightCm} cm` : '--'}</Text>
          </View>
          <View className="bg-white rounded-2xl p-4 flex-1 min-w-[47%] shadow-sm">
            <Text className="text-xs text-gray-500 mb-2">BMI</Text>
            <Text className="text-3xl font-bold text-gray-800">{latestCalculation ? latestCalculation.bmi.toFixed(1) : '--'}</Text>
            {bmiZone && (
              <View style={{ backgroundColor: bmiZone.color }} className="px-2 py-1 rounded-lg self-start mt-1">
                <Text className="text-[11px] text-white font-semibold">{bmiZone.label}</Text>
              </View>
            )}
          </View>
          <View className="bg-white rounded-2xl p-4 flex-1 min-w-[47%] shadow-sm">
            <Text className="text-xs text-gray-500 mb-2">TDEE</Text>
            <Text className="text-3xl font-bold text-gray-800">{latestCalculation ? Math.round(latestCalculation.tdee) : '--'}</Text>
            <Text className="text-xs text-gray-500">kcal/ngày</Text>
          </View>
        </View>

        {latestCalculation && (
          <View className="bg-white rounded-2xl p-4 mb-5 shadow-sm">
            <Text className="text-base font-semibold text-gray-800 mb-3">Macros theo mục tiêu</Text>
            <MacrosDisplay macros={latestCalculation.macros} />
          </View>
        )}

        <View className="bg-white rounded-2xl p-4 mb-5 shadow-sm">
          <Text className="text-base font-semibold text-gray-800 mb-3">Thêm số đo nhanh</Text>

          <View className="bg-orange-50 border border-orange-100 rounded-xl p-3 mb-3">
            <Text className="text-xs text-orange-700">
              Thông tin cá nhân: {profileGender === Gender.MALE ? 'Nam' : profileGender === Gender.FEMALE ? 'Nữ' : 'Chưa có giới tính'}
              {' · '}
              {profileAge ? `${profileAge} tuổi` : 'Chưa có ngày sinh'}
            </Text>
            <TouchableOpacity className="mt-2 self-start px-3 py-1.5 rounded-lg bg-orange-500" onPress={() => navigation.navigate('Profile')}>
              <Text className="text-white text-xs font-semibold">Cập nhật hồ sơ cá nhân</Text>
            </TouchableOpacity>
          </View>

          <Text className="text-sm font-semibold text-gray-700 mb-2">Mục tiêu</Text>
          <View className="flex-row flex-wrap gap-2 mb-3">
            {goalTypes.map(goal => (
              <TouchableOpacity
                key={goal.id}
                onPress={() => setSelectedGoalTypeName(goal.name)}
                className={cn('px-3 py-2 rounded-xl bg-gray-100 mr-2 mb-2', selectedGoalTypeName === goal.name && 'bg-orange-200')}
              >
                <Text className="text-sm text-gray-800">{goal.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View className="flex-row items-center gap-2 mt-2">
            <View className="flex-1  overflow-hidden ">
              <WheelPicker
                items={Array.from({ length: 201 }, (_, i) => i + 50)}
                value={bodyHeight}
                onChange={(v) => setBodyHeight(Number(v))}
                height={120}
                itemHeight={30}
                textColor="#000000"
                selectedTextColor="#000000"
                indicatorColor="#000000"
              />
            </View>
            <View className="w-[120px] rounded-xl overflow-hidden mr-2">
              <WheelPicker
                items={Array.from({ length: 181 }, (_, i) => i + 20)}
                value={bodyWeight}
                onChange={(v) => setBodyWeight(Number(v))}
                height={120}
                itemHeight={30}
                textColor="#000000"
                selectedTextColor="#000000"
                indicatorColor="#000000"
              />
            </View>
            <TouchableOpacity
              className="bg-orange-500 px-3.5 py-2.5 rounded-xl items-center justify-center"
              onPress={submitAddAndCalculate}
              disabled={submitting}
            >
              <Text className="text-white font-semibold">{submitting ? 'Đang...' : 'Lưu & Tính'}</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row flex-wrap gap-2 mt-2.5">
            {Object.keys(ActivityLevelLabels).map((k) => {
              const key = k as ActivityLevel;
              return (
                <TouchableOpacity
                  key={key}
                  className={cn('px-2.5 py-2 rounded-xl bg-gray-100 mr-2', bodyActivity === key && 'bg-orange-200')}
                  onPress={() => setBodyActivity(key)}
                >
                  <Text className="text-sm text-gray-800">{ActivityLevelLabels[key]}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity
          className="bg-orange-500 rounded-xl px-4 py-3 flex-row justify-center items-center gap-2 mb-6"
          onPress={() => navigation.navigate('BodyMetricList' as never)}
        >
          <Text className="text-white font-semibold text-base">Xem biểu đồ chi tiết</Text>
          <ArrowRight size={20} color="white" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

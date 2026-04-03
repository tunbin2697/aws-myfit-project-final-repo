import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Dumbbell, Database, ChevronRight, Calendar, Shield,
  Zap, ClipboardList,
} from 'lucide-react-native';

import { SuggestedPlanScreen } from '../screens/Workout/SuggestedPlanScreen';
import { MyPlansScreen } from '../screens/Workout/MyPlansScreen';
import { PlanDetailScreen } from '../screens/Workout/PlanDetailScreen';
import { WorkoutSessionScreen } from '../screens/Workout/WorkoutSessionScreen';
import { WorkoutSuccessScreen } from '../screens/Workout/WorkoutSuccessScreen';
import { SessionDetailScreen } from '../screens/Workout/SessionDetailScreen';
import { SessionCalendarScreen } from '../screens/Workout/SessionCalendarScreen';
import { CreatePlanScreen } from '../screens/Workout/CreatePlanScreen';
import { isDevelopment } from '../utils/env';

const Stack = createNativeStackNavigator();

// Workout stack now uses PlanDetailScreen as the main dashboard for the user.

// ─────────────────────────────────────────
// Stack Navigator
// ─────────────────────────────────────────
export function WorkoutStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Use PlanDetailScreen as the main dashboard (will load active plan when no planId passed) */}
      <Stack.Screen name="PlanDetail" component={PlanDetailScreen} />
      <Stack.Screen name="PlanEdit" component={require('../screens/Workout/PlanEditScreen').PlanEditScreen} />
      <Stack.Screen name="PlanExercisePicker" component={require('../screens/Workout/PlanExercisePicker').PlanExercisePicker} />
      <Stack.Screen name="CreatePlan" component={CreatePlanScreen} />

      {/* Supporting flows */}
      <Stack.Screen name="SuggestedPlan" component={SuggestedPlanScreen} />
      <Stack.Screen name="MyPlans" component={MyPlansScreen} />
      <Stack.Screen
        name="WorkoutSession"
        component={WorkoutSessionScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name="WorkoutSuccess"
        component={WorkoutSuccessScreen}
        options={{ gestureEnabled: false, headerShown: false }}
      />

      {/* Session history */}
      <Stack.Screen name="SessionDetail" component={SessionDetailScreen} />
      <Stack.Screen name="SessionCalendar" component={SessionCalendarScreen} />
    </Stack.Navigator>
  );
}


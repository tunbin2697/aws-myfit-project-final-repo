import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { DietScreen } from '../screens/Diet/DietScreen';
import { DietHistoryScreen } from '../screens/Diet/DietHistoryScreen';

const Stack = createNativeStackNavigator();

export function DietStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DietMain" component={DietScreen} />
      <Stack.Screen name="DietHistory" component={DietHistoryScreen} />
    </Stack.Navigator>
  );
}

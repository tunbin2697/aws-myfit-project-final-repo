import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HealthDashboardScreen } from '../screens/Health';
import { BodyMetricListScreen, BodyMetricFormScreen } from '../screens/BodyMetric';

const Stack = createNativeStackNavigator();

export function HealthStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="HealthDashboard" component={HealthDashboardScreen} />
            <Stack.Screen name="BodyMetricList" component={BodyMetricListScreen} />
            <Stack.Screen name="BodyMetricForm" component={BodyMetricFormScreen} />
        </Stack.Navigator>
    );
}

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingFlow } from '../screens/Onboarding/OnboardingFlow';
import { useAppDispatch } from '../hooks/redux';
import { completeOnboarding } from '../store/authSlice';

const Stack = createNativeStackNavigator();

export function OnboardingStack() {
    const dispatch = useAppDispatch();

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="OnboardingFlow">
                {(props) => (
                    <OnboardingFlow
                        {...props}
                        onComplete={(data) => {
                            // Save onboarding data and mark as completed
                            console.log('Onboarding completed with data:', data);
                            // Dispatch completeOnboarding - RootNavigator will show MainTabs
                            dispatch(completeOnboarding());
                        }}
                        onBack={() => {
                            // Navigate back to auth
                            props.navigation.goBack();
                        }}
                    />
                )}
            </Stack.Screen>
        </Stack.Navigator>
    );
}

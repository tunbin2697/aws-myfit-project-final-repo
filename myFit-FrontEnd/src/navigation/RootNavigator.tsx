import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAppSelector } from '../hooks/redux';
import { AuthStack } from './AuthStack';
import { OnboardingStack } from './OnboardingStack';
import { MainTabs } from './MainTabs';

export function RootNavigator() {
  const { isAuthenticated, hasCompletedOnboarding } = useAppSelector(state => state.auth);

  // Determine which navigator to show
  const getActiveNavigator = () => {
    if (!isAuthenticated) {
      return <AuthStack />;
    }

    if (!hasCompletedOnboarding) {
      return <OnboardingStack />;
    }

    return <MainTabs />;
  };

  return (
    <NavigationContainer>
      {getActiveNavigator()}
    </NavigationContainer>
  );
}


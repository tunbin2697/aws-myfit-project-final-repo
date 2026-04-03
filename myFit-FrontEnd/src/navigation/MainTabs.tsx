import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity, useWindowDimensions, StyleSheet } from 'react-native';
import { Home, Dumbbell, Utensils, Heart, MessageCircle } from 'lucide-react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

import { HomeScreen } from '../screens/Home';
import { WorkoutStack } from './WorkoutStack';
import { DietStack } from './DietStack';
import { HealthStack } from './HealthStack';
import { ProfileScreen } from '../screens/Profile';
import { ChatScreen } from '../screens/Chat';

const Tab = createBottomTabNavigator();

// Custom Tab Bar with center chat button
function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 380;

  // Hide tab bar on Profile screen only
  const currentRoute = state.routes[state.index]?.name;
  if (currentRoute === 'Profile') {
    return null;
  }

  const getIcon = (routeName: string, color: string, size: number) => {
    switch (routeName) {
      case 'Home':
        return <Home color={color} size={size} />;
      case 'Workout':
        return <Dumbbell color={color} size={size} />;
      case 'Diet':
        return <Utensils color={color} size={size} />;
      case 'Health':
        return <Heart color={color} size={size} />;
      default:
        return null;
    }
  };

  const getLabel = (routeName: string) => {
    switch (routeName) {
      case 'Home':
        return 'Trang chủ';
      case 'Workout':
        return 'Tập luyện';
      case 'Diet':
        return 'Dinh dưỡng';
      case 'Health':
        return 'Sức khỏe';
      default:
        return routeName;
    }
  };

  // Split routes: first 2 on left, last 2 on right
  const leftRoutes = state.routes.slice(0, 2);
  const rightRoutes = state.routes.slice(2, 4);

  const renderTabButton = (route: typeof state.routes[0], index: number, actualIndex: number) => {
    const { options } = descriptors[route.key];
    const isFocused = state.index === actualIndex;
    const color = isFocused ? '#f97316' : '#9ca3af';

    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    };

    return (
      <TouchableOpacity
        key={route.key}
        onPress={onPress}
        className="flex-1 items-center justify-center py-2"
        activeOpacity={0.7}
      >
        {getIcon(route.name, color, isSmallScreen ? 22 : 24)}
        {!isSmallScreen && (
          <Text
            style={{ color, fontSize: 10, marginTop: 4, fontWeight: isFocused ? '600' : '400' }}
          >
            {getLabel(route.name)}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.tabBar}>
        {/* Left tabs */}
        <View style={styles.tabGroup}>
          {leftRoutes.map((route, index) => renderTabButton(route, index, index))}
        </View>

        {/* Center Chat Button */}
        <View style={styles.centerButtonContainer}>
          <TouchableOpacity
            style={styles.chatButton}
            onPress={() => navigation.navigate('Chat')}
            activeOpacity={0.8}
          >
            <MessageCircle color="white" size={28} />
          </TouchableOpacity>
        </View>

        {/* Right tabs */}
        <View style={styles.tabGroup}>
          {rightRoutes.map((route, index) => renderTabButton(route, index, index + 2))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 0,
    height: 65,
    width: '100%',
    paddingBottom: 8,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  tabGroup: {
    flex: 2,
    flexDirection: 'row',
  },
  centerButtonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f97316',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -32,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});

export function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Workout" component={WorkoutStack} />
      <Tab.Screen name="Diet" component={DietStack} />
      <Tab.Screen name="Health" component={HealthStack} />
      {/* Profile is accessed from HomeScreen header */}
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ tabBarButton: () => null }}
      />
      {/* Chat is accessed from center floating button */}
      <Tab.Screen 
        name="Chat" 
        component={ChatScreen} 
        options={{ 
          tabBarButton: () => null,
          tabBarStyle: { display: 'none' },
        }}
      />
    </Tab.Navigator>
  );
}

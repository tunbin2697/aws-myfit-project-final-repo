import React from 'react';
import { View, Text, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Dumbbell } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Button } from '../../components/ui/Button';

export function WelcomeScreen({ navigation }: any) {
  return (
    <LinearGradient
      colors={['#f97316', '#ef4444', '#ec4899']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex-1"
    >
      <SafeAreaView className="flex-1 items-center justify-center px-8">
        <Animated.View 
          entering={FadeInDown.delay(200).springify()}
          className="items-center w-full"
        >
          {/* Logo Icon */}
          <View className="mb-8">
            <Dumbbell color="white" size={120} strokeWidth={2.5} />
          </View>

          {/* App Name */}
          <Text className="text-6xl font-bold text-white mb-4">
            MyFit
          </Text>

          {/* Tagline */}
          <Text className="text-xl text-white/90 text-center mb-16 leading-7">
            Biến đổi cơ thể, nâng tầm sức khỏe
          </Text>

          {/* Start Button */}
          <Button
            className="bg-white w-full h-14 rounded-full"
            textClassName="text-orange-600 font-bold text-lg"
            onPress={() => navigation.navigate('Login')}
          >
            Bắt đầu
          </Button>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

import React, { useRef, useEffect } from 'react';
import { View, ScrollView, Text, Dimensions } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue, useAnimatedStyle, interpolate } from 'react-native-reanimated';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

interface WheelPickerProps {
  items: string[];
  value: string;
  onChange: (value: string | number) => void;
  height?: number;
  itemHeight?: number;
}

export function WheelPicker({ items, value, onChange, height = 160, itemHeight = 40 }: WheelPickerProps) {
  const scrollY = useSharedValue(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
    onMomentumEnd: (event) => {
      const index = Math.round(event.contentOffset.y / itemHeight);
      onChange(items[index]);
    },
  });

  useEffect(() => {
    const currentIndex = items.indexOf(value);
    if (currentIndex !== -1 && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        y: currentIndex * itemHeight,
        animated: false,
      });
    }
  }, []);

  return (
    <View style={{ height, overflow: 'hidden' }}>
      {/* Top Fade */}
      <View className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white/20 to-transparent z-10" />

      {/* Selected Item Highlight */}
      <View
        className="absolute left-0 right-0 bg-white/20 border-y border-white/30"
        style={{
          top: (height - itemHeight) / 2,
          height: itemHeight
        }}
      />

      <AnimatedScrollView
        ref={scrollViewRef}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        decelerationRate="fast"
        contentContainerStyle={{
          paddingVertical: (height - itemHeight) / 2,
        }}
      >
        {items.map((item, index) => {
          const inputRange = [
            (index - 2) * itemHeight,
            (index - 1) * itemHeight,
            index * itemHeight,
            (index + 1) * itemHeight,
            (index + 2) * itemHeight,
          ];

          const animatedStyle = useAnimatedStyle(() => {
            const opacity = interpolate(
              scrollY.value,
              inputRange,
              [0.3, 0.6, 1, 0.6, 0.3]
            );

            const scale = interpolate(
              scrollY.value,
              inputRange,
              [0.7, 0.85, 1, 0.85, 0.7]
            );

            return {
              opacity,
              transform: [{ scale }],
            };
          });

          return (
            <Animated.View
              key={index}
              style={[{ height: itemHeight, justifyContent: 'center', alignItems: 'center' }, animatedStyle]}
            >
              <Text className="text-white text-2xl font-bold">
                {item}
              </Text>
            </Animated.View>
          );
        })}
      </AnimatedScrollView>

      {/* Bottom Fade */}
      <View className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white/20 to-transparent z-10" />
    </View>
  );
}

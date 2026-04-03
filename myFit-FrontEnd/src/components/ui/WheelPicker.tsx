import React, { useRef, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Text,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface WheelPickerProps {
  items: (string | number)[];
  value: string | number;
  onChange: (value: string | number) => void;
  height?: number;
  itemHeight?: number;
  textColor?: string;
  selectedTextColor?: string;
  gradientColors?: string[];
  indicatorColor?: string;
  backgroundColor?: string;
}

export function WheelPicker({
  items,
  value,
  onChange,
  height = 200,
  itemHeight = 50,
  textColor,
  selectedTextColor,
  gradientColors,
  indicatorColor,
  backgroundColor,
}: WheelPickerProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const lastSelectedIndex = useRef(-1);
  const scrollEndTimeout = useRef<any>(null);

  const paddingVertical = (height - itemHeight) / 2;
  const hasGradientMask = Array.isArray(gradientColors) && gradientColors.length >= 2;

  // Scroll to value on mount
  useEffect(() => {
    const index = items.indexOf(value);
    if (index !== -1) {
      lastSelectedIndex.current = index;
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: index * itemHeight,
          animated: false,
        });
      }, 50);
    }
  }, [items, value, itemHeight]);

  // cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (scrollEndTimeout.current) {
        clearTimeout(scrollEndTimeout.current);
        scrollEndTimeout.current = null;
      }
    };
  }, []);

  const handleScrollEnd = useCallback((offsetY: number) => {
    const index = Math.round(offsetY / itemHeight);
    const clampedIndex = Math.max(0, Math.min(items.length - 1, index));

    if (clampedIndex !== lastSelectedIndex.current) {
      lastSelectedIndex.current = clampedIndex;
      onChange(items[clampedIndex]);
    }
  }, [items, itemHeight, onChange]);

  return (
    <View style={{ height, overflow: 'hidden', position: 'relative', backgroundColor }}>

      {hasGradientMask && (
        <>
          <LinearGradient
            colors={gradientColors as [string, string, ...string[]]}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, height: paddingVertical, zIndex: 1 }}
            pointerEvents="none"
          />

          <LinearGradient
            colors={[gradientColors[1], gradientColors[0]] as [string, string, ...string[]]}
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: paddingVertical, zIndex: 1 }}
            pointerEvents="none"
          />
        </>
      )}

      {/* Center Select Indicator */}
      <View
        style={[
          styles.indicator,
          { top: paddingVertical, height: itemHeight },
        ]}
        pointerEvents="none"
      >
        <View style={[styles.indicatorLine, indicatorColor ? { backgroundColor: indicatorColor } : null]} />
        <View style={{ flex: 1 }} />
        <View style={[styles.indicatorLine, indicatorColor ? { backgroundColor: indicatorColor } : null]} />
      </View>

      <Animated.ScrollView
        ref={scrollViewRef}
        nestedScrollEnabled={true}
        snapToInterval={itemHeight}
        decelerationRate="fast"
        bounces={false}
        overScrollMode="never"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingVertical: paddingVertical,
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          {
            useNativeDriver: true,
            listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
              const offsetY = event.nativeEvent.contentOffset.y;
              // debounce scroll end detection for web (mouse wheel) where
              // onMomentumScrollEnd may not fire reliably
              if (scrollEndTimeout.current) {
                clearTimeout(scrollEndTimeout.current);
              }
              scrollEndTimeout.current = setTimeout(() => {
                handleScrollEnd(offsetY);
              }, 120);
            },
          }
        )}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => {
          // native momentum end
          if (scrollEndTimeout.current) {
            clearTimeout(scrollEndTimeout.current);
            scrollEndTimeout.current = null;
          }
          handleScrollEnd(e.nativeEvent.contentOffset.y);
        }}
      >
        {items.map((item, index) => {
          // Dynamic scaling based on distance from center
          const inputRange = [
            (index - 1) * itemHeight,
            index * itemHeight,
            (index + 1) * itemHeight,
          ];

          const scale = scrollY.interpolate({
            inputRange,
            outputRange: [0.85, 1.1, 0.85],
            extrapolate: 'clamp',
          });

          const opacity = scrollY.interpolate({
            inputRange,
            outputRange: [0.4, 1, 0.4],
            extrapolate: 'clamp',
          });

          const isSelected = value === item;

          return (
            <Animated.View
              key={index}
              style={{
                height: itemHeight,
                justifyContent: 'center',
                alignItems: 'center',
                transform: [{ scale }],
                opacity,
              }}
            >
              <Text style={{
                  fontSize: 20,
                  fontWeight: isSelected ? '700' : '400',
                  textAlign: 'center',
                  color: isSelected ? (selectedTextColor ?? textColor) : textColor,
              }}>
                {item}
              </Text>
            </Animated.View>
          );
        })}
      </Animated.ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  indicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 0,
    flexDirection: 'column',
  },
  indicatorLine: {
    height: 1,
    width: '100%',
    opacity: 0.3
  }
});
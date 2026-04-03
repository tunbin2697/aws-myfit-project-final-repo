import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View, ViewProps } from 'react-native';
import { cn } from '../../utils/cn';

type SkeletonProps = ViewProps & {
  className?: string;
};

export function Skeleton({ className, style, ...props }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.45,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      className={cn('bg-gray-200 rounded-lg', className)}
      style={[{ opacity }, style]}
      {...props}
    />
  );
}

type ScreenSkeletonProps = {
  cards?: number;
  showHeader?: boolean;
};

export function ScreenSkeleton({ cards = 3, showHeader = true }: ScreenSkeletonProps) {
  return (
    <View className="flex-1 bg-gray-50 px-6 pt-6">
      {showHeader ? (
        <View className="mb-5">
          <Skeleton className="h-7 w-48 mb-3" />
          <Skeleton className="h-4 w-32" />
        </View>
      ) : null}

      {Array.from({ length: cards }).map((_, idx) => (
        <View key={idx} className="bg-white rounded-2xl p-4 mb-4 border border-gray-100">
          <View className="flex-row items-center justify-between mb-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-14" />
          </View>
          <Skeleton className="h-3 w-full mb-2" />
          <Skeleton className="h-3 w-4/5 mb-2" />
          <Skeleton className="h-3 w-2/3" />
        </View>
      ))}
    </View>
  );
}

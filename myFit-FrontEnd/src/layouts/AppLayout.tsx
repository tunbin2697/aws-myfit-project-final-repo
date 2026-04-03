import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AppLayoutProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function AppLayout({ children, style }: AppLayoutProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[
      styles.container, 
      { paddingTop: insets.top, paddingBottom: insets.bottom },
      style
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

import React from 'react';
import { View, StyleSheet, ScrollView, ViewStyle } from 'react-native';

interface ScreenLayoutProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
}

export function ScreenLayout({ children, scrollable = false, style }: ScreenLayoutProps) {
  const Container = scrollable ? ScrollView : View;

  return (
    <Container style={[styles.container, style]} contentContainerStyle={scrollable ? styles.contentContainer : undefined}>
      {children}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  contentContainer: {
    flexGrow: 1,
  },
});

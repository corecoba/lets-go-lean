import React from 'react';
import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{
      headerShown: false,
      gestureEnabled: false,
    }}>
      <Stack.Screen name="goal-selection" />
      <Stack.Screen name="education" />
      <Stack.Screen name="weight-input" />
      <Stack.Screen name="height-input" />
      <Stack.Screen name="gender-age" />
      <Stack.Screen name="activity-level" />
      <Stack.Screen name="target-weight" />
    </Stack>
  );
} 
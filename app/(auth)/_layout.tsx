import React from 'react';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: 'white' }
    }}>
      <Stack.Screen 
        name="login" 
        options={{ 
          title: 'Login'
        }} 
      />
      <Stack.Screen 
        name="register" 
        options={{ 
          title: 'Register'
        }} 
      />
    </Stack>
  );
}
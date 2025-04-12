import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';

export default function LoginRedirect() {
  useEffect(() => {
    // Redirect to the proper login page
    router.replace('/(auth)/login');
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
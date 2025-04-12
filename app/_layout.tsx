import React from 'react';
import { Stack, SplashScreen } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { theme } from '../src/theme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useCallback } from 'react';
import { useFonts } from 'expo-font';
import { View } from 'react-native';
import { AuthProvider } from '../src/contexts/AuthContext';
import DebugPanel from '../src/components/debug/DebugPanel';
import AuthGuard from '../src/components/auth/AuthGuard';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    // Add any custom fonts here if needed
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <AuthGuard>
          <PaperProvider theme={theme}>
            <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="splash" />
                <Stack.Screen name="landing" />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="onboarding" options={{ headerShown: false }} />
                <Stack.Screen name="auth" options={{ headerShown: false }} />
              </Stack>
              
              {/* Debug panel only appears in development mode */}
              <DebugPanel />
            </View>
          </PaperProvider>
        </AuthGuard>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
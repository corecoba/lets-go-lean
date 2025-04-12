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
import { ErrorBoundary } from '../src/components/common/ErrorBoundary';

// Prevent auto-hiding splash screen
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: 'index',
};

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
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <AuthGuard>
            <PaperProvider theme={theme}>
              <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
                <Stack
                  screenOptions={{
                    headerShown: false,
                    animation: 'slide_from_right',
                    gestureEnabled: true,
                    gestureDirection: 'horizontal',
                  }}
                >
                  {/* Initial screens */}
                  <Stack.Screen 
                    name="index"
                    options={{
                      animation: 'none',
                    }}
                  />
                  <Stack.Screen 
                    name="splash"
                    options={{
                      animation: 'none',
                    }}
                  />
                  <Stack.Screen 
                    name="landing"
                    options={{
                      animation: 'fade',
                    }}
                  />
                  
                  {/* Onboarding flow */}
                  <Stack.Screen 
                    name="onboarding"
                    options={{
                      animation: 'slide_from_right',
                    }}
                  />
                  
                  {/* Auth routes */}
                  <Stack.Screen 
                    name="(auth)"
                    options={{
                      headerShown: false,
                      presentation: 'modal',
                      animation: 'slide_from_bottom',
                    }}
                  />
                  
                  {/* Main app */}
                  <Stack.Screen 
                    name="(tabs)"
                    options={{
                      headerShown: false,
                      animation: 'fade',
                    }}
                  />
                </Stack>
                
                {/* Debug panel only appears in development mode */}
                <DebugPanel />
              </View>
            </PaperProvider>
          </AuthGuard>
        </AuthProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
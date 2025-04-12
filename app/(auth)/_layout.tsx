import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { View, ActivityIndicator, Text } from 'react-native';
import { router } from 'expo-router';
import { logger } from '../../src/utils/logger';

export default function AuthLayout() {
  const { session, loading, refreshSession } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // When component mounts, force a session refresh to ensure we have the latest auth state
  useEffect(() => {
    refreshSession();
  }, []);

  useEffect(() => {
    if (loading) return;
    
    logger.debug('(auth) layout auth check', {
      isLoggedIn: !!session,
      userEmail: session?.user?.email,
      isRedirecting
    });
    
    if (session && !isRedirecting) {
      // User is already logged in, redirect to main app
      setIsRedirecting(true);
      
      logger.debug('(auth) layout redirecting logged-in user', {
        to: '/(tabs)/my-diary'
      });
      
      // Force immediate navigation rather than using setTimeout
      router.replace('/(tabs)/my-diary');
    }
  }, [session, loading, isRedirecting]);

  if (loading || (session && isRedirecting)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={{ marginTop: 10 }}>
          {loading ? 'Checking authentication...' : 'Redirecting to app...'}
        </Text>
        {__DEV__ && (
          <Text style={{ marginTop: 5, fontSize: 12, color: '#666' }}>
            Session: {session ? `Logged in as ${session.user?.email}` : 'No session'}
          </Text>
        )}
      </View>
    );
  }

  return (
    <Stack screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: 'white' }
    }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
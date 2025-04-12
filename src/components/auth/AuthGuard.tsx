import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, Platform } from 'react-native';
import { router, usePathname, useSegments } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { logger } from '../../utils/logger';

type Props = {
  children: React.ReactNode;
};

/**
 * AuthGuard prevents logged-in users from accessing auth screens
 * and redirects them to the main app.
 */
const AuthGuard: React.FC<Props> = ({ children }) => {
  const { session, loading } = useAuth();
  const pathname = usePathname();
  const segments = useSegments();
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  // Debug status message to help us understand the auth state
  const status = loading ? 'Loading...' : 
                session ? `Logged in as ${session.user?.email}` : 
                'Not logged in';
  
  // More robust auth route detection
  const isAuthRoute = pathname.includes('/login') || 
                      pathname.includes('/register') ||
                      pathname.includes('/forgot-password') ||
                      pathname === '/(auth)' ||
                      pathname === '/auth' ||
                      pathname.startsWith('/(auth)/') || 
                      pathname.startsWith('/auth/') ||
                      (segments[0] === 'auth') || 
                      (segments[0] === '(auth)');
  
  useEffect(() => {
    // Only proceed if loading is complete
    if (loading) return;
    
    // Log the current state for debugging
    logger.debug('AuthGuard state check', {
      pathname,
      segments,
      isAuthRoute,
      isLoggedIn: !!session,
      userEmail: session?.user?.email,
      platform: Platform.OS
    });
    
    // If user is logged in and trying to access auth routes, redirect them
    if (session && isAuthRoute && !isRedirecting) {
      // Set redirecting state to prevent multiple redirects
      setIsRedirecting(true);
      
      logger.debug('AuthGuard: Blocking auth page access for logged-in user', {
        from: pathname,
        to: '/(tabs)/my-diary'
      });
      
      // Force immediate redirect
      router.replace('/(tabs)/my-diary');
    }
  }, [session, loading, pathname, segments, isAuthRoute, isRedirecting]);

  // For debugging in dev mode
  if (__DEV__) {
    logger.debug('AuthGuard render info', { 
      isAuthRoute, 
      isLoggedIn: !!session,
      pathname,
      isRedirecting
    });
  }

  // Show loading indicator during initial auth check
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={{ marginTop: 10 }}>Loading authentication...</Text>
      </View>
    );
  }

  // If the user is logged in and trying to access auth pages, 
  // show loading until redirect happens
  if ((session && isAuthRoute) || isRedirecting) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={{ marginTop: 10 }}>Redirecting to app...</Text>
        {__DEV__ && (
          <Text style={{ marginTop: 5, fontSize: 12, color: '#666' }}>
            Auth state: {status}{'\n'}
            Path: {pathname}
          </Text>
        )}
      </View>
    );
  }

  // Otherwise, render children
  return <>{children}</>;
};

export default AuthGuard; 
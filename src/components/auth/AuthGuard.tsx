import React, { useEffect, useState, useCallback } from 'react';
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
  
  // Debug status message
  const status = loading ? 'Loading...' : 
                session ? `Logged in as ${session.user?.email}` : 
                'Not logged in';

  // Define route types
  const isAuthRoute = pathname === '/login' || 
                     pathname === '/register' ||
                     pathname === '/(auth)/login' ||
                     pathname === '/(auth)/register' ||
                     pathname.startsWith('/(auth)/');

  const isPublicRoute = pathname === '/landing' || 
                       pathname === '/' || 
                       pathname === '/splash' ||
                       pathname === '/index' ||
                       pathname.startsWith('/onboarding/') ||
                       pathname === '/onboarding';

  const isProtectedRoute = !isAuthRoute && !isPublicRoute;

  const handleRedirect = useCallback(async (targetPath: string) => {
    if (isRedirecting) return;
    
    try {
      setIsRedirecting(true);
      await router.replace(targetPath);
    } catch (error) {
      logger.error('Navigation error in AuthGuard', error);
    } finally {
      // Reset redirecting state after a short delay to prevent rapid re-renders
      setTimeout(() => setIsRedirecting(false), 100);
    }
  }, [isRedirecting]);
  
  useEffect(() => {
    if (loading) return;
    
    logger.debug('AuthGuard state check', {
      pathname,
      segments,
      isAuthRoute,
      isPublicRoute,
      isProtectedRoute,
      isLoggedIn: !!session,
      platform: Platform.OS,
      sessionDetails: session ? {
        email: session.user?.email,
        id: session.user?.id,
        expiresAt: session.expires_at
      } : null
    });

    // Case 1: Logged-in user trying to access auth routes
    if (session && isAuthRoute) {
      handleRedirect('/(tabs)/my-diary');
    }
    
    // Case 2: Non-logged-in user trying to access protected routes
    if (!session && isProtectedRoute && !pathname.startsWith('/onboarding/')) {
      handleRedirect('/landing');
    }

    // Case 3: Logged-in user on splash/index should go to main app
    if (session && (pathname === '/splash' || pathname === '/index' || pathname === '/')) {
      handleRedirect('/(tabs)/my-diary');
    }

    // Case 4: Non-logged-in user on splash/index should go to landing
    if (!session && (pathname === '/splash' || pathname === '/index' || pathname === '/')) {
      handleRedirect('/landing');
    }
  }, [session, loading, pathname, isAuthRoute, isProtectedRoute, handleRedirect]);

  // For debugging in dev mode
  if (__DEV__) {
    logger.debug('AuthGuard render info', { 
      isAuthRoute, 
      isPublicRoute,
      isProtectedRoute,
      pathname,
      status
    });
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  return <>{children}</>;
};

export default AuthGuard; 
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';

interface AuthContextType {
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
  signIn: async () => ({}),
  signOut: async () => {},
  refreshSession: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to refresh session state
  const refreshSession = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        logger.error('Error refreshing session', error);
        return;
      }
      
      logger.debug('Session refreshed', { 
        isLoggedIn: !!data.session,
        userEmail: data.session?.user?.email 
      });
      
      setSession(data.session);
    } catch (error) {
      logger.error('Exception during session refresh', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Log the AuthProvider mount
    logger.debug('AuthProvider mounted - checking session');

    // Get initial session
    (async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          logger.error('Error getting initial session', error);
          setLoading(false);
          return;
        }
        
        logger.debug('Initial session check', { 
          isLoggedIn: !!data.session,
          userEmail: data.session?.user?.email,
          userId: data.session?.user?.id
        });
        
        setSession(data.session);
      } catch (error) {
        logger.error('Exception during initial session check', error);
      } finally {
        setLoading(false);
      }
    })();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      logger.debug('Auth state changed', { 
        event: _event,
        isLoggedIn: !!session,
        userEmail: session?.user?.email,
        userId: session?.user?.id
      });
      
      setSession(session);
      setLoading(false);
    });

    return () => {
      logger.debug('Unsubscribing from auth state changes');
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    logger.debug('Attempting sign in', { email });
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        logger.error('Sign in error', { error });
        throw error;
      }
      
      logger.debug('Sign in successful', { 
        userId: data.user?.id,
        userEmail: data.user?.email 
      });
      
      return data;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    logger.debug('Attempting sign out');
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        logger.error('Sign out error', { error });
        throw error;
      }
      
      logger.debug('Sign out successful');
      // Explicitly clear session on signout
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  // Log the current auth state when it changes for easier debugging
  useEffect(() => {
    logger.debug('Auth state in context', { 
      isLoggedIn: !!session,
      userEmail: session?.user?.email,
      userId: session?.user?.id,
      isLoading: loading
    });
  }, [session, loading]);

  return (
    <AuthContext.Provider value={{ session, loading, signIn, signOut, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
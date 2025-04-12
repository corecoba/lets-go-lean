import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';
import Constants from 'expo-constants';

// Get Supabase URL and anon key from environment variables or Constants
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || Constants.expoConfig?.extra?.supabaseUrl;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || Constants.expoConfig?.extra?.supabaseAnonKey;

// Validate that we have the required configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase configuration. Please check your environment variables.');
}

// Add custom fetch with logging for debugging
const customFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const method = init?.method || 'GET';
  const url = typeof input === 'string' ? input : input.toString();
  
  try {
    logger.debug(`Supabase API request: ${method} ${url.split('?')[0]}`);
    
    // Special handling for test emails in development mode
    if (__DEV__ && url.includes('/auth/v1/signup') && init?.body) {
      try {
        const bodyStr = init.body.toString();
        const body = JSON.parse(bodyStr);
        
        if (body.email && (
          body.email.includes('test') || 
          body.email.includes('example') || 
          body.email.endsWith('gmail.com')
        )) {
          logger.debug('Using test email in development mode', { email: body.email });
          
          // For test domains, use a proper domain that will pass validation
          if (body.email.endsWith('@gmail.com') || body.email.endsWith('@test.com')) {
            // No need to modify - gmail.com should work
          } else if (body.email.includes('@example') || body.email.includes('@test')) {
            // These might be rejected, try to handle better in development
            logger.warn('Using test email that might be rejected by Supabase', { 
              email: body.email,
              suggestion: 'Use a real email format like test@gmail.com' 
            });
          }
        }
      } catch (e) {
        // Just log and continue if we can't parse the body
        logger.debug('Could not parse request body for email validation', e);
      }
    }
    
    // Make the actual request
    const response = await fetch(input, init);
    
    // Log error responses for debugging
    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      let errorData;
      
      try {
        if (contentType && contentType.includes('application/json')) {
          errorData = await response.clone().json();
        } else {
          errorData = await response.clone().text();
        }
        
        logger.debug(`Supabase API error: ${response.status}`, { 
          url: url.split('?')[0],
          status: response.status,
          statusText: response.statusText,
          errorData
        });
      } catch (e) {
        logger.error('Error parsing error response', e);
      }
    }
    
    return response;
  } catch (error) {
    logger.error(`Supabase API request failed: ${method} ${url.split('?')[0]}`, error);
    throw error;
  }
};

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    fetch: customFetch,
  },
});

// Export a development-friendly version for testing
export const getTestEmail = (base = 'user') => {
  // Generate a unique email that should pass Supabase validation
  const timestamp = new Date().getTime();
  return `${base}${timestamp}@gmail.com`;
};
// lets-go-lean/app/(auth)/register.tsx
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Button, TextInput, HelperText, Text } from 'react-native-paper';
import { router } from 'expo-router';
import { supabase, getTestEmail } from '../../src/lib/supabase';
import { storage } from '../../src/utils/storage';
import { logger } from '../../src/utils/logger';
import WelcomeModal from '../../src/components/common/WelcomeModal';

const MAX_RETRIES = 3;
const RETRY_DELAY = 20000; // 20 seconds for Supabase rate limiting

interface RegisterForm {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export default function Register() {
  const [loading, setLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [form, setForm] = useState<RegisterForm>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });

  // Validate email format
  const validateEmail = (email: string): boolean => {
    // More comprehensive email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    if (!form.email || !form.password || !form.firstName) {
      Alert.alert('Error', 'Please fill in all required fields');
      return false;
    }

    if (!validateEmail(form.email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address format');
      return false;
    }

    if (form.password.length < 8) {
      Alert.alert('Invalid Password', 'Password must be at least 8 characters long');
      return false;
    }

    return true;
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  async function signUpWithEmail() {
    let retryCount = 0;
    
    const attemptSignUp = async (): Promise<void> => {
      if (!validateForm()) return;

      setLoading(true);
      try {
        // Check if we're retrying due to rate limiting
        if (retryCount > 0) {
          Alert.alert(
            'Please wait',
            `Supabase security requires a brief wait between signup attempts. Retrying in ${RETRY_DELAY/1000} seconds...`,
            [{ text: 'OK' }]
          );
        }
        
        // Log the signup attempt for debugging
        logger.debug('Attempting signup', { 
          email: form.email,
          firstName: form.firstName
        });
        
        // For test emails in development, make sure we're using the helper
        if (__DEV__ && (form.email.includes('test') || form.email.includes('example'))) {
          const recommendedEmail = getTestEmail(form.email.split('@')[0]);
          
          // If the email doesn't match our recommended format, suggest it
          if (form.email !== recommendedEmail) {
            logger.warn('Using potentially problematic test email', {
              current: form.email,
              recommended: recommendedEmail
            });
            
            // Offer to replace with a safer test email
            Alert.alert(
              'Test Email Format',
              `The email "${form.email}" might be rejected by Supabase. Would you like to use "${recommendedEmail}" instead?`,
              [
                {
                  text: 'Keep Current',
                  style: 'cancel'
                },
                {
                  text: 'Use Recommended',
                  onPress: () => {
                    setForm(prev => ({ ...prev, email: recommendedEmail }));
                    // Resume the signup after a brief delay to let state update
                    setTimeout(() => attemptSignUp(), 500);
                    return; // Exit this attempt early
                  }
                }
              ]
            );
            setLoading(false);
            return; // Exit this attempt early
          }
        }
        
        // Sign up with Supabase Auth - include email confirmation based on environment
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            // In development, don't require email confirmation
            emailRedirectTo: __DEV__ ? undefined : window.location.origin,
            data: {
              first_name: form.firstName,
              last_name: form.lastName || null
            }
          }
        });

        if (signUpError) {
          // Check for rate limiting errors specifically
          if (signUpError.message.includes('security purposes') || 
              signUpError.message.includes('429') || 
              signUpError.message.toLowerCase().includes('rate limit')) {
            
            logger.debug('Rate limiting detected, will retry', { 
              retryCount, 
              maxRetries: MAX_RETRIES, 
              delay: RETRY_DELAY,
              error: signUpError.message 
            });
            
            if (retryCount < MAX_RETRIES) {
              retryCount++;
              
              // Show a toast or alert about waiting
              Alert.alert(
                'Signup rate limited',
                `For security reasons, please wait ${RETRY_DELAY/1000} seconds before trying again. The app will automatically retry.`,
                [{ text: 'OK' }]
              );
              
              // Wait and retry
              await sleep(RETRY_DELAY);
              return attemptSignUp();
            }
          }
          
          // Check if the user might already exist
          if (signUpError.message.includes('already registered') || 
              signUpError.message.includes('already exists') ||
              signUpError.message.includes('already been registered')) {
            
            logger.debug('User may already exist, attempting login', { email: form.email });
            
            // Ask user if they want to try logging in instead
            Alert.alert(
              'Account May Exist',
              'An account with this email may already exist. Would you like to try logging in instead?',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                  onPress: () => {
                    setLoading(false);
                  }
                },
                {
                  text: 'Try Login',
                  onPress: async () => {
                    try {
                      const { data, error } = await supabase.auth.signInWithPassword({
                        email: form.email,
                        password: form.password,
                      });
                      
                      if (error) {
                        logger.debug('Login attempt failed', { error });
                        throw error;
                      }
                      
                      if (data.user) {
                        logger.debug('Login successful after signup failure', { userId: data.user.id });
                        // Navigate to main app
                        router.replace('/(tabs)');
                        return;
                      }
                    } catch (loginError) {
                      Alert.alert(
                        'Login Failed', 
                        'Could not log in with these credentials. Please check your email and password or use the forgot password option.',
                        [{ text: 'OK' }]
                      );
                      setLoading(false);
                    }
                  }
                }
              ]
            );
            return;
          }
          
          // For other errors, just throw
          if (signUpError) {
            // Log specific error message for debugging
            logger.debug('Signup error details', { 
              message: signUpError.message,
              status: signUpError.status
            });
            throw signUpError;
          }
        }

        if (!authData.user) throw new Error('No user data returned');

        // Get onboarding data from local storage
        const onboardingData = await storage.getOnboardingData();

        // Log onboarding data for debugging
        logger.debug('Onboarding data validation check', onboardingData);

        // Check individual fields for debugging
        logger.debug('Onboarding data field check', {
          has_current_weight: !!onboardingData?.current_weight,
          has_height: !!onboardingData?.height,
          has_activity_level: !!onboardingData?.activity_level,
          has_goal: !!onboardingData?.goal,
          has_target_weight: !!onboardingData?.target_weight,
          has_bmr: !!onboardingData?.bmr,
          has_target_calories: !!onboardingData?.target_calories,
          has_estimated_goal_date: !!onboardingData?.estimated_goal_date,
          has_gender: !!onboardingData?.gender,
          has_birth_date: !!onboardingData?.birth_date,
        });

        // Validate required onboarding data
        if (!onboardingData?.current_weight || !onboardingData?.height || 
            !onboardingData?.activity_level || !onboardingData?.goal || 
            !onboardingData?.target_weight || !onboardingData?.bmr ||
            !onboardingData?.target_calories || !onboardingData?.estimated_goal_date ||
            !onboardingData?.gender || !onboardingData?.birth_date) {
          throw new Error('Missing required onboarding data');
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) {
          throw new Error('Invalid email format');
        }

        // Validate password strength
        if (form.password.length < 8) {
          throw new Error('Password must be at least 8 characters long');
        }

        // Create user profile with onboarding data
        const userProfileData = {
          id: authData.user.id,
          email: form.email,
          first_name: form.firstName,
          last_name: form.lastName || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true,
          goal_type: onboardingData.goal,
          current_weight: onboardingData.current_weight,
          height: onboardingData.height,
          gender: onboardingData.gender,
          birth_date: onboardingData.birth_date,
          activity_level: onboardingData.activity_level,
          target_weight: onboardingData.target_weight,
          bmr: onboardingData.bmr,
          target_calories: onboardingData.target_calories,
          estimated_goal_date: onboardingData.estimated_goal_date,
          last_ideal_shape: 'never'
        };
        
        // Try to use the RPC function first (more reliable with RLS)
        let profileError = null;
        
        try {
          // Method 1: Use the create_user_profile RPC function (bypasses RLS)
          const { error } = await supabase.rpc('create_user_profile', {
            user_id: authData.user.id,
            user_email: form.email,
            first_name: form.firstName,
            last_name: form.lastName || null,
            goal_type: onboardingData.goal,
            current_weight: onboardingData.current_weight,
            height: onboardingData.height,
            gender: onboardingData.gender,
            birth_date: onboardingData.birth_date,
            activity_level: onboardingData.activity_level,
            target_weight: onboardingData.target_weight,
            bmr: onboardingData.bmr,
            target_calories: onboardingData.target_calories,
            estimated_goal_date: onboardingData.estimated_goal_date,
            last_ideal_shape: 'never'
          });
          
          profileError = error;
          
          if (error) {
            logger.debug('RPC method failed, trying direct insert', { error });
            
            // Method 2: Fall back to direct insert if RPC doesn't exist
            const { error: insertError } = await supabase
              .from('users')
              .insert([userProfileData]);
              
            profileError = insertError;
          }
        } catch (err) {
          // Method 2: Fall back to direct insert if RPC throws error
          logger.debug('RPC method threw error, trying direct insert', { err });
          
          const { error: insertError } = await supabase
            .from('users')
            .insert([userProfileData]);
            
          profileError = insertError;
        }

        if (profileError) {
          console.error('Profile creation error:', profileError);
          throw new Error('Failed to create user profile');
        }

        // Log registration data for debugging
        logger.userEvent('registration_completed', {
          userId: authData.user.id,
          email: form.email,
          firstName: form.firstName,
          lastName: form.lastName,
          registrationTime: new Date().toISOString(),
          goal: onboardingData.goal,
          currentWeight: onboardingData.current_weight,
          targetWeight: onboardingData.target_weight,
          height: onboardingData.height,
          activityLevel: onboardingData.activity_level,
          bmr: onboardingData.bmr,
          targetCalories: onboardingData.target_calories,
          estimatedGoalDate: onboardingData.estimated_goal_date,
        }, { tags: ['registration', 'onboarding'] });

        // Clear onboarding data from local storage
        await storage.clearOnboardingData();
        
        // Show welcome modal
        setShowWelcome(true);
      } catch (error) {
        console.error('Registration error:', error);
        logger.error('Registration failed', error, { tags: ['registration', 'error'] });
        Alert.alert('Registration Failed', 
          error instanceof Error ? error.message : 'An unknown error occurred');
        setLoading(false);
      }
    };

    return attemptSignUp();
  }

  const handleWelcomeModalDismiss = () => {
    setShowWelcome(false);
    
    // Log navigation attempt
    logger.debug('Attempting navigation after registration', {
      destination: '/(tabs)/add-diary'
    });
    
    try {
      // Navigate to Add Diary screen instead of My Diary
      router.replace('/(tabs)/add-diary');
    } catch (navigationError) {
      // Log navigation error
      logger.error('Navigation error after registration', navigationError);
      
      // Show error to user
      Alert.alert(
        'Navigation Error',
        'There was a problem navigating to the main app. The app will restart.',
        [{ 
          text: 'OK',
          onPress: () => router.replace('/splash')
        }]
      );
    }
  };

  // Add a helper function for development mode to use test emails
  const useTestEmail = () => {
    if (__DEV__) {
      const testEmail = getTestEmail();
      setForm(prev => ({ ...prev, email: testEmail }));
      logger.debug('Using test email', { email: testEmail });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <Text variant="headlineMedium" style={styles.title}>Create Account</Text>
        <TextInput
          label="Email"
          value={form.email}
          onChangeText={(text) => setForm({ ...form, email: text })}
          mode="outlined"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {__DEV__ && (
          <TouchableOpacity onPress={useTestEmail} style={styles.devHelper}>
            <Text style={styles.devHelperText}>Use test email (dev only)</Text>
          </TouchableOpacity>
        )}
        <TextInput
          label="Password"
          value={form.password}
          onChangeText={(text) => setForm({ ...form, password: text })}
          mode="outlined"
          style={styles.input}
          secureTextEntry
        />
        <HelperText type="info">
          Password must be at least 8 characters long
        </HelperText>
        <TextInput
          label="First Name"
          value={form.firstName}
          onChangeText={(text) => setForm({ ...form, firstName: text })}
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Last Name (Optional)"
          value={form.lastName}
          onChangeText={(text) => setForm({ ...form, lastName: text })}
          mode="outlined"
          style={styles.input}
        />
        <Button
          mode="contained"
          style={styles.button}
          onPress={signUpWithEmail}
          loading={loading}
          disabled={loading}
        >
          Create Account
        </Button>
        <Button
          mode="text"
          onPress={() => router.push('/login')}
          style={styles.button}
          disabled={loading}
        >
          Already have an account? Log in
        </Button>
      </ScrollView>

      <WelcomeModal 
        visible={showWelcome} 
        onDismiss={handleWelcomeModalDismiss} 
        userName={form.firstName}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 12,
  },
  logoutButton: {
    marginTop: 16,
    marginBottom: 8,
  },
  devHelper: {
    paddingVertical: 8,
    alignSelf: 'flex-end',
  },
  devHelperText: {
    color: '#2196F3',
    fontSize: 12,
  },
});
// lets-go-lean/app/onboarding/target-weight.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, TextInput, HelperText } from 'react-native-paper';
import { router } from 'expo-router';
import { OnboardingData, storage } from '../../src/utils/storage';
import { logger } from '../../src/utils/logger';
import { 
  calculateBMR, 
  calculateTDEE, 
  calculateTargetCalories, 
  calculateEstimatedGoalDate 
} from '../../src/utils/healthCalculations';
import { Gender, ActivityLevel, GoalType } from '@/lib/types';

export default function TargetWeight() {
  const [targetWeight, setTargetWeight] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateTargetWeight = async (value: string) => {
    const numValue = Number(value);
    if (isNaN(numValue)) {
      setError('Please enter a valid number');
      return false;
    }
    if (numValue < 30 || numValue > 300) {
      setError('Target weight must be between 30 and 300 kg');
      return false;
    }

    // Get current weight to validate target
    const existingData = await storage.getOnboardingData();
    if (!existingData?.current_weight) {
      setError('Current weight data is missing');
      return false;
    }

    const currentWeight = existingData.current_weight;
    const weightDiff = Math.abs(currentWeight - numValue);
    const maxSafeChange = currentWeight * 0.25; // Max 25% change from current weight

    if (weightDiff > maxSafeChange) {
      setError(`Target weight should be within 25% of your current weight (${Math.round(currentWeight - maxSafeChange)} - ${Math.round(currentWeight + maxSafeChange)} kg)`);
      return false;
    }

    setError('');
    return true;
  };

  async function handleNext() {
    if (!await validateTargetWeight(targetWeight)) return;

    setLoading(true);
    try {
      // Get existing onboarding data
      const existingData = await storage.getOnboardingData();
      if (!existingData) {
        setError('Missing onboarding data. Please start over.');
        setLoading(false);
        return;
      }

      // Validate that required fields exist
      const requiredFields = {
        current_weight: 'current weight',
        height: 'height',
        gender: 'gender',
        birth_date: 'birth date',
        activity_level: 'activity level',
        goal: 'goal'
      };

      // Check each required field
      for (const [field, label] of Object.entries(requiredFields)) {
        if (!existingData[field as keyof OnboardingData]) {
          setError(`Missing ${label}. Please go back and complete all steps.`);
          setLoading(false);
          return;
        }
      }
      
      // Log the complete onboarding data to debug
      logger.debug('Complete onboarding data before calculations', existingData);

      // Calculate age from birth date
      let age = 30; // Default fallback
      if (existingData.birth_date) {
        const birthDate = new Date(existingData.birth_date);
        const today = new Date();
        age = today.getFullYear() - birthDate.getFullYear();
        // Adjust age if birthday hasn't occurred yet this year
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
      }

      logger.debug('Calculation inputs', { 
        age,
        gender: existingData.gender,
        current_weight: existingData.current_weight,
        height: existingData.height,
        activity_level: existingData.activity_level,
        goal: existingData.goal
      });

      // Calculate BMR
      const bmr = calculateBMR(
        existingData.current_weight as number,
        existingData.height as number,
        age,
        existingData.gender as Gender
      );
      logger.debug('BMR calculated', { bmr });

      // Calculate TDEE
      const tdee = calculateTDEE(bmr, existingData.activity_level as ActivityLevel);
      logger.debug('TDEE calculated', { tdee, activityLevel: existingData.activity_level });

      // Calculate target calories
      const target_calories = calculateTargetCalories(tdee, existingData.goal as GoalType);
      logger.debug('Target calories calculated', { target_calories, goal: existingData.goal });

      // Calculate estimated goal date
      const estimated_goal_date = calculateEstimatedGoalDate(
        existingData.current_weight as number,
        Number(targetWeight),
        existingData.goal as GoalType
      );
      logger.debug('Estimated goal date calculated', { 
        estimated_goal_date: estimated_goal_date.toISOString(), 
        currentWeight: existingData.current_weight,
        targetWeight: Number(targetWeight)
      });

      // Save all data including calculations
      const updatedData = await storage.saveOnboardingData({
        ...existingData,  // Keep existing data
        target_weight: Number(targetWeight),
        bmr,
        tdee,
        target_calories,
        estimated_goal_date: estimated_goal_date.toISOString().split('T')[0]
      });

      logger.debug('Complete onboarding data saved', updatedData);
      
      // Redirect to registration screen with proper path
      router.push('/auth/register');
    } catch (error) {
      logger.error('Target weight screen error', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const onboardingData = localStorage.getItem('onboardingData');
    if (onboardingData) {
      const data = JSON.parse(onboardingData) as OnboardingData;
      
      // Check for required fields
      if (!data.birth_date || !data.current_weight || !data.height || !data.gender || !data.activity_level || !data.goal) {
        console.error('Missing required onboarding data');
        return;
      }

      // Calculate age properly
      const birthDate = new Date(data.birth_date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const adjustedAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) 
        ? age - 1 
        : age;

      // Calculate BMR and TDEE
      const bmr = calculateBMR(
        data.current_weight,
        data.height,
        adjustedAge,
        data.gender
      );
      
      const tdee = calculateTDEE(bmr, data.activity_level as ActivityLevel);
      const targetCalories = calculateTargetCalories(tdee, data.goal as GoalType);
      
      // Calculate estimated goal date
      const estimatedDate = calculateEstimatedGoalDate(
        data.current_weight,
        data.target_weight || 0,
        data.goal as GoalType
      );

      console.log('Calculated values:', {
        bmr,
        tdee,
        targetCalories,
        estimatedDate: estimatedDate.toISOString()
      });
    }
  }, []);

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>What's your target weight?</Text>
      <Text variant="bodyLarge" style={styles.subtitle}>This helps us create your personalized plan</Text>

      <TextInput
        label="Target Weight (kg)"
        value={targetWeight}
        onChangeText={(text) => {
          setTargetWeight(text);
          validateTargetWeight(text);
        }}
        mode="outlined"
        style={styles.input}
        keyboardType="numeric"
        error={!!error}
      />
      <HelperText type="error" visible={!!error}>
        {error}
      </HelperText>

      <Button
        mode="contained"
        style={styles.button}
        onPress={handleNext}
        loading={loading}
        disabled={!targetWeight || loading || !!error}
        buttonColor="#4CAF50"
      >
        Complete Setup
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  input: {
    marginVertical: 16,
  },
  button: {
    marginTop: 24,
    borderRadius: 8,
  },
});
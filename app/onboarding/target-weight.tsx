// lets-go-lean/app/onboarding/target-weight.tsx
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, TextInput, HelperText } from 'react-native-paper';
import { router } from 'expo-router';
import { storage } from '../../src/utils/storage';
import { logger } from '../../src/utils/logger';
import { 
  calculateBMR, 
  calculateTDEE, 
  calculateTargetCalories, 
  calculateEstimatedGoalDate 
} from '../../src/utils/healthCalculations';

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
      if (!existingData) throw new Error('Missing onboarding data');

      // Log the complete onboarding data to debug
      logger.debug('Complete onboarding data before calculations', existingData);
      
      // Validate that required fields exist
      if (!existingData.current_weight) throw new Error('Missing current weight');
      if (!existingData.height) throw new Error('Missing height');
      if (!existingData.gender) throw new Error('Missing gender');
      if (!existingData.birth_date) throw new Error('Missing birth date');
      if (!existingData.activity_level) throw new Error('Missing activity level');
      if (!existingData.goal) throw new Error('Missing goal');

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
        existingData.current_weight,
        existingData.height,
        age,
        existingData.gender
      );
      logger.debug('BMR calculated', { bmr });

      // Calculate TDEE
      const tdee = calculateTDEE(bmr, existingData.activity_level);
      logger.debug('TDEE calculated', { tdee, activityLevel: existingData.activity_level });

      // Calculate target calories
      const target_calories = calculateTargetCalories(tdee, existingData.goal);
      logger.debug('Target calories calculated', { target_calories, goal: existingData.goal });

      // Calculate estimated goal date
      const estimated_goal_date = calculateEstimatedGoalDate(
        existingData.current_weight,
        Number(targetWeight),
        existingData.goal
      );
      logger.debug('Estimated goal date calculated', { 
        estimated_goal_date: estimated_goal_date.toISOString(), 
        currentWeight: existingData.current_weight,
        targetWeight: Number(targetWeight)
      });

      // Save all data including calculations
      const updatedData = await storage.saveOnboardingData({
        target_weight: Number(targetWeight),
        bmr,
        tdee,
        target_calories,
        estimated_goal_date: estimated_goal_date.toISOString().split('T')[0]
      });

      logger.debug('Complete onboarding data saved', updatedData);
      
      // Redirect to registration screen
      router.replace('/(auth)/register');
    } catch (error) {
      logger.error('Target weight screen error', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

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
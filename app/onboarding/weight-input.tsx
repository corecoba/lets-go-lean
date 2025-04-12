import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, TextInput, HelperText } from 'react-native-paper';
import { router } from 'expo-router';
import { storage } from '../../src/utils/storage';

export default function WeightInput() {
  const [weight, setWeight] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateWeight = (value: string) => {
    const numValue = Number(value);
    if (isNaN(numValue)) {
      setError('Please enter a valid number');
      return false;
    }
    if (numValue < 30 || numValue > 300) {
      setError('Weight must be between 30 and 300 kg');
      return false;
    }
    setError('');
    return true;
  };

  async function handleNext() {
    if (!validateWeight(weight)) return;

    setLoading(true);
    try {
      // Get existing data first
      const existingData = await storage.getOnboardingData();
      
      // Save to local storage - only update the current_weight field
      await storage.saveOnboardingData({
        current_weight: Number(weight),
      });

      router.push('/onboarding/height-input');
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>What's your current weight?</Text>
      <Text variant="bodyLarge" style={styles.subtitle}>This helps us track your progress</Text>

      <TextInput
        label="Weight (kg)"
        value={weight}
        onChangeText={(text) => {
          setWeight(text);
          validateWeight(text);
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
        disabled={!weight || loading || !!error}
        buttonColor="#4CAF50"
      >
        Continue
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
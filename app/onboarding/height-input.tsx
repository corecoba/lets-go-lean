import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, TextInput, HelperText } from 'react-native-paper';
import { router } from 'expo-router';
import { storage } from '../../src/utils/storage';

export default function HeightInput() {
  const [height, setHeight] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateHeight = (value: string) => {
    const numValue = Number(value);
    if (isNaN(numValue)) {
      setError('Please enter a valid number');
      return false;
    }
    if (numValue < 100 || numValue > 250) {
      setError('Height must be between 100 and 250 cm');
      return false;
    }
    setError('');
    return true;
  };

  async function handleNext() {
    if (!validateHeight(height)) return;

    setLoading(true);
    try {
      // Save height to local storage
      await storage.saveOnboardingData({ height: Number(height) });
      router.push('/onboarding/gender-age');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>What's your height?</Text>
      <Text variant="bodyLarge" style={styles.subtitle}>This helps us calculate your BMI and BMR</Text>

      <TextInput
        label="Height (cm)"
        value={height}
        onChangeText={(text) => {
          setHeight(text);
          validateHeight(text);
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
        disabled={!height || loading || !!error}
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
  },
}); 
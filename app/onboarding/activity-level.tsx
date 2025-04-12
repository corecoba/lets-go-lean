import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, Card } from 'react-native-paper';
import { router } from 'expo-router';
import { storage } from '../../src/utils/storage';

type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'heavy';

export default function ActivityLevel() {
  const [selectedLevel, setSelectedLevel] = useState<ActivityLevel | null>(null);
  const [loading, setLoading] = useState(false);

  const activityLevels = [
    { 
      type: 'sedentary' as ActivityLevel, 
      title: 'Sedentary', 
      description: 'Little or no exercise, desk job' 
    },
    { 
      type: 'light' as ActivityLevel, 
      title: 'Light Activity', 
      description: 'Light exercise 1-2 times per week' 
    },
    { 
      type: 'moderate' as ActivityLevel, 
      title: 'Moderate Activity', 
      description: 'Moderate exercise 3-5 times per week' 
    },
    { 
      type: 'heavy' as ActivityLevel, 
      title: 'Heavy Activity', 
      description: 'Hard exercise 6-7 times per week' 
    },
  ];

  async function handleNext() {
    if (!selectedLevel) return;

    setLoading(true);
    try {
      // Save activity level to local storage
      await storage.saveOnboardingData({ activity_level: selectedLevel });
      router.push('/onboarding/target-weight');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>How active are you?</Text>
      <Text variant="bodyLarge" style={styles.subtitle}>Select your typical activity level</Text>

      {activityLevels.map((level) => (
        <Card
          key={level.type}
          style={[
            styles.card,
            selectedLevel === level.type && styles.selectedCard
          ]}
          onPress={() => setSelectedLevel(level.type)}
        >
          <Card.Content>
            <Text variant="titleLarge">{level.title}</Text>
            <Text variant="bodyMedium">{level.description}</Text>
          </Card.Content>
        </Card>
      ))}

      <Button
        mode="contained"
        style={styles.button}
        onPress={handleNext}
        loading={loading}
        disabled={!selectedLevel || loading}
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
  card: {
    marginVertical: 8,
  },
  selectedCard: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196F3',
    borderWidth: 2,
  },
  button: {
    marginTop: 24,
  },
}); 
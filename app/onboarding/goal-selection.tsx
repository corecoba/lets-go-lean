import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, Card, IconButton } from 'react-native-paper';
import { router } from 'expo-router';
import { storage } from '../../src/utils/storage';

type GoalType = 'lose_weight' | 'gain_weight' | 'get_fit';

export default function GoalSelectionScreen() {
  const [selectedGoal, setSelectedGoal] = useState<GoalType | null>(null);
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    if (!selectedGoal) return;
    
    setLoading(true);
    try {
      // Save goal to local storage
      await storage.saveOnboardingData({ goal: selectedGoal });
      router.push('/onboarding/education');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        What's your primary goal?
      </Text>
      <Text variant="bodyLarge" style={styles.subtitle}>
        Choose the goal that best matches your needs
      </Text>
      
      <View style={styles.cardsContainer}>
        <Card
          style={[styles.card, selectedGoal === 'lose_weight' && styles.selectedCard]}
          onPress={() => setSelectedGoal('lose_weight')}
        >
          <Card.Content style={styles.cardContent}>
            <IconButton
              icon="trending-down"
              size={32}
              iconColor={selectedGoal === 'lose_weight' ? '#4CAF50' : '#666666'}
            />
            <View style={styles.cardTextContainer}>
              <Text variant="titleLarge">Lose Weight</Text>
              <Text variant="bodyMedium" style={styles.cardDescription}>
                Shed extra pounds and improve your health
              </Text>
            </View>
          </Card.Content>
        </Card>

        <Card
          style={[styles.card, selectedGoal === 'gain_weight' && styles.selectedCard]}
          onPress={() => setSelectedGoal('gain_weight')}
        >
          <Card.Content style={styles.cardContent}>
            <IconButton
              icon="trending-up"
              size={32}
              iconColor={selectedGoal === 'gain_weight' ? '#4CAF50' : '#666666'}
            />
            <View style={styles.cardTextContainer}>
              <Text variant="titleLarge">Gain Weight</Text>
              <Text variant="bodyMedium" style={styles.cardDescription}>
                Build muscle and increase your mass
              </Text>
            </View>
          </Card.Content>
        </Card>

        <Card
          style={[styles.card, selectedGoal === 'get_fit' && styles.selectedCard]}
          onPress={() => setSelectedGoal('get_fit')}
        >
          <Card.Content style={styles.cardContent}>
            <IconButton
              icon="dumbbell"
              size={32}
              iconColor={selectedGoal === 'get_fit' ? '#4CAF50' : '#666666'}
            />
            <View style={styles.cardTextContainer}>
              <Text variant="titleLarge">Get Fit</Text>
              <Text variant="bodyMedium" style={styles.cardDescription}>
                Improve overall fitness and health
              </Text>
            </View>
          </Card.Content>
        </Card>
      </View>

      <Button
        mode="contained"
        onPress={handleNext}
        style={styles.button}
        disabled={!selectedGoal}
        buttonColor="#4CAF50"
      >
        Next
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    marginBottom: 10,
    textAlign: 'center',
    color: '#333333',
  },
  subtitle: {
    marginBottom: 30,
    textAlign: 'center',
    color: '#666666',
  },
  cardsContainer: {
    flex: 1,
    gap: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
  },
  selectedCard: {
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTextContainer: {
    flex: 1,
    marginLeft: 8,
  },
  cardDescription: {
    marginTop: 4,
    color: '#666666',
  },
  button: {
    marginTop: 20,
    borderRadius: 8,
  },
}); 
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Text, Card, Divider, List, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { storage } from '../../src/utils/storage';
import { GoalType } from '../../src/utils/healthCalculations';
import { logger } from '../../src/utils/logger';

interface EducationContent {
  title: string;
  subtitle: string;
  tips: string[];
  facts: string[];
  icon: string; // MaterialCommunityIcons name
  iconColor: string;
}

// Content for each goal type
const educationContent: Record<GoalType, EducationContent> = {
  lose_weight: {
    title: 'Weight Loss Tips',
    subtitle: 'Healthy weight loss is 0.5-1 kg per week',
    tips: [
      'Create a calorie deficit of 500-1000 calories per day',
      'Focus on protein and fiber for satiety',
      'Drink water before meals to reduce appetite',
      'Track your food intake every day',
      'Weigh yourself at least 3 times per week'
    ],
    facts: [
      'People who log their food regularly lose twice as much weight',
      '51.8% of people who track consistently meet their weight loss goals',
      'Muscle burns more calories than fat, even at rest',
      'Sleep deprivation can increase hunger hormones'
    ],
    icon: 'trending-down',
    iconColor: '#4CAF50'
  },
  gain_weight: {
    title: 'Weight Gain Tips',
    subtitle: 'Healthy weight gain is 0.25-0.5 kg per week',
    tips: [
      'Create a calorie surplus of 300-500 calories per day',
      'Prioritize protein intake for muscle growth',
      'Eat calorie-dense foods like nuts, avocados, and oils',
      'Consider weight training to build muscle mass',
      'Eat more frequently throughout the day'
    ],
    facts: [
      'Building muscle requires both calorie surplus and resistance training',
      'Protein needs increase during muscle building (1.6-2.2g per kg body weight)',
      'Gaining too quickly can lead to excessive fat gain',
      'Recovery is as important as training for muscle growth'
    ],
    icon: 'trending-up',
    iconColor: '#FF9800'
  },
  get_fit: {
    title: 'Fitness Improvement Tips',
    subtitle: 'Consistent effort leads to lasting results',
    tips: [
      'Aim for 150 minutes of moderate activity per week',
      'Include both cardio and strength training',
      'Start slowly and gradually increase intensity',
      'Find activities you enjoy for better adherence',
      'Allow for adequate recovery between workouts'
    ],
    facts: [
      'Exercise improves mood and reduces stress',
      'Regular physical activity reduces the risk of chronic diseases',
      'Strength training helps maintain muscle mass as you age',
      'Even short bouts of activity (5-10 minutes) provide health benefits'
    ],
    icon: 'dumbbell',
    iconColor: '#2196F3'
  }
};

export default function EducationScreen() {
  const [goalType, setGoalType] = useState<GoalType | null>(null);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<EducationContent | null>(null);

  useEffect(() => {
    const loadGoalType = async () => {
      try {
        const onboardingData = await storage.getOnboardingData();
        logger.debug('Loading goal type for education screen', onboardingData);
        
        if (onboardingData?.goal) {
          setGoalType(onboardingData.goal);
          setContent(educationContent[onboardingData.goal]);
        } else {
          // If no goal is found, default to lose_weight
          logger.warn('No goal type found in storage, defaulting to lose_weight');
          setGoalType('lose_weight');
          setContent(educationContent['lose_weight']);
        }
      } catch (error) {
        logger.error('Error loading goal type', error);
        // Default to lose_weight if there's an error
        setGoalType('lose_weight');
        setContent(educationContent['lose_weight']);
      } finally {
        setLoading(false);
      }
    };

    loadGoalType();
  }, []);

  const handleNext = () => {
    router.push('/onboarding/weight-input');
  };

  if (loading || !content) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading your personalized plan...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text variant="headlineMedium" style={styles.title}>
          {content.title}
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          {content.subtitle}
        </Text>

        <View style={styles.iconContainer}>
          <MaterialCommunityIcons 
            name={content.icon as keyof typeof MaterialCommunityIcons.glyphMap}
            size={64} 
            color={content.iconColor} 
          />
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Research-Based Approach
            </Text>
            <Text variant="bodyMedium" style={styles.evidenceText}>
              Based on research from the Retrofit study, which showed a 5.58% mean weight loss through consistent self-monitoring behaviors.
            </Text>
            
            <Divider style={styles.divider} />
            
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Science-Backed Tips
            </Text>
            {content.tips.map((tip, index) => (
              <List.Item
                key={`tip-${index}`}
                title={tip}
                left={props => <List.Icon {...props} icon="check-circle" color="#4CAF50" />}
                titleNumberOfLines={2}
              />
            ))}
            
            <Divider style={styles.divider} />
            
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Did You Know?
            </Text>
            {content.facts.map((fact, index) => (
              <List.Item
                key={`fact-${index}`}
                title={fact}
                left={props => <List.Icon {...props} icon="information" color="#2196F3" />}
                titleNumberOfLines={3}
              />
            ))}
          </Card.Content>
        </Card>

        <Text variant="bodyMedium" style={styles.disclaimer}>
          This information is based on general guidelines and research. Individual results may vary, and it's always recommended to consult with healthcare professionals.
        </Text>
      </ScrollView>

      <Button
        mode="contained"
        onPress={handleNext}
        style={styles.button}
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
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
    color: '#333333',
  },
  subtitle: {
    marginBottom: 24,
    textAlign: 'center',
    color: '#666666',
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 4,
  },
  sectionTitle: {
    marginBottom: 8,
    color: '#333333',
    fontWeight: 'bold',
  },
  evidenceText: {
    marginBottom: 16,
    fontStyle: 'italic',
  },
  divider: {
    marginVertical: 16,
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  image: {
    width: '100%',
    height: 150,
    resizeMode: 'contain',
  },
  disclaimer: {
    marginTop: 8,
    fontStyle: 'italic',
    textAlign: 'center',
    color: '#666666',
    fontSize: 12,
  },
  button: {
    margin: 20,
    borderRadius: 8,
  },
}); 
import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Modal, Text, Button, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface WelcomeModalProps {
  visible: boolean;
  onDismiss: () => void;
  userName: string;
}

const WelcomeModal = ({ visible, onDismiss, userName }: WelcomeModalProps) => {
  return (
    <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <MaterialCommunityIcons name="party-popper" size={48} color="#2196F3" />
          <Text variant="headlineSmall" style={styles.title}>Welcome, {userName}!</Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Congratulations on taking the first step towards your health goals!
          </Text>
        </View>

        <Text variant="titleMedium" style={styles.sectionTitle}>
          Getting Started
        </Text>

        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.tipItem}>
              <MaterialCommunityIcons name="scale" size={32} color="#4CAF50" style={styles.icon} />
              <View style={styles.tipContent}>
                <Text variant="titleSmall">Log Your Weight Regularly</Text>
                <Text variant="bodyMedium">
                  Users who log their weight 3+ times per week are 51% more likely to reach their goals.
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.tipItem}>
              <MaterialCommunityIcons name="food-apple" size={32} color="#FF9800" style={styles.icon} />
              <View style={styles.tipContent}>
                <Text variant="titleSmall">Track Your Food</Text>
                <Text variant="bodyMedium">
                  Consistent food logging (3+ days/week) is strongly correlated with successful weight management.
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.tipItem}>
              <MaterialCommunityIcons name="run" size={32} color="#2196F3" style={styles.icon} />
              <View style={styles.tipContent}>
                <Text variant="titleSmall">Stay Active</Text>
                <Text variant="bodyMedium">
                  Aim for at least 60 minutes of activity per week for best results.
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <Text variant="bodyMedium" style={styles.noteText}>
          Your personalized plan has been created based on your goals, current weight, height, and activity level.
        </Text>

        <Button 
          mode="contained" 
          onPress={onDismiss} 
          style={styles.button}
        >
          Let's Get Started!
        </Button>
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 8,
    maxHeight: '90%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginTop: 8,
    color: '#757575',
  },
  sectionTitle: {
    marginBottom: 12,
  },
  card: {
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 16,
  },
  tipContent: {
    flex: 1,
  },
  noteText: {
    marginVertical: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    color: '#757575',
  },
  button: {
    marginTop: 8,
    marginBottom: 16,
  },
});

export default WelcomeModal; 
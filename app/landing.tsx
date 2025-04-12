import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { router } from 'expo-router';

export default function LandingPage() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/onboarding-placeholder.svg')}
        style={styles.image}
        resizeMode="contain"
      />
      <Text variant="headlineMedium" style={styles.title}>
        Welcome to Let's Go Lean
      </Text>
      <Text variant="bodyLarge" style={styles.subtitle}>
        Your weight management and fasting partner
      </Text>
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={() => router.push('/onboarding')}
          style={styles.button}
          buttonColor="#4CAF50"
        >
          Get Started
        </Button>
        <Button
          mode="outlined"
          onPress={() => router.push('/(auth)/login')}
          style={styles.button}
          textColor="#4CAF50"
        >
          Login
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
  },
  image: {
    width: '100%',
    height: 200,
    marginBottom: 30,
  },
  title: {
    marginBottom: 10,
    textAlign: 'center',
    color: '#333333',
  },
  subtitle: {
    marginBottom: 40,
    textAlign: 'center',
    color: '#666666',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
  button: {
    marginVertical: 10,
    borderRadius: 8,
  },
}); 
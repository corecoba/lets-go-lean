import React, { useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { router } from 'expo-router';

export default function SplashScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/landing');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/logo.svg')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.subtitle}>Let's Go Lean</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#4CAF50',
  },
}); 
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { router } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();

  const validateForm = () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    setError('');
    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await signIn(email, password);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Welcome Back
      </Text>
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        mode="outlined"
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        error={!!error}
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        mode="outlined"
        style={styles.input}
        secureTextEntry
        error={!!error}
      />
      <HelperText type="error" visible={!!error}>
        {error}
      </HelperText>
      <Button
        mode="contained"
        onPress={handleLogin}
        style={styles.button}
        loading={loading}
        disabled={loading}
      >
        Login
      </Button>
      <Button
        mode="text"
        onPress={() => router.push('/register')}
        style={styles.button}
        disabled={loading}
      >
        Don't have an account? Register
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  title: {
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
});
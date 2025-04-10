import { View, StyleSheet } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { Link } from 'expo-router';
import React from 'react';

export default function Login() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Welcome to Let's Go Lean</Text>
      <TextInput
        label="Email"
        mode="outlined"
        style={styles.input}
        keyboardType="email-address"
      />
      <Button mode="contained" style={styles.button}>
        Login
      </Button>
      <Link href="/register">
        <Text>Don't have an account? Register</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  input: {
    marginVertical: 8,
  },
  button: {
    marginVertical: 16,
  },
});
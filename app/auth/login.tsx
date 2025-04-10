import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { Link, router } from 'expo-router';
import { supabase } from '../../src/lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      router.replace('/(tabs)');
    }
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Welcome to Let's Go Lean</Text>
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        mode="outlined"
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        mode="outlined"
        style={styles.input}
        secureTextEntry
      />
      <Button 
        mode="contained" 
        style={styles.button}
        onPress={signInWithEmail}
        loading={loading}
        disabled={loading}
      >
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
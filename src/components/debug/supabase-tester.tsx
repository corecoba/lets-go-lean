import React, { useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet } from 'react-native';
import { supabase } from '../../lib/supabase';
import { logger } from '../../utils/logger';

export default function SupabaseTester() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .limit(10);

      if (error) throw error;
      setUsers(data || []);
    } catch (e) {
      logger.error('Error fetching users:', e);
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      logger.info('Login successful:', data);
      // You can add navigation here if needed
    } catch (e) {
      logger.error('Login error:', e);
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Supabase Tester</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Login</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Button
          title={loading ? "Loading..." : "Login"}
          onPress={handleLogin}
          disabled={loading}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Existing Users</Text>
        <Button
          title="Fetch Users"
          onPress={fetchUsers}
          disabled={loading}
        />
        {users.map((user) => (
          <View key={user.id} style={styles.userCard}>
            <Text>Email: {user.email}</Text>
            <Text>Name: {user.first_name}</Text>
            <Text>ID: {user.id}</Text>
          </View>
        ))}
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  userCard: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  errorText: {
    color: '#c62828',
  },
}); 
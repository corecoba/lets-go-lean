import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Text, Card, Divider } from 'react-native-paper';
import { supabaseTester } from '../../src/utils/supabaseTester';
import { logger } from '../../src/utils/logger';

/**
 * Developer-only screen for testing Supabase operations
 * This screen should not be accessible in production
 */
export default function SupabaseTester() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState<Record<string, boolean>>({
    rls: false,
    auth: false,
    all: false
  });

  const runRLSTests = async () => {
    setLoading({ ...loading, rls: true });
    try {
      const testResults = await supabaseTester.testRLSPolicies();
      setResults(prev => ({ ...prev, rls: testResults }));
    } catch (error) {
      logger.error('RLS test error', error);
    } finally {
      setLoading({ ...loading, rls: false });
    }
  };

  const runAuthTests = async () => {
    setLoading({ ...loading, auth: true });
    try {
      const testResults = await supabaseTester.testAuth();
      setResults(prev => ({ ...prev, auth: testResults }));
    } catch (error) {
      logger.error('Auth test error', error);
    } finally {
      setLoading({ ...loading, auth: false });
    }
  };

  const runAllTests = async () => {
    setLoading({ ...loading, all: true });
    try {
      const testResults = await supabaseTester.runAllTests();
      setResults(testResults);
    } catch (error) {
      logger.error('All tests error', error);
    } finally {
      setLoading({ ...loading, all: false });
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Supabase Test Console</Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Test your Supabase setup without going through the full registration flow
      </Text>

      <View style={styles.buttonContainer}>
        <Button 
          mode="contained" 
          onPress={runRLSTests} 
          loading={loading.rls}
          style={styles.button}
        >
          Test RLS Policies
        </Button>
        <Button 
          mode="contained" 
          onPress={runAuthTests}
          loading={loading.auth}
          style={styles.button}
        >
          Test Auth
        </Button>
        <Button 
          mode="contained" 
          onPress={runAllTests}
          loading={loading.all}
          style={styles.button}
        >
          Run All Tests
        </Button>
      </View>

      <Divider style={styles.divider} />

      <ScrollView style={styles.resultsContainer}>
        {results?.summary && (
          <Card style={styles.card}>
            <Card.Title title="Test Summary" />
            <Card.Content>
              <Text variant="titleMedium">RLS Tests:</Text>
              <View style={styles.resultRow}>
                <Text>Direct Insert: {results.summary.rls.insert}</Text>
                <Text>RPC Function: {results.summary.rls.rpc}</Text>
              </View>
              <View style={styles.resultRow}>
                <Text>Select Direct: {results.summary.rls.select}</Text>
                <Text>Select RPC: {results.summary.rls.selectRpc}</Text>
              </View>

              <Divider style={styles.miniDivider} />

              <Text variant="titleMedium">Auth Tests:</Text>
              <View style={styles.resultRow}>
                <Text>Sign Up: {results.summary.auth.signup}</Text>
                <Text>Sign In: {results.summary.auth.signin}</Text>
              </View>
              <View style={styles.resultRow}>
                <Text>Sign Out: {results.summary.auth.signout}</Text>
                <Text>Session: {results.summary.auth.session}</Text>
              </View>
            </Card.Content>
          </Card>
        )}

        {results?.rlsResults && !results?.summary && (
          <Card style={styles.card}>
            <Card.Title title="RLS Test Results" />
            <Card.Content>
              <Text>Insert: {results.rlsResults.results.insert?.success ? 'Success' : 'Failed'}</Text>
              {results.rlsResults.results.insert?.error && (
                <Text style={styles.errorText}>Error: {results.rlsResults.results.insert.error}</Text>
              )}

              <Text>RPC: {results.rlsResults.results.rpc?.success ? 'Success' : 'Failed'}</Text>
              {results.rlsResults.results.rpc?.error && (
                <Text style={styles.errorText}>Error: {results.rlsResults.results.rpc.error}</Text>
              )}

              <Text>Select: {results.rlsResults.results.select?.success ? 'Success' : 'Failed'}</Text>
              {results.rlsResults.results.select?.error && (
                <Text style={styles.errorText}>Error: {results.rlsResults.results.select.error}</Text>
              )}
            </Card.Content>
          </Card>
        )}

        {results?.authResults && !results?.summary && (
          <Card style={styles.card}>
            <Card.Title title="Auth Test Results" />
            <Card.Content>
              <Text>Sign Up: {results.authResults.results.signup?.success ? 'Success' : 'Failed'}</Text>
              {results.authResults.results.signup?.error && (
                <Text style={styles.errorText}>Error: {results.authResults.results.signup.error}</Text>
              )}

              <Text>Sign In: {results.authResults.results.signin?.success ? 'Success' : 'Failed'}</Text>
              {results.authResults.results.signin?.error && (
                <Text style={styles.errorText}>Error: {results.authResults.results.signin.error}</Text>
              )}

              <Text>Session: {results.authResults.results.session?.exists ? 'Valid' : 'None'}</Text>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  button: {
    marginBottom: 16,
    minWidth: '30%',
  },
  divider: {
    marginVertical: 16,
  },
  miniDivider: {
    marginVertical: 12,
  },
  resultsContainer: {
    flex: 1,
  },
  card: {
    marginBottom: 16,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  errorText: {
    color: 'red',
    marginBottom: 8,
  }
}); 
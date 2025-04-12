import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, Avatar, List, Divider, Switch } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { supabase } from '../../src/lib/supabase';

export default function Profile() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  
  const { session, signOut } = useAuth();
  const userId = session?.user?.id;
  
  useEffect(() => {
    if (!userId) return;
    
    const loadProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('first_name, last_name, email')
          .eq('id', userId)
          .single();
          
        if (error) throw error;
        
        setProfileData({
          firstName: data.first_name,
          lastName: data.last_name || '',
          email: data.email
        });
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadProfile();
  }, [userId]);
  
  const handleLogout = async () => {
    try {
      setLogoutLoading(true);
      await signOut();
      setTimeout(() => {
        router.replace('/login');
      }, 100);
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Logout Failed', 'An error occurred during logout. Please try again.');
      setLogoutLoading(false);
    }
  };

  const displayName = profileData.firstName + (profileData.lastName ? ` ${profileData.lastName}` : '');
  const initials = profileData.firstName.charAt(0) + (profileData.lastName ? profileData.lastName.charAt(0) : '');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Profile Header */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.profileHeader}>
              <Avatar.Text
                size={80}
                label={initials}
                style={styles.avatar}
              />
              <View style={styles.profileInfo}>
                <Text variant="headlineSmall">{displayName}</Text>
                <Text variant="bodyMedium" style={styles.email}>{profileData.email}</Text>
                <Button
                  mode="outlined"
                  onPress={() => {}}
                  style={styles.editButton}
                >
                  Edit Profile
                </Button>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Account Settings */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Account Settings</Text>
            <List.Item
              title="Change Password"
              left={props => <List.Icon {...props} icon="lock" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {}}
            />
            <Divider />
            <List.Item
              title="Email Preferences"
              left={props => <List.Icon {...props} icon="email" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {}}
            />
            <Divider />
            <List.Item
              title="Privacy Settings"
              left={props => <List.Icon {...props} icon="shield" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {}}
            />
          </Card.Content>
        </Card>

        {/* App Settings */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>App Settings</Text>
            <List.Item
              title="Notifications"
              description="Receive reminders and updates"
              left={props => <List.Icon {...props} icon="bell" />}
              right={() => (
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                />
              )}
            />
            <Divider />
            <List.Item
              title="Dark Mode"
              description="Switch to dark theme"
              left={props => <List.Icon {...props} icon="theme-light-dark" />}
              right={() => (
                <Switch
                  value={darkModeEnabled}
                  onValueChange={setDarkModeEnabled}
                />
              )}
            />
            <Divider />
            <List.Item
              title="Units"
              description="Metric (kg, cm) / Imperial (lb, in)"
              left={props => <List.Icon {...props} icon="ruler" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {}}
            />
          </Card.Content>
        </Card>

        {/* Support */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Support</Text>
            <List.Item
              title="Help Center"
              left={props => <List.Icon {...props} icon="help-circle" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {}}
            />
            <Divider />
            <List.Item
              title="Send Feedback"
              left={props => <List.Icon {...props} icon="message-text" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {}}
            />
            <Divider />
            <List.Item
              title="About"
              left={props => <List.Icon {...props} icon="information" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {}}
            />
          </Card.Content>
        </Card>

        {/* Logout Button */}
        <Button
          mode="outlined"
          onPress={handleLogout}
          style={styles.logoutButton}
          icon="logout"
          loading={logoutLoading}
          disabled={logoutLoading}
        >
          Logout
        </Button>

        <Text variant="bodySmall" style={styles.version}>
          Version 1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#2196F3',
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  email: {
    color: '#757575',
    marginVertical: 4,
  },
  editButton: {
    marginTop: 8,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  logoutButton: {
    marginTop: 16,
    marginBottom: 8,
  },
  version: {
    textAlign: 'center',
    color: '#757575',
    marginBottom: 16,
  },
}); 
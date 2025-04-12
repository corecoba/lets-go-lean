import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Text, Card, Button, Divider, Snackbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../src/lib/supabase';
import { useAuth } from '../../src/contexts/AuthContext';

// Types
interface UserProfile {
  first_name: string;
  current_weight: number;
  target_weight: number;
  target_calories: number;
}

interface FoodDatabase {
  name: string;
}

interface FoodLogResponse {
  id: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  food_database: FoodDatabase | null;
}

interface FoodLog {
  id: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  name: string;
}

export default function MyDiary() {
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [totalCalories, setTotalCalories] = useState(0);
  const [weightData, setWeightData] = useState<{current: number, previous: number | null}>({
    current: 0, 
    previous: null
  });
  const [showError, setShowError] = useState(false);
  
  const { session } = useAuth();
  const userId = session?.user?.id;

  useEffect(() => {
    if (!userId) return;

    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('first_name, current_weight, target_weight, target_calories')
          .eq('id', userId)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Format date for queries
        const formattedDate = date.toISOString().split('T')[0];

        // Fetch food logs for the selected date
        const { data: foodData, error: foodError } = await supabase
          .from('food_logs')
          .select('id, meal_type, calories, food_database(name)')
          .eq('user_id', userId)
          .eq('date', formattedDate);

        if (foodError) throw foodError;
        
        // Transform food data
        const transformedFoodData = foodData.map((item: any) => ({
          id: item.id,
          meal_type: item.meal_type,
          calories: item.calories,
          name: item.food_database ? item.food_database.name : 'Unknown Food'
        }));
        
        setFoodLogs(transformedFoodData);
        
        // Calculate total calories
        const total = transformedFoodData.reduce((sum, item) => sum + item.calories, 0);
        setTotalCalories(total);

        // Fetch previous weight entry for comparison
        const { data: weightLogs, error: weightError } = await supabase
          .from('body_composition_logs')
          .select('weight, date')
          .eq('user_id', userId)
          .order('date', { ascending: false })
          .limit(2);

        if (weightError) throw weightError;
        
        if (weightLogs && weightLogs.length > 0) {
          const current = profileData.current_weight;
          const previous = weightLogs.length > 1 ? weightLogs[1].weight : null;
          
          setWeightData({
            current,
            previous
          });
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setShowError(true);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId, date]);

  // Calculate weight change percentage
  const weightChangePercent = weightData.previous 
    ? ((weightData.current - weightData.previous) / weightData.previous * 100).toFixed(1)
    : null;

  if (loading && !profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text variant="headlineSmall">My Diary</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading your data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall">My Diary</Text>
        <Button
          mode="text"
          onPress={() => {}}
          icon="calendar"
        >
          {date.toLocaleDateString()}
        </Button>
      </View>

      <ScrollView style={styles.content}>
        {/* Daily Summary Card */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text variant="titleMedium">Calories</Text>
                <Text variant="headlineMedium">{totalCalories}</Text>
                <Text variant="bodySmall">/ {profile?.target_calories || 2000} kcal</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text variant="titleMedium">Weight</Text>
                <Text variant="headlineMedium">{profile?.current_weight || '-'} kg</Text>
                {weightChangePercent && (
                  <Text 
                    variant="bodySmall"
                    style={{ 
                      color: Number(weightChangePercent) > 0 
                        ? (profile?.target_weight && profile.target_weight > profile.current_weight ? 'green' : 'red') 
                        : (profile?.target_weight && profile.target_weight < profile.current_weight ? 'green' : 'red')
                    }}
                  >
                    {Number(weightChangePercent) > 0 ? '+' : ''}{weightChangePercent}% from last
                  </Text>
                )}
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Activity Summary */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.activityRow}>
              <View style={styles.activityItem}>
                <MaterialCommunityIcons name="walk" size={24} color="#2196F3" />
                <Text variant="bodyMedium">0/10,000 steps</Text>
              </View>
              <View style={styles.activityItem}>
                <MaterialCommunityIcons name="clock-outline" size={24} color="#2196F3" />
                <Text variant="bodyMedium">0/60 active minutes</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Meals Section */}
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>Meals</Text>
          
          {['breakfast', 'lunch', 'dinner', 'snack'].map((mealType) => {
            const mealFoods = foodLogs.filter(food => food.meal_type === mealType);
            const mealDisplayName = mealType.charAt(0).toUpperCase() + mealType.slice(1);
            
            return (
              <Card key={mealType} style={styles.mealCard}>
                <Card.Content>
                  <View style={styles.mealHeader}>
                    <Text variant="titleMedium">{mealDisplayName}</Text>
                    <Button mode="text" icon="plus" onPress={() => {}}>Add Food</Button>
                  </View>
                  <Divider style={styles.divider} />
                  
                  {mealFoods.length > 0 ? (
                    mealFoods.map(food => (
                      <View key={food.id} style={styles.foodItem}>
                        <Text variant="bodyMedium">{food.name}</Text>
                        <Text variant="bodyMedium">{food.calories} kcal</Text>
                      </View>
                    ))
                  ) : (
                    <Text variant="bodyMedium" style={styles.emptyText}>
                      No foods logged yet
                    </Text>
                  )}
                </Card.Content>
              </Card>
            );
          })}
        </View>
      </ScrollView>
      
      <Snackbar
        visible={showError}
        onDismiss={() => setShowError(false)}
        action={{
          label: 'Dismiss',
          onPress: () => setShowError(false),
        }}
      >
        {error || 'An error occurred'}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  activityItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  mealCard: {
    marginBottom: 16,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: {
    marginVertical: 8,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.5,
    marginVertical: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
}); 
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, Card, Button, ProgressBar, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';

export default function Goals() {
  const [timeRange, setTimeRange] = useState('6m');

  const weightData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [85, 83, 82, 81, 80, 79],
        color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Progress Card */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.progressHeader}>
              <Text variant="titleMedium">Weight Loss Progress</Text>
              <Chip>2 kg lost / 5 kg goal</Chip>
            </View>
            <ProgressBar
              progress={0.4}
              color="#2196F3"
              style={styles.progressBar}
            />
            <Text variant="bodySmall" style={styles.progressText}>
              40% of your goal achieved
            </Text>
          </Card.Content>
        </Card>

        {/* Weight Trend Graph */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.graphHeader}>
              <Text variant="titleMedium">Weight Trend</Text>
              <View style={styles.timeRangeSelector}>
                <Chip
                  selected={timeRange === '1m'}
                  onPress={() => setTimeRange('1m')}
                  style={styles.timeChip}
                >
                  1M
                </Chip>
                <Chip
                  selected={timeRange === '3m'}
                  onPress={() => setTimeRange('3m')}
                  style={styles.timeChip}
                >
                  3M
                </Chip>
                <Chip
                  selected={timeRange === '6m'}
                  onPress={() => setTimeRange('6m')}
                  style={styles.timeChip}
                >
                  6M
                </Chip>
                <Chip
                  selected={timeRange === '1y'}
                  onPress={() => setTimeRange('1y')}
                  style={styles.timeChip}
                >
                  1Y
                </Chip>
              </View>
            </View>
            <LineChart
              data={weightData}
              width={Dimensions.get('window').width - 48}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </Card.Content>
        </Card>

        {/* Goal Details */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Goal Details</Text>
            <View style={styles.goalDetail}>
              <MaterialCommunityIcons name="target" size={24} color="#2196F3" />
              <View style={styles.goalText}>
                <Text variant="bodyMedium">Target Weight</Text>
                <Text variant="titleMedium">75 kg</Text>
              </View>
            </View>
            <View style={styles.goalDetail}>
              <MaterialCommunityIcons name="calendar" size={24} color="#2196F3" />
              <View style={styles.goalText}>
                <Text variant="bodyMedium">Estimated Goal Date</Text>
                <Text variant="titleMedium">August 15, 2024</Text>
              </View>
            </View>
            <View style={styles.goalDetail}>
              <MaterialCommunityIcons name="fire" size={24} color="#2196F3" />
              <View style={styles.goalText}>
                <Text variant="bodyMedium">Daily Calorie Goal</Text>
                <Text variant="titleMedium">2,000 kcal</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Tips Card */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.tipsHeader}>
              <MaterialCommunityIcons name="lightbulb" size={24} color="#FFC107" />
              <Text variant="titleMedium" style={styles.tipsTitle}>Tips to Stay on Track</Text>
            </View>
            <View style={styles.tipItem}>
              <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />
              <Text variant="bodyMedium" style={styles.tipText}>
                Weigh in 3x/week to stay on track!
              </Text>
            </View>
            <View style={styles.tipItem}>
              <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />
              <Text variant="bodyMedium" style={styles.tipText}>
                Log your meals consistently to maintain awareness
              </Text>
            </View>
            <View style={styles.tipItem}>
              <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />
              <Text variant="bodyMedium" style={styles.tipText}>
                Aim for 60+ active minutes per week
              </Text>
            </View>
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          onPress={() => {}}
          style={styles.shareButton}
          icon="share"
        >
          Share Progress
        </Button>
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
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  progressText: {
    textAlign: 'right',
    color: '#757575',
  },
  graphHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeRangeSelector: {
    flexDirection: 'row',
  },
  timeChip: {
    marginLeft: 4,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  goalDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  goalText: {
    marginLeft: 16,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  tipsTitle: {
    marginLeft: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipText: {
    marginLeft: 8,
    flex: 1,
  },
  shareButton: {
    marginTop: 16,
    marginBottom: 32,
  },
}); 
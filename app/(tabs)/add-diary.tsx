import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, Button, Divider, TextInput, Portal, Modal, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

export default function AddDiary() {
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeTab, setActiveTab] = useState('food');
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const recentFoods = [
    { name: 'Boiled Eggs', calories: 140, serving: '2 large' },
    { name: 'Chicken Breast', calories: 165, serving: '100g' },
    { name: 'Brown Rice', calories: 216, serving: '1 cup' },
  ];

  const quickAddItems = [
    { name: 'Water', icon: 'water' as const, color: '#2196F3' },
    { name: 'Coffee', icon: 'coffee' as const, color: '#795548' },
    { name: 'Tea', icon: 'tea' as const, color: '#4CAF50' },
    { name: 'Apple', icon: 'food-apple' as const, color: '#F44336' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall">Add Diary</Text>
        <Button
          mode="text"
          onPress={() => setShowDatePicker(true)}
          icon="calendar"
        >
          {date.toLocaleDateString()}
        </Button>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
            setShowDatePicker(false);
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'food' && styles.activeTab]}
          onPress={() => setActiveTab('food')}
        >
          <MaterialCommunityIcons
            name="food"
            size={24}
            color={activeTab === 'food' ? '#2196F3' : '#757575'}
          />
          <Text style={[styles.tabText, activeTab === 'food' && styles.activeTabText]}>
            Food
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'body' && styles.activeTab]}
          onPress={() => setActiveTab('body')}
        >
          <MaterialCommunityIcons
            name="scale"
            size={24}
            color={activeTab === 'body' ? '#2196F3' : '#757575'}
          />
          <Text style={[styles.tabText, activeTab === 'body' && styles.activeTabText]}>
            Body
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'activity' && styles.activeTab]}
          onPress={() => setActiveTab('activity')}
        >
          <MaterialCommunityIcons
            name="run"
            size={24}
            color={activeTab === 'activity' ? '#2196F3' : '#757575'}
          />
          <Text style={[styles.tabText, activeTab === 'activity' && styles.activeTabText]}>
            Activity
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'food' && (
          <>
            <Card style={styles.card}>
              <Card.Content>
                <TextInput
                  mode="outlined"
                  placeholder="Search for food..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  left={<TextInput.Icon icon="magnify" />}
                  right={<TextInput.Icon icon="barcode-scan" />}
                />
              </Card.Content>
            </Card>

            <View style={styles.quickAddSection}>
              <Text variant="titleMedium" style={styles.sectionTitle}>Quick Add</Text>
              <View style={styles.quickAddGrid}>
                {quickAddItems.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.quickAddItem}
                    onPress={() => {}}
                  >
                    <MaterialCommunityIcons
                      name={item.icon}
                      size={32}
                      color={item.color}
                    />
                    <Text variant="bodySmall">{item.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.recentSection}>
              <Text variant="titleMedium" style={styles.sectionTitle}>Recent Foods</Text>
              {recentFoods.map((food, index) => (
                <Card key={index} style={styles.foodCard}>
                  <Card.Content>
                    <View style={styles.foodItem}>
                      <View>
                        <Text variant="titleMedium">{food.name}</Text>
                        <Text variant="bodySmall">{food.serving}</Text>
                      </View>
                      <View style={styles.foodCalories}>
                        <Text variant="titleMedium">{food.calories}</Text>
                        <Text variant="bodySmall">kcal</Text>
                      </View>
                    </View>
                  </Card.Content>
                </Card>
              ))}
            </View>
          </>
        )}

        {activeTab === 'body' && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>Body Composition</Text>
              <View style={styles.inputRow}>
                <TextInput
                  mode="outlined"
                  label="Weight"
                  keyboardType="numeric"
                  style={styles.input}
                />
                <Chip style={styles.unitChip}>kg</Chip>
              </View>
              <View style={styles.inputRow}>
                <TextInput
                  mode="outlined"
                  label="Body Fat %"
                  keyboardType="numeric"
                  style={styles.input}
                />
                <Chip style={styles.unitChip}>%</Chip>
              </View>
              <Button
                mode="contained"
                onPress={() => {}}
                style={styles.saveButton}
              >
                Save Measurements
              </Button>
            </Card.Content>
          </Card>
        )}

        {activeTab === 'activity' && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>Activity</Text>
              <View style={styles.inputRow}>
                <TextInput
                  mode="outlined"
                  label="Activity Type"
                  style={styles.input}
                />
                <Chip style={styles.unitChip}>Select</Chip>
              </View>
              <View style={styles.inputRow}>
                <TextInput
                  mode="outlined"
                  label="Duration"
                  keyboardType="numeric"
                  style={styles.input}
                />
                <Chip style={styles.unitChip}>minutes</Chip>
              </View>
              <View style={styles.inputRow}>
                <TextInput
                  mode="outlined"
                  label="Calories Burned"
                  keyboardType="numeric"
                  style={styles.input}
                />
                <Chip style={styles.unitChip}>kcal</Chip>
              </View>
              <Button
                mode="contained"
                onPress={() => {}}
                style={styles.saveButton}
              >
                Log Activity
              </Button>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
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
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2196F3',
  },
  tabText: {
    marginTop: 4,
    color: '#757575',
  },
  activeTabText: {
    color: '#2196F3',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  quickAddSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  quickAddGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAddItem: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    elevation: 2,
  },
  recentSection: {
    marginBottom: 16,
  },
  foodCard: {
    marginBottom: 8,
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  foodCalories: {
    alignItems: 'flex-end',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    marginRight: 8,
  },
  unitChip: {
    backgroundColor: '#e3f2fd',
  },
  saveButton: {
    marginTop: 16,
  },
}); 
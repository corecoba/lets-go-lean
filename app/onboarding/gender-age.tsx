import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, SegmentedButtons, HelperText } from 'react-native-paper';
import { router } from 'expo-router';
import { storage } from '../../src/utils/storage';
import DatePickerInput from '../../src/components/common/DatePickerInput';

export default function GenderAge() {
  const [gender, setGender] = useState<string>('');
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateForm = () => {
    if (!gender) {
      setError('Please select your gender');
      return false;
    }
    if (!birthDate) {
      setError('Please enter your birth date');
      return false;
    }
    
    const currentYear = new Date().getFullYear();
    const birthYear = birthDate.getFullYear();
    const age = currentYear - birthYear;
    
    if (age < 18 || age > 100) {
      setError('Age must be between 18 and 100 years');
      return false;
    }
    
    setError('');
    return true;
  };

  const handleDateChange = (date: Date) => {
    setBirthDate(date);
  };

  async function handleNext() {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Format birth date as ISO string
      const formattedDate = birthDate?.toISOString().split('T')[0];
      
      // Save gender and birth date to local storage
      await storage.saveOnboardingData({ 
        gender, 
        birth_date: formattedDate 
      });
      
      router.push('/onboarding/activity-level');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Tell us about yourself</Text>
      <Text variant="bodyLarge" style={styles.subtitle}>This helps us calculate your ideal calorie intake</Text>

      <Text variant="titleMedium" style={styles.sectionTitle}>Gender</Text>
      <SegmentedButtons
        value={gender}
        onValueChange={setGender}
        buttons={[
          { value: 'male', label: 'Male' },
          { value: 'female', label: 'Female' },
          { value: 'other', label: 'Other' }
        ]}
        style={styles.segmentedButtons}
      />

      <Text variant="titleMedium" style={styles.sectionTitle}>Birth Date</Text>
      <DatePickerInput
        label="Birth Date"
        value={birthDate}
        onChange={handleDateChange}
        maximumDate={new Date()}
        minimumDate={new Date(1923, 0, 1)}
      />

      {error ? <HelperText type="error">{error}</HelperText> : null}

      <Button
        mode="contained"
        style={styles.button}
        onPress={handleNext}
        loading={loading}
        disabled={!gender || !birthDate || loading}
        buttonColor="#4CAF50"
      >
        Continue
      </Button>
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
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  input: {
    marginVertical: 8,
  },
  button: {
    marginTop: 24,
    borderRadius: 8,
  },
}); 
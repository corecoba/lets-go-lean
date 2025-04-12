import React, { useState } from 'react';
import { View, Platform, Modal, TouchableOpacity, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';

interface DatePickerInputProps {
  label: string;
  value: Date | null;
  onChange: (date: Date) => void;
  maximumDate?: Date;
  minimumDate?: Date;
}

/**
 * Cross-platform date picker input component
 * Uses native date picker on iOS/Android and a custom modal with date inputs on web
 */
const DatePickerInput: React.FC<DatePickerInputProps> = ({
  label,
  value,
  onChange,
  maximumDate,
  minimumDate
}) => {
  const [showPicker, setShowPicker] = useState(false);
  
  // For web platform
  const [day, setDay] = useState(value ? value.getDate().toString() : '');
  const [month, setMonth] = useState(value ? (value.getMonth() + 1).toString() : '');
  const [year, setYear] = useState(value ? value.getFullYear().toString() : '');
  
  // Error states for validation
  const [dayError, setDayError] = useState(false);
  const [monthError, setMonthError] = useState(false);
  const [yearError, setYearError] = useState(false);
  
  const formattedDate = value ? value.toLocaleDateString() : '';
  
  const onChangeNative = (event: any, selectedDate?: Date) => {
    // Hide the picker on Android (iOS will have its own dismiss button)
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    
    if (selectedDate) {
      onChange(selectedDate);
    }
  };
  
  // Helper functions for input validation
  const validateDay = (value: string): boolean => {
    const numValue = parseInt(value);
    const isValid = !isNaN(numValue) && numValue >= 1 && numValue <= 31;
    setDayError(!isValid && value.length > 0);
    return isValid;
  };
  
  const validateMonth = (value: string): boolean => {
    const numValue = parseInt(value);
    const isValid = !isNaN(numValue) && numValue >= 1 && numValue <= 12;
    setMonthError(!isValid && value.length > 0);
    return isValid;
  };
  
  const validateYear = (value: string): boolean => {
    const numValue = parseInt(value);
    const currentYear = new Date().getFullYear();
    const isValid = !isNaN(numValue) && numValue >= 1900 && numValue <= currentYear;
    setYearError(!isValid && value.length > 0);
    return isValid;
  };
  
  const handleDayChange = (text: string) => {
    // Only allow numbers
    const numericValue = text.replace(/[^0-9]/g, '');
    setDay(numericValue);
    validateDay(numericValue);
  };
  
  const handleMonthChange = (text: string) => {
    // Only allow numbers
    const numericValue = text.replace(/[^0-9]/g, '');
    setMonth(numericValue);
    validateMonth(numericValue);
  };
  
  const handleYearChange = (text: string) => {
    // Only allow numbers
    const numericValue = text.replace(/[^0-9]/g, '');
    setYear(numericValue);
    validateYear(numericValue);
  };
  
  const handleWebDateConfirm = () => {
    const numYear = parseInt(year);
    const numMonth = parseInt(month) - 1; // JavaScript months are 0-indexed
    const numDay = parseInt(day);
    
    // Validate all fields
    const isValidDay = validateDay(day);
    const isValidMonth = validateMonth(month);
    const isValidYear = validateYear(year);
    
    if (!isValidDay || !isValidMonth || !isValidYear) {
      return;
    }
    
    // Create and validate the date
    try {
      const newDate = new Date(numYear, numMonth, numDay);
      
      // Check if it's a valid date (e.g., not February 31st)
      if (newDate.getDate() !== numDay) {
        setDayError(true);
        return;
      }
      
      // Validate min/max dates
      if (minimumDate && newDate < minimumDate) {
        setYearError(true);
        return;
      }
      if (maximumDate && newDate > maximumDate) {
        setYearError(true);
        return;
      }
      
      onChange(newDate);
      setShowPicker(false);
    } catch (e) {
      // If date construction fails
      setDayError(true);
      setMonthError(true);
      setYearError(true);
    }
  };

  // Update state when value changes externally
  React.useEffect(() => {
    if (value) {
      setDay(value.getDate().toString());
      setMonth((value.getMonth() + 1).toString());
      setYear(value.getFullYear().toString());
      // Reset errors
      setDayError(false);
      setMonthError(false);
      setYearError(false);
    }
  }, [value]);
  
  // Render native date picker for iOS and Android
  if (Platform.OS !== 'web') {
    return (
      <View>
        <TextInput
          label={label}
          value={formattedDate}
          onFocus={() => setShowPicker(true)}
          right={<TextInput.Icon icon="calendar" onPress={() => setShowPicker(true)} />}
          editable={false}
        />
        
        {showPicker && (
          <DateTimePicker
            value={value || new Date()}
            mode="date"
            display="default"
            onChange={onChangeNative}
            maximumDate={maximumDate}
            minimumDate={minimumDate}
          />
        )}
      </View>
    );
  }
  
  // Custom web implementation
  return (
    <View>
      <TextInput
        label={label}
        value={formattedDate}
        onFocus={() => setShowPicker(true)}
        right={<TextInput.Icon icon="calendar" onPress={() => setShowPicker(true)} />}
        editable={false}
      />
      
      <Modal
        visible={showPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPicker(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowPicker(false)}
        >
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalContent}>
              <Text variant="titleLarge" style={styles.modalTitle}>{label}</Text>
              
              <View style={styles.dateInputContainer}>
                <TextInput
                  label="Day"
                  value={day}
                  onChangeText={handleDayChange}
                  style={styles.dateInput}
                  keyboardType="number-pad"
                  maxLength={2}
                  error={dayError}
                />
                <Text style={styles.dateInputSeparator}>/</Text>
                <TextInput
                  label="Month"
                  value={month}
                  onChangeText={handleMonthChange}
                  style={styles.dateInput}
                  keyboardType="number-pad"
                  maxLength={2}
                  error={monthError}
                />
                <Text style={styles.dateInputSeparator}>/</Text>
                <TextInput
                  label="Year"
                  value={year}
                  onChangeText={handleYearChange}
                  style={[styles.dateInput, styles.yearInput]}
                  keyboardType="number-pad"
                  maxLength={4}
                  error={yearError}
                />
              </View>
              
              {(dayError || monthError || yearError) && (
                <Text style={styles.errorText}>
                  Please enter a valid date
                </Text>
              )}
              
              <View style={styles.buttonContainer}>
                <Button 
                  mode="outlined" 
                  onPress={() => setShowPicker(false)}
                  style={styles.button}
                >
                  Cancel
                </Button>
                <Button 
                  mode="contained" 
                  onPress={handleWebDateConfirm}
                  style={styles.button}
                >
                  Confirm
                </Button>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxWidth: 500,
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: 'center',
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  dateInput: {
    width: 70,
  },
  yearInput: {
    width: 100,
  },
  dateInputSeparator: {
    fontSize: 24,
    marginHorizontal: 8,
  },
  errorText: {
    color: '#B00020',
    fontSize: 12,
    marginBottom: 10,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
});

export default DatePickerInput; 
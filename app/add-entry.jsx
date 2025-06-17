import 'react-native-get-random-values';
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { v4 as uuidv4 } from 'uuid';
import Colors from './constants/Colors';
import CommonStyles from './constants/CommonStyles';
import SuccessToast from './components/SuccessToast';

export default function AddEntryScreen() {
  const { entryId } = useLocalSearchParams();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isIncome, setIsIncome] = useState(false);
  const [isEditing, setIsEditing] = useState(!!entryId);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (entryId) {
      const loadEntry = async () => {
        try {
          const stored = await AsyncStorage.getItem('entries');
          const entries = stored && stored !== 'undefined' ? JSON.parse(stored) : [];
          if (!Array.isArray(entries)) throw new Error('Invalid data format');
          const entry = entries.find((e) => e.id === entryId);
          if (entry) {
            setAmount(entry.amount.toString());
            setDescription(entry.description);
            setDate(new Date(entry.date || Date.now()));
            setIsIncome(entry.isIncome);
          } else {
            setToastMessage('Entry not found');
            setToastVisible(true);
            router.back();
          }
        } catch (error) {
          setToastMessage('Failed to load entry');
          setToastVisible(true);
          console.error('Load entry error:', error);
        }
      };
      loadEntry();
    }
  }, [entryId, router]);

  const handleSave = async () => {
    const parsedAmount = parseFloat(amount);
    if (!description.trim()) {
      setToastMessage('Please enter a description');
      setToastVisible(true);
      return;
    }
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setToastMessage('Please enter a valid amount');
      setToastVisible(true);
      return;
    }
    try {
      const newEntry = {
        id: isEditing ? entryId : uuidv4(),
        amount: parsedAmount,
        description: description.trim(),
        date: date.toISOString(),
        isIncome,
        createdAt: Date.now(),
      };

      const storedEntries = await AsyncStorage.getItem('entries');
      let entries = storedEntries && storedEntries !== 'undefined' ? JSON.parse(storedEntries) : [];
      if (!Array.isArray(entries)) entries = [];

      if (isEditing) {
        const oldEntry = entries.find(e => e.id === entryId);
        if (oldEntry && oldEntry.isIncome) {
          const storedIncome = await AsyncStorage.getItem('income');
          const currentIncome = storedIncome ? parseFloat(storedIncome) : 0;
          await AsyncStorage.setItem('income', (currentIncome - oldEntry.amount).toString());
        }
        entries = entries.map((e) => (e.id === entryId ? newEntry : e));
      } else {
        entries.push(newEntry);
      }

      if (isIncome) {
        const storedIncome = await AsyncStorage.getItem('income');
        const currentIncome = storedIncome ? parseFloat(storedIncome) : 0;
        await AsyncStorage.setItem('income', (currentIncome + parsedAmount).toString());
      }

      await AsyncStorage.setItem('entries', JSON.stringify(entries));
      setToastMessage(isEditing ? 'Entry updated!' : 'Entry added!');
      setToastVisible(true);
      setTimeout(() => {
        setToastVisible(false);
        router.replace('/');
      }, 1800);
    } catch (error) {
      setToastMessage('Failed to save entry');
      setToastVisible(true);
      console.error('Save entry error:', error);
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  return (
    <View style={styles.container}>
      <SuccessToast visible={toastVisible} message={toastMessage} onHide={() => setToastVisible(false)} />
      <Text style={styles.title}>{isEditing ? 'Edit Entry' : 'Add New Entry'}</Text>

      <View style={styles.typeContainer}>
        <TouchableOpacity
          style={[styles.typeButton, !isIncome && styles.typeButtonActive]}
          onPress={() => setIsIncome(false)}
        >
          <Text style={[
            styles.typeButtonText,
            !isIncome && styles.typeButtonTextActive
          ]}>Expense</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeButton, isIncome && styles.typeButtonActive]}
          onPress={() => setIsIncome(true)}
        >
          <Text style={[
            styles.typeButtonText,
            isIncome && styles.typeButtonTextActive
          ]}>Income</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Amount</Text>
      <TextInput
        placeholder="Enter amount"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
        style={styles.input}
        accessibilityLabel="Entry amount"
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        placeholder="Enter description"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
        accessibilityLabel="Entry description"
      />

      <Text style={styles.label}>Date</Text>
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onDateChange}
          maximumDate={new Date()}
        />
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => router.back()}
        >
          <Text style={[styles.typeButtonText, styles.cancelButtonText]}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={handleSave}
        >
          <Text style={styles.typeButtonTextActive}>{isEditing ? 'Update' : 'Save'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...CommonStyles.container,
    paddingTop: 48,
  },
  title: {
    ...CommonStyles.title,
  },
  typeContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 4,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  typeButtonActive: {
    backgroundColor: Colors.accent,
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  typeButtonTextActive: {
    color: Colors.background,
  },
  input: {
    ...CommonStyles.input,
  },
  label: {
    ...CommonStyles.label,
  },
  dateButton: {
    ...CommonStyles.input,
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
    color: Colors.text,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  button: {
    ...CommonStyles.button,
    flex: 1,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    color: Colors.text,
  }
});
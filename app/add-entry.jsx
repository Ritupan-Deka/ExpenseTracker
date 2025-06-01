// import React, { useState } from 'react';
// import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
// import { useRouter } from 'expo-router';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { v4 as uuidv4 } from 'uuid'; // Optional: For unique ID

// export default function AddExpenseScreen() {
//   const [amount, setAmount] = useState('');
//   const [description, setDescription] = useState('');
//   const router = useRouter();

//   const handleSave = async () => {
//     if (!amount || !description) {
//       Alert.alert('Please fill all fields');
//       return;
//     }

//     const newExpense = {
//       id: Date.now().toString(), // or use uuidv4()
//       amount: parseFloat(amount),
//       description,
//     };

//     const stored = await AsyncStorage.getItem('expenses');
//     const expenses = stored ? JSON.parse(stored) : [];

//     expenses.push(newExpense);
//     await AsyncStorage.setItem('expenses', JSON.stringify(expenses));

//     Alert.alert('Saved!', 'Expense added successfully');
//     router.replace('/');
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Add New Expense</Text>

//       <TextInput
//         placeholder="Amount"
//         keyboardType="numeric"
//         value={amount}
//         onChangeText={setAmount}
//         style={styles.input}
//       />
//       <TextInput
//         placeholder="Description"
//         value={description}
//         onChangeText={setDescription}
//         style={styles.input}
//       />

//       <Button title="Save Expense" onPress={handleSave} />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 20, justifyContent: 'center' },
//   title: { fontSize: 22, marginBottom: 20, textAlign: 'center' },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     marginBottom: 15,
//     padding: 10,
//     borderRadius: 5,
//   },
// });




import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Switch } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DatePicker from '@react-native-community/datetimepicker'; 
// import DateTimePicker from '@react-native-community/datetimepicker';

import { v4 as uuidv4 } from 'uuid';

export default function AddEntryScreen() {
  const { entryId } = useLocalSearchParams();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  // const [date, setDate] = useState(new Date());
  const [isIncome, setIsIncome] = useState(false);
  const [isEditing, setIsEditing] = useState(!!entryId);
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
            // setDate(new Date(entry.date));
            setIsIncome(entry.isIncome);
          } else {
            Alert.alert('Error', 'Entry not found');
            router.back();
          }
        } catch (error) {
          Alert.alert('Error', 'Failed to load entry');
          console.error('Load entry error:', error);
        }
      };
      loadEntry();
    }
  }, [entryId, router]);

  const handleSave = async () => {
    const parsedAmount = parseFloat(amount);
    if (!description.trim() || !amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount and description');
      return;
    }

    try {
      const newEntry = {
        id: isEditing ? entryId : uuidv4(),
        amount: parsedAmount,
        description: description.trim(),
        // date: date.toISOString().split('T')[0],
        isIncome,
      };

      const storedEntries = await AsyncStorage.getItem('entries');
      let entries = storedEntries && storedEntries !== 'undefined' ? JSON.parse(storedEntries) : [];
      if (!Array.isArray(entries)) entries = [];

      if (isEditing) {
        entries = entries.map((e) => (e.id === entryId ? newEntry : e));
      } else {
        entries.push(newEntry);
        if (isIncome) {
          const storedIncome = await AsyncStorage.getItem('income');
          const currentIncome = storedIncome ? parseFloat(storedIncome) : 0;
          await AsyncStorage.setItem('income', (currentIncome + parsedAmount).toString());
        }
      }

      await AsyncStorage.setItem('entries', JSON.stringify(entries));
      Alert.alert('Success', isEditing ? 'Entry updated' : 'Entry added');
      router.replace('/');
    } catch (error) {
      Alert.alert('Error', 'Failed to save entry');
      console.error('Save entry error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isEditing ? 'Edit Entry' : 'Add New Entry'}</Text>

      <View style={styles.toggleContainer}>
        <Text style={styles.label}>Type: {isIncome ? 'Income' : 'Expense'}</Text>
        <Switch
          value={isIncome}
          onValueChange={setIsIncome}
          accessibilityLabel="Toggle between expense and income"
        />
      </View>

      <TextInput
        placeholder="Amount"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
        style={styles.input}
        accessibilityLabel="Entry amount"
      />
      <TextInput
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
        accessibilityLabel="Entry description"
      />
      {/* <Text style={styles.label}>Date</Text>
      <DatePicker
        date={date}
        onDateChange={setDate}
        mode="date"
        style={styles.datePicker}
        accessibilityLabel="Select entry date"
      /> */}

      <View style={styles.buttonContainer}>
        <Button title={isEditing ? 'Update Entry' : 'Save Entry'} onPress={handleSave} />
        <Button title="Cancel" color="gray" onPress={() => router.back()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 22, marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 16, marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 15,
    padding: 10,
    borderRadius: 5,
  },
  toggleContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  // datePicker: { alignSelf: 'center', marginBottom: 15 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between' },
});
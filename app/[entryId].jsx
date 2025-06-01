// import React, { useEffect, useState } from 'react';
// import { View, Text, StyleSheet } from 'react-native';
// import { useLocalSearchParams } from 'expo-router';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// export default function ExpenseDetail() {
//   const { expenseId } = useLocalSearchParams();
//   const [expense, setExpense] = useState(null);

//   useEffect(() => {
//     const fetchExpense = async () => {
//       const stored = await AsyncStorage.getItem('expenses');
//       const expenses = stored ? JSON.parse(stored) : [];
//       const found = expenses.find((e) => e.id === expenseId);
//       setExpense(found);
//     };
//     fetchExpense();
//   }, [expenseId]);

//   if (!expense) return <Text style={styles.loading}>Loading...</Text>;

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Expense Details</Text>
//       <Text style={styles.text}>Description: {expense.description}</Text>
//       <Text style={styles.text}>Amount: ₹{expense.amount}</Text>
//       <Text style={styles.text}>ID: {expense.id}</Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 20, justifyContent: 'center' },
//   title: { fontSize: 22, marginBottom: 20, textAlign: 'center' },
//   text: { fontSize: 18, marginBottom: 10 },
//   loading: { fontSize: 18, textAlign: 'center', marginTop: 40 },
// });




import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function EntryDetail() {
  const { entryId } = useLocalSearchParams();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        setLoading(true);
        const stored = await AsyncStorage.getItem('entries');
        const entries = stored && stored !== 'undefined' ? JSON.parse(stored) : [];
        if (!Array.isArray(entries)) throw new Error('Invalid data format');
        const found = entries.find((e) => e.id === entryId);
        setEntry(found || null);
      } catch (error) {
        Alert.alert('Error', 'Failed to load entry');
        console.error('Fetch entry error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEntry();
  }, [entryId]);

  const handleDelete = async () => {
    try {
      const stored = await AsyncStorage.getItem('entries');
      let entries = stored && stored !== 'undefined' ? JSON.parse(stored) : [];
      if (!Array.isArray(entries)) entries = [];

      const entryToDelete = entries.find((e) => e.id === entryId);
      if (!entryToDelete) return;

      entries = entries.filter((e) => e.id !== entryId);
      await AsyncStorage.setItem('entries', JSON.stringify(entries));

      if (entryToDelete.isIncome) {
        const storedIncome = await AsyncStorage.getItem('income');
        const currentIncome = storedIncome ? parseFloat(storedIncome) : 0;
        await AsyncStorage.setItem('income', (currentIncome - entryToDelete.amount).toString());
      }

      Alert.alert('Success', 'Entry deleted');
      router.replace('/');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete entry');
      console.error('Delete entry error:', error);
    }
  };

  if (loading) return <Text style={styles.loading}>Loading...</Text>;
  if (!entry) return <Text style={styles.error}>Entry not found</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Entry Details</Text>
      <Text style={styles.text}>Type: {entry.isIncome ? 'Income' : 'Expense'}</Text>
      <Text style={styles.text}>Description: {entry.description}</Text>
      <Text style={styles.text}>Amount: ₹{entry.amount.toFixed(2)}</Text>
      <Text style={styles.text}>Date: {new Date(entry.date).toLocaleDateString()}</Text>
      <Text style={styles.text}>ID: {entry.id}</Text>
      <View style={styles.buttonContainer}>
        <Button
          title="Edit"
          onPress={() => router.push({ pathname: '/add-entry', params: { entryId } })}
        />
        <Button title="Delete" color="red" onPress={handleDelete} />
        <Button title="Back" color="gray" onPress={() => router.back()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 22, marginBottom: 20, textAlign: 'center' },
  text: { fontSize: 18, marginBottom: 10 },
  loading: { fontSize: 18, textAlign: 'center', marginTop: 40 },
  error: { fontSize: 18, textAlign: 'center', marginTop: 40, color: 'red' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
});
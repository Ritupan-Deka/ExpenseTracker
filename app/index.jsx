// import React, { useEffect, useState } from 'react';
// import { View, Text, FlatList, TouchableOpacity, StyleSheet} from 'react-native';
// import { useIsFocused } from '@react-navigation/native';
// import { Link } from 'expo-router';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// export default function HomeScreen() {
//   const [expenses, setExpenses] = useState([]);
//   const isFocused = useIsFocused(); // refresh list on return

//   useEffect(() => {
//     const loadExpenses = async () => {
//       const stored = await AsyncStorage.getItem('expenses');
//       if (stored) setExpenses(JSON.parse(stored));
//     };
//     loadExpenses();
//   }, [isFocused]);

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Expense Tracker</Text>

//       <Link href="/add-expense" style={styles.addButton}>
//         ➕ Add Expense
//       </Link>

//       <FlatList
//         data={expenses}
//         keyExtractor={(item) => item.id}
//         renderItem={({ item }) => (
//           <Link href={`/${item.id}`} asChild>
//             <TouchableOpacity style={styles.expenseItem}>
//               <Text>{item.description}</Text>
//               <Text>₹{item.amount}</Text>
//             </TouchableOpacity>
//           </Link>
//         )}
//         ListEmptyComponent={<Text>No expenses yet.</Text>}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 20, paddingTop: 60 },
//   title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
//   addButton: { fontSize: 18, color: 'blue', marginBottom: 20 },
//   expenseItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignContent: 'center',
//     paddingVertical: 10,
//     padding: 15,
//     marginBottom: 10,
//     backgroundColor: '#f2f2f2',
//     borderRadius: 8,
//   },
// });


import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { Link } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const [entries, setEntries] = useState([]);
  const [income, setIncome] = useState(0);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const storedEntries = await AsyncStorage.getItem('entries');
        const storedIncome = await AsyncStorage.getItem('income');
        const parsedEntries = storedEntries && storedEntries !== 'undefined' ? JSON.parse(storedEntries) : [];
        if (Array.isArray(parsedEntries)) {
          setEntries(parsedEntries);
        } else {
          setEntries([]);
          Alert.alert('Error', 'Invalid data format in storage');
        }
        setIncome(storedIncome ? parseFloat(storedIncome) : 0);
      } catch (error) {
        Alert.alert('Error', 'Failed to load data');
        console.error('Load data error:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [isFocused]);

  const totalExpenses = entries.reduce((sum, entry) => (
    entry.isIncome ? sum : sum + entry.amount
  ), 0);
  const balance = income - totalExpenses;

  if (loading) return <Text style={styles.loading}>Loading...</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Expense Tracker</Text>
      <View style={styles.summary}>
        <Text style={styles.summaryText}>Total Income: ₹{income.toFixed(2)}</Text>
        <Text style={styles.summaryText}>Total Expenses: ₹{totalExpenses.toFixed(2)}</Text>
        <Text style={[styles.summaryText, { color: balance >= 0 ? 'green' : 'red' }]}>
          Balance: ₹{balance.toFixed(2)}
        </Text>
      </View>

      <Link href="/add-entry" style={styles.addButton}>
        ➕ Add Entry
      </Link>

      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Link href={`/${item.id}`} asChild>
            <TouchableOpacity
              style={[styles.entryItem, { backgroundColor: item.isIncome ? '#e6ffed' : '#ffe6e6' }]}
              accessibilityLabel={`${item.isIncome ? 'Income' : 'Expense'}: ${item.description}`}
            >
              <View>
                <Text style={styles.entryText}>{item.description}</Text>
                {/* <Text style={styles.entryDate}>{new Date(item.date).toLocaleDateString()}</Text> */}
              </View>
              <Text style={[styles.entryAmount, { color: item.isIncome ? 'green' : 'red' }]}>
                {item.isIncome ? '+' : '-'}₹{item.amount.toFixed(2)}
              </Text>
            </TouchableOpacity>
          </Link>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No entries yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  summary: { marginBottom: 20, alignItems: 'center' },
  summaryText: { fontSize: 16, marginBottom: 5 },
  addButton: { fontSize: 18, color: 'blue', marginBottom: 20, textAlign: 'center' },
  entryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
  },
  entryText: { fontSize: 16 },
  entryDate: { fontSize: 14, color: '#666' },
  entryAmount: { fontSize: 16, fontWeight: 'bold' },
  emptyText: { fontSize: 16, textAlign: 'center', color: '#666' },
  loading: { fontSize: 18, textAlign: 'center', marginTop: 40 },
});
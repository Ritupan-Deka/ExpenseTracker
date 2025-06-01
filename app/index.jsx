import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, RefreshControl } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { Link } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from './constants/Colors';
import CommonStyles from './constants/CommonStyles';

export default function HomeScreen() {
  const [entries, setEntries] = useState([]);
  const [income, setIncome] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isFocused = useIsFocused();

  const loadData = async () => {
    try {
      setLoading(true);
      const [storedEntries, storedIncome] = await Promise.all([
        AsyncStorage.getItem('entries'),
        AsyncStorage.getItem('income')
      ]);

      const parsedEntries = storedEntries && storedEntries !== 'undefined' ? JSON.parse(storedEntries) : [];

      if (Array.isArray(parsedEntries)) {
        // Sort entries by date, most recent first
        const sortedEntries = parsedEntries.sort((a, b) => {
          const dateA = a.createdAt || new Date(a.date).getTime();
          const dateB = b.createdAt || new Date(b.date).getTime();
          return dateB - dateA;
        });
        setEntries(sortedEntries);
      } else {
        setEntries([]);
        Alert.alert('Error', 'Invalid data format in storage');
      }

      const parsedIncome = storedIncome ? parseFloat(storedIncome) : 0;
      if (isNaN(parsedIncome)) {
        setIncome(0);
        await AsyncStorage.setItem('income', '0');
      } else {
        setIncome(parsedIncome);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load data');
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      loadData();
    }
  }, [isFocused]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  const totalExpenses = entries.reduce((sum, entry) => (
    entry.isIncome ? sum : sum + entry.amount
  ), 0);
  const balance = income - totalExpenses;

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Expense Tracker</Text>
      <View style={styles.summary}>
        <Text style={[styles.balanceAmount, { color: balance >= 0 ? Colors.success : Colors.error }]}>
          ₹{balance.toFixed(2)}
        </Text>
        <Text style={styles.summaryText}>Total Income: ₹{income.toFixed(2)}</Text>
        <Text style={styles.summaryText}>Total Expenses: ₹{totalExpenses.toFixed(2)}</Text>
      </View>

      <Link href="/add-entry" asChild>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>➕ Add New Entry</Text>
        </TouchableOpacity>
      </Link>

      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <Link href={`/${item.id}`} asChild>
            <TouchableOpacity
              style={[
                styles.entryItem,
                { borderLeftColor: item.isIncome ? Colors.success : Colors.error }
              ]}
              accessibilityLabel={`${item.isIncome ? 'Income' : 'Expense'}: ${item.description}`}
            >
              <View>
                <Text style={styles.entryText}>{item.description}</Text>
                <Text style={styles.entryDate}>
                  {new Date(item.date).toLocaleDateString()}
                </Text>
              </View>
              <Text style={[styles.entryAmount, { color: item.isIncome ? Colors.success : Colors.error }]}>
                {item.isIncome ? '+' : '-'}₹{item.amount.toFixed(2)}
              </Text>
            </TouchableOpacity>
          </Link>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No entries yet. Tap the + button to add one.</Text>
        }
      />
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
  summary: {
    ...CommonStyles.card,
    marginBottom: 24,
    padding: 16,
  },
  summaryText: {
    fontSize: 16,
    marginBottom: 8,
    color: Colors.secondary,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginVertical: 8,
  },
  addButton: {
    ...CommonStyles.button,
    marginVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  addButtonText: {
    ...CommonStyles.buttonText,
    marginLeft: 8,
  },
  entryItem: {
    ...CommonStyles.card,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    padding: 16,
    marginBottom: 8,
  },
  entryText: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 4,
  },
  entryDate: {
    fontSize: 12,
    color: Colors.secondary,
  },
  entryAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    color: Colors.secondary,
    marginTop: 32,
  },
  loading: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 40,
    color: Colors.secondary,
  }
});
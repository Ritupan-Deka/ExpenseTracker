import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from './constants/Colors';
import CommonStyles from './constants/CommonStyles';
import SuccessToast from './components/SuccessToast';
import ConfirmDialog from './components/ConfirmDialog';

export default function EntryDetail() {
  const { entryId } = useLocalSearchParams();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [confirmVisible, setConfirmVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        setLoading(true);
        const stored = await AsyncStorage.getItem('entries');
        const entries = stored && stored !== 'undefined' ? JSON.parse(stored) : [];
        if (!Array.isArray(entries)) throw new Error('Invalid data format');
        const found = entries.find((e) => e.id === entryId);
        if (!found) {
          setToastMessage('Entry not found');
          setToastVisible(true);
          router.back();
          return;
        }
        setEntry(found);
      } catch (error) {
        setToastMessage('Failed to load entry');
        setToastVisible(true);
        console.error('Fetch entry error:', error);
        router.back();
      } finally {
        setLoading(false);
      }
    };
    fetchEntry();
  }, [entryId, router]);

  const handleDelete = async () => {
    setConfirmVisible(true);
  };

  const confirmDelete = async () => {
    try {
      const stored = await AsyncStorage.getItem('entries');
      let entries = stored && stored !== 'undefined' ? JSON.parse(stored) : [];
      if (!Array.isArray(entries)) entries = [];

      const entryToDelete = entries.find((e) => e.id === entryId);
      if (!entryToDelete) {
        setToastMessage('Entry not found');
        setToastVisible(true);
        setConfirmVisible(false);
        return;
      }

      entries = entries.filter((e) => e.id !== entryId);
      await AsyncStorage.setItem('entries', JSON.stringify(entries));

      if (entryToDelete.isIncome) {
        const storedIncome = await AsyncStorage.getItem('income');
        const currentIncome = storedIncome ? parseFloat(storedIncome) : 0;
        await AsyncStorage.setItem('income', (currentIncome - entryToDelete.amount).toString());
      }

      setToastMessage('Entry deleted!');
      setToastVisible(true);
      setConfirmVisible(false);
      setTimeout(() => {
        setToastVisible(false);
        router.replace('/');
      }, 1800);
    } catch (error) {
      setToastMessage('Failed to delete entry');
      setToastVisible(true);
      setConfirmVisible(false);
      console.error('Delete entry error:', error);
    }
  };

  if (loading) return <Text style={styles.loading}>Loading...</Text>;
  if (!entry) return <Text style={styles.error}>Entry not found</Text>;

  return (
    <View style={styles.container}>
      <SuccessToast visible={toastVisible} message={toastMessage} onHide={() => setToastVisible(false)} />
      <ConfirmDialog
        visible={confirmVisible}
        message="Are you sure you want to delete this entry?"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmVisible(false)}
      />
      <Text style={styles.title}>Entry Details</Text>

      <View style={[styles.detailCard, { borderLeftColor: entry.isIncome ? Colors.success : Colors.error }]}>
        <View style={styles.detailRowAmount}>
          <View>
            <Text style={styles.label}>Description</Text>
            <Text style={styles.value}>{entry.description}</Text>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.value}>{new Date(entry.date).toLocaleDateString()}</Text>
            <Text style={styles.type}>{entry.isIncome ? 'Income' : 'Expense'}</Text>
          </View>
          <View style={styles.amountRightContainer}>
            <Text style={[styles.amount, { color: entry.isIncome ? Colors.success : Colors.error }]}>
              {entry.isIncome ? '+' : '-'}₹{entry.amount.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={() => router.push({ pathname: '/add-entry', params: { entryId } })}
        >
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={handleDelete}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.backButton]}
          onPress={() => router.back()}
        >
          <Text style={[styles.buttonText, styles.backButtonText]}>Back</Text>
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
  detailCard: {
    ...CommonStyles.card,
    borderLeftWidth: 4,
    marginVertical: 0,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 0,
    paddingVertical: 0,
    minHeight: 0,
  },
  detailRowAmount: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
    padding: 16,
  },
  amountRightContainer: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    minWidth: 100,
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  amount: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 8,
  },
  type: {
    fontSize: 18,
    color: Colors.secondary,
  },
  detailRow: {
    marginBottom: 16,
  },
  label: {
    ...CommonStyles.label,
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
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
  editButton: {
    backgroundColor: Colors.accent,
  },
  deleteButton: {
    backgroundColor: Colors.error,
  },
  backButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  buttonText: {
    ...CommonStyles.buttonText,
  },
  backButtonText: {
    color: Colors.text,
  },
  loading: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 40,
    color: Colors.secondary,
  },
  error: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 40,
    color: Colors.error,
  },
});
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Stack } from 'expo-router';
import { Search } from 'lucide-react-native';

export default function InvestigationsScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'תחקיר',
        }}
      />

      <View style={styles.emptyContainer}>
        <Search size={80} color="#D1D5DB" strokeWidth={1.5} />
        <Text style={styles.emptyTitle}>מערכת תחקירים</Text>
        <Text style={styles.emptyText}>הלשונית תמולא בהמשך</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
});

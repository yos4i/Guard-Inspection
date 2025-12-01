import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useGuards } from '@/contexts/GuardsProvider';
import { UserPlus } from 'lucide-react-native';

export default function AddGuardScreen() {
  const router = useRouter();
  const { addGuard, guards } = useGuards();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    if (!firstName.trim()) {
      Alert.alert('שגיאה', 'נא להזין שם פרטי');
      return false;
    }
    if (!lastName.trim()) {
      Alert.alert('שגיאה', 'נא להזין שם משפחה');
      return false;
    }
    if (!idNumber.trim()) {
      Alert.alert('שגיאה', 'נא להזין תעודת זהות');
      return false;
    }
    if (idNumber.length !== 9 || !/^\d+$/.test(idNumber)) {
      Alert.alert('שגיאה', 'תעודת זהות חייבת להכיל 9 ספרות');
      return false;
    }
    if (!phone.trim()) {
      Alert.alert('שגיאה', 'נא להזין מספר טלפון');
      return false;
    }
    if (!/^05\d{8}$/.test(phone)) {
      Alert.alert('שגיאה', 'מספר טלפון לא תקין (05XXXXXXXX)');
      return false;
    }
    if (guards.length >= 30) {
      Alert.alert('שגיאה', 'הגעת למגבלת 30 מאבטחים');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await addGuard({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        idNumber: idNumber.trim(),
        phone: phone.trim(),
      });

      Alert.alert('הצלחה', 'המאבטח נוסף בהצלחה', [
        {
          text: 'אישור',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert('שגיאה', 'נכשל בהוספת מאבטח');
      console.error('Failed to add guard:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen
        options={{
          title: 'הוסף מאבטח',
          headerBackTitle: 'ביטול',
        }}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.iconContainer}>
          <UserPlus size={60} color="#2563EB" strokeWidth={1.5} />
        </View>

        <Text style={styles.title}>פרטי מאבטח חדש</Text>
        <Text style={styles.subtitle}>
          מאבטחים: {guards.length}/30
        </Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>שם פרטי *</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="הזן שם פרטי"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>שם משפחה *</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="הזן שם משפחה"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>תעודת זהות *</Text>
            <TextInput
              style={styles.input}
              value={idNumber}
              onChangeText={setIdNumber}
              placeholder="123456789"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              maxLength={9}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>טלפון *</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="0501234567"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'שומר...' : 'הוסף מאבטח'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    padding: 24,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#374151',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  submitButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
});

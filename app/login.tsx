import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield, User, Lock } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthProvider';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('שגיאה', 'נא למלא את כל השדות');
      return;
    }

    setIsLoading(true);
    try {
      await login(username, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Login error in UI:', error);
      const errorMessage = error?.message || 'שם משתמש או סיסמה שגויים';
      const detailedError = `${errorMessage}\n\nAPI URL: ${process.env.EXPO_PUBLIC_RORK_API_BASE_URL || 'לא מוגדר'}`;
      Alert.alert('שגיאת התחברות', detailedError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#1a1a2e', '#16213e', '#0f3460']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Shield size={64} color="#ffffff" strokeWidth={2} />
            </View>
            <Text style={styles.title}>מערכת ניהול מאבטחים</Text>
            <Text style={styles.subtitle}>כניסה למערכת</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <View style={styles.inputIconContainer}>
                <User size={20} color="#94a3b8" />
              </View>
              <TextInput
                style={styles.input}
                placeholder="שם משתמש"
                placeholderTextColor="#94a3b8"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                textAlign="right"
              />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputIconContainer}>
                <Lock size={20} color="#94a3b8" />
              </View>
              <TextInput
                style={styles.input}
                placeholder="סיסמה"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                textAlign="right"
              />
            </View>

            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.loginButtonText}>כניסה למערכת</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>מערכת מאובטחת</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
  },
  formContainer: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    height: 56,
  },
  inputIconContainer: {
    marginLeft: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    paddingVertical: 0,
  },
  loginButton: {
    backgroundColor: '#0ea5e9',
    borderRadius: 12,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    marginTop: 48,
    alignItems: 'center',
  },
  footerText: {
    color: '#64748b',
    fontSize: 14,
  },
});

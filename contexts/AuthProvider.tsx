import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';

const AUTH_KEY = '@auth_token';
const CREDENTIALS = {
  username: 'אשכול',
  password: '0123456'
};

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem(AUTH_KEY);
      setIsAuthenticated(!!token);
    } catch (error) {
      console.error('Failed to check auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    if (username === CREDENTIALS.username && password === CREDENTIALS.password) {
      await AsyncStorage.setItem(AUTH_KEY, 'authenticated');
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = async () => {
    await AsyncStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
});

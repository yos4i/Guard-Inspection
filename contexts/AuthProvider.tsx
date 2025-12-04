import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { trpc } from '@/lib/trpc';

const AUTH_KEY = '@auth_token';

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuthMutation = trpc.auth.check.useQuery(undefined, {
    enabled: false,
    retry: false,
  });

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem(AUTH_KEY);
      if (token) {
        await checkAuthMutation.refetch();
        if (checkAuthMutation.data?.isAuthenticated) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          await AsyncStorage.removeItem(AUTH_KEY);
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Failed to check auth:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const loginMutation = trpc.auth.login.useMutation();

  const login = async (username: string, password: string) => {
    try {
      console.log('Attempting login...');
      console.log('API Base URL:', process.env.EXPO_PUBLIC_RORK_API_BASE_URL);
      console.log('tRPC URL:', `${process.env.EXPO_PUBLIC_RORK_API_BASE_URL}/api/trpc`);
      const result = await loginMutation.mutateAsync({ username, password });
      console.log('Login successful, saving token...');
      await AsyncStorage.setItem(AUTH_KEY, result.token);
      setIsAuthenticated(true);
      return true;
    } catch (error: any) {
      console.error('Login failed:', error);
      console.error('Error name:', error?.name);
      console.error('Error message:', error?.message);
      console.error('Error shape:', error?.shape);
      console.error('Full error:', JSON.stringify(error, null, 2));
      throw error;
    }
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

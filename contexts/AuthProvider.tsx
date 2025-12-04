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
      const result = await loginMutation.mutateAsync({ username, password });
      await AsyncStorage.setItem(AUTH_KEY, result.token);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
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

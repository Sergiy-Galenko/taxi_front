import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const signIn = useCallback(async (token: string) => {
    try {
      await AsyncStorage.setItem('authToken', token);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error saving auth token:', error);
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error removing auth token:', error);
      throw error;
    }
  }, []);

  return {
    isAuthenticated,
    signIn,
    signOut,
  };
}; 
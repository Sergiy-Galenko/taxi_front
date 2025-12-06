import { useEffect, useState } from 'react';
import { useUser } from './UserContext';
import { getAuthToken, removeAuthToken } from '../utils/auth';
import { apiRequest } from '../config/api';

export const useAuth = () => {
  const { user, setUser } = useUser();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await getAuthToken();
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Verify token with server
      const response = await apiRequest('/api/auth/me');
      
      if (response.ok) {
        const userData = await response.json();
        setUser({
          id: String(userData.id),
          email: userData.email,
          fullName: userData.full_name,
          role: userData.role,
          phoneNumber: userData.phone_number,
        });
      } else {
        // Token is invalid, remove it
        await removeAuthToken();
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      await removeAuthToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await removeAuthToken();
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return {
    user,
    isLoading,
    logout,
    checkAuthStatus,
  };
}; 
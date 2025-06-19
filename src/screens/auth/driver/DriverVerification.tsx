import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showMessage } from 'react-native-flash-message';
import { useTheme } from '../../hooks/useTheme';
import { verifyDriver, getDriverProfile } from '../../services/api/driver';

export default function DriverVerification() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'active' | 'blocked'>('pending');

  useEffect(() => {
    checkVerificationStatus();
  }, []);

  const checkVerificationStatus = async () => {
    try {
      const driverId = await AsyncStorage.getItem('driverId');
      if (!driverId) {
        throw new Error('Driver ID not found');
      }

      const response = await getDriverProfile(driverId);
      if (response.success && response.data) {
        setVerificationStatus(response.data.driver.status);
        
        if (response.data.driver.status === 'active') {
          showMessage({
            message: 'Your account has been verified',
            type: 'success',
          });
          navigation.navigate('Home' as never);
        } else if (response.data.driver.status === 'blocked') {
          showMessage({
            message: 'Your account has been blocked',
            type: 'danger',
          });
          navigation.navigate('Login' as never);
        }
      }
    } catch (error) {
      showMessage({
        message: error instanceof Error ? error.message : 'Failed to check verification status',
        type: 'danger',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    try {
      setIsLoading(true);
      const driverId = await AsyncStorage.getItem('driverId');
      if (!driverId) {
        throw new Error('Driver ID not found');
      }

      const response = await verifyDriver(driverId);
      if (response.success && response.data) {
        setVerificationStatus(response.data.status);
        
        if (response.data.status === 'active') {
          showMessage({
            message: 'Your account has been verified',
            type: 'success',
          });
          navigation.navigate('Home' as never);
        }
      }
    } catch (error) {
      showMessage({
        message: error instanceof Error ? error.message : 'Failed to verify account',
        type: 'danger',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.content, { paddingTop: insets.top + 20 }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Driver Verification
        </Text>

        {isLoading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} />
        ) : (
          <>
            <Text style={[styles.status, { color: theme.colors.text }]}>
              Status: {verificationStatus}
            </Text>

            {verificationStatus === 'pending' && (
              <Button
                mode="contained"
                onPress={handleVerify}
                style={styles.button}
                loading={isLoading}
                disabled={isLoading}
              >
                Verify Account
              </Button>
            )}
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  status: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    marginTop: 20,
  },
}); 
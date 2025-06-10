import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '../../../types/navigation';

export default function DriverRegistration() {
  const navigation = useNavigation<NavigationProp>();

  const handleStartRegistration = () => {
    navigation.navigate('DriverPersonalInfo');
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Driver Registration
      </Text>
      <Text variant="bodyLarge" style={styles.subtitle}>
        Complete the registration process to become a driver
      </Text>
      <Button
        mode="contained"
        onPress={handleStartRegistration}
        style={styles.button}
      >
        Start Registration
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 32,
    textAlign: 'center',
    opacity: 0.7,
  },
  button: {
    width: '100%',
    maxWidth: 300,
  },
}); 
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '../../types/navigation';

export const DriverHome = () => {
  const navigation = useNavigation<NavigationProp>();

  const handleLogout = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Вітаємо!</Text>
        <Text style={styles.subtitle}>
          Ваш обліковий запис на перевірці. Ви отримаєте повідомлення, коли він буде підтверджено.
        </Text>

        <Button
          mode="contained"
          onPress={handleLogout}
          style={styles.button}
          icon="logout"
        >
          Вийти
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    width: '100%',
    backgroundColor: '#FF3B30',
  },
}); 
import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, Text, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '../../types/navigation';

export const VerificationComplete = () => {
  const navigation = useNavigation<NavigationProp>();

  const handleGoToHome = () => {
    try {
      console.log('Attempting to navigate to Home screen...');
      navigation.navigate('Home');
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert(
        'Помилка',
        'Не вдалося перейти до головного екрану. Спробуйте ще раз.'
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <IconButton
          icon="check-circle"
          size={100}
          iconColor="#4CAF50"
          style={styles.successIcon}
        />
        
        <Text style={styles.title}>Верифікація завершена!</Text>
        
        <Text style={styles.subtitle}>
          Дякуємо за надання необхідних документів. Ми перевіримо їх протягом 24 годин.
        </Text>

        <Text style={styles.info}>
          Ви отримаєте повідомлення, коли ваш обліковий запис буде підтверджено.
        </Text>

        <Button
          mode="contained"
          onPress={handleGoToHome}
          style={styles.button}
          icon="home"
        >
          Перейти до головного екрану
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
  successIcon: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#4CAF50',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 24,
  },
  info: {
    fontSize: 14,
    color: '#999',
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    backgroundColor: '#4CAF50',
  },
}); 
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, IconButton } from 'react-native-paper';

export const Welcome = ({ navigation }: any) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="taxi"
          size={80}
          iconColor="#007AFF"
          style={styles.logo}
        />
        <Text style={styles.title}>Ласкаво просимо до Taxi App</Text>
        <Text style={styles.subtitle}>Оберіть, як ви хочете використовувати наш сервіс</Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('PassengerRegistration')}
          style={styles.button}
          icon="account"
        >
          Я пасажир
        </Button>

        <Button
          mode="contained"
          onPress={() => navigation.navigate('DriverRegistration')}
          style={styles.button}
          icon="car"
        >
          Я водій
        </Button>

        <Text
          style={styles.link}
          onPress={() => navigation.navigate('Login')}
        >
          Вже маєте обліковий запис? Увійти
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  logo: {
    marginBottom: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  buttonContainer: {
    gap: 15,
  },
  button: {
    height: 50,
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#007AFF',
  },
  link: {
    color: '#007AFF',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
}); 
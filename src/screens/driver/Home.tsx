import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '../../types/navigation';

// Тестові пропозиції поїздок
const mockRides = [
  {
    id: '1',
    from: 'вул. Хрещатик, 22',
    to: 'просп. Перемоги, 45',
    time: '14:30',
    price: 180,
  },
  {
    id: '2',
    from: 'вул. Січових Стрільців, 10',
    to: 'вул. Лесі Українки, 5',
    time: '15:00',
    price: 120,
  },
  {
    id: '3',
    from: 'пл. Перемоги, 1',
    to: 'вул. Грушевського, 12',
    time: '15:15',
    price: 150,
  },
];

const DriverHome = () => {
  const navigation = useNavigation<NavigationProp>();
  const [rides, setRides] = useState(mockRides);

  const handleLogout = () => {
    navigation.navigate('Login');
  };

  const handleTakeRide = (rideId: string) => {
    const ride = rides.find(r => r.id === rideId);
    Alert.alert('Ви взяли поїздку!', `Маршрут: ${ride?.from} → ${ride?.to}`);
    setRides(rides.filter(r => r.id !== rideId));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Пропозиції поїздок</Text>
      {rides.length === 0 ? (
        <Text style={styles.empty}>Наразі немає доступних поїздок</Text>
      ) : (
        <FlatList
          data={rides}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.route}>{item.from} → {item.to}</Text>
                <Text style={styles.time}>Час: {item.time}</Text>
                <Text style={styles.price}>Ціна: {item.price} грн</Text>
                <Button
                  mode="contained"
                  style={styles.button}
                  onPress={() => handleTakeRide(item.id)}
                >
                  Взяти поїздку
                </Button>
              </Card.Content>
            </Card>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  list: {
    paddingBottom: 24,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  route: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  time: {
    fontSize: 16,
    color: '#555',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    color: '#E50914',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#E50914',
    borderRadius: 8,
  },
  empty: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 40,
  },
});

export default DriverHome; 
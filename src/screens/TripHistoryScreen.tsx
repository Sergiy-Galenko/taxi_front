import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Animated, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface Trip {
  id: string;
  from: string;
  to: string;
  date: string;
  price: string;
  rating: number;
}

const TripHistoryScreen = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    // TODO: fetch from API
    setTrips([
      { 
        id: '1', 
        from: 'вул. Хрещатик, 25', 
        to: 'Аеропорт "Бориспіль"', 
        date: '15 червня 2024, 14:30',
        price: '₴350',
        rating: 5
      },
      { 
        id: '2', 
        from: 'ТРЦ "Ocean Plaza"', 
        to: 'вул. Лисенка, 12', 
        date: '14 червня 2024, 18:15',
        price: '₴120',
        rating: 4
      },
      { 
        id: '3', 
        from: 'Залізничний вокзал', 
        to: 'Софіївська площа', 
        date: '10 червня 2024, 09:45',
        price: '₴85',
        rating: 5
      },
    ]);
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleRepeat = (trip: Trip) => {
    navigation.navigate('Home', { from: trip.from, to: trip.to } as any);
  };

  const renderTripCard = ({ item }: { item: Trip }) => (
    <Animated.View style={[styles.tripCard, { opacity: fadeAnim }]}>
      <View style={styles.tripHeader}>
        <FontAwesome5 name="route" size={20} color="#E50914" style={styles.routeIcon} />
        <Text style={styles.tripDate}>{item.date}</Text>
      </View>
      
      <View style={styles.routeRow}>
        <MaterialIcons name="location-on" size={18} color="#0A84FF" />
        <Text style={styles.routeText} numberOfLines={1} ellipsizeMode="tail">{item.from}</Text>
      </View>
      
      <View style={styles.routeRow}>
        <MaterialIcons name="flag" size={18} color="#FF3B30" />
        <Text style={styles.routeText} numberOfLines={1} ellipsizeMode="tail">{item.to}</Text>
      </View>
      
      <View style={styles.tripFooter}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>{item.price}</Text>
        </View>
        
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.repeatButton} 
        onPress={() => handleRepeat(item)}
      >
        <LinearGradient
          colors={['#E50914', '#B20710']}
          style={styles.repeatButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Ionicons name="repeat" size={20} color="#FFF" />
          <Text style={styles.repeatButtonText}>Повторити</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <LinearGradient
      colors={['#141414', '#1a1a1a', '#000']}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Історія поїздок</Text>
        <View style={{ width: 40 }} />
      </View>
      
      {trips.length > 0 ? (
        <FlatList
          data={trips}
          keyExtractor={item => item.id}
          renderItem={renderTripCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <FontAwesome5 name="history" size={60} color="#E50914" style={styles.emptyIcon} />
          <Text style={styles.emptyTitle}>Історія поїздок порожня</Text>
          <Text style={styles.emptyText}>Тут з'являтимуться ваші попередні поїздки</Text>
        </View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: 'rgba(229, 9, 20, 0.2)',
    borderRadius: 20,
    padding: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    flex: 1,
  },
  listContent: {
    paddingBottom: 30,
  },
  tripCard: {
    backgroundColor: 'rgba(30,30,30,0.8)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(80,80,80,0.5)',
  },
  tripHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingBottom: 12,
  },
  routeIcon: {
    marginRight: 10,
  },
  tripDate: {
    color: '#BBB',
    fontSize: 14,
    fontWeight: '500',
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  routeText: {
    color: '#FFF',
    marginLeft: 10,
    fontSize: 16,
    flex: 1,
  },
  tripFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
  },
  priceContainer: {
    backgroundColor: 'rgba(229, 9, 20, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  priceText: {
    color: '#E50914',
    fontWeight: 'bold',
    fontSize: 18,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,215,0,0.15)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  ratingText: {
    color: '#FFD700',
    fontWeight: '600',
    marginLeft: 5,
    fontSize: 16,
  },
  repeatButton: {
    marginTop: 15,
    borderRadius: 12,
    overflow: 'hidden',
  },
  repeatButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  repeatButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyIcon: {
    marginBottom: 20,
    opacity: 0.7,
  },
  emptyTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyText: {
    color: '#BBB',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default TripHistoryScreen;
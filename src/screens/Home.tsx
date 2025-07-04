import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Keyboard,
  Animated,
  Platform,
  ScrollView,
  TouchableWithoutFeedback
} from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import MapView, { Marker, Region, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { DrawerActions, useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const TAXI_TYPES = [
  { key: 'econom', label: 'Економ', icon: 'car', price: '₴45' },
  { key: 'comfort', label: 'Комфорт', icon: 'car-side', price: '₴65' },
  { key: 'business', label: 'Бізнес', icon: 'crown', price: '₴90' },
  { key: 'balance', label: 'Преміум', icon: 'gem', price: '₴120' },
];

const RECENT_DESTINATIONS = [
  { id: '1', name: 'Залізничний вокзал', icon: 'train', coords: { latitude: 50.4405, longitude: 30.4900 } },
  { id: '2', name: 'Аеропорт "Бориспіль"', icon: 'plane', coords: { latitude: 50.3450, longitude: 30.8947 } },
  { id: '3', name: 'ТРЦ "Ocean Plaza"', icon: 'shopping-cart', coords: { latitude: 50.4395, longitude: 30.5214 } },
  { id: '4', name: 'Софіївська площа', icon: 'landmark', coords: { latitude: 50.4539, longitude: 30.5161 } },
];

export default function NetflixStyleHome() {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const mapRef = useRef<MapView>(null);

  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [startCoord, setStartCoord] = useState<{ latitude: number; longitude: number } | null>(null);
  const [endCoord, setEndCoord] = useState<{ latitude: number; longitude: number } | null>(null);
  const [taxiType, setTaxiType] = useState('econom');
  const [isFocused, setIsFocused] = useState(false);
  const [showRecents, setShowRecents] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState('~ ₴75');
  const [estimatedTime, setEstimatedTime] = useState('~ 12 хв');
  const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);
  const [nearbyCities, setNearbyCities] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      let loc = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };
      setLocation(coords);
      setStartCoord(coords);
      setStart('Моє місцезнаходження');
      setRegion({
        ...coords,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
      });

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
      
      // Отримання міст поруч
      fetchNearbyCities(coords);
    })();
  }, []);

  // Функція для отримання міст у радіусі 10 км
  const fetchNearbyCities = async (center: { latitude: number; longitude: number }) => {
    try {
      // Отримуємо адреси в радіусі 10 км
      const addresses = await Location.reverseGeocodeAsync({
        latitude: center.latitude,
        longitude: center.longitude,
      });
      
      // Фільтруємо результати, залишаючи лише міста
      const cities = addresses.reduce((unique: any[], item) => {
        if (item.city && !unique.some(city => city.city === item.city)) {
          return [...unique, {
            id: `city-${unique.length}`,
            name: item.city,
            icon: 'city',
            coords: center // Використовуємо поточні координати для міста
          }];
        }
        return unique;
      }, []);
      
      setNearbyCities(cities.slice(0, 3)); // Беремо перші 3 унікальні міста
    } catch (error) {
      console.warn('Failed to fetch nearby cities:', error);
    }
  };

  // Оновлення маршруту при зміні точок
  useEffect(() => {
    if (startCoord && endCoord) {
      // Генеруємо фейковий маршрут (в реальному додатку використовуйте API напрямків)
      const newRoute = [
        startCoord,
        {
          latitude: (startCoord.latitude + endCoord.latitude) / 2,
          longitude: (startCoord.longitude + endCoord.longitude) / 2
        },
        endCoord
      ];
      setRouteCoordinates(newRoute);

      // Центруємо карту на маршруті
      mapRef.current?.fitToCoordinates([startCoord, endCoord], {
        edgePadding: { top: 100, right: 100, bottom: 300, left: 100 },
        animated: true,
      });
    } else {
      setRouteCoordinates([]);
    }
  }, [startCoord, endCoord]);

  // Геокодування кінцевої точки при зміні end
  const geocodeAddress = async (address: string, isStart: boolean = false) => {
    if (!address) {
      isStart ? setStartCoord(null) : setEndCoord(null);
      return;
    }
    
    try {
      const geocoded = await Location.geocodeAsync(address);
      if (geocoded.length) {
        const { latitude, longitude } = geocoded[0];
        if (isStart) {
          setStartCoord({ latitude, longitude });
        } else {
          setEndCoord({ latitude, longitude });
        }
      }
    } catch (e) {
      console.warn('Geocode error:', e);
    }
  };

  const handleSearch = () => {
    Keyboard.dismiss();
    navigation.navigate('RideOptions' as never);
  };

  const handleFocus = () => {
    setIsFocused(true);
    setShowRecents(true);
  };
  
  const handleBlur = () => {
    setIsFocused(false);
    setTimeout(() => setShowRecents(false), 200);
  };
  
  const handleSetCurrentLocation = () => {
    if (location) {
      setStart('Моє місцезнаходження');
      setStartCoord(location);
    }
  };
  
  const handlePlaceSelect = (place: any) => {
    setEnd(place.name);
    setEndCoord(place.coords);
    setShowRecents(false);
    Keyboard.dismiss();
  };
  
  const handleSwapLocations = () => {
    const tmp = start;
    setStart(end);
    setEnd(tmp);
    
    const tmpCoord = startCoord;
    setStartCoord(endCoord);
    setEndCoord(tmpCoord);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        {region && (
          <MapView
            ref={mapRef}
            style={styles.map}
            region={region}
            showsUserLocation
            mapType="standard"
            userInterfaceStyle="dark"
            onRegionChangeComplete={setRegion}
          >
            {/* Маркер поточної локації */}
            {startCoord && (
              <Marker coordinate={startCoord}>
                <View style={styles.startMarker}>
                  <FontAwesome5 name="map-marker" size={28} color="#0A84FF" />
                </View>
              </Marker>
            )}

            {/* Маркер призначення */}
            {endCoord && (
              <Marker coordinate={endCoord}>
                <View style={styles.destinationMarker}>
                  <FontAwesome5 name="map-pin" size={24} color="#FF3B30" />
                </View>
              </Marker>
            )}

            {/* Маршрут */}
            {routeCoordinates.length > 0 && (
              <Polyline
                coordinates={routeCoordinates}
                strokeColor="#E50914"
                strokeWidth={4}
                lineDashPattern={[10, 10]}
              />
            )}
          </MapView>
        )}

        {/* Градиєнти зверху/знизу */}
        <LinearGradient colors={['rgba(20,20,20,0.9)', 'transparent']} style={styles.topGradient} pointerEvents="none" />
        <LinearGradient colors={['transparent', 'rgba(20,20,20,0.9)']} style={styles.bottomGradient} pointerEvents="none" />

        {/* Хедер */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            activeOpacity={0.7}
          >
            <MaterialIcons name="menu" size={32} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.greetingText}>Доброго вечора!</Text>
            <Text style={styles.locationText}>Київ, Україна</Text>
          </View>
          <TouchableOpacity style={styles.profileButton} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={28} color="#FFF" />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </Animated.View>

        {/* Пошукова картка */}
        <Animated.View style={[styles.searchCard, { opacity: fadeAnim }]}>
          <BlurView intensity={isFocused ? 100 : 60} tint="dark" style={styles.blurContainer}>
            {/* Початок */}
            <View style={styles.startInputRow}>
              <TextInput
                mode="outlined"
                placeholder="Звідки..."
                value={start}
                onChangeText={text => {
                  setStart(text);
                  geocodeAddress(text, true);
                }}
                style={styles.routeInput}
                left={<TextInput.Icon icon="map-marker" color="#FF3B30" />}
                theme={{ colors: { primary: '#FF3B30', background: '#fff', text: '#222', placeholder: '#888' } }}
                dense
              />
              <Button
                mode="contained"
                onPress={handleSetCurrentLocation}
                style={styles.locationButton}
                icon="crosshairs-gps"
                labelStyle={{ fontSize: 18, color: '#FFF' }}
                compact
              >
                <></>
              </Button>
            </View>

            {/* Кнопка swap */}
            <TouchableOpacity style={styles.swapButton} onPress={handleSwapLocations} activeOpacity={0.7}>
              <Ionicons name="swap-vertical" size={22} color="#FFF" />
            </TouchableOpacity>

            {/* Кінець */}
            <View style={styles.endInputRow}>
              <TextInput
                mode="outlined"
                placeholder="Куди поїдемо?"
                value={end}
                onChangeText={text => {
                  setEnd(text);
                  geocodeAddress(text);
                }}
                style={styles.routeInput}
                left={<TextInput.Icon icon="flag" color="#FF3B30" />}
                theme={{ colors: { primary: '#FF3B30', background: '#fff', text: '#222', placeholder: '#888' } }}
                onFocus={handleFocus}
                onBlur={handleBlur}
                dense
              />
            </View>

            {/* Останні поїздки та міста поруч */}
            {showRecents && (
              <Animated.View style={[styles.recentContainer, { opacity: fadeAnim }]}>
                <ScrollView style={{ maxHeight: 220 }} showsVerticalScrollIndicator={false}>
                  <Text style={styles.recentTitle}>Недавні поїздки</Text>
                  {RECENT_DESTINATIONS.map(dest => (
                    <TouchableOpacity
                      key={dest.id}
                      style={styles.recentItem}
                      onPress={() => handlePlaceSelect(dest)}
                      activeOpacity={0.7}
                    >
                      <FontAwesome5 name={dest.icon} size={18} color="#888" style={styles.recentIcon} />
                      <Text style={styles.recentText}>{dest.name}</Text>
                      <MaterialIcons name="chevron-right" size={20} color="#888" />
                    </TouchableOpacity>
                  ))}

                  {/* Міста поруч (10 км) */}
                  {nearbyCities.length > 0 && (
                    <>
                      <Text style={[styles.recentTitle, { marginTop: 15 }]}>Міста поруч (10 км)</Text>
                      {nearbyCities.map(city => (
                        <TouchableOpacity
                          key={city.id}
                          style={styles.recentItem}
                          onPress={() => handlePlaceSelect(city)}
                          activeOpacity={0.7}
                        >
                          <FontAwesome5 name={city.icon} size={18} color="#0A84FF" style={styles.recentIcon} />
                          <Text style={styles.recentText}>{city.name}</Text>
                          <MaterialIcons name="chevron-right" size={20} color="#888" />
                        </TouchableOpacity>
                      ))}
                    </>
                  )}
                </ScrollView>
              </Animated.View>
            )}

            {/* Вибір таксі */}
            <View style={styles.taxiSelector}>
              {TAXI_TYPES.map(type => (
                <TouchableOpacity
                  key={type.key}
                  style={[styles.taxiOption, taxiType === type.key && styles.selectedTaxiOption]}
                  onPress={() => setTaxiType(type.key)}
                  activeOpacity={0.8}
                >
                  <FontAwesome5
                    name={type.icon}
                    size={20}
                    color={taxiType === type.key ? '#FFF' : '#888'}
                  />
                  <Text style={[styles.taxiLabel, taxiType === type.key && styles.selectedTaxiLabel]}>
                    {type.label}
                  </Text>
                  <Text style={[styles.taxiPrice, taxiType === type.key && styles.selectedTaxiPrice]}>
                    {type.price}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Оцінка */}
            <View style={styles.estimateContainer}>
              <View style={styles.estimateItem}>
                <Ionicons name="time-outline" size={20} color="#888" />
                <Text style={styles.estimateText}>{estimatedTime}</Text>
              </View>
              <View style={styles.estimateSeparator} />
              <View style={styles.estimateItem}>
                <Ionicons name="pricetag-outline" size={20} color="#888" />
                <Text style={styles.estimateText}>{estimatedPrice}</Text>
              </View>
            </View>

            {/* Кнопка пошуку */}
            <TouchableOpacity style={styles.searchButton} onPress={handleSearch} activeOpacity={0.8}>
              <LinearGradient
                colors={['#E50914', '#B20710']}
                style={styles.searchButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.searchButtonText}>ЗНАЙТИ ТАКСІ</Text>
                <Ionicons name="car-sport" size={24} color="#FFF" style={styles.carIcon} />
              </LinearGradient>
            </TouchableOpacity>
          </BlurView>
        </Animated.View>

        {/* Швидкі дії */}
        <Animated.View style={[styles.quickActions, { opacity: fadeAnim }]}>
          <TouchableOpacity 
            style={styles.quickAction} 
            activeOpacity={0.8}
            onPress={() => {
              setEnd('Залізничний вокзал');
              setEndCoord({ latitude: 50.4405, longitude: 30.4900 });
            }}
          >
            <LinearGradient
              colors={['#141414', '#E50914']} style={styles.quickActionGradient}
              start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
            >
              <Ionicons name="home" size={24} color="#FFF" />
            </LinearGradient>
            <Text style={styles.quickActionText}>Додому</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickAction} 
            activeOpacity={0.8}
            onPress={() => {
              setEnd('ТРЦ "Ocean Plaza"');
              setEndCoord({ latitude: 50.4395, longitude: 30.5214 });
            }}
          >
            <LinearGradient
              colors={['#141414', '#E50914']} style={styles.quickActionGradient}
              start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
            >
              <Ionicons name="briefcase" size={24} color="#FFF" />
            </LinearGradient>
            <Text style={styles.quickActionText}>На роботу</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickAction} 
            activeOpacity={0.8}
            onPress={() => {
              setEnd('Аеропорт "Бориспіль"');
              setEndCoord({ latitude: 50.3450, longitude: 30.8947 });
            }}
          >
            <LinearGradient
              colors={['#141414', '#E50914']} style={styles.quickActionGradient}
              start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
            >
              <Ionicons name="airplane" size={24} color="#FFF" />
            </LinearGradient>
            <Text style={styles.quickActionText}>Аеропорт</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#141414' },
  map: { ...StyleSheet.absoluteFillObject, zIndex: 0 },
  topGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 200, zIndex: 2 },
  bottomGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 200, zIndex: 2 },
  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 0, right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20, zIndex: 10
  },
  menuButton: {
    backgroundColor: 'rgba(30,30,30,0.7)', borderRadius: 20, padding: 8
  },
  profileButton: {
    backgroundColor: 'rgba(30,30,30,0.7)', borderRadius: 20, padding: 8, position: 'relative'
  },
  notificationBadge: {
    position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#E50914', borderWidth: 1, borderColor: '#fff'
  },
  headerCenter: { alignItems: 'center', flex: 1, marginHorizontal: 10 },
  greetingText: {
    color: '#FFF', fontSize: 16, fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2
  },
  locationText: { color: '#BBB', fontSize: 14, marginTop: 2 },
  searchCard: {
    position: 'absolute', bottom: 40, left: 20, right: 20,
    borderRadius: 16, overflow: 'hidden', zIndex: 20, backgroundColor: 'transparent',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15,
    shadowRadius: 12, elevation: 8
  },
  blurContainer: { padding: 20, backgroundColor: 'rgba(20,20,20,0.2)', borderRadius: 16 },
  startInputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, zIndex: 2 },
  endInputRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, zIndex: 2 },
  routeInput: {
    flex: 1, backgroundColor: '#FFF', borderRadius: 10, fontSize: 15, minHeight: 44, paddingHorizontal: 0
  },
  locationButton: {
    marginLeft: 8, backgroundColor: '#FF3B30', borderRadius: 12,
    minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center',
    elevation: 2, shadowColor: '#E50914', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 4
  },
  swapButton: {
    position: 'absolute', left: 10, top: 60, backgroundColor: '#E50914',
    borderRadius: 20, padding: 6, zIndex: 5, elevation: 5,
    shadowColor: '#E50914', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 4
  },
  recentContainer: {
    backgroundColor: 'rgba(30,30,30,0.95)', borderRadius: 12, padding: 15,
    marginTop: 10, marginBottom: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 4, elevation: 2
  },
  recentTitle: { color: '#FFF', fontWeight: '600', marginBottom: 10, fontSize: 16 },
  recentItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)'
  },
  recentIcon: { marginRight: 12, width: 24, textAlign: 'center' },
  recentText: { flex: 1, color: '#FFF', fontSize: 15 },
  taxiSelector: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, marginBottom: 15, zIndex: 1 },
  taxiOption: {
    alignItems: 'center', paddingVertical: 10, paddingHorizontal: 4,
    borderRadius: 10, backgroundColor: 'rgba(50,50,50,0.6)', width: width * 0.21,
    marginHorizontal: 2, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)'
  },
  selectedTaxiOption: {
    backgroundColor: '#E50914', transform: [{ scale: 1.05 }],
    borderColor: '#E50914', shadowColor: '#E50914', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 6
  },
  taxiLabel: { color: '#888', fontSize: 12, marginTop: 5, fontWeight: '600' },
  selectedTaxiLabel: { color: '#FFF', fontWeight: '700' },
  taxiPrice: { color: '#888', fontSize: 10, marginTop: 3, fontWeight: '600' },
  selectedTaxiPrice: { color: '#FFF', fontWeight: '700' },
  estimateContainer: {
    flexDirection: 'row', justifyContent: 'center', backgroundColor: 'rgba(30,30,30,0.7)',
    borderRadius: 20, paddingVertical: 12, marginTop: 5, marginBottom: 15, alignItems: 'center'
  },
  estimateItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15 },
  estimateSeparator: { width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 8 },
  estimateText: { color: '#FFF', marginLeft: 8, fontWeight: '600', fontSize: 15 },
  searchButton: {
    marginTop: 10, borderRadius: 8, overflow: 'hidden', elevation: 3,
    shadowColor: '#E50914', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 6
  },
  searchButtonGradient: {
    paddingVertical: 16, alignItems: 'center', justifyContent: 'center',
    flexDirection: 'row', borderRadius: 8
  },
  searchButtonText: {
    color: '#FFF', fontWeight: '900', fontSize: 16, letterSpacing: 0.5, marginRight: 10
  },
  carIcon: { marginLeft: 5 },
  startMarker: {
    backgroundColor: 'rgba(10, 132, 255, 0.3)',
    borderRadius: 20,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  destinationMarker: {
    backgroundColor: 'rgba(255,255,255,0.9)', 
    borderRadius: 12,
    padding: 5, 
    borderWidth: 2, 
    borderColor: '#FF3B30', 
    alignItems: 'center', 
    justifyContent: 'center'
  },
  quickActions: {
    position: 'absolute', top: Platform.OS === 'ios' ? 120 : 100,
    right: 20, zIndex: 15, backgroundColor: 'rgba(30,30,30,0.7)',
    borderRadius: 20, padding: 10, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 4, elevation: 2
  },
  quickAction: { alignItems: 'center', marginVertical: 8, width: 70 },
  quickActionGradient: {
    width: 50, height: 50, borderRadius: 25, justifyContent: 'center',
    alignItems: 'center', marginBottom: 5,
    shadowColor: '#E50914', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12, shadowRadius: 4, elevation: 2
  },
  quickActionText: { color: '#FFF', fontSize: 12, textAlign: 'center' },
});
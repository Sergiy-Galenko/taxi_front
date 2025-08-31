import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Keyboard,
  Animated,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  SafeAreaView,
  StatusBar,
  Pressable,
} from 'react-native';
import { Text, TextInput, Button, Snackbar } from 'react-native-paper';
import MapView, { Marker, Region, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { DrawerActions, useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const TAXI_TYPES = [
  { key: 'econom', label: 'Економ', icon: 'car', price: '₴45', color: '#4CAF50' },
  { key: 'comfort', label: 'Комфорт', icon: 'car-side', price: '₴65', color: '#2196F3' },
  { key: 'business', label: 'Бізнес', icon: 'crown', price: '₴90', color: '#FF9800' },
  { key: 'premium', label: 'Преміум', icon: 'gem', price: '₴120', color: '#9C27B0' },
];

const QUICK_DESTINATIONS = [
  { id: '1', name: 'Залізничний вокзал', icon: 'train', coords: { latitude: 50.4405, longitude: 30.4900 } },
  { id: '2', name: 'Аеропорт «Бориспіль»', icon: 'plane', coords: { latitude: 50.3450, longitude: 30.8947 } },
  { id: '3', name: 'ТРЦ «Ocean Plaza»', icon: 'shopping-cart', coords: { latitude: 50.4395, longitude: 30.5214 } },
  { id: '4', name: 'Софіївська площа', icon: 'landmark', coords: { latitude: 50.4539, longitude: 30.5161 } },
  { id: '5', name: 'Майдан Незалежності', icon: 'flag', coords: { latitude: 50.4501, longitude: 30.5234 } },
  { id: '6', name: 'Київський метрополітен', icon: 'subway', coords: { latitude: 50.4501, longitude: 30.5234 } },
];

// -------- helpers
const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const formatTime = (d: Date) => `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;

function getGreeting(hour: number) {
  if (hour >= 5 && hour < 11) return 'Добрий ранок';
  if (hour >= 11 && hour < 17) return 'Добрий день';
  if (hour >= 17 && hour < 23) return 'Добрий вечір';
  return 'Доброї ночі';
}

export default function HomeScreenRedesigned() {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const mapRef = useRef<MapView>(null);

  // ---- state
  const [now, setNow] = useState<Date>(new Date());
  const [greeting, setGreeting] = useState<string>(getGreeting(new Date().getHours()));

  const [permissionDenied, setPermissionDenied] = useState(false);

  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [region, setRegion] = useState<Region | null>(null);

  const [start, setStart] = useState('Моє місцезнаходження');
  const [end, setEnd] = useState('');
  const [startCoord, setStartCoord] = useState<{ latitude: number; longitude: number } | null>(null);
  const [endCoord, setEndCoord] = useState<{ latitude: number; longitude: number } | null>(null);

  const [placeLabel, setPlaceLabel] = useState<string>('Визначаємо місце…');
  const [taxiType, setTaxiType] = useState('econom');
  const [isFocused, setIsFocused] = useState(false);
  const [showRecents, setShowRecents] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState('~ ₴75');
  const [estimatedTime, setEstimatedTime] = useState('~ 12 хв');
  const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);
  const [nearbyCities, setNearbyCities] = useState<any[]>([]);

  // live clock + greeting
  useEffect(() => {
    const t = setInterval(() => {
      const d = new Date();
      setNow(d);
      setGreeting(getGreeting(d.getHours()));
    }, 30000); // раз на 30с достатньо
    return () => clearInterval(t);
  }, []);

  // geolocation + reverse geocode
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setPermissionDenied(true);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };

      setLocation(coords);
      setStartCoord(coords);
      setRegion({ ...coords, latitudeDelta: 0.015, longitudeDelta: 0.0121 });

      // reverse geocode for header
      try {
        const [addr] = await Location.reverseGeocodeAsync(coords);
        const city = addr.city || addr.subregion || addr.district || addr.region;
        const country = addr.country || 'Україна';
        setPlaceLabel(city ? `${city}, ${country}` : country);
      } catch {
        setPlaceLabel('Місце не визначено');
      }

      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }).start();
      fetchNearbyCities(coords);
    })();
  }, []);

  // cities around (simple unique list from reverse geocode)
  const fetchNearbyCities = async (center: { latitude: number; longitude: number }) => {
    try {
      const addresses = await Location.reverseGeocodeAsync(center);
      const unique = addresses.reduce((acc: any[], item) => {
        const city = item.city || item.subregion || item.district;
        if (city && !acc.some((c) => c.name === city)) {
          acc.push({
            id: `city-${acc.length}`,
            name: city,
            icon: 'city',
            coords: center,
          });
        }
        return acc;
      }, []);
      setNearbyCities(unique.slice(0, 3));
    } catch {
      // noop
    }
  };

  // route build when both points set
  useEffect(() => {
    if (startCoord && endCoord) {
      const mid = {
        latitude: (startCoord.latitude + endCoord.latitude) / 2,
        longitude: (startCoord.longitude + endCoord.longitude) / 2,
      };
      setRouteCoordinates([startCoord, mid, endCoord]);

      mapRef.current?.fitToCoordinates([startCoord, endCoord], {
        edgePadding: { top: 120, right: 80, bottom: 320, left: 80 },
        animated: true,
      });

      // toy estimate (можеш підмінити на реальне API)
      const distKm =
        Math.hypot(startCoord.latitude - endCoord.latitude, startCoord.longitude - endCoord.longitude) * 111;
      const mins = Math.max(8, Math.round(distKm * 4));
      const base = taxiType === 'econom' ? 45 : taxiType === 'comfort' ? 65 : taxiType === 'business' ? 90 : 120;
      const price = Math.round(base + distKm * (taxiType === 'premium' ? 18 : 12));
      setEstimatedTime(`~ ${mins} хв`);
      setEstimatedPrice(`~ ₴${price}`);
    } else {
      setRouteCoordinates([]);
      setEstimatedTime('~ 12 хв');
      setEstimatedPrice('~ ₴75');
    }
  }, [startCoord, endCoord, taxiType]);

  // ----- debounced geocoding
  const geocodeTimer = useRef<NodeJS.Timeout | null>(null);
  const geocodeAddress = useCallback((address: string, isStart = false) => {
    if (geocodeTimer.current) clearTimeout(geocodeTimer.current);
    if (!address || address.trim().length < 3) {
      isStart ? setStartCoord(null) : setEndCoord(null);
      return;
    }
    geocodeTimer.current = setTimeout(async () => {
      try {
        const geocoded = await Location.geocodeAsync(address);
        if (geocoded.length) {
          const { latitude, longitude } = geocoded[0];
          isStart ? setStartCoord({ latitude, longitude }) : setEndCoord({ latitude, longitude });
        }
      } catch {
        // ignore
      }
    }, 450);
  }, []);

  const handleSearch = () => {
    Keyboard.dismiss();
    // Можеш підмінити на свій екран
    navigation.navigate('RideOptions' as never);
  };

  const handleFocus = () => {
    setIsFocused(true);
    setShowRecents(true);
  };
  const handleBlur = () => {
    setIsFocused(false);
    setTimeout(() => setShowRecents(false), 180);
  };

  const handleSetCurrentLocation = () => {
    if (location) {
      setStart('Моє місцезнаходження');
      setStartCoord(location);
      setEnd('');
      setEndCoord(null);
      mapRef.current?.animateToRegion(
        { ...location, latitudeDelta: 0.015, longitudeDelta: 0.0121 },
        400
      );
    }
  };

  const handlePlaceSelect = (place: any) => {
    setEnd(place.name);
    setEndCoord(place.coords);
    setShowRecents(false);
    Keyboard.dismiss();
  };

  const handleSwapLocations = () => {
    const s = start;
    const sc = startCoord;
    setStart(end);
    setStartCoord(endCoord);
    setEnd(s);
    setEndCoord(sc);
  };

  const isSearchDisabled = !endCoord;

  // -------- UI
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" />
        <View style={styles.container}>
          {/* MAP */}
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
              {/* start */}
              {startCoord && (
                <Marker coordinate={startCoord}>
                  <View style={styles.startMarker}>
                    <FontAwesome5 name="map-marker" size={28} color="#0A84FF" />
                  </View>
                </Marker>
              )}

              {/* end */}
              {endCoord && (
                <Marker coordinate={endCoord}>
                  <View style={styles.destinationMarker}>
                    <FontAwesome5 name="map-pin" size={22} color="#FF3B30" />
                  </View>
                </Marker>
              )}

              {/* route */}
              {routeCoordinates.length > 0 && (
                <Polyline coordinates={routeCoordinates} strokeColor="#E50914" strokeWidth={4} lineDashPattern={[12, 10]} />
              )}
            </MapView>
          )}

          {/* gradients */}
          <LinearGradient colors={['rgba(20,20,20,0.92)', 'transparent']} style={styles.topGradient} pointerEvents="none" />
          <LinearGradient colors={['transparent', 'rgba(20,20,20,0.92)']} style={styles.bottomGradient} pointerEvents="none" />

          {/* HEADER with time + greeting + place */}
          <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
              accessibilityRole="button"
              accessibilityLabel="Відкрити меню"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.7}
            >
              <MaterialIcons name="menu" size={28} color="#FFF" />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Text style={styles.headerTime}>{formatTime(now)}</Text>
              <Text style={styles.headerGreeting} numberOfLines={1} ellipsizeMode="tail">
                {greeting}! <Text style={styles.headerPlace}>{placeLabel}</Text>
              </Text>
            </View>

            <TouchableOpacity
              style={styles.iconBtn}
              accessibilityRole="button"
              accessibilityLabel="Сповіщення"
              activeOpacity={0.7}
            >
              <Ionicons name="notifications-outline" size={24} color="#FFF" />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
          </Animated.View>

          {/* QUICK ACTIONS */}
          <Animated.View style={[styles.quickActions, { opacity: fadeAnim }]}>
            <Text style={styles.quickActionsTitle}>Швидкі маршрути</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActionsScroll}>
              {QUICK_DESTINATIONS.map((dest) => (
                <TouchableOpacity
                  key={dest.id}
                  style={styles.quickAction}
                  activeOpacity={0.85}
                  onPress={() => handlePlaceSelect(dest)}
                  accessibilityLabel={dest.name}
                >
                  <LinearGradient colors={['#141414', '#E50914']} style={styles.quickActionGradient} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}>
                    <FontAwesome5 name={dest.icon} size={20} color="#FFF" />
                  </LinearGradient>
                  <Text style={styles.quickActionText}>{dest.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>

          {/* SEARCH CARD */}
          <Animated.View style={[styles.searchCard, { opacity: fadeAnim }]}>
            <BlurView intensity={isFocused ? 100 : 60} tint="dark" style={styles.blurContainer}>
              {/* from */}
              <View style={styles.row}>
                <TextInput
                  mode="outlined"
                  placeholder="Звідки…"
                  value={start}
                  onChangeText={(v) => {
                    setStart(v);
                    geocodeAddress(v, true);
                  }}
                  style={styles.input}
                  left={<TextInput.Icon icon="map-marker" color="#FF3B30" />}
                  theme={{ colors: { primary: '#FF3B30', background: '#fff', text: '#222', placeholder: '#888' } }}
                  dense
                  accessibilityLabel="Поле звідки"
                />
                <Button
                  mode="contained"
                  onPress={handleSetCurrentLocation}
                  style={styles.locationButton}
                  icon="crosshairs-gps"
                  labelStyle={{ fontSize: 18, color: '#FFF' }}
                  compact
                  accessibilityLabel="Встановити моє місцезнаходження"
                >
                  <></>
                </Button>
              </View>

              {/* swap */}
              <TouchableOpacity style={styles.swapButton} onPress={handleSwapLocations} activeOpacity={0.7} accessibilityLabel="Поміняти місцями">
                <Ionicons name="swap-vertical" size={22} color="#FFF" />
              </TouchableOpacity>

              {/* to */}
              <View style={styles.row}>
                <TextInput
                  mode="outlined"
                  placeholder="Куди поїдемо?"
                  value={end}
                  onChangeText={(v) => {
                    setEnd(v);
                    geocodeAddress(v);
                  }}
                  style={styles.input}
                  left={<TextInput.Icon icon="flag" color="#FF3B30" />}
                  theme={{ colors: { primary: '#FF3B30', background: '#fff', text: '#222', placeholder: '#888' } }}
                  onFocus={() => {
                    setShowRecents(true);
                    setIsFocused(true);
                  }}
                  onBlur={handleBlur}
                  dense
                  accessibilityLabel="Поле куди"
                />
              </View>

              {/* recents & near cities */}
              {showRecents && (
                <Animated.View style={[styles.recentContainer, { opacity: fadeAnim }]}>
                  <ScrollView style={{ maxHeight: 220 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    <Text style={styles.recentTitle}>Недавні поїздки</Text>
                    {QUICK_DESTINATIONS.slice(0, 4).map((dest) => (
                      <Pressable
                        key={dest.id}
                        style={({ pressed }) => [styles.recentItem, pressed && styles.pressed]}
                        onPress={() => handlePlaceSelect(dest)}
                        android_ripple={{ color: 'rgba(255,255,255,0.08)' }}
                        accessibilityLabel={`Маршрут: ${dest.name}`}
                      >
                        <FontAwesome5 name={dest.icon} size={18} color="#9aa0a6" style={styles.recentIcon} />
                        <Text style={styles.recentText}>{dest.name}</Text>
                        <MaterialIcons name="chevron-right" size={20} color="#9aa0a6" />
                      </Pressable>
                    ))}

                    {nearbyCities.length > 0 && (
                      <>
                        <Text style={[styles.recentTitle, { marginTop: 12 }]}>Міста поруч</Text>
                        {nearbyCities.map((city) => (
                          <Pressable
                            key={city.id}
                            style={({ pressed }) => [styles.recentItem, pressed && styles.pressed]}
                            onPress={() => handlePlaceSelect(city)}
                            android_ripple={{ color: 'rgba(255,255,255,0.08)' }}
                            accessibilityLabel={`Місто поруч: ${city.name}`}
                          >
                            <FontAwesome5 name="city" size={18} color="#0A84FF" style={styles.recentIcon} />
                            <Text style={styles.recentText}>{city.name}</Text>
                            <MaterialIcons name="chevron-right" size={20} color="#9aa0a6" />
                          </Pressable>
                        ))}
                      </>
                    )}
                  </ScrollView>
                </Animated.View>
              )}

              {/* taxi selector */}
              <View style={styles.taxiSelector}>
                <Text style={styles.taxiSelectorTitle}>Виберіть тип таксі</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 2 }}>
                  {TAXI_TYPES.map((type) => {
                    const selected = taxiType === type.key;
                    return (
                      <Pressable
                        key={type.key}
                        onPress={() => setTaxiType(type.key)}
                        style={({ pressed }) => [
                          styles.taxiOption,
                          selected && styles.selectedTaxiOption,
                          pressed && { opacity: 0.95 },
                        ]}
                        accessibilityRole="radio"
                        accessibilityState={{ selected }}
                        accessibilityLabel={`Тариф ${type.label}`}
                      >
                        <FontAwesome5 name={type.icon} size={20} color={selected ? '#FFF' : '#9aa0a6'} />
                        <Text style={[styles.taxiLabel, selected && styles.selectedTaxiLabel]}>{type.label}</Text>
                        <Text style={[styles.taxiPrice, selected && styles.selectedTaxiPrice]}>{type.price}</Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>

              {/* estimates */}
              <View style={styles.estimateContainer}>
                <View style={styles.estimateItem}>
                  <Ionicons name="time-outline" size={20} color="#9aa0a6" />
                  <Text style={styles.estimateText}>{estimatedTime}</Text>
                </View>
                <View style={styles.estimateSeparator} />
                <View style={styles.estimateItem}>
                  <Ionicons name="pricetag-outline" size={20} color="#9aa0a6" />
                  <Text style={styles.estimateText}>{estimatedPrice}</Text>
                </View>
              </View>

              {/* CTA */}
              <TouchableOpacity
                style={[styles.searchButton, isSearchDisabled && styles.searchButtonDisabled]}
                onPress={handleSearch}
                activeOpacity={0.9}
                disabled={isSearchDisabled}
                accessibilityRole="button"
                accessibilityState={{ disabled: isSearchDisabled }}
                accessibilityLabel="Знайти таксі"
              >
                <LinearGradient
                  colors={isSearchDisabled ? ['#4b5563', '#374151'] : ['#E50914', '#B20710']}
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

          {/* permission snackbar */}
          <Snackbar
            visible={permissionDenied}
            onDismiss={() => setPermissionDenied(false)}
            duration={5000}
            style={{ backgroundColor: '#1f2937' }}
            action={{
              label: 'OK',
              onPress: () => setPermissionDenied(false),
              color: '#E50914',
            }}
          >
            <Text style={{ color: '#fff' }}>
              Немає доступу до геолокації. Увімкніть доступ у налаштуваннях, щоб бачити ваше місце.
            </Text>
          </Snackbar>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

// ---- styles
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#141414' },
  container: { flex: 1, backgroundColor: '#141414' },
  map: { ...StyleSheet.absoluteFillObject, zIndex: 0 },

  topGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 220, zIndex: 2 },
  bottomGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 220, zIndex: 2 },

  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 6 : 10,
    left: 10,
    right: 10,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBtn: {
    backgroundColor: 'rgba(30,30,30,0.7)',
    borderRadius: 14,
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E50914',
    borderWidth: 1,
    borderColor: '#fff',
  },
  headerCenter: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(20,20,20,0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  headerTime: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerGreeting: {
    color: '#e5e7eb',
    fontSize: 14,
    marginTop: 2,
  },
  headerPlace: {
    color: '#93c5fd',
    fontWeight: '700',
  },

  quickActions: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 120 : 110,
    left: 16,
    right: 16,
    zIndex: 15,
    backgroundColor: 'rgba(30,30,30,0.8)',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quickActionsTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  quickActionsScroll: {
    paddingRight: 16,
  },
  quickAction: { 
    alignItems: 'center', 
    marginRight: 16, 
    width: 80 
  },
  quickActionGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionText: { 
    color: '#FFF', 
    fontSize: 12, 
    textAlign: 'center',
    fontWeight: '600',
  },

  searchCard: {
    position: 'absolute',
    bottom: 40,
    left: 16,
    right: 16,
    borderRadius: 16,
    overflow: 'hidden',
    zIndex: 20,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  blurContainer: { padding: 16, backgroundColor: 'rgba(20,20,20,0.25)', borderRadius: 16 },

  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, zIndex: 2 },
  input: { flex: 1, backgroundColor: '#FFF', borderRadius: 10, fontSize: 15, minHeight: 44, paddingHorizontal: 0 },

  locationButton: {
    marginLeft: 8,
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  swapButton: {
    alignSelf: 'flex-start',
    marginLeft: 6,
    marginTop: 2,
    backgroundColor: '#E50914',
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 8,
    zIndex: 5,
    elevation: 5,
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  recentContainer: {
    backgroundColor: 'rgba(30,30,30,0.95)',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  recentTitle: { color: '#FFF', fontWeight: '700', marginBottom: 8, fontSize: 15 },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  pressed: { opacity: 0.9 },
  recentIcon: { marginRight: 12, width: 24, textAlign: 'center' },
  recentText: { flex: 1, color: '#FFF', fontSize: 15 },

  taxiSelector: { marginTop: 10, marginBottom: 12, zIndex: 1 },
  taxiSelectorTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  taxiOption: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(50,50,50,0.6)',
    width: width * 0.28,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  selectedTaxiOption: {
    backgroundColor: '#E50914',
    borderColor: '#E50914',
    transform: [{ scale: 1.02 }],
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  taxiLabel: { color: '#9aa0a6', fontSize: 12, marginTop: 6, fontWeight: '700' },
  selectedTaxiLabel: { color: '#FFF' },
  taxiPrice: { color: '#9aa0a6', fontSize: 11, marginTop: 2, fontWeight: '600' },
  selectedTaxiPrice: { color: '#fff' },

  estimateContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: 'rgba(30,30,30,0.7)',
    borderRadius: 16,
    paddingVertical: 12,
    marginTop: 2,
    marginBottom: 10,
    alignItems: 'center',
  },
  estimateItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14 },
  estimateSeparator: { width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 8 },
  estimateText: { color: '#FFF', marginLeft: 8, fontWeight: '700', fontSize: 15 },

  searchButton: {
    marginTop: 8,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  searchButtonDisabled: { opacity: 0.6 },
  searchButtonGradient: { paddingVertical: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', borderRadius: 10 },
  searchButtonText: { color: '#FFF', fontWeight: '900', fontSize: 16, letterSpacing: 0.5, marginRight: 8 },
  carIcon: { marginLeft: 4 },

  startMarker: {
    backgroundColor: 'rgba(10, 132, 255, 0.28)',
    borderRadius: 20,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  destinationMarker: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    padding: 5,
    borderWidth: 2,
    borderColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

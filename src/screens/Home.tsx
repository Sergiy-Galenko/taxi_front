import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Platform, PermissionsAndroid, TouchableOpacity } from 'react-native';
import { Text, Button, TextInput, Menu, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '../types/navigation';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Animatable from 'react-native-animatable';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';
import { ScrollView } from 'react-native';

const { width, height } = Dimensions.get('window');

const TAXI_TYPES = [
  { key: 'econom', label: 'Економ' },
  { key: 'comfort', label: 'Комфорт' },
  { key: 'business', label: 'Бізнес' },
  { key: 'balance', label: 'Баланс' },
];

export default function Home({ navigation }: any) {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [taxiType, setTaxiType] = useState('econom');
  const [taxiMenuVisible, setTaxiMenuVisible] = useState(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Дозвіл на доступ до геолокації не надано');
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      setRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, []);

  const handleLogout = () => {
    navigation.navigate('Login' as never);
  };

  const handleSelectTaxiType = () => {
    // TODO: реалізувати вибір типу таксі (наприклад, відкривати модалку)
    alert('Вибір типу таксі поки не реалізовано');
  };

  return (
    <View style={styles.container}>
      {region && (
        <MapView
          style={styles.map}
          region={region}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {location && (
            <Marker
              coordinate={location}
              title="Ви тут"
            />
          )}
        </MapView>
      )}
      <View style={styles.overlay} pointerEvents="box-none">
        <TouchableOpacity style={styles.burgerButton} onPress={() => navigation.openDrawer()}>
          <MaterialIcons name="menu" size={32} color="#222" />
        </TouchableOpacity>
        <View style={styles.bottomBlock}>
          <ScrollView style={styles.bottomScroll} contentContainerStyle={styles.bottomScrollContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.welcomeText}>Оберіть маршрут</Text>
            <TextInput
              mode="outlined"
              placeholder="Звідки..."
              value={start}
              onChangeText={setStart}
              style={styles.routeInput}
              left={<TextInput.Icon icon="map-marker" color="#FF3B30" />}
              theme={{ colors: { primary: '#FF3B30', background: '#fff', text: '#222', placeholder: '#888' } }}
            />
            <TextInput
              mode="outlined"
              placeholder="Куди..."
              value={end}
              onChangeText={setEnd}
              style={styles.routeInput}
              left={<TextInput.Icon icon="flag-checkered" color="#FF3B30" />}
              theme={{ colors: { primary: '#FF3B30', background: '#fff', text: '#222', placeholder: '#888' } }}
            />
            <View style={styles.dropdownContainer}>
              <Menu
                visible={taxiMenuVisible}
                onDismiss={() => setTaxiMenuVisible(false)}
                anchor={
                  <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => setTaxiMenuVisible(true)}
                  >
                    <Text style={styles.dropdownButtonText}>
                      {TAXI_TYPES.find(t => t.key === taxiType)?.label || 'Оберіть тип таксі'}
                    </Text>
                  </TouchableOpacity>
                }
                contentStyle={styles.dropdownMenu}
              >
                {TAXI_TYPES.map(type => (
                  <Menu.Item
                    key={type.key}
                    onPress={() => {
                      setTaxiType(type.key);
                      setTaxiMenuVisible(false);
                    }}
                    title={type.label}
                    leadingIcon={type.key === 'business' ? 'briefcase' : type.key === 'comfort' ? 'star' : type.key === 'balance' ? 'scale-balance' : 'car'}
                    titleStyle={{ color: taxiType === type.key ? '#FF3B30' : '#222' }}
                  />
                ))}
              </Menu>
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  circle1: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: '#FF3B30',
    opacity: 0.1,
    top: -width * 0.2,
    right: -width * 0.2,
  },
  circle2: {
    position: 'absolute',
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: '#FF3B30',
    opacity: 0.1,
    bottom: -width * 0.1,
    left: -width * 0.1,
  },
  circle3: {
    position: 'absolute',
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: width * 0.2,
    backgroundColor: '#FF3B30',
    opacity: 0.1,
    top: height * 0.3,
    right: -width * 0.1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  subtitle: {
    marginBottom: 32,
    textAlign: 'center',
    color: '#CCCCCC',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
  buttonBlur: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  button: {
    height: 50,
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#FF3B30',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 40,
  },
  burgerButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 24,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  bottomBlock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '40%',
    backgroundColor: '#F8F8F8',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    zIndex: 20,
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderWidth: 2,
    borderColor: '#FF3B30',
  },
  routeInput: {
    marginBottom: 12,
    backgroundColor: '#fff',
    width: '100%',
    borderColor: '#FF3B30',
    borderWidth: 1,
    color: '#222',
  },
  welcomeText: {
    fontSize: 18,
    color: '#FF3B30',
    backgroundColor: 'rgba(255,59,48,0.08)',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 8,
    fontWeight: '600',
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  exitButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 16,
    paddingHorizontal: 32,
    paddingVertical: 6,
    elevation: 2,
    minWidth: 120,
    marginTop: 16,
  },
  dropdownContainer: {
    width: '100%',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  dropdownButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FF3B30',
    paddingHorizontal: 18,
    paddingVertical: 8,
    minWidth: 120,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  dropdownButtonText: {
    color: '#FF3B30',
    fontWeight: '600',
    fontSize: 16,
  },
  dropdownMenu: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderColor: '#FF3B30',
    borderWidth: 1,
  },
  bottomScroll: {
    flex: 1,
    width: '100%',
  },
  bottomScrollContent: {
    flexGrow: 1,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    width: '100%',
  },
}); 
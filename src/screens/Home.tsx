import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AddressInputCard from '../components/passenger/AddressInputCard';
import PassengerScreenLayout from '../components/passenger/PassengerScreenLayout';
import RideOptionCard from '../components/passenger/RideOptionCard';
import {
  calculateTripSummary,
  DEFAULT_CITY_CENTER,
  DEFAULT_REGION,
  findLocationSuggestion,
  getRideOption,
  LOCATION_SUGGESTIONS,
  RIDE_OPTIONS,
} from '../data/passenger';
import { passengerPalette, passengerRadius } from '../theme/passenger';
import { RootStackParamList } from '../types/navigation';
import { Coordinates, RideOptionKey } from '../types/passenger';

type HomeScreenProps =
  | NativeStackScreenProps<RootStackParamList, 'Home'>
  | NativeStackScreenProps<RootStackParamList, 'Main'>;

const buildMidPoint = (from: Coordinates, to: Coordinates): Coordinates => ({
  latitude: (from.latitude + to.latitude) / 2,
  longitude: (from.longitude + to.longitude) / 2,
});

const formatAddressLabel = (place: Location.LocationGeocodedAddress | undefined) => {
  if (!place) {
    return 'Current location';
  }

  const line = [place.streetNumber, place.street].filter(Boolean).join(' ').trim();

  return line || place.name || place.city || 'Current location';
};

const formatAreaLabel = (place: Location.LocationGeocodedAddress | undefined) => {
  if (!place) {
    return 'Kyiv city center';
  }

  return [place.district, place.city, place.region].filter(Boolean).join(', ') || 'Kyiv city center';
};

export default function HomeScreen({ navigation, route }: HomeScreenProps) {
  const mapRef = useRef<MapView | null>(null);
  const insets = useSafeAreaInsets();
  const routeParams = route.name === 'Home' ? route.params : undefined;

  const [pickup, setPickup] = useState('Detecting pickup...');
  const [destination, setDestination] = useState('');
  const [pickupCoords, setPickupCoords] = useState<Coordinates | null>(DEFAULT_CITY_CENTER);
  const [destinationCoords, setDestinationCoords] = useState<Coordinates | null>(null);
  const [currentCoords, setCurrentCoords] = useState<Coordinates | null>(null);
  const [selectedRide, setSelectedRide] = useState<RideOptionKey>('economy');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [areaLabel, setAreaLabel] = useState('Checking nearby drivers...');
  const [permissionDenied, setPermissionDenied] = useState(false);

  const selectedRideConfig = getRideOption(selectedRide);
  const tripSummary = calculateTripSummary(pickupCoords, destinationCoords, selectedRide);

  const routeLine =
    pickupCoords && destinationCoords
      ? [pickupCoords, buildMidPoint(pickupCoords, destinationCoords), destinationCoords]
      : [];

  useEffect(() => {
    let active = true;

    const loadCurrentLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          if (active) {
            setPermissionDenied(true);
            setPickup('Kyiv center');
            setAreaLabel('Location access off');
          }
          return;
        }

        const currentPosition = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (!active) {
          return;
        }

        const nextCoords = {
          latitude: currentPosition.coords.latitude,
          longitude: currentPosition.coords.longitude,
        };

        setCurrentCoords(nextCoords);
        setPickupCoords(nextCoords);

        const [address] = await Location.reverseGeocodeAsync(nextCoords);

        if (!active) {
          return;
        }

        setPickup(formatAddressLabel(address));
        setAreaLabel(formatAreaLabel(address));

        mapRef.current?.animateToRegion(
          {
            ...nextCoords,
            latitudeDelta: DEFAULT_REGION.latitudeDelta,
            longitudeDelta: DEFAULT_REGION.longitudeDelta,
          },
          450
        );
      } catch {
        if (active) {
          setPickup('Kyiv center');
          setAreaLabel('Kyiv city center');
        }
      }
    };

    void loadCurrentLocation();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!routeParams) {
      return;
    }

    if (routeParams.rideType) {
      setSelectedRide(routeParams.rideType);
    }

    if (routeParams.from) {
      setPickup(routeParams.from);
      void resolveAddress(routeParams.from, true);
    }

    if (routeParams.to) {
      setDestination(routeParams.to);
      setShowSuggestions(false);
      void resolveAddress(routeParams.to, false);
    }
  }, [routeParams]);

  useEffect(() => {
    if (!pickupCoords || !destinationCoords) {
      return;
    }

    mapRef.current?.fitToCoordinates([pickupCoords, destinationCoords], {
      animated: true,
      edgePadding: {
        top: 90,
        right: 50,
        bottom: 90,
        left: 50,
      },
    });
  }, [pickupCoords, destinationCoords]);

  useEffect(() => {
    if (!pickup || pickup.length < 3) {
      return;
    }

    const timer = setTimeout(() => {
      void resolveAddress(pickup, true);
    }, 450);

    return () => clearTimeout(timer);
  }, [pickup]);

  useEffect(() => {
    if (!destination) {
      setDestinationCoords(null);
      setShowSuggestions(true);
      return;
    }

    if (destination.length < 3) {
      return;
    }

    const timer = setTimeout(() => {
      void resolveAddress(destination, false);
    }, 450);

    return () => clearTimeout(timer);
  }, [destination]);

  const resolveAddress = async (label: string, isPickup: boolean) => {
    const normalizedLabel = label.trim();

    if (!normalizedLabel) {
      if (!isPickup) {
        setDestinationCoords(null);
      }
      return;
    }

    const matchedSuggestion = findLocationSuggestion(normalizedLabel);

    if (matchedSuggestion) {
      if (isPickup) {
        setPickupCoords(matchedSuggestion.coords);
      } else {
        setDestinationCoords(matchedSuggestion.coords);
      }
      return;
    }

    if (isPickup && currentCoords && normalizedLabel === pickup) {
      return;
    }

    try {
      const results = await Location.geocodeAsync(normalizedLabel);

      if (!results.length) {
        return;
      }

      const nextCoords = {
        latitude: results[0].latitude,
        longitude: results[0].longitude,
      };

      if (isPickup) {
        setPickupCoords(nextCoords);
      } else {
        setDestinationCoords(nextCoords);
      }
    } catch {
      // Ignore geocoding errors and preserve user input.
    }
  };

  const handleUseCurrentLocation = () => {
    if (!currentCoords) {
      return;
    }

    setPickupCoords(currentCoords);
    mapRef.current?.animateToRegion(
      {
        ...currentCoords,
        latitudeDelta: DEFAULT_REGION.latitudeDelta,
        longitudeDelta: DEFAULT_REGION.longitudeDelta,
      },
      300
    );
  };

  const handleSwapLocations = () => {
    if (!destination) {
      return;
    }

    setPickup(destination);
    setDestination(pickup);
    setPickupCoords(destinationCoords);
    setDestinationCoords(pickupCoords);
  };

  const handleDestinationSelect = (label: string, coords: Coordinates) => {
    setDestination(label);
    setDestinationCoords(coords);
    setShowSuggestions(false);
  };

  const handleBookRide = () => {
    if (!destinationCoords || !destination.trim()) {
      setShowSuggestions(true);
      return;
    }

    Alert.alert(
      'Ride requested',
      `${selectedRideConfig.label} confirmed to ${destination}. Driver arrives in about ${tripSummary.pickupEtaMin} minutes.`
    );
  };

  const footerOffset = insets.bottom + 102;

  return (
    <PassengerScreenLayout activeRoute="Home" showHeader={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={styles.mapSection}>
          <MapView
            ref={mapRef}
            initialRegion={DEFAULT_REGION}
            showsUserLocation={!permissionDenied}
            style={styles.map}
          >
            {pickupCoords ? (
              <Marker coordinate={pickupCoords}>
                <View style={styles.pickupPin}>
                  <View style={styles.pickupPinInner} />
                </View>
              </Marker>
            ) : null}

            {destinationCoords ? (
              <Marker coordinate={destinationCoords}>
                <View style={styles.destinationPin}>
                  <Ionicons color="#FFFFFF" name="flag" size={14} />
                </View>
              </Marker>
            ) : null}

            {routeLine.length > 1 ? (
              <Polyline
                coordinates={routeLine}
                strokeColor={passengerPalette.primaryDeep}
                strokeWidth={4}
              />
            ) : null}
          </MapView>

          <View style={styles.heroTopRow}>
            <View style={styles.brandCard}>
              <Text style={styles.brandLabel}>CABLINE</Text>
              <Text style={styles.brandTitle}>Order in seconds</Text>
              <Text style={styles.brandCaption}>{areaLabel}</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleUseCurrentLocation}
              style={styles.locateButton}
            >
              <Ionicons color={passengerPalette.text} name="locate-outline" size={20} />
            </TouchableOpacity>
          </View>

          <View style={styles.heroBottomCard}>
            <View>
              <Text style={styles.heroEyebrow}>Fast pickup</Text>
              <Text style={styles.heroValue}>{tripSummary.pickupEtaMin} min away</Text>
            </View>
            <View style={styles.heroDivider} />
            <View>
              <Text style={styles.heroEyebrow}>Selected ride</Text>
              <Text style={styles.heroValue}>{selectedRideConfig.label}</Text>
            </View>
          </View>
        </View>

        <View style={styles.sheet}>
          <ScrollView
            contentContainerStyle={[styles.scrollContent, { paddingBottom: footerOffset + 36 }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.introBlock}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Fast booking</Text>
              </View>
              <Text style={styles.headline}>Set route, choose ride, confirm.</Text>
              <Text style={styles.subheadline}>
                The flow is linear on purpose. The app surfaces only the next action you need.
              </Text>
            </View>

            <AddressInputCard
              destination={destination}
              onDestinationChange={setDestination}
              onDestinationFocus={() => setShowSuggestions(true)}
              onPickupChange={setPickup}
              onSwap={handleSwapLocations}
              onUseCurrentLocation={handleUseCurrentLocation}
              pickup={pickup}
            />

            {permissionDenied ? (
              <View style={styles.inlineNotice}>
                <Ionicons color={passengerPalette.danger} name="alert-circle-outline" size={18} />
                <Text style={styles.inlineNoticeText}>
                  Location access is off, so pickup stays manual until the user enables it.
                </Text>
              </View>
            ) : null}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Quick destinations</Text>
              <TouchableOpacity activeOpacity={0.75} onPress={() => navigation.navigate('TripHistory')}>
                <Text style={styles.sectionLink}>Use recent rides</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.quickGrid}>
              {LOCATION_SUGGESTIONS.slice(0, 4).map((suggestion) => (
                <TouchableOpacity
                  key={suggestion.id}
                  activeOpacity={0.88}
                  onPress={() => handleDestinationSelect(suggestion.title, suggestion.coords)}
                  style={styles.quickCard}
                >
                  <View style={styles.quickIcon}>
                    <Ionicons
                      color={passengerPalette.text}
                      name={
                        suggestion.category === 'favorite'
                          ? 'heart-outline'
                          : suggestion.category === 'hub'
                            ? 'airplane-outline'
                            : 'time-outline'
                      }
                      size={18}
                    />
                  </View>
                  <View style={styles.quickText}>
                    <Text style={styles.quickLabel}>{suggestion.title}</Text>
                    <Text style={styles.quickSubtitle}>{suggestion.subtitle}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {showSuggestions ? (
              <View style={styles.suggestionPanel}>
                <Text style={styles.suggestionTitle}>Suggested destinations</Text>
                {LOCATION_SUGGESTIONS.map((suggestion) => (
                  <TouchableOpacity
                    key={suggestion.id}
                    activeOpacity={0.85}
                    onPress={() => handleDestinationSelect(suggestion.title, suggestion.coords)}
                    style={styles.suggestionRow}
                  >
                    <View style={styles.suggestionDot} />
                    <View style={styles.suggestionText}>
                      <Text style={styles.suggestionLabel}>{suggestion.title}</Text>
                      <Text style={styles.suggestionSubtitle}>{suggestion.subtitle}</Text>
                    </View>
                    <Ionicons color={passengerPalette.mutedText} name="chevron-forward" size={18} />
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Choose your ride</Text>
              <Text style={styles.sectionMeta}>
                {destinationCoords ? `${tripSummary.durationMin} min trip` : 'Waiting for route'}
              </Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {RIDE_OPTIONS.map((option) => (
                <RideOptionCard
                  key={option.key}
                  onPress={() => setSelectedRide(option.key)}
                  option={option}
                  selected={selectedRide === option.key}
                  summary={calculateTripSummary(pickupCoords, destinationCoords, option.key)}
                />
              ))}
            </ScrollView>

            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <Text style={styles.summaryTitle}>Trip summary</Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() =>
                    navigation.navigate('Preorder', {
                      pickup,
                      destination,
                      rideType: selectedRide,
                    })
                  }
                  style={styles.secondaryButton}
                >
                  <Ionicons color={passengerPalette.text} name="calendar-outline" size={16} />
                  <Text style={styles.secondaryButtonText}>Schedule instead</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.metricRow}>
                <View style={styles.metricBlock}>
                  <Text style={styles.metricLabel}>Distance</Text>
                  <Text style={styles.metricValue}>
                    {destinationCoords ? `${tripSummary.distanceKm} km` : 'Add route'}
                  </Text>
                </View>
                <View style={styles.metricBlock}>
                  <Text style={styles.metricLabel}>Ride time</Text>
                  <Text style={styles.metricValue}>
                    {destinationCoords ? `${tripSummary.durationMin} min` : 'Pending'}
                  </Text>
                </View>
                <View style={styles.metricBlock}>
                  <Text style={styles.metricLabel}>Fare</Text>
                  <Text style={styles.metricValue}>UAH {tripSummary.price}</Text>
                </View>
              </View>

              <View style={styles.summaryFooter}>
                <View>
                  <Text style={styles.paymentLabel}>Payment</Text>
                  <Text style={styles.paymentValue}>Visa •••• 4219</Text>
                </View>
                <View style={styles.routeNote}>
                  <Ionicons color={passengerPalette.accent} name="shield-checkmark-outline" size={16} />
                  <Text style={styles.routeNoteText}>Driver and vehicle details show before pickup.</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>

        <View style={[styles.footerAction, { bottom: footerOffset }]}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleBookRide}
            style={styles.primaryButton}
          >
            <View>
              <Text style={styles.primaryEyebrow}>
                {destinationCoords ? `${selectedRideConfig.label} · UAH ${tripSummary.price}` : 'Set destination first'}
              </Text>
              <Text style={styles.primaryTitle}>
                {destinationCoords ? 'Book ride now' : 'Choose destination'}
              </Text>
            </View>
            <View style={styles.primaryIconWrap}>
              <Ionicons color={passengerPalette.text} name="arrow-forward" size={18} />
            </View>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </PassengerScreenLayout>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  mapSection: {
    height: 300,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  map: {
    borderRadius: passengerRadius.xl,
    flex: 1,
  },
  heroTopRow: {
    left: 32,
    position: 'absolute',
    right: 32,
    top: 26,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  brandCard: {
    backgroundColor: passengerPalette.overlay,
    borderRadius: passengerRadius.lg,
    gap: 4,
    maxWidth: 220,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  brandLabel: {
    color: '#FCD34D',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  brandTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  brandCaption: {
    color: 'rgba(255, 255, 255, 0.78)',
    fontSize: 13,
  },
  locateButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: passengerRadius.md,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  heroBottomCard: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: passengerRadius.lg,
    bottom: 18,
    flexDirection: 'row',
    gap: 20,
    paddingHorizontal: 18,
    paddingVertical: 14,
    position: 'absolute',
  },
  heroDivider: {
    backgroundColor: passengerPalette.border,
    height: 34,
    width: 1,
  },
  heroEyebrow: {
    color: passengerPalette.mutedText,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  heroValue: {
    color: passengerPalette.text,
    fontSize: 16,
    fontWeight: '800',
  },
  pickupPin: {
    alignItems: 'center',
    backgroundColor: passengerPalette.accentSoft,
    borderColor: passengerPalette.accent,
    borderRadius: 18,
    borderWidth: 2,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  pickupPinInner: {
    backgroundColor: passengerPalette.accent,
    borderRadius: 7,
    height: 14,
    width: 14,
  },
  destinationPin: {
    alignItems: 'center',
    backgroundColor: passengerPalette.danger,
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  sheet: {
    backgroundColor: 'rgba(246, 241, 231, 0.95)',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    flex: 1,
    marginTop: -28,
  },
  scrollContent: {
    gap: 22,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  introBlock: {
    gap: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: passengerPalette.primarySoft,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    color: passengerPalette.text,
    fontSize: 12,
    fontWeight: '700',
  },
  headline: {
    color: passengerPalette.text,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.7,
  },
  subheadline: {
    color: passengerPalette.mutedText,
    fontSize: 15,
    lineHeight: 22,
  },
  inlineNotice: {
    alignItems: 'flex-start',
    backgroundColor: '#FFF5F3',
    borderColor: '#F7C7C2',
    borderRadius: passengerRadius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 14,
  },
  inlineNoticeText: {
    color: passengerPalette.text,
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: passengerPalette.text,
    fontSize: 18,
    fontWeight: '800',
  },
  sectionLink: {
    color: passengerPalette.info,
    fontSize: 13,
    fontWeight: '700',
  },
  sectionMeta: {
    color: passengerPalette.mutedText,
    fontSize: 13,
    fontWeight: '700',
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickCard: {
    backgroundColor: passengerPalette.surface,
    borderColor: passengerPalette.border,
    borderRadius: passengerRadius.md,
    borderWidth: 1,
    flexBasis: '48%',
    flexDirection: 'row',
    gap: 12,
    minHeight: 82,
    padding: 14,
  },
  quickIcon: {
    alignItems: 'center',
    backgroundColor: passengerPalette.surfaceMuted,
    borderRadius: 14,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  quickText: {
    flex: 1,
    justifyContent: 'center',
  },
  quickLabel: {
    color: passengerPalette.text,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  quickSubtitle: {
    color: passengerPalette.mutedText,
    fontSize: 12,
  },
  suggestionPanel: {
    backgroundColor: passengerPalette.surface,
    borderColor: passengerPalette.border,
    borderRadius: passengerRadius.lg,
    borderWidth: 1,
    padding: 16,
  },
  suggestionTitle: {
    color: passengerPalette.text,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 10,
  },
  suggestionRow: {
    alignItems: 'center',
    borderTopColor: passengerPalette.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 14,
  },
  suggestionDot: {
    backgroundColor: passengerPalette.primary,
    borderRadius: 6,
    height: 12,
    width: 12,
  },
  suggestionText: {
    flex: 1,
    gap: 2,
  },
  suggestionLabel: {
    color: passengerPalette.text,
    fontSize: 14,
    fontWeight: '700',
  },
  suggestionSubtitle: {
    color: passengerPalette.mutedText,
    fontSize: 12,
  },
  summaryCard: {
    backgroundColor: passengerPalette.surface,
    borderColor: passengerPalette.border,
    borderRadius: passengerRadius.lg,
    borderWidth: 1,
    gap: 18,
    padding: 18,
  },
  summaryHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryTitle: {
    color: passengerPalette.text,
    fontSize: 18,
    fontWeight: '800',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: passengerPalette.surfaceMuted,
    borderRadius: 999,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  secondaryButtonText: {
    color: passengerPalette.text,
    fontSize: 12,
    fontWeight: '700',
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricBlock: {
    gap: 6,
  },
  metricLabel: {
    color: passengerPalette.mutedText,
    fontSize: 12,
    fontWeight: '700',
  },
  metricValue: {
    color: passengerPalette.text,
    fontSize: 16,
    fontWeight: '800',
  },
  summaryFooter: {
    gap: 14,
  },
  paymentLabel: {
    color: passengerPalette.mutedText,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  paymentValue: {
    color: passengerPalette.text,
    fontSize: 15,
    fontWeight: '700',
  },
  routeNote: {
    alignItems: 'center',
    backgroundColor: passengerPalette.accentSoft,
    borderRadius: passengerRadius.md,
    flexDirection: 'row',
    gap: 10,
    padding: 12,
  },
  routeNoteText: {
    color: passengerPalette.text,
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  footerAction: {
    left: 20,
    position: 'absolute',
    right: 20,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: passengerPalette.primary,
    borderRadius: passengerRadius.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 16,
    shadowColor: passengerPalette.shadow,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 8,
  },
  primaryEyebrow: {
    color: '#7A5400',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  primaryTitle: {
    color: passengerPalette.text,
    fontSize: 18,
    fontWeight: '800',
  },
  primaryIconWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
});

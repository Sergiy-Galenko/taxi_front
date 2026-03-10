import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
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
import {
  calculateTripSummary,
  DEFAULT_CITY_CENTER,
  DEFAULT_REGION,
  findLocationSuggestion,
  getRideOption,
  searchDestinationSuggestions,
} from '../data/passenger';
import { passengerPalette, passengerRadius } from '../theme/passenger';
import { RootStackParamList } from '../types/navigation';
import { Coordinates, DestinationSuggestion, RideOptionKey } from '../types/passenger';

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
  const [selectedRide, setSelectedRide] = useState<RideOptionKey>('comfort');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [areaLabel, setAreaLabel] = useState('Checking nearby drivers...');
  const [permissionDenied, setPermissionDenied] = useState(false);

  const routeLine =
    pickupCoords && destinationCoords
      ? [pickupCoords, buildMidPoint(pickupCoords, destinationCoords), destinationCoords]
      : [];

  const tripPreview = useMemo(() => {
    return destinationCoords ? calculateTripSummary(pickupCoords, destinationCoords, 'comfort') : null;
  }, [destinationCoords, pickupCoords]);

  const priceRange = useMemo(() => {
    if (!destinationCoords) {
      return null;
    }

    const economy = calculateTripSummary(pickupCoords, destinationCoords, 'economy');
    const xl = calculateTripSummary(pickupCoords, destinationCoords, 'xl');

    return {
      min: economy.price,
      max: xl.price,
    };
  }, [destinationCoords, pickupCoords]);

  const preferredRide = getRideOption(selectedRide);
  const destinationQuery = destination.trim();
  const destinationSuggestions = useMemo(() => {
    return searchDestinationSuggestions(destination, destinationQuery ? 6 : 4);
  }, [destination, destinationQuery]);

  useEffect(() => {
    let active = true;

    const loadCurrentLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          if (active) {
            setPermissionDenied(true);
            setPickup('Kyiv center');
            setAreaLabel('Location access is off');
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
        top: 110,
        right: 54,
        bottom: 120,
        left: 54,
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
      // Keep the typed address even if geocoding fails.
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

  const handleDestinationChange = (value: string) => {
    setDestination(value);
    setShowSuggestions(true);

    if (!value.trim()) {
      setDestinationCoords(null);
    }
  };

  const handleDestinationSuggestionSelect = (suggestion: DestinationSuggestion) => {
    setDestination(suggestion.title);
    setShowSuggestions(false);

    if (suggestion.coords) {
      setDestinationCoords(suggestion.coords);
      return;
    }

    setDestinationCoords(null);
    void resolveAddress(suggestion.title, false);
  };

  const handleOrderTaxi = () => {
    if (!destinationCoords || !destination.trim()) {
      setShowSuggestions(true);
      return;
    }

    navigation.navigate('VehicleSelection', {
      from: pickup,
      to: destination,
      pickupCoords,
      destinationCoords,
      rideType: selectedRide,
    });
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
                  <Ionicons color="#FFFFFF" name="flag" size={13} />
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
            <View style={styles.heroCard}>
              <Text style={styles.heroBadge}>Book in two steps</Text>
              <Text style={styles.heroTitle}>Where do you want to go?</Text>
              <Text style={styles.heroCaption}>{areaLabel}</Text>
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
              <Text style={styles.heroStatLabel}>Pickup</Text>
              <Text style={styles.heroStatValue}>
                {tripPreview ? `${tripPreview.pickupEtaMin} min` : 'Fast nearby'}
              </Text>
            </View>
            <View style={styles.heroDivider} />
            <View>
              <Text style={styles.heroStatLabel}>Vehicle step</Text>
              <Text style={styles.heroStatValue}>Choose after order</Text>
            </View>
          </View>
        </View>

        <View style={styles.sheet}>
          <ScrollView
            contentContainerStyle={[styles.scrollContent, { paddingBottom: footerOffset + 42 }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.introBlock}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Simpler booking flow</Text>
              </View>
              <Text style={styles.headline}>Set route now. Choose the car next.</Text>
              <Text style={styles.subheadline}>
                This screen is focused only on the route so first-time users always know the next step.
              </Text>
            </View>

            <AddressInputCard
              destination={destination}
              onDestinationChange={handleDestinationChange}
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
                  Location is off, so pickup stays manual until the user enables access.
                </Text>
              </View>
            ) : null}

            {tripPreview && priceRange ? (
              <View style={styles.previewCard}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Trip preview</Text>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() =>
                      navigation.navigate('Preorder', {
                        pickup,
                        destination,
                        rideType: selectedRide,
                      })
                    }
                  >
                    <Text style={styles.sectionLink}>Schedule instead</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.metricRow}>
                  <View style={styles.metricBlock}>
                    <Text style={styles.metricLabel}>Ride time</Text>
                    <Text style={styles.metricValue}>{tripPreview.durationMin} min</Text>
                  </View>
                  <View style={styles.metricBlock}>
                    <Text style={styles.metricLabel}>Distance</Text>
                    <Text style={styles.metricValue}>{tripPreview.distanceKm} km</Text>
                  </View>
                  <View style={styles.metricBlock}>
                    <Text style={styles.metricLabel}>Estimated fare</Text>
                    <Text style={styles.metricValue}>UAH {priceRange.min}-{priceRange.max}</Text>
                  </View>
                </View>

                <View style={styles.previewNote}>
                  <Ionicons color={passengerPalette.accent} name="sparkles-outline" size={16} />
                  <Text style={styles.previewNoteText}>
                    {preferredRide.label} stays preselected when you open the car selection screen.
                  </Text>
                </View>
              </View>
            ) : null}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {destinationQuery ? 'Location suggestions' : 'Saved and recent places'}
              </Text>
              <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('TripHistory')}>
                <Text style={styles.sectionLink}>
                  {destinationQuery ? `${destinationSuggestions.length} matches` : 'Recent rides'}
                </Text>
              </TouchableOpacity>
            </View>

            {showSuggestions ? (
              destinationSuggestions.length ? (
                <View style={styles.savedList}>
                  {destinationSuggestions.map((suggestion) => (
                    <TouchableOpacity
                      key={suggestion.id}
                      activeOpacity={0.88}
                      onPress={() => handleDestinationSuggestionSelect(suggestion)}
                      style={styles.savedRow}
                    >
                      <View style={styles.savedIcon}>
                        <Ionicons
                          color={passengerPalette.text}
                          name={
                            suggestion.category === 'favorite'
                              ? 'heart-outline'
                              : suggestion.category === 'hub'
                                ? 'business-outline'
                                : suggestion.category === 'history'
                                  ? 'reload-outline'
                                  : 'time-outline'
                          }
                          size={18}
                        />
                      </View>
                      <View style={styles.savedCopy}>
                        <Text style={styles.savedLabel}>{suggestion.title}</Text>
                        <Text style={styles.savedSubtitle}>{suggestion.subtitle}</Text>
                      </View>
                      <Ionicons color={passengerPalette.mutedText} name="chevron-forward" size={18} />
                    </TouchableOpacity>
                  ))}
                </View>
              ) : destinationQuery ? (
                <View style={styles.emptySuggestionsCard}>
                  <Ionicons color={passengerPalette.mutedText} name="search-outline" size={18} />
                  <View style={styles.emptySuggestionsCopy}>
                    <Text style={styles.emptySuggestionsTitle}>No quick match yet</Text>
                    <Text style={styles.emptySuggestionsText}>
                      Keep typing the address and the app will use the typed destination directly.
                    </Text>
                  </View>
                </View>
              ) : null
            ) : null}
          </ScrollView>
        </View>

        <View style={[styles.footerAction, { bottom: footerOffset }]}> 
          <TouchableOpacity
            activeOpacity={0.92}
            disabled={!destinationCoords}
            onPress={handleOrderTaxi}
            style={[styles.primaryButton, !destinationCoords && styles.primaryButtonDisabled]}
          >
            <View>
              <Text style={styles.primaryEyebrow}>
                {destinationCoords ? 'Next: choose vehicle type' : 'Add destination to continue'}
              </Text>
              <Text style={styles.primaryTitle}>Order Taxi</Text>
            </View>
            <View style={styles.primaryIconWrap}>
              <Ionicons color="#FFFFFF" name="arrow-forward" size={18} />
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
    height: 290,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  map: {
    flex: 1,
    borderRadius: passengerRadius.xl,
  },
  heroTopRow: {
    position: 'absolute',
    top: 24,
    left: 28,
    right: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  heroCard: {
    flex: 1,
    maxWidth: 250,
    backgroundColor: 'rgba(21, 32, 43, 0.7)',
    borderRadius: passengerRadius.lg,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 5,
  },
  heroBadge: {
    color: '#FCD34D',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 25,
  },
  heroCaption: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    lineHeight: 18,
  },
  locateButton: {
    width: 46,
    height: 46,
    borderRadius: passengerRadius.md,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBottomCard: {
    position: 'absolute',
    left: 34,
    right: 34,
    bottom: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: passengerRadius.lg,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroStatLabel: {
    color: passengerPalette.mutedText,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  heroStatValue: {
    color: passengerPalette.text,
    fontSize: 16,
    fontWeight: '800',
  },
  heroDivider: {
    width: 1,
    height: 34,
    backgroundColor: passengerPalette.border,
  },
  pickupPin: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: passengerPalette.accent,
    backgroundColor: passengerPalette.accentSoft,
  },
  pickupPinInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: passengerPalette.accent,
  },
  destinationPin: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: passengerPalette.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheet: {
    flex: 1,
    marginTop: -24,
    backgroundColor: 'rgba(246, 241, 231, 0.96)',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  scrollContent: {
    gap: 20,
    paddingHorizontal: 20,
    paddingTop: 28,
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
    letterSpacing: -0.8,
    lineHeight: 36,
  },
  subheadline: {
    color: passengerPalette.mutedText,
    fontSize: 15,
    lineHeight: 22,
  },
  inlineNotice: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#FFF5F3',
    borderWidth: 1,
    borderColor: '#F7C7C2',
    borderRadius: passengerRadius.md,
    padding: 14,
  },
  inlineNoticeText: {
    color: passengerPalette.text,
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  previewCard: {
    backgroundColor: passengerPalette.surface,
    borderColor: passengerPalette.border,
    borderRadius: passengerRadius.lg,
    borderWidth: 1,
    gap: 14,
    padding: 18,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
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
  metricRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricBlock: {
    flex: 1,
    backgroundColor: passengerPalette.surfaceMuted,
    borderRadius: passengerRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  metricLabel: {
    color: passengerPalette.mutedText,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  metricValue: {
    color: passengerPalette.text,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  previewNote: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    backgroundColor: passengerPalette.surfaceMuted,
    borderRadius: passengerRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  previewNoteText: {
    color: passengerPalette.text,
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  savedList: {
    backgroundColor: passengerPalette.surface,
    borderColor: passengerPalette.border,
    borderRadius: passengerRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  savedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: passengerPalette.border,
  },
  savedIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: passengerPalette.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedCopy: {
    flex: 1,
    gap: 3,
  },
  savedLabel: {
    color: passengerPalette.text,
    fontSize: 15,
    fontWeight: '700',
  },
  savedSubtitle: {
    color: passengerPalette.mutedText,
    fontSize: 13,
  },
  emptySuggestionsCard: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    backgroundColor: passengerPalette.surface,
    borderColor: passengerPalette.border,
    borderRadius: passengerRadius.lg,
    borderWidth: 1,
    padding: 16,
  },
  emptySuggestionsCopy: {
    flex: 1,
    gap: 4,
  },
  emptySuggestionsTitle: {
    color: passengerPalette.text,
    fontSize: 15,
    fontWeight: '700',
  },
  emptySuggestionsText: {
    color: passengerPalette.mutedText,
    fontSize: 13,
    lineHeight: 18,
  },
  footerAction: {
    position: 'absolute',
    left: 16,
    right: 16,
  },
  primaryButton: {
    backgroundColor: passengerPalette.primaryDeep,
    borderRadius: passengerRadius.lg,
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  primaryButtonDisabled: {
    backgroundColor: '#C9B78A',
  },
  primaryEyebrow: {
    color: '#FDE6B8',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  primaryTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  primaryIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

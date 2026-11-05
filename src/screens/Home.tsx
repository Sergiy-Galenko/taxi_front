import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AddressInputCard from '../components/passenger/AddressInputCard';
import PassengerScreenLayout from '../components/passenger/PassengerScreenLayout';
import {
  DEFAULT_CITY_CENTER,
  DEFAULT_REGION,
  findLocationSuggestion,
  searchDestinationSuggestions,
} from '../data/passenger';
import { useI18n } from '../hooks/useI18n';
import { searchKyivPlaceSuggestions } from '../services/places/kyivPlaces';
import { PassengerPalette } from '../theme/passenger';
import { usePassengerTheme } from '../hooks/usePassengerTheme';
import { RootStackParamList } from '../types/navigation';
import { Coordinates, DestinationSuggestion, RideOptionKey } from '../types/passenger';

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

const buildMidPoint = (from: Coordinates, to: Coordinates): Coordinates => ({
  latitude: (from.latitude + to.latitude) / 2,
  longitude: (from.longitude + to.longitude) / 2,
});

const normalizeInputValue = (value: string): string => value.trim().toLowerCase();

const formatAddressLabel = (
  place: Location.LocationGeocodedAddress | undefined,
  fallback: string
) => {
  if (!place) {
    return fallback;
  }

  const line = [place.streetNumber, place.street].filter(Boolean).join(' ').trim();
  return line || place.name || place.city || fallback;
};

const formatAreaLabel = (
  place: Location.LocationGeocodedAddress | undefined,
  fallback: string
) => {
  if (!place) {
    return fallback;
  }

  return [place.district, place.city, place.region].filter(Boolean).join(', ') || fallback;
};

export default function HomeScreen({ navigation, route }: HomeScreenProps) {
  const mapRef = useRef<MapView | null>(null);
  const { width, height } = useWindowDimensions();
  const wide = width >= 800 || width > height;
  const mounted = useRef(true);
  const pickupEdited = useRef(false);
  const resolutionControllers = useRef<{ pickup?: AbortController; destination?: AbortController }>({});
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      resolutionControllers.current.pickup?.abort();
      resolutionControllers.current.destination?.abort();
    };
  }, []);
  const routeParams = route.name === 'Home' ? route.params : undefined;
  const { t, language } = useI18n();
  const { palette, radius } = usePassengerTheme();
  const styles = useMemo(() => createStyles(palette, radius), [palette, radius]);
  const currentLocationLabel = t('home.currentLocation');
  const cityCenterLabel = t('home.cityCenter');
  const locationOffShortLabel = t('home.locationAccessOffShort');

  const [pickup, setPickup] = useState(() => t('home.detectingPickup'));
  const [destination, setDestination] = useState('');
  const [pickupCoords, setPickupCoords] = useState<Coordinates | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<Coordinates | null>(null);
  const [currentCoords, setCurrentCoords] = useState<Coordinates | null>(null);
  const [selectedRide, setSelectedRide] = useState<RideOptionKey>('comfort');
  const [areaLabel, setAreaLabel] = useState(() => t('home.cityCenter'));
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [focusedField, setFocusedField] = useState<'pickup' | 'destination' | null>(null);
  const [remotePlaceSuggestions, setRemotePlaceSuggestions] = useState<DestinationSuggestion[]>([]);
  const routeSubmitting = useRef(false);
  const [isSubmittingRoute, setIsSubmittingRoute] = useState(false);
  const pickupValueRef = useRef(pickup);
  const destinationValueRef = useRef(destination);

  const routeLine =
    pickupCoords && destinationCoords
      ? [pickupCoords, buildMidPoint(pickupCoords, destinationCoords), destinationCoords]
      : [];

  const activeQuery = focusedField === 'pickup' ? pickup : focusedField === 'destination' ? destination : '';
  const localPlaceSuggestions = useMemo(() => {
    if (!focusedField) {
      return [];
    }

    return searchDestinationSuggestions(activeQuery, activeQuery.trim() ? 4 : 4);
  }, [activeQuery, focusedField]);

  const placeSuggestions = useMemo(() => {
    if (!focusedField) {
      return [];
    }

    if (!activeQuery.trim()) {
      return localPlaceSuggestions;
    }

    const mergedSuggestions = [...remotePlaceSuggestions, ...localPlaceSuggestions];
    const seen = new Set<string>();

    return mergedSuggestions.filter((suggestion) => {
      const key = `${suggestion.title.trim().toLowerCase()}|${suggestion.subtitle.trim().toLowerCase()}`;

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    }).slice(0, 6);
  }, [activeQuery, focusedField, localPlaceSuggestions, remotePlaceSuggestions]);

  useEffect(() => {
    pickupValueRef.current = pickup;
  }, [pickup]);

  useEffect(() => {
    destinationValueRef.current = destination;
  }, [destination]);

  useEffect(() => {
    let active = true;

    const loadCurrentLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          if (active) {
            setPermissionDenied(true);
            if (pickupEdited.current) return;
            pickupValueRef.current = cityCenterLabel;
            setPickup(cityCenterLabel);
            setPickupCoords(DEFAULT_CITY_CENTER);
            setAreaLabel(locationOffShortLabel);
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
        if (pickupEdited.current) return;
        setPickupCoords(nextCoords);

        const [address] = await Location.reverseGeocodeAsync(nextCoords);

        if (!active || pickupEdited.current) {
          return;
        }

        pickupValueRef.current = formatAddressLabel(address, currentLocationLabel);
        setPickup(pickupValueRef.current);
        setAreaLabel(formatAreaLabel(address, cityCenterLabel));
        mapRef.current?.animateToRegion({
          ...nextCoords,
          latitudeDelta: DEFAULT_REGION.latitudeDelta,
          longitudeDelta: DEFAULT_REGION.longitudeDelta,
        });
      } catch {
        if (active && !pickupEdited.current) {
          setPickupCoords(DEFAULT_CITY_CENTER);
          pickupValueRef.current = cityCenterLabel;
          setPickup(cityCenterLabel);
          setAreaLabel(cityCenterLabel);
        }
      }
    };

    void loadCurrentLocation();

    return () => {
      active = false;
    };
  }, [cityCenterLabel, currentLocationLabel, locationOffShortLabel]);

  useEffect(() => {
    if (!routeParams) {
      return;
    }

    if (routeParams.rideType) {
      setSelectedRide(routeParams.rideType);
    }

    if (routeParams.from) {
      pickupEdited.current = true;
      pickupValueRef.current = routeParams.from;
      setPickup(routeParams.from);
      void resolveAddress(routeParams.from, true);
    }

    if (routeParams.to) {
      destinationValueRef.current = routeParams.to;
      setDestination(routeParams.to);
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
        top: 140,
        right: 54,
        bottom: 220,
        left: 54,
      },
    });
  }, [pickupCoords, destinationCoords]);

  useEffect(() => {
    if (!focusedField || activeQuery.trim().length < 2) {
      setRemotePlaceSuggestions([]);
      return;
    }

    setRemotePlaceSuggestions([]);
    const controller = new AbortController();
    const timer = setTimeout(() => {
      searchKyivPlaceSuggestions(activeQuery, language, 6, controller.signal)
        .then((suggestions) => {
          if (!controller.signal.aborted) setRemotePlaceSuggestions(suggestions);
        })
        .catch((error: unknown) => {
          if (controller.signal.aborted || (error instanceof Error && error.name === 'AbortError')) {
            return;
          }

          setRemotePlaceSuggestions([]);
        });
    }, 220);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [activeQuery, focusedField, language]);

  const resolveAddress = async (label: string, isPickup: boolean): Promise<Coordinates | null> => {
    const field = isPickup ? 'pickup' : 'destination';
    resolutionControllers.current[field]?.abort();
    const controller = new AbortController();
    resolutionControllers.current[field] = controller;
    const normalizedLabel = label.trim();
    const applyCoordinates = (coords: Coordinates): Coordinates | null => {
      if (!mounted.current || controller.signal.aborted) return null;
      const currentFieldValue = isPickup ? pickupValueRef.current : destinationValueRef.current;

      if (normalizeInputValue(currentFieldValue) !== normalizeInputValue(normalizedLabel)) {
        return null;
      }

      if (isPickup) {
        setPickupCoords(coords);
      } else {
        setDestinationCoords(coords);
      }

      return coords;
    };

    const clearCoordinates = () => {
      if (!mounted.current || controller.signal.aborted) return;
      const currentFieldValue = isPickup ? pickupValueRef.current : destinationValueRef.current;

      if (normalizeInputValue(currentFieldValue) !== normalizeInputValue(normalizedLabel)) {
        return;
      }

      if (isPickup) {
        setPickupCoords(null);
      } else {
        setDestinationCoords(null);
      }
    };

    if (!normalizedLabel) {
      clearCoordinates();
      return null;
    }

    const matchedSuggestion = findLocationSuggestion(normalizedLabel);

    if (matchedSuggestion) {
      return applyCoordinates(matchedSuggestion.coords);
    }

    if (isPickup && currentCoords && normalizeInputValue(normalizedLabel) === normalizeInputValue(currentLocationLabel)) {
      return applyCoordinates(currentCoords);
    }

    if (normalizeInputValue(normalizedLabel) === normalizeInputValue(cityCenterLabel)) {
      return applyCoordinates(DEFAULT_CITY_CENTER);
    }

    try {
      const liveSuggestions = await searchKyivPlaceSuggestions(normalizedLabel, language, 1, controller.signal);
      const liveCoords = liveSuggestions[0]?.coords;

      if (liveCoords) {
        return applyCoordinates(liveCoords);
      }
    } catch {
      // Fall through to native geocoding if Kyiv lookup is temporarily unavailable.
    }

    if (controller.signal.aborted || !mounted.current) return null;
    try {
      const results = await Location.geocodeAsync(normalizedLabel);

      if (!results.length) {
        clearCoordinates();
        return null;
      }

      const nextCoords = {
        latitude: results[0].latitude,
        longitude: results[0].longitude,
      };

      return applyCoordinates(nextCoords);
    } catch {
      clearCoordinates();
      return null;
    }
  };

  const handleUseCurrentLocation = () => {
    resolutionControllers.current.pickup?.abort();
    resolutionControllers.current.destination?.abort();
    pickupEdited.current = true;
    if (!currentCoords) {
      return;
    }

    pickupValueRef.current = currentLocationLabel;
    setPickupCoords(currentCoords);
    setPickup(currentLocationLabel);
    Keyboard.dismiss();
    setFocusedField(null);
    setRemotePlaceSuggestions([]);
    mapRef.current?.animateToRegion({
      ...currentCoords,
      latitudeDelta: DEFAULT_REGION.latitudeDelta,
      longitudeDelta: DEFAULT_REGION.longitudeDelta,
    });
  };

  const handleSwapLocations = () => {
    resolutionControllers.current.pickup?.abort();
    resolutionControllers.current.destination?.abort();
    pickupEdited.current = true;
    if (!destination) {
      return;
    }

    pickupValueRef.current = destination;
    destinationValueRef.current = pickup;
    setPickup(destination);
    setDestination(pickup);
    setPickupCoords(destinationCoords);
    setDestinationCoords(pickupCoords);
    setFocusedField(null);
    setRemotePlaceSuggestions([]);
  };

  const handlePlaceSuggestionSelect = (suggestion: DestinationSuggestion) => {
    resolutionControllers.current.pickup?.abort();
    resolutionControllers.current.destination?.abort();
    pickupEdited.current = true;
    const targetField = focusedField ?? 'destination';

    if (targetField === 'pickup') {
      pickupValueRef.current = suggestion.title;
      setPickup(suggestion.title);
      if (suggestion.coords) {
        setPickupCoords(suggestion.coords);
      } else {
        void resolveAddress(suggestion.title, true);
      }
    } else {
      destinationValueRef.current = suggestion.title;
      setDestination(suggestion.title);
      if (suggestion.coords) {
        setDestinationCoords(suggestion.coords);
      } else {
        void resolveAddress(suggestion.title, false);
      }
    }

    setFocusedField(null);
    setRemotePlaceSuggestions([]);
  };

  const handleDismissInputs = () => {
    Keyboard.dismiss();
    setFocusedField(null);
    setRemotePlaceSuggestions([]);
  };

  const handleOrderTaxi = async () => {
    if (routeSubmitting.current) {
      return;
    }

    if (!destination.trim()) {
      setFocusedField('destination');
      return;
    }

    Keyboard.dismiss();
    routeSubmitting.current = true;
    setIsSubmittingRoute(true);
    try {
      const nextPickupCoords =
        pickup.trim() && !pickupCoords ? await resolveAddress(pickup, true) : pickupCoords;
      const nextDestinationCoords =
        destination.trim() && !destinationCoords
          ? await resolveAddress(destination, false)
          : destinationCoords;

      if (!pickup.trim() || !nextPickupCoords) {
        setFocusedField('pickup');
        return;
      }

      if (!destination.trim() || !nextDestinationCoords) {
        setFocusedField('destination');
        return;
      }

      if (!mounted.current || pickupValueRef.current !== pickup || destinationValueRef.current !== destination) return;
      navigation.navigate('VehicleSelection', {
        from: pickup,
        to: destination,
        pickupCoords: nextPickupCoords,
        destinationCoords: nextDestinationCoords,
        rideType: selectedRide,
      });
    } finally {
      routeSubmitting.current = false;
      if (mounted.current) setIsSubmittingRoute(false);
    }
  };

  const canOrderTaxi = Boolean(destination.trim()) && !isSubmittingRoute;

  return (
    <PassengerScreenLayout activeRoute="Home" showHeader={false}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, flexDirection: wide ? 'row' : 'column' }}>
        <View style={{ flex: wide ? 1 : undefined, height: wide ? undefined : Math.min(220, height * 0.28), minHeight: 100 }}>
          <MapView ref={mapRef} initialRegion={DEFAULT_REGION} onPress={handleDismissInputs} showsUserLocation={currentCoords !== null && !permissionDenied} style={StyleSheet.absoluteFill}>
            {pickupCoords ? <Marker coordinate={pickupCoords} title={pickup} /> : null}
            {destinationCoords ? <Marker coordinate={destinationCoords} title={destination} /> : null}
            {routeLine.length > 1 ? <Polyline coordinates={routeLine} strokeColor={palette.primaryDeep} strokeWidth={3} lineDashPattern={[6, 6]} /> : null}
          </MapView>
        </View>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 16 }} keyboardShouldPersistTaps="handled">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Text style={{ color: palette.text, flex: 1 }}>{areaLabel}</Text>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel={t('accessibility.locate')} disabled={!currentCoords} onPress={handleUseCurrentLocation} style={styles.locateButton}>
              <Ionicons color={palette.text} name="locate-outline" size={20} />
            </TouchableOpacity>
          </View>
          <AddressInputCard
            destination={destination} destinationLabel={t('home.destinationLabel')} destinationPlaceholder={t('home.destinationPlaceholder')}
            focusedField={focusedField} headerLabel={t('home.routeHeader')}
            onDestinationChange={(value) => {
              resolutionControllers.current.destination?.abort();
              destinationValueRef.current = value; setDestination(value); setDestinationCoords(null); setFocusedField('destination');
            }}
            onDestinationFocus={() => setFocusedField('destination')}
            onPickupChange={(value) => {
              pickupEdited.current = true;
              resolutionControllers.current.pickup?.abort();
              pickupValueRef.current = value; setPickup(value); setPickupCoords(null); setFocusedField('pickup');
            }}
            onPickupFocus={() => setFocusedField('pickup')} onSwap={handleSwapLocations} onUseCurrentLocation={handleUseCurrentLocation}
            pickup={pickup} pickupLabel={t('home.pickupLabel')} pickupPlaceholder={t('home.pickupPlaceholder')}
          />
          {focusedField ? (
            <View style={{ gap: 8 }}>
              <Text style={{ color: palette.text }}>{t(focusedField === 'pickup' ? 'home.suggestionsForPickup' : 'home.suggestionsForDestination')}</Text>
              {placeSuggestions.map((suggestion) => (
                <TouchableOpacity accessibilityRole="button" key={suggestion.id} onPress={() => handlePlaceSuggestionSelect(suggestion)} style={styles.suggestionRow}>
                  <Ionicons color={palette.text} name="location-outline" size={20} />
                  <View style={{ flex: 1 }}><Text style={styles.suggestionLabel}>{suggestion.title}</Text><Text style={styles.suggestionSubtitle}>{suggestion.subtitle}</Text></View>
                </TouchableOpacity>
              ))}
              {!placeSuggestions.length ? <Text style={styles.suggestionSubtitle}>{t('home.noQuickMatchText')}</Text> : null}
            </View>
          ) : null}
          {permissionDenied ? <Text style={{ color: palette.text }}>{t('home.locationAccessOff')}</Text> : null}
          {destinationCoords ? <Text style={styles.suggestionSubtitle}>{t('home.routeLineNotice')}</Text> : null}
          <TouchableOpacity accessibilityRole="button" accessibilityState={{ disabled: !canOrderTaxi, busy: isSubmittingRoute }} disabled={!canOrderTaxi} onPress={() => { void handleOrderTaxi(); }} style={[styles.primaryButton, !canOrderTaxi && styles.primaryButtonDisabled]}>
            <Text style={styles.primaryTitle}>{t('home.routePreview')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </PassengerScreenLayout>
  );
}

const createStyles = (palette: PassengerPalette, radius: typeof import('../theme/passenger').passengerRadius) => StyleSheet.create({
  locateButton: { minWidth: 48, minHeight: 48, borderRadius: radius.md, backgroundColor: palette.surface, alignItems: 'center', justifyContent: 'center' },
  suggestionRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  suggestionLabel: { color: palette.text, fontSize: 16, fontWeight: '700' },
  suggestionSubtitle: { color: palette.mutedText, fontSize: 14, lineHeight: 20 },
  primaryButton: { minHeight: 48, backgroundColor: palette.primaryDeep, borderRadius: radius.lg, padding: 18, alignItems: 'center' },
  primaryButtonDisabled: { opacity: 0.6 },
  primaryTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', textAlign: 'center' },
});

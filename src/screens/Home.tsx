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
  searchDestinationSuggestions,
} from '../data/passenger';
import { useI18n } from '../hooks/useI18n';
import { useSettings } from '../hooks/useSettings';
import { searchKyivPlaceSuggestions } from '../services/places/kyivPlaces';
import { PassengerPalette } from '../theme/passenger';
import { usePassengerTheme } from '../hooks/usePassengerTheme';
import { RootStackParamList } from '../types/navigation';
import { Coordinates, DestinationSuggestion, RideOptionKey } from '../types/passenger';

type HomeScreenProps =
  | NativeStackScreenProps<RootStackParamList, 'Home'>
  | NativeStackScreenProps<RootStackParamList, 'Main'>;

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
  const insets = useSafeAreaInsets();
  const routeParams = route.name === 'Home' ? route.params : undefined;
  const { t, language } = useI18n();
  const { priceAlertsEnabled } = useSettings();
  const { palette, radius } = usePassengerTheme();
  const styles = useMemo(() => createStyles(palette, radius), [palette, radius]);
  const currentLocationLabel = t('home.currentLocation');
  const cityCenterLabel = t('home.cityCenter');
  const locationOffShortLabel = t('home.locationAccessOffShort');

  const [pickup, setPickup] = useState(() => t('home.detectingPickup'));
  const [destination, setDestination] = useState('');
  const [pickupCoords, setPickupCoords] = useState<Coordinates | null>(DEFAULT_CITY_CENTER);
  const [destinationCoords, setDestinationCoords] = useState<Coordinates | null>(null);
  const [currentCoords, setCurrentCoords] = useState<Coordinates | null>(null);
  const [selectedRide, setSelectedRide] = useState<RideOptionKey>('comfort');
  const [areaLabel, setAreaLabel] = useState(() => t('home.checkingNearbyDrivers'));
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [focusedField, setFocusedField] = useState<'pickup' | 'destination' | null>(null);
  const [remotePlaceSuggestions, setRemotePlaceSuggestions] = useState<DestinationSuggestion[]>([]);
  const [isSubmittingRoute, setIsSubmittingRoute] = useState(false);
  const pickupValueRef = useRef(pickup);
  const destinationValueRef = useRef(destination);

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
            pickupValueRef.current = cityCenterLabel;
            setPermissionDenied(true);
            setPickup(cityCenterLabel);
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
        setPickupCoords(nextCoords);

        const [address] = await Location.reverseGeocodeAsync(nextCoords);

        if (!active) {
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
        if (active) {
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
    if (!pickup || pickup.length < 3 || focusedField !== 'pickup') {
      return;
    }

    const timer = setTimeout(() => {
      void resolveAddress(pickup, true);
    }, 450);

    return () => clearTimeout(timer);
  }, [pickup, focusedField]);

  useEffect(() => {
    if (!destination) {
      setDestinationCoords(null);
      return;
    }

    if (destination.length < 3 || focusedField !== 'destination') {
      return;
    }

    const timer = setTimeout(() => {
      void resolveAddress(destination, false);
    }, 450);

    return () => clearTimeout(timer);
  }, [destination, focusedField]);

  useEffect(() => {
    if (!focusedField || activeQuery.trim().length < 2) {
      setRemotePlaceSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => {
      searchKyivPlaceSuggestions(activeQuery, language, 6, controller.signal)
        .then((suggestions) => {
          setRemotePlaceSuggestions(suggestions);
        })
        .catch((error: unknown) => {
          if ((error as { name?: string })?.name === 'AbortError') {
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
    const normalizedLabel = label.trim();
    const applyCoordinates = (coords: Coordinates): Coordinates => {
      const currentFieldValue = isPickup ? pickupValueRef.current : destinationValueRef.current;

      if (normalizeInputValue(currentFieldValue) !== normalizeInputValue(normalizedLabel)) {
        return coords;
      }

      if (isPickup) {
        setPickupCoords(coords);
      } else {
        setDestinationCoords(coords);
      }

      return coords;
    };

    const clearCoordinates = () => {
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
      const liveSuggestions = await searchKyivPlaceSuggestions(normalizedLabel, language, 1);
      const liveCoords = liveSuggestions[0]?.coords;

      if (liveCoords) {
        return applyCoordinates(liveCoords);
      }
    } catch {
      // Fall through to native geocoding if Kyiv lookup is temporarily unavailable.
    }

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
    if (isSubmittingRoute) {
      return;
    }

    if (!destination.trim()) {
      setFocusedField('destination');
      return;
    }

    Keyboard.dismiss();
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

      navigation.navigate('VehicleSelection', {
        from: pickup,
        to: destination,
        pickupCoords: nextPickupCoords,
        destinationCoords: nextDestinationCoords,
        rideType: selectedRide,
      });
    } finally {
      setIsSubmittingRoute(false);
    }
  };

  const canOrderTaxi = Boolean(destination.trim()) && !isSubmittingRoute;

  const bottomInset = Math.max(insets.bottom, 10);
  const tabBarOffset = bottomInset + 78;
  const ctaBottom = tabBarOffset + 18;
  const suggestionSheetBottom = ctaBottom + 92;

  return (
    <PassengerScreenLayout activeRoute="Home" showHeader={false} contentStyle={styles.screen}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.screen}>
        <MapView
          ref={mapRef}
          initialRegion={DEFAULT_REGION}
          onPress={handleDismissInputs}
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
            <Polyline coordinates={routeLine} strokeColor={palette.primaryDeep} strokeWidth={4} />
          ) : null}
        </MapView>

        <View style={[styles.topOverlay, { top: insets.top + 8 }]}> 
          <View style={styles.heroBadgeWrap}>
            <Text style={styles.heroBadge}>{t('home.heroBadge')}</Text>
            <Text style={styles.heroCaption}>{areaLabel}</Text>
          </View>

          <TouchableOpacity activeOpacity={0.9} onPress={handleUseCurrentLocation} style={styles.locateButton}>
            <Ionicons color={palette.text} name="locate-outline" size={20} />
          </TouchableOpacity>
        </View>

        <View style={[styles.routeCardWrap, { top: insets.top + 54 }]}> 
          <AddressInputCard
            destination={destination}
            destinationLabel={t('home.destinationLabel')}
            destinationPlaceholder={t('home.destinationPlaceholder')}
            focusedField={focusedField}
            headerLabel={t('home.routeHeader')}
            onDestinationChange={(value) => {
              destinationValueRef.current = value;
              setDestination(value);
              setFocusedField('destination');
              if (normalizeInputValue(value) !== normalizeInputValue(destination)) {
                setDestinationCoords(null);
              }
            }}
            onDestinationFocus={() => setFocusedField('destination')}
            onPickupChange={(value) => {
              pickupValueRef.current = value;
              setPickup(value);
              setFocusedField('pickup');
              if (normalizeInputValue(value) !== normalizeInputValue(pickup)) {
                setPickupCoords(null);
              }
            }}
            onPickupFocus={() => setFocusedField('pickup')}
            onSwap={handleSwapLocations}
            onUseCurrentLocation={handleUseCurrentLocation}
            pickup={pickup}
            pickupLabel={t('home.pickupLabel')}
            pickupPlaceholder={t('home.pickupPlaceholder')}
          />
        </View>

        {tripPreview && priceRange && !focusedField ? (
          <View style={[styles.previewCard, { bottom: suggestionSheetBottom }]}> 
            <View style={styles.previewMetric}>
              <Text style={styles.previewMetricLabel}>{t('home.pickupStat')}</Text>
              <Text style={styles.previewMetricValue}>{t('common.minutesShort', { count: tripPreview.pickupEtaMin })}</Text>
            </View>
            <View style={styles.previewDivider} />
            <View style={styles.previewMetric}>
              <Text style={styles.previewMetricLabel}>{t('home.rideTime')}</Text>
              <Text style={styles.previewMetricValue}>{t('common.minutesShort', { count: tripPreview.durationMin })}</Text>
            </View>
            <View style={styles.previewDivider} />
            <View style={styles.previewMetric}>
              <Text style={styles.previewMetricLabel}>{t('home.estimatedFare')}</Text>
              <Text style={styles.previewMetricValue}>
                {t('common.priceUah', { amount: `${priceRange.min}-${priceRange.max}` })}
              </Text>
            </View>
          </View>
        ) : null}

        {focusedField ? (
          <View style={[styles.suggestionSheet, { bottom: suggestionSheetBottom }]}> 
            <View style={styles.suggestionHeader}>
              <Text style={styles.suggestionTitle}>
                {focusedField === 'pickup' ? t('home.suggestionsForPickup') : t('home.suggestionsForDestination')}
              </Text>
              <Text style={styles.suggestionMeta}>{t('common.matchesCount', { count: placeSuggestions.length })}</Text>
            </View>

            {placeSuggestions.length ? (
              <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                {placeSuggestions.map((suggestion) => (
                  <TouchableOpacity
                    key={suggestion.id}
                    activeOpacity={0.88}
                    onPress={() => handlePlaceSuggestionSelect(suggestion)}
                    style={styles.suggestionRow}
                  >
                    <View style={styles.suggestionIcon}>
                      <Ionicons
                        color={palette.text}
                        name={
                          suggestion.category === 'favorite'
                            ? 'heart-outline'
                            : suggestion.category === 'hub'
                              ? 'business-outline'
                              : suggestion.category === 'history'
                                ? 'reload-outline'
                                : suggestion.category === 'live'
                                  ? 'location-outline'
                                  : 'time-outline'
                        }
                        size={18}
                      />
                    </View>
                    <View style={styles.suggestionCopy}>
                      <Text style={styles.suggestionLabel}>{suggestion.title}</Text>
                      <Text style={styles.suggestionSubtitle}>{suggestion.subtitle}</Text>
                    </View>
                    <Text style={styles.suggestionCategory}>{t(`placeCategories.${suggestion.category}`)}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptySuggestionsCard}>
                <Ionicons color={palette.mutedText} name="search-outline" size={18} />
                <View style={styles.emptySuggestionsCopy}>
                  <Text style={styles.emptySuggestionsTitle}>{t('home.noQuickMatchTitle')}</Text>
                  <Text style={styles.emptySuggestionsText}>{t('home.noQuickMatchText')}</Text>
                </View>
              </View>
            )}
          </View>
        ) : null}

        {priceAlertsEnabled && tripPreview ? (
          <View style={[styles.alertCard, { bottom: ctaBottom + 78 }]}> 
            <Ionicons color={palette.primaryDeep} name="pricetag-outline" size={16} />
            <View style={styles.alertCopy}>
              <Text style={styles.alertTitle}>{t('home.priceAlertTitle')}</Text>
              <Text style={styles.alertText}>{t('home.priceAlertText')}</Text>
            </View>
          </View>
        ) : null}

        {permissionDenied ? (
          <View style={[styles.permissionNotice, { bottom: ctaBottom + 150 }]}> 
            <Ionicons color={palette.danger} name="alert-circle-outline" size={16} />
            <Text style={styles.permissionNoticeText}>{t('home.locationAccessOff')}</Text>
          </View>
        ) : null}

        <View style={[styles.footerAction, { bottom: ctaBottom }]}> 
          <TouchableOpacity
            activeOpacity={0.92}
            disabled={!canOrderTaxi}
            onPress={handleOrderTaxi}
            style={[styles.primaryButton, !canOrderTaxi && styles.primaryButtonDisabled]}
          >
            <View>
              <Text style={styles.primaryEyebrow}>
                {destinationCoords || destination.trim()
                  ? t('home.orderTaxiEyebrowReady')
                  : t('home.orderTaxiEyebrowWaiting')}
              </Text>
              <Text style={styles.primaryTitle}>{t('home.orderTaxi')}</Text>
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

const createStyles = (palette: PassengerPalette, radius: typeof import('../theme/passenger').passengerRadius) => StyleSheet.create({
  screen: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  topOverlay: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  heroBadgeWrap: {
    flex: 1,
    maxWidth: 250,
    backgroundColor: palette.mapOverlay,
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
  },
  heroBadge: {
    color: '#FCD34D',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  heroCaption: {
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 18,
  },
  locateButton: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 4,
  },
  routeCardWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
  },
  previewCard: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: palette.tabBar,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  previewMetric: {
    flex: 1,
  },
  previewMetricLabel: {
    color: palette.mutedText,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  previewMetricValue: {
    color: palette.text,
    fontSize: 14,
    fontWeight: '800',
  },
  previewDivider: {
    width: 1,
    backgroundColor: palette.border,
    marginHorizontal: 10,
  },
  suggestionSheet: {
    position: 'absolute',
    left: 16,
    right: 16,
    maxHeight: 240,
    backgroundColor: palette.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 16,
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 10,
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  suggestionTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '800',
  },
  suggestionMeta: {
    color: palette.mutedText,
    fontSize: 12,
    fontWeight: '700',
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
  },
  suggestionIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: palette.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionCopy: {
    flex: 1,
    gap: 3,
  },
  suggestionLabel: {
    color: palette.text,
    fontSize: 15,
    fontWeight: '700',
  },
  suggestionSubtitle: {
    color: palette.mutedText,
    fontSize: 12,
    lineHeight: 17,
  },
  suggestionCategory: {
    color: palette.mutedText,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  emptySuggestionsCard: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 8,
  },
  emptySuggestionsCopy: {
    flex: 1,
    gap: 4,
  },
  emptySuggestionsTitle: {
    color: palette.text,
    fontSize: 15,
    fontWeight: '700',
  },
  emptySuggestionsText: {
    color: palette.mutedText,
    fontSize: 13,
    lineHeight: 18,
  },
  alertCard: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: palette.warningSurface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.warningBorder,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  alertCopy: {
    flex: 1,
    gap: 2,
  },
  alertTitle: {
    color: palette.text,
    fontSize: 13,
    fontWeight: '800',
  },
  alertText: {
    color: palette.mutedText,
    fontSize: 12,
    lineHeight: 17,
  },
  permissionNotice: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    gap: 10,
    backgroundColor: palette.surfaceMuted,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.danger,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  permissionNoticeText: {
    color: palette.text,
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },
  footerAction: {
    position: 'absolute',
    left: 16,
    right: 16,
  },
  primaryButton: {
    backgroundColor: palette.primaryDeep,
    borderRadius: radius.lg,
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 1,
    shadowRadius: 22,
    elevation: 10,
  },
  primaryButtonDisabled: {
    backgroundColor: palette.border,
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
  pickupPin: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: palette.accent,
    backgroundColor: palette.accentSoft,
  },
  pickupPinInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: palette.accent,
  },
  destinationPin: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: palette.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

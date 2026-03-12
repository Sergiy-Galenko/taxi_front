import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GoogleRouteMap, { type RouteMapCameraRef } from '../components/maps/GoogleRouteMap';
import PassengerScreenLayout from '../components/passenger/PassengerScreenLayout';
import {
  createGooglePlacesSessionToken,
  hasGoogleMapsApiKey,
} from '../config/googleMaps';
import {
  calculateTripSummary,
  calculateTripSummaryFromMetrics,
  DEFAULT_CITY_CENTER,
  findLocationSuggestion,
  searchDestinationSuggestions,
} from '../data/passenger';
import { useI18n } from '../hooks/useI18n';
import { useSettings } from '../hooks/useSettings';
import { fetchGoogleRoute } from '../services/googleMaps/directions';
import {
  fetchGooglePlaceDetails,
  forwardGeocodeGoogleAddress,
  reverseGeocodeGoogleAddress,
  searchGooglePlaceSuggestions,
} from '../services/googleMaps/places';
import { getBoundsFromCoordinates } from '../services/maps/geometry';
import { PassengerPalette } from '../theme/passenger';
import { usePassengerTheme } from '../hooks/usePassengerTheme';
import { RootStackParamList } from '../types/navigation';
import { Coordinates, DestinationSuggestion, RideOptionKey } from '../types/passenger';

type HomeScreenProps =
  | NativeStackScreenProps<RootStackParamList, 'Home'>
  | NativeStackScreenProps<RootStackParamList, 'Main'>;

const DEFAULT_HOME_ZOOM = 14.5;

const buildMidPoint = (from: Coordinates, to: Coordinates): Coordinates => ({
  latitude: (from.latitude + to.latitude) / 2,
  longitude: (from.longitude + to.longitude) / 2,
});

const normalizeInputValue = (value: string): string => value.trim().toLowerCase();

const areCoordinatesEqual = (
  left: Coordinates | null | undefined,
  right: Coordinates | null | undefined
): boolean => {
  if (!left || !right) {
    return false;
  }

  return left.latitude === right.latitude && left.longitude === right.longitude;
};

export default function HomeScreen({ navigation, route }: HomeScreenProps) {
  const cameraRef = useRef<RouteMapCameraRef | null>(null);
  const initialLocationResolvedRef = useRef(false);
  const autocompleteSessionTokenRef = useRef(createGooglePlacesSessionToken());
  const pickupValueRef = useRef('');
  const destinationValueRef = useRef('');
  const insets = useSafeAreaInsets();
  const routeParams = route.name === 'Home' ? route.params : undefined;
  const { t, language } = useI18n();
  const { priceAlertsEnabled } = useSettings();
  const { palette, radius } = usePassengerTheme();
  const styles = useMemo(() => createStyles(palette, radius), [palette, radius]);
  const currentLocationLabel = t('home.currentLocation');
  const detectingPickupLabel = t('home.detectingPickup');
  const cityCenterLabel = t('home.cityCenter');
  const locationOffShortLabel = t('home.locationAccessOffShort');

  const [pickup, setPickup] = useState(() => detectingPickupLabel);
  const [destination, setDestination] = useState('');
  const [pickupCoords, setPickupCoords] = useState<Coordinates | null>(DEFAULT_CITY_CENTER);
  const [destinationCoords, setDestinationCoords] = useState<Coordinates | null>(null);
  const [currentCoords, setCurrentCoords] = useState<Coordinates | null>(null);
  const [routeDistanceKm, setRouteDistanceKm] = useState<number | null>(null);
  const [routeDurationMin, setRouteDurationMin] = useState<number | null>(null);
  const [routeGeometry, setRouteGeometry] = useState<Coordinates[]>([]);
  const [selectedRide, setSelectedRide] = useState<RideOptionKey>('comfort');
  const [areaLabel, setAreaLabel] = useState(() => t('home.checkingNearbyDrivers'));
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [focusedField, setFocusedField] = useState<'pickup' | 'destination' | null>(null);
  const [remotePlaceSuggestions, setRemotePlaceSuggestions] = useState<DestinationSuggestion[]>([]);
  const [isSubmittingRoute, setIsSubmittingRoute] = useState(false);
  const [isResolvingSuggestion, setIsResolvingSuggestion] = useState(false);

  const fallbackRouteLine =
    pickupCoords && destinationCoords
      ? [pickupCoords, buildMidPoint(pickupCoords, destinationCoords), destinationCoords]
      : [];
  const routeLine = routeGeometry.length > 1 ? routeGeometry : fallbackRouteLine;

  const tripPreview = useMemo(() => {
    if (!destinationCoords) {
      return null;
    }

    if (routeDistanceKm != null && routeDurationMin != null) {
      return calculateTripSummaryFromMetrics(routeDistanceKm, routeDurationMin, selectedRide);
    }

    return calculateTripSummary(pickupCoords, destinationCoords, selectedRide);
  }, [destinationCoords, pickupCoords, routeDistanceKm, routeDurationMin, selectedRide]);

  const priceRange = useMemo(() => {
    if (!destinationCoords) {
      return null;
    }

    const economy =
      routeDistanceKm != null && routeDurationMin != null
        ? calculateTripSummaryFromMetrics(routeDistanceKm, routeDurationMin, 'economy')
        : calculateTripSummary(pickupCoords, destinationCoords, 'economy');
    const xl =
      routeDistanceKm != null && routeDurationMin != null
        ? calculateTripSummaryFromMetrics(routeDistanceKm, routeDurationMin, 'xl')
        : calculateTripSummary(pickupCoords, destinationCoords, 'xl');

    return {
      max: xl.price,
      min: economy.price,
    };
  }, [destinationCoords, pickupCoords, routeDistanceKm, routeDurationMin]);

  const activeQuery =
    focusedField === 'pickup' ? pickup : focusedField === 'destination' ? destination : '';

  const localPlaceSuggestions = useMemo(() => {
    if (!focusedField) {
      return [];
    }

    return searchDestinationSuggestions(activeQuery, 5);
  }, [activeQuery, focusedField]);

  const placeSuggestions = useMemo(() => {
    if (!focusedField) {
      return [];
    }

    const mergedSuggestions =
      activeQuery.trim().length > 1
        ? [...remotePlaceSuggestions, ...localPlaceSuggestions]
        : localPlaceSuggestions;
    const seen = new Set<string>();

    return mergedSuggestions
      .filter((suggestion) => {
        const key = `${suggestion.title.trim().toLowerCase()}|${suggestion.subtitle
          .trim()
          .toLowerCase()}`;

        if (seen.has(key)) {
          return false;
        }

        seen.add(key);
        return true;
      })
      .slice(0, 6);
  }, [activeQuery, focusedField, localPlaceSuggestions, remotePlaceSuggestions]);

  const moveCameraToCoordinate = (coords: Coordinates) => {
    cameraRef.current?.setCamera({
      animationDuration: 600,
      centerCoordinate: [coords.longitude, coords.latitude],
      zoomLevel: DEFAULT_HOME_ZOOM,
    });
  };

  const applyCurrentLocation = async (
    coords: Coordinates,
    options?: {
      centerMap?: boolean;
      forcePickup?: boolean;
    }
  ) => {
    const shouldReplacePickup =
      options?.forcePickup ||
      normalizeInputValue(pickupValueRef.current) === normalizeInputValue(detectingPickupLabel) ||
      normalizeInputValue(pickupValueRef.current) === normalizeInputValue(currentLocationLabel) ||
      normalizeInputValue(pickupValueRef.current) === normalizeInputValue(cityCenterLabel);

    setCurrentCoords(coords);

    if (options?.centerMap) {
      moveCameraToCoordinate(coords);
    }

    if (!shouldReplacePickup) {
      return;
    }

    setPickupCoords(coords);

    try {
      const place = await reverseGeocodeGoogleAddress(coords, language);
      const nextPickupLabel = place?.fullAddress || place?.title || currentLocationLabel;

      pickupValueRef.current = nextPickupLabel;
      setPickup(nextPickupLabel);
      setAreaLabel(place?.subtitle || cityCenterLabel);
    } catch {
      pickupValueRef.current = currentLocationLabel;
      setPickup(currentLocationLabel);
      setAreaLabel(cityCenterLabel);
    }
  };

  useEffect(() => {
    pickupValueRef.current = pickup;
  }, [pickup]);

  useEffect(() => {
    destinationValueRef.current = destination;
  }, [destination]);

  useEffect(() => {
    let active = true;

    const requestLocationPermission = async () => {
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        const granted = permission.status === 'granted';

        if (!granted) {
          if (active) {
            pickupValueRef.current = cityCenterLabel;
            setPermissionDenied(true);
            setPickup(cityCenterLabel);
            setAreaLabel(locationOffShortLabel);
          }
          return;
        }

        if (!active) {
          return;
        }

        setPermissionDenied(false);

        const lastKnownPosition = await Location.getLastKnownPositionAsync();

        if (lastKnownPosition?.coords && active) {
          const coords = {
            latitude: lastKnownPosition.coords.latitude,
            longitude: lastKnownPosition.coords.longitude,
          };

          void applyCurrentLocation(coords, { centerMap: true, forcePickup: true });
        }

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (!active || !position?.coords) {
          return;
        }

        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        void applyCurrentLocation(coords, {
          centerMap: !lastKnownPosition?.coords,
          forcePickup: true,
        });
      } catch {
        if (active) {
          pickupValueRef.current = cityCenterLabel;
          setPickup(cityCenterLabel);
          setAreaLabel(cityCenterLabel);
        }
      }
    };

    void requestLocationPermission();

    return () => {
      active = false;
    };
  }, [cityCenterLabel, currentLocationLabel, detectingPickupLabel, language, locationOffShortLabel]);

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
    const coordinatesToFit =
      routeLine.length > 1
        ? routeLine
        : [pickupCoords, destinationCoords].filter(
            (coordinate): coordinate is Coordinates => Boolean(coordinate)
          );
    const bounds = getBoundsFromCoordinates(coordinatesToFit);

    if (!bounds) {
      return;
    }

    cameraRef.current?.fitBounds(bounds.ne, bounds.sw, [160, 44, 280, 44], 650);
  }, [destinationCoords, pickupCoords, routeLine]);

  useEffect(() => {
    if (!pickup || pickup.length < 3 || focusedField !== 'pickup') {
      return;
    }

    const timer = setTimeout(() => {
      void resolveAddress(pickup, true);
    }, 550);

    return () => clearTimeout(timer);
  }, [focusedField, pickup]);

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
    }, 550);

    return () => clearTimeout(timer);
  }, [destination, focusedField]);

  useEffect(() => {
    if (!focusedField || activeQuery.trim().length < 2 || !hasGoogleMapsApiKey()) {
      setRemotePlaceSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => {
      searchGooglePlaceSuggestions(
        activeQuery,
        language,
        6,
        currentCoords ?? pickupCoords ?? undefined,
        autocompleteSessionTokenRef.current,
        controller.signal
      )
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
  }, [activeQuery, currentCoords, focusedField, language, pickupCoords]);

  useEffect(() => {
    if (!pickupCoords || !destinationCoords) {
      setRouteDistanceKm(null);
      setRouteDurationMin(null);
      setRouteGeometry([]);
      return;
    }

    const controller = new AbortController();

    fetchGoogleRoute({
      coordinates: [pickupCoords, destinationCoords],
      language,
      signal: controller.signal,
    })
      .then((routeData) => {
        if (!routeData) {
          setRouteDistanceKm(null);
          setRouteDurationMin(null);
          setRouteGeometry([]);
          return;
        }

        setRouteDistanceKm(routeData.distanceKm);
        setRouteDurationMin(routeData.durationMin);
        setRouteGeometry(routeData.geometry);
      })
      .catch((error: unknown) => {
        if ((error as { name?: string })?.name === 'AbortError') {
          return;
        }

        setRouteDistanceKm(null);
        setRouteDurationMin(null);
        setRouteGeometry([]);
      });

    return () => controller.abort();
  }, [destinationCoords, language, pickupCoords]);

  const resolveAddress = async (
    label: string,
    isPickup: boolean
  ): Promise<Coordinates | null> => {
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

    if (
      isPickup &&
      currentCoords &&
      normalizeInputValue(normalizedLabel) === normalizeInputValue(currentLocationLabel)
    ) {
      return applyCoordinates(currentCoords);
    }

    if (normalizeInputValue(normalizedLabel) === normalizeInputValue(cityCenterLabel)) {
      return applyCoordinates(DEFAULT_CITY_CENTER);
    }

    try {
      const place = await forwardGeocodeGoogleAddress(normalizedLabel, language);

      if (place?.coords) {
        return applyCoordinates(place.coords);
      }
    } catch {
      clearCoordinates();
      return null;
    }

    clearCoordinates();
    return null;
  };

  const handleUserLocationUpdate = (coords: Coordinates) => {
    setCurrentCoords(coords);

    if (initialLocationResolvedRef.current) {
      return;
    }

    initialLocationResolvedRef.current = true;
    void applyCurrentLocation(coords, { centerMap: true, forcePickup: true });
  };

  const handleUseCurrentLocation = () => {
    if (!currentCoords) {
      return;
    }

    Keyboard.dismiss();
    setFocusedField(null);
    setRemotePlaceSuggestions([]);
    void applyCurrentLocation(currentCoords, { centerMap: true, forcePickup: true });
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

  const applySuggestionToField = (
    field: 'pickup' | 'destination',
    value: string,
    coords: Coordinates | null,
    subtitle?: string
  ) => {
    if (field === 'pickup') {
      pickupValueRef.current = value;
      setPickup(value);
      setPickupCoords(coords);
      if (subtitle) {
        setAreaLabel(subtitle);
      }
      return;
    }

    destinationValueRef.current = value;
    setDestination(value);
    setDestinationCoords(coords);
  };

  const handlePlaceSuggestionSelect = async (suggestion: DestinationSuggestion) => {
    const targetField = focusedField ?? 'destination';
    const fallbackLabel =
      suggestion.fullAddress ||
      [suggestion.title, suggestion.subtitle].filter(Boolean).join(', ') ||
      suggestion.title;

    setFocusedField(null);
    setRemotePlaceSuggestions([]);
    Keyboard.dismiss();

    if (suggestion.placeId) {
      setIsResolvingSuggestion(true);

      try {
        const place = await fetchGooglePlaceDetails(
          suggestion.placeId,
          language,
          autocompleteSessionTokenRef.current
        );
        const label = place?.fullAddress || fallbackLabel;

        applySuggestionToField(targetField, label, place?.coords || suggestion.coords || null, place?.subtitle || suggestion.subtitle);
      } catch {
        applySuggestionToField(targetField, fallbackLabel, suggestion.coords || null, suggestion.subtitle);
      } finally {
        setIsResolvingSuggestion(false);
      }
    } else if (suggestion.coords) {
      applySuggestionToField(targetField, fallbackLabel, suggestion.coords, suggestion.subtitle);
    } else {
      setIsResolvingSuggestion(true);

      try {
        const place = await forwardGeocodeGoogleAddress(fallbackLabel, language);
        applySuggestionToField(
          targetField,
          place?.fullAddress || fallbackLabel,
          place?.coords || null,
          place?.subtitle || suggestion.subtitle
        );
      } finally {
        setIsResolvingSuggestion(false);
      }
    }

    autocompleteSessionTokenRef.current = createGooglePlacesSessionToken();
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

      const routeSummary =
        routeDistanceKm != null &&
        routeDurationMin != null &&
        areCoordinatesEqual(nextPickupCoords, pickupCoords) &&
        areCoordinatesEqual(nextDestinationCoords, destinationCoords)
          ? {
              distanceKm: routeDistanceKm,
              durationMin: routeDurationMin,
            }
          : await fetchGoogleRoute({
              coordinates: [nextPickupCoords, nextDestinationCoords],
              language,
            });

      navigation.navigate('VehicleSelection', {
        destinationCoords: nextDestinationCoords,
        from: pickup,
        pickupCoords: nextPickupCoords,
        rideType: selectedRide,
        routeDistanceKm: routeSummary?.distanceKm,
        routeDurationMin: routeSummary?.durationMin,
        to: destination,
      });
    } finally {
      setIsSubmittingRoute(false);
    }
  };

  const canOrderTaxi = Boolean(destination.trim()) && Boolean(pickup.trim()) && !isSubmittingRoute;
  const bottomInset = Math.max(insets.bottom, 10);
  const tabBarOffset = bottomInset + 84;

  const mapMarkers = useMemo(() => {
    const markers: Array<{
      coords: Coordinates;
      element: React.ReactElement;
      id: string;
    }> = [];

    if (pickupCoords) {
      markers.push({
        coords: pickupCoords,
        element: (
          <View style={styles.pickupPin}>
            <View style={styles.pickupPinInner} />
          </View>
        ),
        id: 'pickup',
      });
    }

    if (destinationCoords) {
      markers.push({
        coords: destinationCoords,
        element: (
          <View style={styles.destinationPin}>
            <Ionicons color="#FFFFFF" name="flag" size={13} />
          </View>
        ),
        id: 'destination',
      });
    }

    return markers;
  }, [destinationCoords, pickupCoords, styles.destinationPin, styles.pickupPin, styles.pickupPinInner]);

  return (
    <PassengerScreenLayout activeRoute="Home" showHeader={false} contentStyle={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.screen}
      >
        <GoogleRouteMap
          cameraRef={cameraRef}
          language={language}
          markers={mapMarkers}
          onMapPress={handleDismissInputs}
          onUserLocationUpdate={permissionDenied ? undefined : handleUserLocationUpdate}
          routeCoordinates={routeLine}
          routeLineColor={palette.primaryDeep}
          showUserLocation={!permissionDenied}
          style={styles.map}
        />

        <View style={[styles.topOverlay, { top: insets.top + 8 }]}>
          <View style={styles.heroCard}>
            <Text style={styles.heroBadge}>{t('home.heroBadge')}</Text>
            <Text style={styles.heroTitle}>{t('home.heroTitle')}</Text>
            <Text style={styles.heroCaption}>{areaLabel}</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleUseCurrentLocation}
            style={styles.locateButton}
          >
            <Ionicons color={palette.text} name="locate-outline" size={20} />
          </TouchableOpacity>
        </View>

        <View style={[styles.composerWrap, { bottom: tabBarOffset }]}>
          <View style={[styles.composerCard, focusedField && styles.composerCardExpanded]}>
            <View style={styles.composerHeader}>
              <View style={styles.composerCopy}>
                <Text style={styles.composerEyebrow}>{t('home.flowBadge')}</Text>
                <Text style={styles.composerTitle}>{t('home.headline')}</Text>
                <Text style={styles.composerSubtitle}>{t('home.subheadline')}</Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => navigation.navigate('Preorder')}
                style={styles.scheduleButton}
              >
                <Ionicons color={palette.text} name="calendar-outline" size={18} />
              </TouchableOpacity>
            </View>

            <View style={styles.routePanel}>
              <View style={styles.timelineColumn}>
                <View style={[styles.routeMarker, styles.pickupMarker]} />
                <View style={styles.timelineLine} />
                <View style={[styles.routeMarker, styles.destinationMarker]} />
              </View>

              <View style={styles.routeFields}>
                <View
                  style={[
                    styles.routeField,
                    focusedField === 'pickup' && styles.routeFieldActive,
                  ]}
                >
                  <View style={styles.routeFieldCopy}>
                    <Text style={styles.routeLabel}>{t('home.pickupLabel')}</Text>
                    <TextInput
                      onChangeText={(value) => {
                        pickupValueRef.current = value;
                        setPickup(value);
                        setFocusedField('pickup');

                        if (normalizeInputValue(value) !== normalizeInputValue(pickup)) {
                          setPickupCoords(null);
                        }
                      }}
                      onFocus={() => setFocusedField('pickup')}
                      placeholder={t('home.pickupPlaceholder')}
                      placeholderTextColor={palette.mutedText}
                      style={styles.routeInput}
                      value={pickup}
                    />
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.88}
                    onPress={handleUseCurrentLocation}
                    style={styles.inlineActionButton}
                  >
                    <Ionicons color={palette.info} name="locate-outline" size={18} />
                  </TouchableOpacity>
                </View>

                <View style={styles.innerDivider} />

                <View
                  style={[
                    styles.routeField,
                    focusedField === 'destination' && styles.routeFieldActive,
                  ]}
                >
                  <View style={styles.routeFieldCopy}>
                    <Text style={styles.routeLabel}>{t('home.destinationLabel')}</Text>
                    <TextInput
                      onChangeText={(value) => {
                        destinationValueRef.current = value;
                        setDestination(value);
                        setFocusedField('destination');

                        if (normalizeInputValue(value) !== normalizeInputValue(destination)) {
                          setDestinationCoords(null);
                        }
                      }}
                      onFocus={() => setFocusedField('destination')}
                      placeholder={t('home.destinationPlaceholder')}
                      placeholderTextColor={palette.mutedText}
                      style={styles.routeInput}
                      value={destination}
                    />
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.88}
                    onPress={handleSwapLocations}
                    style={styles.inlineActionButton}
                  >
                    <Ionicons color={palette.text} name="swap-vertical-outline" size={18} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {focusedField ? (
              <View style={styles.suggestionsSection}>
                <View style={styles.suggestionHeader}>
                  <Text style={styles.suggestionTitle}>
                    {focusedField === 'pickup'
                      ? t('home.suggestionsForPickup')
                      : t('home.suggestionsForDestination')}
                  </Text>
                  <Text style={styles.suggestionMeta}>
                    {isResolvingSuggestion
                      ? t('common.loading')
                      : t('common.matchesCount', { count: placeSuggestions.length })}
                  </Text>
                </View>

                {placeSuggestions.length ? (
                  <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                    {placeSuggestions.map((suggestion) => (
                      <TouchableOpacity
                        key={suggestion.id}
                        activeOpacity={0.88}
                        onPress={() => void handlePlaceSuggestionSelect(suggestion)}
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
                        <Text style={styles.suggestionCategory}>
                          {t(`placeCategories.${suggestion.category}`)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                ) : (
                  <View style={styles.emptySuggestionsCard}>
                    <Ionicons color={palette.mutedText} name="search-outline" size={18} />
                    <View style={styles.emptySuggestionsCopy}>
                      <Text style={styles.emptySuggestionsTitle}>
                        {t('home.noQuickMatchTitle')}
                      </Text>
                      <Text style={styles.emptySuggestionsText}>
                        {t('home.noQuickMatchText')}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            ) : (
              <>
                <View style={styles.metricsRow}>
                  {tripPreview && priceRange ? (
                    <>
                      <View style={styles.metricChip}>
                        <Text style={styles.metricLabel}>{t('home.pickupStat')}</Text>
                        <Text style={styles.metricValue}>
                          {t('common.minutesShort', { count: tripPreview.pickupEtaMin })}
                        </Text>
                      </View>
                      <View style={styles.metricChip}>
                        <Text style={styles.metricLabel}>{t('home.rideTime')}</Text>
                        <Text style={styles.metricValue}>
                          {t('common.minutesShort', { count: tripPreview.durationMin })}
                        </Text>
                      </View>
                      <View style={styles.metricChip}>
                        <Text style={styles.metricLabel}>{t('home.estimatedFare')}</Text>
                        <Text style={styles.metricValue}>
                          {t('common.priceUah', { amount: `${priceRange.min}-${priceRange.max}` })}
                        </Text>
                      </View>
                    </>
                  ) : (
                    <>
                      <View style={styles.metricChip}>
                        <Text style={styles.metricLabel}>{t('home.pickupStat')}</Text>
                        <Text style={styles.metricValue}>{t('home.pickupFastNearby')}</Text>
                      </View>
                      <View style={styles.metricChip}>
                        <Text style={styles.metricLabel}>{t('home.vehicleStepLabel')}</Text>
                        <Text style={styles.metricValue}>{t('home.vehicleStep')}</Text>
                      </View>
                    </>
                  )}
                </View>

                {priceAlertsEnabled && tripPreview ? (
                  <View style={styles.infoRow}>
                    <Ionicons color={palette.primaryDeep} name="pricetag-outline" size={16} />
                    <View style={styles.infoCopy}>
                      <Text style={styles.infoTitle}>{t('home.priceAlertTitle')}</Text>
                      <Text style={styles.infoText}>{t('home.priceAlertText')}</Text>
                    </View>
                  </View>
                ) : null}

                {permissionDenied ? (
                  <View style={styles.noticeRow}>
                    <Ionicons color={palette.danger} name="alert-circle-outline" size={16} />
                    <Text style={styles.noticeText}>{t('home.locationAccessOff')}</Text>
                  </View>
                ) : null}

                {routeParams?.rideType ? (
                  <Text style={styles.selectionHint}>
                    {t('home.preselectedRideHint', {
                      ride: t(`rideOptions.${selectedRide}.label`),
                    })}
                  </Text>
                ) : null}

                <TouchableOpacity
                  activeOpacity={0.92}
                  disabled={!canOrderTaxi}
                  onPress={handleOrderTaxi}
                  style={[
                    styles.primaryButton,
                    !canOrderTaxi && styles.primaryButtonDisabled,
                  ]}
                >
                  <View>
                    <Text style={styles.primaryEyebrow}>
                      {destinationCoords || destination.trim()
                        ? t('home.orderTaxiEyebrowReady')
                        : t('home.orderTaxiEyebrowWaiting')}
                    </Text>
                    <Text style={styles.primaryTitle}>
                      {isSubmittingRoute ? t('common.loading') : t('home.orderTaxi')}
                    </Text>
                  </View>
                  <View style={styles.primaryIconWrap}>
                    <Ionicons color="#FFFFFF" name="arrow-forward" size={18} />
                  </View>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </PassengerScreenLayout>
  );
}

const createStyles = (
  palette: PassengerPalette,
  radius: typeof import('../theme/passenger').passengerRadius
) =>
  StyleSheet.create({
    screen: {
      flex: 1,
    },
    map: {
      flex: 1,
    },
    topOverlay: {
      flexDirection: 'row',
      gap: 12,
      justifyContent: 'space-between',
      left: 16,
      position: 'absolute',
      right: 16,
    },
    heroCard: {
      backgroundColor: palette.mapOverlay,
      borderRadius: radius.lg,
      gap: 4,
      maxWidth: 280,
      paddingHorizontal: 16,
      paddingVertical: 14,
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
      letterSpacing: -0.5,
    },
    heroCaption: {
      color: 'rgba(255, 255, 255, 0.78)',
      fontSize: 13,
      lineHeight: 18,
    },
    locateButton: {
      alignItems: 'center',
      backgroundColor: palette.surface,
      borderRadius: radius.md,
      height: 48,
      justifyContent: 'center',
      shadowColor: palette.shadow,
      shadowOffset: { height: 10, width: 0 },
      shadowOpacity: 1,
      shadowRadius: 24,
      width: 48,
    },
    composerWrap: {
      left: 16,
      position: 'absolute',
      right: 16,
    },
    composerCard: {
      backgroundColor: palette.tabBar,
      borderColor: palette.border,
      borderRadius: radius.xl,
      borderWidth: 1,
      gap: 16,
      padding: 18,
      shadowColor: palette.shadow,
      shadowOffset: { height: 16, width: 0 },
      shadowOpacity: 1,
      shadowRadius: 24,
    },
    composerCardExpanded: {
      maxHeight: 420,
    },
    composerHeader: {
      alignItems: 'flex-start',
      flexDirection: 'row',
      gap: 14,
      justifyContent: 'space-between',
    },
    composerCopy: {
      flex: 1,
      gap: 4,
    },
    composerEyebrow: {
      color: palette.primaryDeep,
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 0.4,
      textTransform: 'uppercase',
    },
    composerTitle: {
      color: palette.text,
      fontSize: 24,
      fontWeight: '800',
      letterSpacing: -0.7,
    },
    composerSubtitle: {
      color: palette.mutedText,
      fontSize: 13,
      lineHeight: 18,
    },
    scheduleButton: {
      alignItems: 'center',
      backgroundColor: palette.surface,
      borderColor: palette.border,
      borderRadius: 18,
      borderWidth: 1,
      height: 42,
      justifyContent: 'center',
      width: 42,
    },
    routePanel: {
      flexDirection: 'row',
      gap: 12,
    },
    timelineColumn: {
      alignItems: 'center',
      paddingTop: 14,
    },
    routeMarker: {
      borderRadius: 6,
      height: 12,
      width: 12,
    },
    pickupMarker: {
      backgroundColor: palette.accent,
    },
    destinationMarker: {
      backgroundColor: palette.danger,
    },
    timelineLine: {
      backgroundColor: palette.border,
      flex: 1,
      marginVertical: 6,
      minHeight: 44,
      width: 2,
    },
    routeFields: {
      backgroundColor: palette.surface,
      borderColor: palette.border,
      borderRadius: radius.lg,
      borderWidth: 1,
      flex: 1,
      overflow: 'hidden',
    },
    routeField: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    routeFieldActive: {
      backgroundColor: palette.surfaceMuted,
    },
    routeFieldCopy: {
      flex: 1,
      gap: 3,
    },
    routeLabel: {
      color: palette.mutedText,
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    routeInput: {
      color: palette.text,
      fontSize: 17,
      fontWeight: '700',
      paddingVertical: 0,
    },
    inlineActionButton: {
      alignItems: 'center',
      backgroundColor: palette.surfaceMuted,
      borderRadius: 14,
      height: 38,
      justifyContent: 'center',
      width: 38,
    },
    innerDivider: {
      backgroundColor: palette.border,
      height: 1,
      marginHorizontal: 14,
    },
    suggestionsSection: {
      gap: 8,
      minHeight: 180,
    },
    suggestionHeader: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 12,
      justifyContent: 'space-between',
    },
    suggestionTitle: {
      color: palette.text,
      fontSize: 15,
      fontWeight: '800',
    },
    suggestionMeta: {
      color: palette.mutedText,
      fontSize: 12,
      fontWeight: '700',
    },
    suggestionRow: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 12,
      paddingVertical: 11,
    },
    suggestionIcon: {
      alignItems: 'center',
      backgroundColor: palette.surfaceMuted,
      borderRadius: 14,
      height: 38,
      justifyContent: 'center',
      width: 38,
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
      alignItems: 'flex-start',
      backgroundColor: palette.surface,
      borderColor: palette.border,
      borderRadius: radius.lg,
      borderWidth: 1,
      flexDirection: 'row',
      gap: 12,
      padding: 16,
    },
    emptySuggestionsCopy: {
      flex: 1,
      gap: 4,
    },
    emptySuggestionsTitle: {
      color: palette.text,
      fontSize: 14,
      fontWeight: '800',
    },
    emptySuggestionsText: {
      color: palette.mutedText,
      fontSize: 12,
      lineHeight: 18,
    },
    metricsRow: {
      flexDirection: 'row',
      gap: 10,
    },
    metricChip: {
      backgroundColor: palette.surface,
      borderRadius: 18,
      flex: 1,
      gap: 5,
      paddingHorizontal: 12,
      paddingVertical: 12,
    },
    metricLabel: {
      color: palette.mutedText,
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    metricValue: {
      color: palette.text,
      fontSize: 13,
      fontWeight: '800',
    },
    infoRow: {
      alignItems: 'flex-start',
      backgroundColor: palette.warningSurface,
      borderColor: palette.warningBorder,
      borderRadius: radius.lg,
      borderWidth: 1,
      flexDirection: 'row',
      gap: 10,
      padding: 14,
    },
    infoCopy: {
      flex: 1,
      gap: 2,
    },
    infoTitle: {
      color: palette.text,
      fontSize: 13,
      fontWeight: '800',
    },
    infoText: {
      color: palette.mutedText,
      fontSize: 12,
      lineHeight: 17,
    },
    noticeRow: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 8,
    },
    noticeText: {
      color: palette.mutedText,
      flex: 1,
      fontSize: 12,
      lineHeight: 17,
    },
    selectionHint: {
      color: palette.mutedText,
      fontSize: 12,
      lineHeight: 18,
    },
    primaryButton: {
      alignItems: 'center',
      backgroundColor: palette.primaryDeep,
      borderRadius: radius.lg,
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 18,
      paddingVertical: 16,
    },
    primaryButtonDisabled: {
      backgroundColor: palette.border,
    },
    primaryEyebrow: {
      color: '#FCE7B5',
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.6,
      marginBottom: 4,
      textTransform: 'uppercase',
    },
    primaryTitle: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '800',
    },
    primaryIconWrap: {
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.18)',
      borderRadius: 16,
      height: 38,
      justifyContent: 'center',
      width: 38,
    },
    pickupPin: {
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      borderColor: palette.accent,
      borderRadius: 14,
      borderWidth: 3,
      height: 28,
      justifyContent: 'center',
      shadowColor: palette.shadow,
      shadowOffset: { height: 6, width: 0 },
      shadowOpacity: 1,
      shadowRadius: 14,
      width: 28,
    },
    pickupPinInner: {
      backgroundColor: palette.accent,
      borderRadius: 6,
      height: 12,
      width: 12,
    },
    destinationPin: {
      alignItems: 'center',
      backgroundColor: palette.danger,
      borderRadius: 14,
      height: 28,
      justifyContent: 'center',
      shadowColor: palette.shadow,
      shadowOffset: { height: 6, width: 0 },
      shadowOpacity: 1,
      shadowRadius: 14,
      width: 28,
    },
  });

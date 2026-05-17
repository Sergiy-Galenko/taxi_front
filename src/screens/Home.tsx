import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AddressSearch from '../components/AddressSearch';
import BottomSheet from '../components/BottomSheet';
import Button from '../components/Button';
import MapControls from '../components/MapControls';
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
  LOCATION_SUGGESTIONS,
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
import { usePassengerTheme } from '../hooks/usePassengerTheme';
import { PassengerPalette, passengerSpacing } from '../theme/passenger';
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

const buildSuggestionLabel = (suggestion: DestinationSuggestion) =>
  suggestion.fullAddress ||
  [suggestion.title, suggestion.subtitle].filter(Boolean).join(', ') ||
  suggestion.title;

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
    const premium =
      routeDistanceKm != null && routeDurationMin != null
        ? calculateTripSummaryFromMetrics(routeDistanceKm, routeDurationMin, 'business')
        : calculateTripSummary(pickupCoords, destinationCoords, 'business');

    return {
      max: premium.price,
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

  const moveCameraToCoordinate = useCallback((coords: Coordinates) => {
    cameraRef.current?.setCamera({
      animationDuration: 600,
      centerCoordinate: [coords.longitude, coords.latitude],
      zoomLevel: DEFAULT_HOME_ZOOM,
    });
  }, []);

  const applyCurrentLocation = useCallback(
    async (
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
    },
    [
      cityCenterLabel,
      currentLocationLabel,
      detectingPickupLabel,
      language,
      moveCameraToCoordinate,
    ]
  );

  const resolveAddress = useCallback(
    async (label: string, isPickup: boolean): Promise<Coordinates | null> => {
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
    },
    [cityCenterLabel, currentCoords, currentLocationLabel, language]
  );

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
  }, [applyCurrentLocation, cityCenterLabel, locationOffShortLabel]);

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
  }, [resolveAddress, routeParams]);

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

    cameraRef.current?.fitBounds(bounds.ne, bounds.sw, [160, 44, 300, 44], 650);
  }, [destinationCoords, pickupCoords, routeLine]);

  useEffect(() => {
    if (!pickup || pickup.length < 3 || focusedField !== 'pickup') {
      return;
    }

    const timer = setTimeout(() => {
      void resolveAddress(pickup, true);
    }, 550);

    return () => clearTimeout(timer);
  }, [focusedField, pickup, resolveAddress]);

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
  }, [destination, focusedField, resolveAddress]);

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

  const handleUserLocationUpdate = useCallback(
    (coords: Coordinates) => {
      setCurrentCoords(coords);

      if (initialLocationResolvedRef.current) {
        return;
      }

      initialLocationResolvedRef.current = true;
      void applyCurrentLocation(coords, { centerMap: true, forcePickup: true });
    },
    [applyCurrentLocation]
  );

  const handleUseCurrentLocation = useCallback(() => {
    if (!currentCoords) {
      return;
    }

    Keyboard.dismiss();
    setFocusedField(null);
    setRemotePlaceSuggestions([]);
    void applyCurrentLocation(currentCoords, { centerMap: true, forcePickup: true });
  }, [applyCurrentLocation, currentCoords]);

  const handleSwapLocations = useCallback(() => {
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
  }, [destination, destinationCoords, pickup, pickupCoords]);

  const applySuggestionToField = useCallback(
    (
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
    },
    []
  );

  const handlePlaceSuggestionSelect = useCallback(
    async (suggestion: DestinationSuggestion) => {
      const targetField = focusedField ?? 'destination';
      const fallbackLabel = buildSuggestionLabel(suggestion);

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
    },
    [applySuggestionToField, focusedField, language]
  );

  const handleDismissInputs = useCallback(() => {
    Keyboard.dismiss();
    setFocusedField(null);
    setRemotePlaceSuggestions([]);
  }, []);

  const handleOrderTaxi = useCallback(async () => {
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
  }, [
    destination,
    destinationCoords,
    isSubmittingRoute,
    language,
    navigation,
    pickup,
    pickupCoords,
    resolveAddress,
    routeDistanceKm,
    routeDurationMin,
    selectedRide,
  ]);

  const canOrderTaxi = Boolean(destination.trim()) && Boolean(pickup.trim()) && !isSubmittingRoute;
  const bottomInset = Math.max(insets.bottom, 10);
  const tabBarOffset = bottomInset + 104;
  const primaryActionTitle = canOrderTaxi ? t('home.ctaChooseTariff') : t('home.ctaAddDestination');
  const primaryActionSubtitle = canOrderTaxi ? t('home.orderTaxiEyebrowReady') : t('home.ctaAddDestinationHint');

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

  const quickPlaces = useMemo(() => LOCATION_SUGGESTIONS.slice(0, 4), []);

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
          routeLineColor={palette.surfaceStrong}
          showUserLocation={!permissionDenied}
          style={styles.map}
        />

        <View style={[styles.topBar, { top: insets.top + 10 }]}>
          <View style={styles.brandPill}>
            <View style={styles.brandIcon}>
              <Ionicons color={palette.backgroundSecondary} name="navigate" size={18} />
            </View>
            <View style={styles.brandCopy}>
              <Text style={styles.brandTitle}>SwiftTaxi</Text>
              <Text style={styles.brandMeta} numberOfLines={1}>{areaLabel}</Text>
            </View>
          </View>
          <MapControls
            onLocate={handleUseCurrentLocation}
            onSafety={() => navigation.navigate('Settings')}
            style={styles.mapControls}
          />
        </View>

        <BottomSheet
          bottomOffset={tabBarOffset}
          footer={
            <Button
              disabled={!canOrderTaxi}
              loading={isSubmittingRoute}
              onPress={handleOrderTaxi}
              rightIcon="arrow-forward"
              subtitle={primaryActionSubtitle}
              title={primaryActionTitle}
            />
          }
          style={focusedField ? styles.sheetExpanded : styles.sheet}
        >
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetTitle}>
                {destination.trim() ? t('home.tripPreview') : t('home.destinationPlaceholder')}
              </Text>
              <Text style={styles.sheetSubtitle}>
                {tripPreview
                  ? t('common.minutesShort', { count: tripPreview.durationMin })
                  : t('home.pickupFastNearby')}
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.86}
              onPress={() => navigation.navigate('Preorder', { pickup, destination, rideType: selectedRide })}
              style={styles.scheduleButton}
            >
              <Ionicons color={palette.text} name="calendar-outline" size={19} />
            </TouchableOpacity>
          </View>

          <AddressSearch
            destination={destination}
            destinationPlaceholder={t('home.destinationPlaceholder')}
            focusedField={focusedField}
            loadingSuggestion={isResolvingSuggestion}
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
            onSelectSuggestion={(suggestion) => void handlePlaceSuggestionSelect(suggestion)}
            onSwap={handleSwapLocations}
            onUseCurrentLocation={handleUseCurrentLocation}
            pickup={pickup}
            pickupPlaceholder={t('home.pickupPlaceholder')}
            suggestions={placeSuggestions}
          />

          {!focusedField ? (
            <>
              <ScrollView
                contentContainerStyle={styles.quickPlaces}
                horizontal
                keyboardShouldPersistTaps="handled"
                showsHorizontalScrollIndicator={false}
              >
                {quickPlaces.map((suggestion) => (
                  <TouchableOpacity
                    key={suggestion.id}
                    activeOpacity={0.86}
                    onPress={() => {
                      applySuggestionToField('destination', buildSuggestionLabel(suggestion), suggestion.coords, suggestion.subtitle);
                    }}
                    style={styles.quickPlace}
                  >
                    <Ionicons
                      color={palette.text}
                      name={suggestion.category === 'favorite' ? 'heart-outline' : 'time-outline'}
                      size={17}
                    />
                    <Text numberOfLines={1} style={styles.quickPlaceText}>{suggestion.title}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {tripPreview && priceRange ? (
                <View style={styles.routeReadyCard}>
                  <View style={styles.routeReadyIcon}>
                    <Ionicons color={palette.backgroundSecondary} name="navigate" size={17} />
                  </View>
                  <View style={styles.routeReadyCopy}>
                    <Text style={styles.routeReadyTitle}>{t('home.routeReadyTitle')}</Text>
                    <Text style={styles.routeReadyText}>
                      {t('common.minutesShort', { count: tripPreview.durationMin })} · {t('common.kilometersShort', { count: routeDistanceKm ?? tripPreview.distanceKm })} · {t('common.priceUah', { amount: `${priceRange.min}-${priceRange.max}` })}
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.routeReadyCard}>
                  <View style={styles.routeReadyIconMuted}>
                    <Ionicons color={palette.text} name="flash-outline" size={17} />
                  </View>
                  <View style={styles.routeReadyCopy}>
                    <Text style={styles.routeReadyTitle}>{t('home.pickupFastNearby')}</Text>
                    <Text style={styles.routeReadyText}>{t('home.ctaAddDestinationHint')}</Text>
                  </View>
                </View>
              )}

              {permissionDenied ? (
                <View style={styles.noticeRow}>
                  <Ionicons color={palette.danger} name="alert-circle-outline" size={16} />
                  <Text style={styles.noticeText}>{t('home.locationAccessOff')}</Text>
                </View>
              ) : null}

              {priceAlertsEnabled && tripPreview ? (
                <View style={styles.noticeRow}>
                  <Ionicons color={palette.primaryDeep} name="pricetag-outline" size={16} />
                  <Text style={styles.noticeText}>{t('home.priceAlertText')}</Text>
                </View>
              ) : null}
            </>
          ) : null}
        </BottomSheet>
      </KeyboardAvoidingView>
    </PassengerScreenLayout>
  );
}

const createStyles = (
  palette: PassengerPalette,
  radius: typeof import('../theme/passenger').passengerRadius
) =>
  StyleSheet.create({
    brandCopy: {
      flex: 1,
      gap: 2,
    },
    brandIcon: {
      alignItems: 'center',
      backgroundColor: palette.surfaceStrong,
      borderRadius: radius.md,
      height: 38,
      justifyContent: 'center',
      width: 38,
    },
    brandMeta: {
      color: palette.mutedText,
      fontSize: 12,
      fontWeight: '700',
      maxWidth: 150,
    },
    brandPill: {
      alignItems: 'center',
      backgroundColor: palette.tabBar,
      borderColor: palette.border,
      borderRadius: radius.xl,
      borderWidth: 1,
      flexDirection: 'row',
      gap: passengerSpacing.sm,
      maxWidth: 228,
      padding: passengerSpacing.sm,
    },
    brandTitle: {
      color: palette.text,
      fontSize: 15,
      fontWeight: '900',
    },
    destinationPin: {
      alignItems: 'center',
      backgroundColor: palette.danger,
      borderColor: '#FFFFFF',
      borderRadius: 16,
      borderWidth: 3,
      height: 32,
      justifyContent: 'center',
      width: 32,
    },
    map: {
      ...StyleSheet.absoluteFillObject,
    },
    mapControls: {
      alignItems: 'flex-end',
    },
    metric: {
      backgroundColor: palette.surfaceMuted,
      borderRadius: radius.md,
      flex: 1,
      gap: 4,
      padding: passengerSpacing.md,
    },
    metricLabel: {
      color: palette.mutedText,
      fontSize: 11,
      fontWeight: '900',
    },
    metricsRow: {
      flexDirection: 'row',
      gap: passengerSpacing.sm,
    },
    metricValue: {
      color: palette.text,
      fontSize: 13,
      fontWeight: '900',
    },
    metricWide: {
      backgroundColor: palette.surfaceMuted,
      borderRadius: radius.md,
      flex: 1,
      gap: 4,
      padding: passengerSpacing.md,
    },
    noticeRow: {
      alignItems: 'flex-start',
      backgroundColor: palette.surfaceMuted,
      borderRadius: radius.lg,
      flexDirection: 'row',
      gap: passengerSpacing.sm,
      padding: passengerSpacing.md,
    },
    noticeText: {
      color: palette.mutedText,
      flex: 1,
      fontSize: 12,
      fontWeight: '700',
      lineHeight: 17,
    },
    pickupPin: {
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      borderColor: palette.accent,
      borderRadius: 17,
      borderWidth: 3,
      height: 34,
      justifyContent: 'center',
      width: 34,
    },
    pickupPinInner: {
      backgroundColor: palette.accent,
      borderRadius: 6,
      height: 12,
      width: 12,
    },
    quickPlace: {
      alignItems: 'center',
      backgroundColor: palette.surfaceMuted,
      borderColor: palette.border,
      borderRadius: radius.pill,
      borderWidth: 1,
      flexDirection: 'row',
      gap: passengerSpacing.xs,
      paddingHorizontal: passengerSpacing.md,
      paddingVertical: passengerSpacing.sm,
    },
    quickPlaces: {
      flexDirection: 'row',
      gap: passengerSpacing.sm,
      paddingRight: passengerSpacing.xl,
    },
    quickPlaceText: {
      color: palette.text,
      flexShrink: 1,
      fontSize: 13,
      fontWeight: '800',
    },
    scheduleButton: {
      alignItems: 'center',
      backgroundColor: palette.surfaceMuted,
      borderRadius: radius.md,
      height: 44,
      justifyContent: 'center',
      width: 44,
    },
    screen: {
      flex: 1,
    },
    sheet: {
      maxHeight: 448,
    },
    sheetExpanded: {
      maxHeight: 640,
    },
    sheetHeader: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: passengerSpacing.md,
    },
    sheetSubtitle: {
      color: palette.mutedText,
      fontSize: 13,
      fontWeight: '800',
      marginTop: 3,
    },
    sheetTitle: {
      color: palette.text,
      fontSize: 24,
      fontWeight: '900',
    },
    topBar: {
      alignItems: 'flex-start',
      flexDirection: 'row',
      justifyContent: 'space-between',
      left: passengerSpacing.lg,
      position: 'absolute',
      right: passengerSpacing.lg,
    },
    routeReadyCard: {
      alignItems: 'center',
      backgroundColor: palette.surfaceMuted,
      borderRadius: radius.lg,
      flexDirection: 'row',
      gap: passengerSpacing.md,
      padding: passengerSpacing.md,
    },
    routeReadyCopy: {
      flex: 1,
      gap: 3,
    },
    routeReadyIcon: {
      alignItems: 'center',
      backgroundColor: palette.surfaceStrong,
      borderRadius: radius.md,
      height: 38,
      justifyContent: 'center',
      width: 38,
    },
    routeReadyIconMuted: {
      alignItems: 'center',
      backgroundColor: palette.primarySoft,
      borderRadius: radius.md,
      height: 38,
      justifyContent: 'center',
      width: 38,
    },
    routeReadyText: {
      color: palette.mutedText,
      fontSize: 12,
      fontWeight: '700',
      lineHeight: 17,
    },
    routeReadyTitle: {
      color: palette.text,
      fontSize: 14,
      fontWeight: '900',
    },
  });

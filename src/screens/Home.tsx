import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  View,
} from "react-native";
import * as Location from "expo-location";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import AddressInputCard from "../components/passenger/AddressInputCard";
import PassengerScreenLayout from "../components/passenger/PassengerScreenLayout";
import {
  DEFAULT_CITY_CENTER,
  DEFAULT_REGION,
  findLocationSuggestion,
  searchDestinationSuggestions,
  RIDE_OPTIONS,
} from "../data/passenger";
import { useI18n } from "../hooks/useI18n";
import { searchKyivPlaceSuggestions } from "../services/places/kyivPlaces";
import { RootStackParamList } from "../types/navigation";
import {
  Coordinates,
  DestinationSuggestion,
  RideOptionKey,
} from "../types/passenger";
import {
  AppButton,
  AppCard,
  AppIcon,
  AppText,
  ErrorState,
  LoadingState,
  MapControlButton,
  SectionHeading,
} from "../design-system/components/ui";
import BookingSheet from "../design-system/components/BookingSheet";
import { AdaptiveScreen } from "../design-system/components/AdaptiveScreen";
import { useAdaptiveLayout } from "../design-system/hooks/useAdaptiveLayout";
import { useDesign } from "../design-system/hooks/useDesign";
import { radii, space } from "../design-system/tokens";
import { SheetPosition } from "../design-system/adaptive";
import TaxiMap from "../features/maps/TaxiMap";
import { TaxiMapHandle } from "../features/maps/types";

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, "Home">;

const normalizeInputValue = (value: string): string =>
  value.trim().toLowerCase();

const formatAddressLabel = (
  place: Location.LocationGeocodedAddress | undefined,
  fallback: string,
) => {
  if (!place) {
    return fallback;
  }

  const line = [place.streetNumber, place.street]
    .filter(Boolean)
    .join(" ")
    .trim();
  return line || place.name || place.city || fallback;
};

const formatAreaLabel = (
  place: Location.LocationGeocodedAddress | undefined,
  fallback: string,
) => {
  if (!place) {
    return fallback;
  }

  return (
    [place.district, place.city, place.region].filter(Boolean).join(", ") ||
    fallback
  );
};

export default function HomeScreen({ navigation, route }: HomeScreenProps) {
  const mapRef = useRef<TaxiMapHandle | null>(null);
  const { height, insets, sidePanel } = useAdaptiveLayout();
  const { colors } = useDesign();
  const [availableHeight, setAvailableHeight] = useState(
    Math.max(240, height - insets.top - insets.bottom - 88),
  );
  const [sheetPosition, setSheetPosition] = useState<SheetPosition>("partial");
  const [placeStatus, setPlaceStatus] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const [routeError, setRouteError] = useState("");
  const [compactMap, setCompactMap] = useState(false);
  const compactMapRef = useRef(false);
  const [mapControlsVisible, setMapControlsVisible] = useState(true);
  const mapControlsRef = useRef(true);
  const mounted = useRef(true);
  const pickupEdited = useRef(false);
  const resolutionControllers = useRef<{
    pickup?: AbortController;
    destination?: AbortController;
  }>({});
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      resolutionControllers.current.pickup?.abort();
      resolutionControllers.current.destination?.abort();
    };
  }, []);
  const routeParams = route.name === "Home" ? route.params : undefined;
  const { t, language } = useI18n();
  const currentLocationLabel = t("home.currentLocation");
  const cityCenterLabel = t("home.cityCenter");
  const locationOffShortLabel = t("home.locationAccessOffShort");

  const [pickup, setPickup] = useState(() => t("home.detectingPickup"));
  const [destination, setDestination] = useState("");
  const [pickupCoords, setPickupCoords] = useState<Coordinates | null>(null);
  const [destinationCoords, setDestinationCoords] =
    useState<Coordinates | null>(null);
  const [currentCoords, setCurrentCoords] = useState<Coordinates | null>(null);
  const [selectedRide, setSelectedRide] = useState<RideOptionKey>("comfort");
  const [areaLabel, setAreaLabel] = useState(() => t("home.cityCenter"));
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [focusedField, setFocusedField] = useState<
    "pickup" | "destination" | null
  >(null);
  const [remotePlaceSuggestions, setRemotePlaceSuggestions] = useState<
    DestinationSuggestion[]
  >([]);
  const routeSubmitting = useRef(false);
  const [isSubmittingRoute, setIsSubmittingRoute] = useState(false);
  const pickupValueRef = useRef(pickup);
  const destinationValueRef = useRef(destination);

  const activeQuery =
    focusedField === "pickup"
      ? pickup
      : focusedField === "destination"
        ? destination
        : "";
  const localPlaceSuggestions = useMemo(() => {
    if (!focusedField) {
      return [];
    }

    return searchDestinationSuggestions(
      activeQuery,
      activeQuery.trim() ? 4 : 4,
    );
  }, [activeQuery, focusedField]);

  const placeSuggestions = useMemo(() => {
    if (!focusedField) {
      return [];
    }

    if (!activeQuery.trim()) {
      return localPlaceSuggestions;
    }

    const mergedSuggestions = [
      ...remotePlaceSuggestions,
      ...localPlaceSuggestions,
    ];
    const seen = new Set<string>();

    return mergedSuggestions
      .filter((suggestion) => {
        const key = `${suggestion.title.trim().toLowerCase()}|${suggestion.subtitle.trim().toLowerCase()}`;

        if (seen.has(key)) {
          return false;
        }

        seen.add(key);
        return true;
      })
      .slice(0, 6);
  }, [
    activeQuery,
    focusedField,
    localPlaceSuggestions,
    remotePlaceSuggestions,
  ]);

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

        if (status !== "granted") {
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

        pickupValueRef.current = formatAddressLabel(
          address,
          currentLocationLabel,
        );
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
        top: 80,
        right: 40,
        bottom: 48,
        left: 40,
      },
    });
  }, [pickupCoords, destinationCoords]);

  useEffect(() => {
    if (!focusedField || activeQuery.trim().length < 2) {
      setRemotePlaceSuggestions([]);
      setPlaceStatus("idle");
      return;
    }

    setPlaceStatus("loading");
    setRemotePlaceSuggestions([]);
    const controller = new AbortController();
    const timer = setTimeout(() => {
      searchKyivPlaceSuggestions(activeQuery, language, 6, controller.signal)
        .then((suggestions) => {
          if (!controller.signal.aborted) {
            setRemotePlaceSuggestions(suggestions);
            setPlaceStatus("ready");
          }
        })
        .catch((error: unknown) => {
          if (
            controller.signal.aborted ||
            (error instanceof Error && error.name === "AbortError")
          ) {
            return;
          }

          setRemotePlaceSuggestions([]);
          setPlaceStatus("error");
        });
    }, 220);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [activeQuery, focusedField, language]);

  const resolveAddress = async (
    label: string,
    isPickup: boolean,
  ): Promise<Coordinates | null> => {
    const field = isPickup ? "pickup" : "destination";
    resolutionControllers.current[field]?.abort();
    const controller = new AbortController();
    resolutionControllers.current[field] = controller;
    const normalizedLabel = label.trim();
    const applyCoordinates = (coords: Coordinates): Coordinates | null => {
      if (!mounted.current || controller.signal.aborted) return null;
      const currentFieldValue = isPickup
        ? pickupValueRef.current
        : destinationValueRef.current;

      if (
        normalizeInputValue(currentFieldValue) !==
        normalizeInputValue(normalizedLabel)
      ) {
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
      const currentFieldValue = isPickup
        ? pickupValueRef.current
        : destinationValueRef.current;

      if (
        normalizeInputValue(currentFieldValue) !==
        normalizeInputValue(normalizedLabel)
      ) {
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
      normalizeInputValue(normalizedLabel) ===
        normalizeInputValue(currentLocationLabel)
    ) {
      return applyCoordinates(currentCoords);
    }

    if (
      normalizeInputValue(normalizedLabel) ===
      normalizeInputValue(cityCenterLabel)
    ) {
      return applyCoordinates(DEFAULT_CITY_CENTER);
    }

    try {
      const liveSuggestions = await searchKyivPlaceSuggestions(
        normalizedLabel,
        language,
        1,
        controller.signal,
      );
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
    const targetField = focusedField ?? "destination";

    if (targetField === "pickup") {
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

  const handleDismissInputs = useCallback(() => {
    Keyboard.dismiss();
    setFocusedField(null);
    setRemotePlaceSuggestions([]);
    setSheetPosition("partial");
  }, []);

  const handleOrderTaxi = async () => {
    if (routeSubmitting.current) {
      return;
    }

    if (!destination.trim()) {
      setFocusedField("destination");
      return;
    }

    Keyboard.dismiss();
    setRouteError("");
    routeSubmitting.current = true;
    setIsSubmittingRoute(true);
    try {
      const nextPickupCoords =
        pickup.trim() && !pickupCoords
          ? await resolveAddress(pickup, true)
          : pickupCoords;
      const nextDestinationCoords =
        destination.trim() && !destinationCoords
          ? await resolveAddress(destination, false)
          : destinationCoords;

      if (!pickup.trim() || !nextPickupCoords) {
        setFocusedField("pickup");
        setRouteError(t("ui.pickupNotFound"));
        return;
      }

      if (!destination.trim() || !nextDestinationCoords) {
        setFocusedField("destination");
        setRouteError(t("ui.destinationNotFound"));
        return;
      }

      if (
        !mounted.current ||
        pickupValueRef.current !== pickup ||
        destinationValueRef.current !== destination
      )
        return;
      navigation.navigate("VehicleSelection", {
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

  const fitRoute = useCallback(() => {
    if (pickupCoords && destinationCoords)
      mapRef.current?.fitToCoordinates([pickupCoords, destinationCoords], {
        animated: true,
        edgePadding: { top: 88, right: 40, bottom: 48, left: 40 },
      });
    else if (pickupCoords)
      mapRef.current?.animateToRegion({
        ...pickupCoords,
        latitudeDelta: DEFAULT_REGION.latitudeDelta,
        longitudeDelta: DEFAULT_REGION.longitudeDelta,
      });
  }, [pickupCoords, destinationCoords]);
  const focus = (field: "pickup" | "destination") => {
    setFocusedField(field);
    setSheetPosition("expanded");
  };
  return (
    <PassengerScreenLayout activeRoute="Home" showHeader={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View
          style={{ flex: 1 }}
          onLayout={(event) =>
            setAvailableHeight(event.nativeEvent.layout.height)
          }
        >
          <AdaptiveScreen
            panel={
              <BookingSheet
                title={t("ui.whereTo")}
                subtitle={t("ui.homePanelHint")}
                position={sheetPosition}
                onPositionChange={setSheetPosition}
                availableHeight={availableHeight}
                footer={
                  <AppButton
                    label={t("ui.reviewOptions")}
                    icon="arrow-forward"
                    disabled={!canOrderTaxi}
                    loading={isSubmittingRoute}
                    onPress={() => {
                      void handleOrderTaxi();
                    }}
                  />
                }
              >
                <AddressInputCard
                  headerLabel={t("home.routeHeader")}
                  destination={destination}
                  destinationLabel={t("home.destinationLabel")}
                  destinationPlaceholder={t("home.destinationPlaceholder")}
                  focusedField={focusedField}
                  onDestinationChange={(value) => {
                    resolutionControllers.current.destination?.abort();
                    destinationValueRef.current = value;
                    setDestination(value);
                    setDestinationCoords(null);
                    setRouteError("");
                    focus("destination");
                  }}
                  onDestinationFocus={() => focus("destination")}
                  onPickupChange={(value) => {
                    pickupEdited.current = true;
                    resolutionControllers.current.pickup?.abort();
                    pickupValueRef.current = value;
                    setPickup(value);
                    setPickupCoords(null);
                    setRouteError("");
                    focus("pickup");
                  }}
                  onPickupFocus={() => focus("pickup")}
                  onSwap={handleSwapLocations}
                  onUseCurrentLocation={handleUseCurrentLocation}
                  pickup={pickup}
                  pickupLabel={t("home.pickupLabel")}
                  pickupPlaceholder={t("home.pickupPlaceholder")}
                />
                {focusedField ? (
                  <View style={{ gap: space.md }}>
                    <SectionHeading title={t("ui.suggestions")} />
                    {placeStatus === "loading" ? (
                      <LoadingState label={t("ui.searchingPlaces")} />
                    ) : null}
                    {placeSuggestions.map((suggestion) => (
                      <Pressable
                        key={suggestion.id}
                        accessibilityRole="button"
                        onPress={() => {
                          handlePlaceSuggestionSelect(suggestion);
                          setSheetPosition("partial");
                        }}
                        style={({ pressed }) => ({
                          minHeight: 56,
                          flexDirection: "row",
                          alignItems: "center",
                          gap: space.md,
                          paddingVertical: space.md,
                          borderBottomWidth: 1,
                          borderBottomColor: colors.border,
                          opacity: pressed ? 0.65 : 1,
                        })}
                      >
                        <AppIcon
                          name="location-outline"
                          tone="secondary"
                          size={20}
                        />
                        <View style={{ flex: 1, gap: space.xs }}>
                          <AppText>{suggestion.title}</AppText>
                          <AppText tone="secondary" variant="secondary">
                            {suggestion.subtitle}
                          </AppText>
                        </View>
                        <AppIcon
                          name="arrow-up-left-box"
                          tone="secondary"
                          size={18}
                        />
                      </Pressable>
                    ))}
                    {placeStatus === "error" ? (
                      <AppText
                        tone="warning"
                        accessibilityLiveRegion="polite"
                        variant="secondary"
                      >
                        {t("ui.placeSearchFailed")}
                      </AppText>
                    ) : null}
                    {placeStatus === "ready" && !placeSuggestions.length ? (
                      <AppText tone="secondary">
                        {t("home.noQuickMatchText")}
                      </AppText>
                    ) : null}
                  </View>
                ) : null}
                <View style={{ gap: space.md }}>
                  <SectionHeading title={t("ui.rideClass")} />
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: space.sm,
                    }}
                  >
                    {RIDE_OPTIONS.map((option) => (
                      <AppButton
                        key={option.key}
                        label={t(`rideOptions.${option.key}.label`)}
                        variant={
                          selectedRide === option.key ? "primary" : "secondary"
                        }
                        accessibilityState={{
                          selected: selectedRide === option.key,
                        }}
                        onPress={() => setSelectedRide(option.key)}
                        style={{ flexGrow: 1, paddingHorizontal: space.md }}
                      />
                    ))}
                  </View>
                </View>
                <AppCard>
                  <AppText variant="secondary" tone="secondary">
                    {t("ui.farePending")}
                  </AppText>
                  {destinationCoords ? (
                    <AppText variant="caption" tone="secondary">
                      {t("home.routeLineNotice")}
                    </AppText>
                  ) : null}
                </AppCard>
                {permissionDenied ? (
                  <AppText variant="secondary" tone="warning">
                    {t("home.locationAccessOff")}
                  </AppText>
                ) : null}
                {routeError ? (
                  <ErrorState
                    title={t("ui.checkAddress")}
                    description={routeError}
                  />
                ) : null}
              </BookingSheet>
            }
            map={
              <View
                style={{ flex: 1, backgroundColor: colors.inset }}
                onLayout={(event) => {
                  const next = event.nativeEvent.layout.height < 200;
                  const controls = event.nativeEvent.layout.height >= 100;
                  if (controls !== mapControlsRef.current) { mapControlsRef.current = controls; setMapControlsVisible(controls); }
                  if (next !== compactMapRef.current) {
                    compactMapRef.current = next;
                    setCompactMap(next);
                  }
                }}
              >
                <TaxiMap
                  ref={mapRef}
                  pickup={pickupCoords}
                  destination={destinationCoords}
                  pickupLabel={pickupCoords ? pickup : undefined}
                  destinationLabel={destinationCoords ? destination : undefined}
                  showUserLocation={currentCoords !== null && !permissionDenied}
                  onPress={handleDismissInputs}
                  onViewportChange={fitRoute}
                />
                {!compactMap || sidePanel ? (
                  <View
                    pointerEvents="box-none"
                    style={{
                      position: "absolute",
                      top: space.lg,
                      left: space.lg,
                      right: space.lg,
                      flexDirection: "row",
                      alignItems: "flex-start",
                      gap: space.md,
                    }}
                  >
                    <View
                      style={{
                        flex: 1,
                        maxWidth: sidePanel ? 340 : 300,
                        backgroundColor: colors.surface,
                        borderWidth: 1,
                        borderColor: colors.border,
                        borderRadius: radii.lg,
                        padding: space.md,
                        gap: space.xs,
                      }}
                    >
                      <AppText variant="caption" tone="primary">
                        {t("ui.pickupMap")}
                      </AppText>
                      <AppText variant="secondary">
                        {focusedField ? areaLabel : pickup}
                      </AppText>
                    </View>
                    <MapControlButton
                      icon="person-outline"
                      label={t("tabs.profile")}
                      onPress={() => navigation.navigate("Settings")}
                    />
                  </View>
                ) : null}
                <View
                  style={{
                    position: "absolute",
                    display: mapControlsVisible ? "flex" : "none",
                    bottom: space.xl,
                    right: space.lg,
                    gap: space.sm,
                    flexDirection: compactMap ? "row" : "column",
                  }}
                >
                  <MapControlButton
                    icon="scan-outline"
                    label={t("ui.routeOverview")}
                    onPress={fitRoute}
                    disabled={!pickupCoords || !destinationCoords}
                  />
                  <MapControlButton
                    icon="locate-outline"
                    label={t("accessibility.locate")}
                    onPress={handleUseCurrentLocation}
                    disabled={!currentCoords}
                  />
                </View>
              </View>
            }
          />
        </View>
      </KeyboardAvoidingView>
    </PassengerScreenLayout>
  );
}

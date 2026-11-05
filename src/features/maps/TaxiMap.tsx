import React, {
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { DEFAULT_REGION } from "../../data/passenger";
import { useDesign } from "../../design-system/hooks/useDesign";
import { radii, space } from "../../design-system/tokens";
import { TaxiMapHandle, TaxiMapProps } from "./types";
const TaxiMap = forwardRef<TaxiMapHandle, TaxiMapProps>(function TaxiMap(
  {
    pickup,
    destination,
    pickupLabel,
    destinationLabel,
    showUserLocation,
    onPress,
    onViewportChange,
  },
  ref,
) {
  const map = useRef<MapView | null>(null);
  const resize = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ready = useRef(false);
  const { colors, isDark } = useDesign();
  useImperativeHandle(
    ref,
    () => ({
      animateToRegion: (region, duration) =>
        map.current?.animateToRegion(region, duration),
      fitToCoordinates: (coordinates, options) =>
        map.current?.fitToCoordinates(coordinates, options),
    }),
    [],
  );
  useEffect(
    () => () => {
      if (resize.current) clearTimeout(resize.current);
    },
    [],
  );
  const fit = () => {
    if (onViewportChange) {
      onViewportChange();
      return;
    }
    if (pickup && destination)
      map.current?.fitToCoordinates([pickup, destination], {
        animated: true,
        edgePadding: { top: 40, right: 40, bottom: 40, left: 40 },
      });
  };
  useEffect(() => {
    if (ready.current) fit();
  }, [
    pickup?.latitude,
    pickup?.longitude,
    destination?.latitude,
    destination?.longitude,
  ]);
  const layoutChanged = () => {
    if (resize.current) clearTimeout(resize.current);
    resize.current = setTimeout(() => {
      if (ready.current) fit();
    }, 160);
  };
  return (
    <MapView
      ref={map}
      initialRegion={DEFAULT_REGION}
      style={StyleSheet.absoluteFill}
      userInterfaceStyle={isDark ? "dark" : "light"}
      showsUserLocation={showUserLocation}
      showsMyLocationButton={false}
      showsCompass={false}
      onPress={onPress}
      onLayout={layoutChanged}
      onMapReady={() => {
        ready.current = true;
        fit();
      }}
    >
      {pickup ? (
        <Marker
          key={`pickup-${isDark}`}
          coordinate={pickup}
          title={pickupLabel}
          tracksViewChanges={false}
        >
          <View
            style={{
              padding: space.sm,
              backgroundColor: colors.surface,
              borderColor: colors.primary,
              borderWidth: 2,
              borderRadius: radii.pill,
            }}
          >
            <View
              style={{
                width: 16,
                height: 16,
                borderRadius: radii.pill,
                backgroundColor: colors.primary,
              }}
            />
          </View>
        </Marker>
      ) : null}
      {destination ? (
        <Marker
          key={`destination-${isDark}`}
          coordinate={destination}
          title={destinationLabel}
          tracksViewChanges={false}
        >
          <View
            style={{
              padding: space.sm,
              backgroundColor: colors.surface,
              borderColor: colors.text,
              borderWidth: 2,
              borderRadius: radii.pill,
            }}
          >
            <View
              style={{
                width: 14,
                height: 14,
                backgroundColor: colors.text,
                transform: [{ rotate: "45deg" }],
              }}
            />
          </View>
        </Marker>
      ) : null}
      {pickup && destination ? (
        <Polyline
          coordinates={[pickup, destination]}
          strokeColor={colors.primary}
          strokeWidth={3}
          lineDashPattern={[6, 6]}
        />
      ) : null}
    </MapView>
  );
});
export default memo(TaxiMap);

import React, { useEffect, useMemo, useRef } from 'react';
import { Platform, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, type EdgePadding } from 'react-native-maps';
import { hasGoogleMapsApiKey } from '../../config/googleMaps';
import { DEFAULT_CITY_CENTER } from '../../data/passenger';
import { getRegionFromCoordinates } from '../../services/maps/geometry';
import { Coordinates } from '../../types/passenger';

export interface RouteMapCameraRef {
  fitBounds: (
    ne: [number, number],
    sw: [number, number],
    paddingConfig?: number | number[],
    animationDuration?: number
  ) => void;
  setCamera: (config: {
    animationDuration?: number;
    centerCoordinate?: [number, number];
    zoomLevel?: number;
  }) => void;
}

interface RouteMarker {
  anchor?: {
    x: number;
    y: number;
  };
  coords: Coordinates;
  element: React.ReactElement;
  id: string;
}

interface GoogleRouteMapProps {
  cameraRef?: React.RefObject<RouteMapCameraRef | null>;
  language: 'en' | 'uk';
  markers: RouteMarker[];
  onMapPress?: () => void;
  onUserLocationUpdate?: (coords: Coordinates) => void;
  routeCoordinates?: Coordinates[];
  routeLineColor?: string;
  scrollEnabled?: boolean;
  showUserLocation?: boolean;
  style: StyleProp<ViewStyle>;
}

const paddingValueToEdgePadding = (paddingConfig?: number | number[]): EdgePadding => {
  if (Array.isArray(paddingConfig)) {
    const [top = 0, right = top, bottom = top, left = right] = paddingConfig;
    return { bottom, left, right, top };
  }

  const uniform = paddingConfig ?? 0;
  return {
    bottom: uniform,
    left: uniform,
    right: uniform,
    top: uniform,
  };
};

export default function GoogleRouteMap({
  cameraRef,
  language,
  markers,
  onMapPress,
  onUserLocationUpdate,
  routeCoordinates = [],
  routeLineColor = '#D18C00',
  scrollEnabled = true,
  showUserLocation = false,
  style,
}: GoogleRouteMapProps) {
  const mapRef = useRef<MapView | null>(null);
  const initialRegion = useMemo(() => {
    return getRegionFromCoordinates(
      [...routeCoordinates, ...markers.map((marker) => marker.coords)],
      DEFAULT_CITY_CENTER
    );
  }, [markers, routeCoordinates]);

  useEffect(() => {
    if (!cameraRef) {
      return;
    }

    cameraRef.current = {
      fitBounds: (ne, sw, paddingConfig = 0) => {
        mapRef.current?.fitToCoordinates(
          [
            { latitude: sw[1], longitude: sw[0] },
            { latitude: ne[1], longitude: ne[0] },
          ],
          {
            animated: true,
            edgePadding: paddingValueToEdgePadding(paddingConfig),
          }
        );
      },
      setCamera: ({ animationDuration = 600, centerCoordinate, zoomLevel }) => {
        const center = centerCoordinate
          ? {
              latitude: centerCoordinate[1],
              longitude: centerCoordinate[0],
            }
          : undefined;

        mapRef.current?.animateCamera(
          {
            center,
            zoom: zoomLevel,
          },
          {
            duration: animationDuration,
          }
        );
      },
    };

    return () => {
      cameraRef.current = null;
    };
  }, [cameraRef]);

  if (!hasGoogleMapsApiKey()) {
    const title =
      language === 'uk' ? 'Google Maps недоступна' : 'Google Maps unavailable';
    const description =
      language === 'uk'
        ? 'Додайте EXPO_PUBLIC_GOOGLE_MAPS_API_KEY та перебудуйте застосунок, щоб увімкнути карти, підказки адрес і маршрути.'
        : 'Add EXPO_PUBLIC_GOOGLE_MAPS_API_KEY and rebuild the app to enable maps, autocomplete, and routing.';

    return (
      <View style={[styles.unavailableCard, style]}>
        <Text style={styles.unavailableTitle}>{title}</Text>
        <Text style={styles.unavailableText}>{description}</Text>
      </View>
    );
  }

  return (
    <MapView
      showsCompass={false}
      showsIndoors={false}
      showsMyLocationButton={false}
      showsPointsOfInterests={false}
      showsTraffic
      toolbarEnabled={false}
      provider={Platform.OS === 'android' || Platform.OS === 'ios' ? PROVIDER_GOOGLE : undefined}
      onPress={() => onMapPress?.()}
      onUserLocationChange={(event) => {
        const coordinate = event.nativeEvent.coordinate;

        if (!coordinate) {
          return;
        }

        onUserLocationUpdate?.({
          latitude: coordinate.latitude,
          longitude: coordinate.longitude,
        });
      }}
      initialRegion={initialRegion}
      pitchEnabled={false}
      rotateEnabled={false}
      scrollEnabled={scrollEnabled}
      showsUserLocation={showUserLocation}
      style={style}
      zoomEnabled={scrollEnabled}
      ref={(instance) => {
        mapRef.current = instance;
      }}
    >
      {routeCoordinates.length > 1 ? (
        <Polyline
          coordinates={routeCoordinates}
          geodesic
          lineCap="round"
          lineJoin="round"
          strokeColor={routeLineColor}
          strokeWidth={5}
        />
      ) : null}

      {markers.map((marker) => (
        <Marker
          key={marker.id}
          anchor={marker.anchor}
          coordinate={marker.coords}
          tracksViewChanges={false}
        >
          {marker.element}
        </Marker>
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  unavailableCard: {
    alignItems: 'center',
    backgroundColor: '#F4F1EA',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  unavailableText: {
    color: '#4B5563',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  unavailableTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
});

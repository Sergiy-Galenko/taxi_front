import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Coordinates } from '../../types/passenger';
import { buildLineStringFeature, toMapboxCoordinate } from '../../services/mapbox/geometry';
import { getMapboxModule, getMapboxRuntimeIssue } from '../../services/mapbox/native';

export interface MapboxCameraRef {
  flyTo: (centerCoordinate: [number, number], animationDuration?: number) => void;
  fitBounds: (
    ne: [number, number],
    sw: [number, number],
    paddingConfig?: number | number[],
    animationDuration?: number
  ) => void;
  moveBy: (props: {
    animationDuration?: number;
    animationMode?: 'easeTo' | 'linearTo';
    scaleFactor?: number;
    x: number;
    y: number;
  }) => void;
  moveTo: (centerCoordinate: [number, number], animationDuration?: number) => void;
  scaleBy: (props: {
    animationDuration?: number;
    animationMode?: 'easeTo' | 'linearTo';
    scaleFactor: number;
    x: number;
    y: number;
  }) => void;
  setCamera: (config: {
    animationDuration?: number;
    animationMode?: 'flyTo' | 'easeTo' | 'linearTo' | 'moveTo' | 'none';
    centerCoordinate?: [number, number];
    zoomLevel?: number;
  }) => void;
  zoomTo: (zoomLevel: number, animationDuration?: number) => void;
}

interface RouteMarker {
  allowOverlap?: boolean;
  anchor?: {
    x: number;
    y: number;
  };
  coords: Coordinates;
  element: React.ReactElement;
  id: string;
}

interface MapboxRouteMapProps {
  cameraRef?: React.RefObject<MapboxCameraRef | null>;
  language: 'en' | 'uk';
  mapStyleUrl: string;
  markers: RouteMarker[];
  onMapPress?: () => void;
  onUserLocationUpdate?: (coords: Coordinates) => void;
  routeCoordinates?: Coordinates[];
  routeLineColor?: string;
  scrollEnabled?: boolean;
  showUserLocation?: boolean;
  style: StyleProp<ViewStyle>;
}

export default function MapboxRouteMap({
  cameraRef,
  language,
  mapStyleUrl,
  markers,
  onMapPress,
  onUserLocationUpdate,
  routeCoordinates = [],
  routeLineColor = '#D18C00',
  scrollEnabled = true,
  showUserLocation = false,
  style,
}: MapboxRouteMapProps) {
  const runtimeIssue = getMapboxRuntimeIssue();

  if (runtimeIssue) {
    const title =
      language === 'uk' ? 'Карта Mapbox недоступна' : 'Mapbox map unavailable';
    const description =
      runtimeIssue === 'missing_native_module'
        ? language === 'uk'
          ? 'Потрібен development build з нативним модулем Mapbox. Запускайте застосунок через dev client, а не Expo Go.'
          : 'A development build with the native Mapbox module is required. Launch the app with a dev client instead of Expo Go.'
        : language === 'uk'
          ? 'Немає EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN. Додайте токен Mapbox у середовище та перезапустіть застосунок.'
          : 'EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN is missing. Add your Mapbox token to the environment and restart the app.';

    return (
      <View style={[styles.unavailableCard, style]}>
        <Text style={styles.unavailableTitle}>{title}</Text>
        <Text style={styles.unavailableText}>{description}</Text>
      </View>
    );
  }

  const Mapbox = getMapboxModule();

  if (!Mapbox) {
    return <View style={style} />;
  }

  return (
    <Mapbox.MapView
      attributionEnabled={false}
      compassEnabled={false}
      localizeLabels={{ locale: language }}
      logoEnabled={false}
      onPress={() => onMapPress?.()}
      onUserLocationUpdate={(event: { coords?: { latitude: number; longitude: number } }) => {
        const nextCoords = event.coords;

        if (!nextCoords) {
          return;
        }

        onUserLocationUpdate?.({
          latitude: nextCoords.latitude,
          longitude: nextCoords.longitude,
        });
      }}
      pitchEnabled={false}
      rotateEnabled={false}
      scaleBarEnabled={false}
      scrollEnabled={scrollEnabled}
      style={style}
      styleURL={mapStyleUrl}
      zoomEnabled={scrollEnabled}
    >
      <Mapbox.Camera
        ref={cameraRef as unknown as React.Ref<any>}
        defaultSettings={{
          centerCoordinate: toMapboxCoordinate(markers[0]?.coords || { latitude: 50.4501, longitude: 30.5234 }),
          zoomLevel: 13,
        }}
      />

      {showUserLocation ? (
        <Mapbox.LocationPuck
          puckBearing="course"
          puckBearingEnabled
          pulsing={{ isEnabled: true, radius: 36 }}
          visible
        />
      ) : null}

      {routeCoordinates.length > 1 ? (
        <Mapbox.ShapeSource id="route-shape-source" shape={buildLineStringFeature(routeCoordinates)}>
          <Mapbox.LineLayer
            id="route-line-layer"
            style={{
              lineCap: 'round',
              lineColor: routeLineColor,
              lineJoin: 'round',
              lineWidth: 4,
            }}
          />
        </Mapbox.ShapeSource>
      ) : null}

      {markers.map((marker) => (
        <Mapbox.MarkerView
          key={marker.id}
          allowOverlap={marker.allowOverlap ?? true}
          allowOverlapWithPuck
          anchor={marker.anchor || { x: 0.5, y: 0.5 }}
          coordinate={toMapboxCoordinate(marker.coords)}
          isSelected={false}
        >
          {marker.element}
        </Mapbox.MarkerView>
      ))}
    </Mapbox.MapView>
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

import React, { memo, useEffect, useMemo, useRef } from 'react';
import { Image, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
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

const TILE_ZOOM = 13;
const TILE_GRID_SIZE = 3;

const longitudeToTileX = (longitude: number, zoom: number) =>
  ((longitude + 180) / 360) * 2 ** zoom;

const latitudeToTileY = (latitude: number, zoom: number) => {
  const latitudeRad = (latitude * Math.PI) / 180;
  return (
    ((1 - Math.log(Math.tan(latitudeRad) + 1 / Math.cos(latitudeRad)) / Math.PI) / 2) *
    2 ** zoom
  );
};

const clampPercent = (value: number) => Math.max(6, Math.min(94, value));

function GoogleRouteMap({
  cameraRef,
  language,
  markers,
  onMapPress,
  routeCoordinates = [],
  style,
}: GoogleRouteMapProps) {
  const mapRef = useRef<any>(null);
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
      fitBounds: () => undefined,
      setCamera: () => undefined,
    };

    return () => {
      cameraRef.current = null;
    };
  }, [cameraRef]);

  const hasApiKey = hasGoogleMapsApiKey();
  const attribution = hasApiKey
    ? language === 'uk'
      ? 'Демо-карта'
      : 'Demo map'
    : language === 'uk'
      ? 'OpenStreetMap'
      : 'OpenStreetMap';

  return (
    <View ref={mapRef} onTouchEnd={onMapPress} style={style}>
      <MapFallback
        initialRegion={initialRegion}
        markers={markers}
        routeCoordinates={routeCoordinates}
        attribution={attribution}
      />
    </View>
  );
}

export default memo(GoogleRouteMap);

interface MapFallbackProps {
  attribution: string;
  initialRegion: ReturnType<typeof getRegionFromCoordinates>;
  markers: RouteMarker[];
  routeCoordinates: Coordinates[];
}

function MapFallback({
  attribution,
  initialRegion,
  markers,
  routeCoordinates,
}: MapFallbackProps) {
  const tileData = useMemo(() => {
    const centerTileX = longitudeToTileX(initialRegion.longitude, TILE_ZOOM);
    const centerTileY = latitudeToTileY(initialRegion.latitude, TILE_ZOOM);
    const baseX = Math.floor(centerTileX) - 1;
    const baseY = Math.floor(centerTileY) - 1;

    return Array.from({ length: TILE_GRID_SIZE * TILE_GRID_SIZE }, (_, index) => {
      const col = index % TILE_GRID_SIZE;
      const row = Math.floor(index / TILE_GRID_SIZE);
      const x = baseX + col;
      const y = baseY + row;

      return {
        id: `${x}-${y}`,
        left: `${col * (100 / TILE_GRID_SIZE)}%`,
        top: `${row * (100 / TILE_GRID_SIZE)}%`,
        uri: `https://tile.openstreetmap.org/${TILE_ZOOM}/${x}/${y}.png`,
      };
    });
  }, [initialRegion.latitude, initialRegion.longitude]);

  const markerPositions = useMemo(() => {
    const centerTileX = longitudeToTileX(initialRegion.longitude, TILE_ZOOM);
    const centerTileY = latitudeToTileY(initialRegion.latitude, TILE_ZOOM);
    const scale = 100 / TILE_GRID_SIZE;

    return markers.map((marker) => {
      const x = longitudeToTileX(marker.coords.longitude, TILE_ZOOM);
      const y = latitudeToTileY(marker.coords.latitude, TILE_ZOOM);

      return {
        id: marker.id,
        left: `${clampPercent(50 + (x - centerTileX) * scale)}%`,
        top: `${clampPercent(50 + (y - centerTileY) * scale)}%`,
      };
    });
  }, [initialRegion.latitude, initialRegion.longitude, markers]);

  return (
    <View style={styles.unavailableCard}>
      <View style={styles.fallbackGrid}>
        {tileData.map((tile) => (
          <Image
            key={tile.id}
            resizeMode="cover"
            source={{ uri: tile.uri }}
            style={[styles.tile, { left: tile.left as any, top: tile.top as any }]}
          />
        ))}
        <View pointerEvents="none" style={styles.tileOverlay} />
        {routeCoordinates.length > 1 ? <View style={styles.fallbackRouteLine} /> : null}
        {markerPositions.map((marker) => (
          <View
            key={marker.id}
            style={[
              styles.fallbackMarker,
              marker.id === 'destination' && styles.fallbackDestinationMarker,
              { left: marker.left as any, top: marker.top as any },
            ]}
          />
        ))}
        <Text style={styles.attribution}>© {attribution}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  attribution: {
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderRadius: 999,
    bottom: 12,
    color: '#64716C',
    fontSize: 10,
    fontWeight: '700',
    left: 12,
    paddingHorizontal: 9,
    paddingVertical: 5,
    position: 'absolute',
  },
  fallbackDestinationMarker: {
    backgroundColor: '#C94A4A',
  },
  fallbackGrid: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#E9EFE9',
  },
  fallbackMarker: {
    backgroundColor: '#197A68',
    borderColor: '#FFFFFF',
    borderRadius: 13,
    borderWidth: 3,
    height: 26,
    position: 'absolute',
    width: 26,
  },
  fallbackRouteLine: {
    backgroundColor: 'rgba(17, 24, 23, 0.78)',
    borderRadius: 999,
    height: 6,
    left: '22%',
    position: 'absolute',
    right: '22%',
    top: '52%',
    transform: [{ rotate: '-14deg' }],
  },
  tile: {
    height: '33.34%',
    position: 'absolute',
    width: '33.34%',
  },
  tileOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(233, 239, 233, 0.12)',
  },
  unavailableCard: {
    alignItems: 'center',
    backgroundColor: '#E9EFE9',
    flex: 1,
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: 24,
    paddingVertical: 20,
    width: '100%',
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

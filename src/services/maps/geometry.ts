import { Coordinates } from '../../types/passenger';

export type CoordinateTuple = [number, number];

const DEFAULT_LATITUDE_DELTA = 0.08;
const DEFAULT_LONGITUDE_DELTA = 0.08;

export const getBoundsFromCoordinates = (
  coordinates: Coordinates[]
): { ne: CoordinateTuple; sw: CoordinateTuple } | null => {
  if (!coordinates.length) {
    return null;
  }

  const latitudes = coordinates.map((coordinate) => coordinate.latitude);
  const longitudes = coordinates.map((coordinate) => coordinate.longitude);

  return {
    ne: [Math.max(...longitudes), Math.max(...latitudes)],
    sw: [Math.min(...longitudes), Math.min(...latitudes)],
  };
};

export const getCenterFromCoordinates = (
  coordinates: Coordinates[],
  fallback: Coordinates
): Coordinates => {
  const bounds = getBoundsFromCoordinates(coordinates);

  if (!bounds) {
    return fallback;
  }

  return {
    latitude: (bounds.ne[1] + bounds.sw[1]) / 2,
    longitude: (bounds.ne[0] + bounds.sw[0]) / 2,
  };
};

export const getRegionFromCoordinates = (
  coordinates: Coordinates[],
  fallback: Coordinates
): {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
} => {
  const bounds = getBoundsFromCoordinates(coordinates);

  if (!bounds) {
    return {
      latitude: fallback.latitude,
      longitude: fallback.longitude,
      latitudeDelta: DEFAULT_LATITUDE_DELTA,
      longitudeDelta: DEFAULT_LONGITUDE_DELTA,
    };
  }

  const latitudeDelta = Math.max(
    Math.abs(bounds.ne[1] - bounds.sw[1]) * 1.8,
    DEFAULT_LATITUDE_DELTA / 4
  );
  const longitudeDelta = Math.max(
    Math.abs(bounds.ne[0] - bounds.sw[0]) * 1.8,
    DEFAULT_LONGITUDE_DELTA / 4
  );

  return {
    latitude: (bounds.ne[1] + bounds.sw[1]) / 2,
    longitude: (bounds.ne[0] + bounds.sw[0]) / 2,
    latitudeDelta,
    longitudeDelta,
  };
};

import { Coordinates } from '../../types/passenger';

export type MapboxCoordinate = [number, number];

export const toMapboxCoordinate = ({ latitude, longitude }: Coordinates): MapboxCoordinate => {
  return [longitude, latitude];
};

export const fromMapboxCoordinate = (coordinate: number[]): Coordinates => {
  return {
    latitude: coordinate[1],
    longitude: coordinate[0],
  };
};

export const buildLineStringFeature = (
  coordinates: Coordinates[]
): GeoJSON.Feature<GeoJSON.LineString> => {
  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: coordinates.map(toMapboxCoordinate),
    },
  };
};

export const getBoundsFromCoordinates = (
  coordinates: Coordinates[]
): { ne: MapboxCoordinate; sw: MapboxCoordinate } | null => {
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

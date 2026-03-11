import {
  getMapboxAccessTokenOrThrow,
  hasMapboxAccessToken,
  MAPBOX_DIRECTIONS_API_URL,
} from '../../config/mapbox';
import { Coordinates } from '../../types/passenger';
import { AppLanguage } from '../../types/settings';
import { fromMapboxCoordinate } from './geometry';

type MapboxDirectionsRoute = {
  distance?: number;
  duration?: number;
  geometry?: {
    coordinates?: number[][];
    type?: string;
  };
};

type MapboxDirectionsResponse = {
  routes?: MapboxDirectionsRoute[];
};

export interface MapboxRoute {
  distanceKm: number;
  distanceMeters: number;
  durationMin: number;
  durationSeconds: number;
  geometry: Coordinates[];
}

interface FetchMapboxRouteOptions {
  coordinates: Coordinates[];
  language: AppLanguage;
  signal?: AbortSignal;
}

export const fetchMapboxRoute = async ({
  coordinates,
  language,
  signal,
}: FetchMapboxRouteOptions): Promise<MapboxRoute | null> => {
  if (coordinates.length < 2 || !hasMapboxAccessToken()) {
    return null;
  }

  const coordinatePath = coordinates
    .map((coordinate) => `${coordinate.longitude},${coordinate.latitude}`)
    .join(';');

  const params = new URLSearchParams({
    access_token: getMapboxAccessTokenOrThrow(),
    alternatives: 'false',
    geometries: 'geojson',
    language: language === 'uk' ? 'uk' : 'en',
    overview: 'full',
    steps: 'false',
  });

  const response = await fetch(
    `${MAPBOX_DIRECTIONS_API_URL}/driving-traffic/${coordinatePath}?${params.toString()}`,
    {
      method: 'GET',
      signal,
    }
  );

  if (!response.ok) {
    throw new Error(`Mapbox directions request failed with ${response.status}`);
  }

  const payload = (await response.json()) as MapboxDirectionsResponse;
  const route = payload.routes?.[0];
  const routeCoordinates = route?.geometry?.coordinates || [];

  if (!route || routeCoordinates.length < 2 || typeof route.distance !== 'number' || typeof route.duration !== 'number') {
    return null;
  }

  return {
    distanceKm: Number((route.distance / 1000).toFixed(1)),
    distanceMeters: route.distance,
    durationMin: Math.max(1, Math.round(route.duration / 60)),
    durationSeconds: route.duration,
    geometry: routeCoordinates.map(fromMapboxCoordinate),
  };
};

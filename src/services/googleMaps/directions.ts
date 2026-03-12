import {
  buildGoogleMapsLanguageCode,
  getGoogleMapsApiKeyOrThrow,
  GOOGLE_MAPS_API_URLS,
  hasGoogleMapsApiKey,
} from '../../config/googleMaps';
import { Coordinates } from '../../types/passenger';
import { AppLanguage } from '../../types/settings';
import { decodeGooglePolyline } from './polyline';

type GoogleDirectionsResponse = {
  routes?: Array<{
    legs?: Array<{
      distance?: {
        value?: number;
      };
      duration?: {
        value?: number;
      };
    }>;
    overview_polyline?: {
      points?: string;
    };
  }>;
  status?: string;
};

export interface GoogleRoute {
  distanceKm: number;
  distanceMeters: number;
  durationMin: number;
  durationSeconds: number;
  geometry: Coordinates[];
}

interface FetchGoogleRouteOptions {
  coordinates: Coordinates[];
  language: AppLanguage;
  signal?: AbortSignal;
}

const toDirectionsWaypoint = ({ latitude, longitude }: Coordinates): string => {
  return `${latitude},${longitude}`;
};

export const fetchGoogleRoute = async ({
  coordinates,
  language,
  signal,
}: FetchGoogleRouteOptions): Promise<GoogleRoute | null> => {
  if (coordinates.length < 2 || !hasGoogleMapsApiKey()) {
    return null;
  }

  const origin = coordinates[0];
  const destination = coordinates[coordinates.length - 1];
  const waypoints = coordinates.slice(1, -1);
  const params = new URLSearchParams({
    alternatives: 'false',
    destination: toDirectionsWaypoint(destination),
    key: getGoogleMapsApiKeyOrThrow(),
    language: buildGoogleMapsLanguageCode('', language),
    mode: 'driving',
    origin: toDirectionsWaypoint(origin),
    region: 'ua',
  });

  if (waypoints.length) {
    params.set(
      'waypoints',
      waypoints.map((coordinate) => toDirectionsWaypoint(coordinate)).join('|')
    );
  }

  const response = await fetch(
    `${GOOGLE_MAPS_API_URLS.directions}?${params.toString()}`,
    {
      method: 'GET',
      signal,
    }
  );

  if (!response.ok) {
    throw new Error(`Google Directions request failed with ${response.status}`);
  }

  const payload = (await response.json()) as GoogleDirectionsResponse;
  const route = payload.routes?.[0];
  const legs = route?.legs || [];
  const encodedPolyline = route?.overview_polyline?.points;

  if (!route || !encodedPolyline || !legs.length) {
    return null;
  }

  const distanceMeters = legs.reduce((total, leg) => total + (leg.distance?.value || 0), 0);
  const durationSeconds = legs.reduce((total, leg) => total + (leg.duration?.value || 0), 0);

  if (!distanceMeters || !durationSeconds) {
    return null;
  }

  return {
    distanceKm: Number((distanceMeters / 1000).toFixed(1)),
    distanceMeters,
    durationMin: Math.max(1, Math.round(durationSeconds / 60)),
    durationSeconds,
    geometry: decodeGooglePolyline(encodedPolyline),
  };
};

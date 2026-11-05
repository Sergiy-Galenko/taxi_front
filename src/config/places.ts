import { resolveApiUrl } from '../core/config/apiUrl';
const ENV_PLACES_API_URL = process.env.EXPO_PUBLIC_PLACES_API_URL?.trim();

export const PLACES_API_URL = resolveApiUrl(ENV_PLACES_API_URL || 'https://photon.komoot.io/api', __DEV__, 'https://photon.komoot.io/api');

export const KYIV_SEARCH_CENTER = {
  latitude: 50.4501,
  longitude: 30.5234,
};

// lon,lat,lon,lat order for Photon bbox
export const KYIV_SEARCH_BBOX = {
  minLongitude: 30.213,
  minLatitude: 50.279,
  maxLongitude: 30.825,
  maxLatitude: 50.59,
};

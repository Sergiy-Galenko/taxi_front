type EnvSource = {
  process?: {
    env?: Record<string, string | undefined>;
  };
};

const ENV_PLACES_API_URL = (globalThis as EnvSource).process?.env?.EXPO_PUBLIC_PLACES_API_URL?.trim();

const normalizeUrl = (value: string): string => value.replace(/\/+$/, '');

export const PLACES_API_URL = normalizeUrl(ENV_PLACES_API_URL || 'https://photon.komoot.io/api');

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

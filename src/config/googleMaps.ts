import { AppLanguage } from '../types/settings';

type EnvSource = {
  process?: {
    env?: Record<string, string | undefined>;
  };
};

const ENV_GOOGLE_MAPS_API_KEY =
  (globalThis as EnvSource).process?.env?.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() || '';

const containsUkrainianCharacters = (value: string): boolean => /[А-Яа-яЇїІіЄєҐґ]/.test(value);

export const GOOGLE_MAPS_API_KEY = ENV_GOOGLE_MAPS_API_KEY;
export const GOOGLE_MAPS_API_URLS = {
  autocomplete: 'https://places.googleapis.com/v1/places:autocomplete',
  directions: 'https://maps.googleapis.com/maps/api/directions/json',
  geocoding: 'https://maps.googleapis.com/maps/api/geocode/json',
  placeDetails: 'https://places.googleapis.com/v1/places',
} as const;

export const KYIV_SEARCH_BOUNDS = {
  northEast: {
    latitude: 50.59,
    longitude: 30.825,
  },
  southWest: {
    latitude: 50.279,
    longitude: 30.213,
  },
} as const;

export const hasGoogleMapsApiKey = (): boolean => GOOGLE_MAPS_API_KEY.length > 0;

export const getGoogleMapsApiKeyOrThrow = (): string => {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('EXPO_PUBLIC_GOOGLE_MAPS_API_KEY is not configured.');
  }

  return GOOGLE_MAPS_API_KEY;
};

export const buildGoogleMapsLanguageCode = (
  query: string,
  language: AppLanguage
): 'en' | 'uk' => {
  if (containsUkrainianCharacters(query)) {
    return 'uk';
  }

  return language === 'uk' ? 'uk' : 'en';
};

export const createGooglePlacesSessionToken = (): string => {
  return `ride_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
};

export const GOOGLE_AUTOCOMPLETE_FIELD_MASK = [
  'suggestions.placePrediction.placeId',
  'suggestions.placePrediction.distanceMeters',
  'suggestions.placePrediction.structuredFormat.mainText.text',
  'suggestions.placePrediction.structuredFormat.secondaryText.text',
  'suggestions.placePrediction.text.text',
].join(',');

export const GOOGLE_PLACE_DETAILS_FIELD_MASK = [
  'id',
  'displayName',
  'formattedAddress',
  'location',
].join(',');

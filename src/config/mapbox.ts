import { AppLanguage } from '../types/settings';

type EnvSource = {
  process?: {
    env?: Record<string, string | undefined>;
  };
};

const ENV_MAPBOX_ACCESS_TOKEN = (globalThis as EnvSource).process?.env?.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN?.trim();

const containsUkrainianCharacters = (value: string): boolean => /[А-Яа-яЇїІіЄєҐґ]/.test(value);

export const MAPBOX_ACCESS_TOKEN = ENV_MAPBOX_ACCESS_TOKEN || '';
export const MAPBOX_GEOCODING_API_URL = 'https://api.mapbox.com/search/geocode/v6';
export const MAPBOX_DIRECTIONS_API_URL = 'https://api.mapbox.com/directions/v5/mapbox';
export const MAPBOX_RUNTIME_STYLE_URL = {
  dark: 'mapbox://styles/mapbox/dark-v11',
  light: 'mapbox://styles/mapbox/streets-v12',
};

export const KYIV_SEARCH_BBOX = {
  minLongitude: 30.213,
  minLatitude: 50.279,
  maxLongitude: 30.825,
  maxLatitude: 50.59,
};

export const hasMapboxAccessToken = (): boolean => MAPBOX_ACCESS_TOKEN.length > 0;

export const getMapboxAccessTokenOrThrow = (): string => {
  if (!MAPBOX_ACCESS_TOKEN) {
    throw new Error('EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN is not configured.');
  }

  return MAPBOX_ACCESS_TOKEN;
};

export const buildMapboxLanguagePreference = (
  query: string,
  language: AppLanguage
): string => {
  if (containsUkrainianCharacters(query)) {
    return 'uk,en';
  }

  return language === 'uk' ? 'uk,en' : 'en,uk';
};

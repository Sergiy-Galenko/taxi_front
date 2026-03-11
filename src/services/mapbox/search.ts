import {
  buildMapboxLanguagePreference,
  getMapboxAccessTokenOrThrow,
  hasMapboxAccessToken,
  KYIV_SEARCH_BBOX,
  MAPBOX_GEOCODING_API_URL,
} from '../../config/mapbox';
import { Coordinates, DestinationSuggestion } from '../../types/passenger';
import { AppLanguage } from '../../types/settings';

type MapboxContextEntry = {
  name?: string;
};

type MapboxFeatureProperties = {
  mapbox_id?: string;
  feature_type?: string;
  name?: string;
  name_preferred?: string;
  full_address?: string;
  place_formatted?: string;
  context?: MapboxContextEntry[];
};

type MapboxFeature = {
  geometry?: {
    coordinates?: [number, number];
  };
  properties?: MapboxFeatureProperties;
};

type MapboxGeocodingResponse = {
  features?: MapboxFeature[];
};

export interface MapboxPlaceResult {
  coords: Coordinates;
  fullAddress: string;
  id: string;
  subtitle: string;
  title: string;
}

const normalizeText = (value: string): string => value.trim().toLowerCase();

const buildContextSubtitle = (properties: MapboxFeatureProperties): string => {
  const contextParts = (properties.context || [])
    .map((entry) => entry.name?.trim())
    .filter((value): value is string => Boolean(value));

  const uniqueParts = Array.from(new Set(contextParts.map(normalizeText))).map((normalizedPart) => {
    return contextParts.find((part) => normalizeText(part) === normalizedPart) || normalizedPart;
  });

  return uniqueParts.join(', ');
};

const mapFeatureToPlaceResult = (feature: MapboxFeature, index: number): MapboxPlaceResult | null => {
  const properties = feature.properties || {};
  const coordinates = feature.geometry?.coordinates;

  if (!coordinates || coordinates.length < 2) {
    return null;
  }

  const title =
    properties.name_preferred?.trim() ||
    properties.name?.trim() ||
    properties.full_address?.trim() ||
    '';

  if (!title) {
    return null;
  }

  const subtitle = properties.place_formatted?.trim() || buildContextSubtitle(properties);
  const fullAddress = properties.full_address?.trim() || [title, subtitle].filter(Boolean).join(', ');

  return {
    coords: {
      latitude: coordinates[1],
      longitude: coordinates[0],
    },
    fullAddress,
    id: properties.mapbox_id || `mapbox-${index}`,
    subtitle,
    title,
  };
};

const dedupeSuggestions = (suggestions: DestinationSuggestion[]): DestinationSuggestion[] => {
  const seen = new Set<string>();

  return suggestions.filter((suggestion) => {
    const key = `${normalizeText(suggestion.title)}|${normalizeText(suggestion.subtitle)}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

const buildForwardSearchUrl = (
  query: string,
  language: AppLanguage,
  limit: number,
  autocomplete: boolean,
  proximity?: Coordinates
): string => {
  const params = new URLSearchParams({
    access_token: getMapboxAccessTokenOrThrow(),
    autocomplete: autocomplete ? 'true' : 'false',
    bbox: [
      KYIV_SEARCH_BBOX.minLongitude,
      KYIV_SEARCH_BBOX.minLatitude,
      KYIV_SEARCH_BBOX.maxLongitude,
      KYIV_SEARCH_BBOX.maxLatitude,
    ].join(','),
    country: 'ua',
    language: buildMapboxLanguagePreference(query, language),
    limit: String(limit),
    q: query.trim(),
    types: 'address,street,place,locality,neighborhood,poi',
  });

  if (proximity) {
    params.set('proximity', `${proximity.longitude},${proximity.latitude}`);
  }

  return `${MAPBOX_GEOCODING_API_URL}/forward?${params.toString()}`;
};

const buildReverseSearchUrl = (coords: Coordinates, language: AppLanguage): string => {
  const params = new URLSearchParams({
    access_token: getMapboxAccessTokenOrThrow(),
    language: language === 'uk' ? 'uk,en' : 'en,uk',
    latitude: String(coords.latitude),
    longitude: String(coords.longitude),
    limit: '1',
    types: 'address,street,place,locality,neighborhood',
  });

  return `${MAPBOX_GEOCODING_API_URL}/reverse?${params.toString()}`;
};

const fetchPlaces = async (url: string, signal?: AbortSignal): Promise<MapboxPlaceResult[]> => {
  const response = await fetch(url, {
    method: 'GET',
    signal,
  });

  if (!response.ok) {
    throw new Error(`Mapbox geocoding request failed with ${response.status}`);
  }

  const payload = (await response.json()) as MapboxGeocodingResponse;

  return (payload.features || [])
    .map((feature, index) => mapFeatureToPlaceResult(feature, index))
    .filter((feature): feature is MapboxPlaceResult => Boolean(feature));
};

export const searchMapboxPlaceSuggestions = async (
  query: string,
  language: AppLanguage,
  limit = 6,
  proximity?: Coordinates,
  signal?: AbortSignal
): Promise<DestinationSuggestion[]> => {
  const normalizedQuery = query.trim();

  if (normalizedQuery.length < 2 || !hasMapboxAccessToken()) {
    return [];
  }

  const results = await fetchPlaces(
    buildForwardSearchUrl(normalizedQuery, language, limit, true, proximity),
    signal
  );

  return dedupeSuggestions(
    results.map((result) => ({
      id: result.id,
      title: result.title,
      subtitle: result.subtitle,
      category: 'live',
      coords: result.coords,
    }))
  ).slice(0, limit);
};

export const forwardGeocodeMapboxAddress = async (
  query: string,
  language: AppLanguage,
  proximity?: Coordinates,
  signal?: AbortSignal
): Promise<MapboxPlaceResult | null> => {
  const normalizedQuery = query.trim();

  if (!normalizedQuery || !hasMapboxAccessToken()) {
    return null;
  }

  const results = await fetchPlaces(
    buildForwardSearchUrl(normalizedQuery, language, 1, false, proximity),
    signal
  );

  return results[0] || null;
};

export const reverseGeocodeMapboxAddress = async (
  coords: Coordinates,
  language: AppLanguage,
  signal?: AbortSignal
): Promise<MapboxPlaceResult | null> => {
  if (!hasMapboxAccessToken()) {
    return null;
  }

  const results = await fetchPlaces(buildReverseSearchUrl(coords, language), signal);
  return results[0] || null;
};

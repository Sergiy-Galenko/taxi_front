import { isRecord } from '../../core/auth/session';
import { requestJson } from '../api/http';
import { PLACES_API_URL, KYIV_SEARCH_BBOX, KYIV_SEARCH_CENTER } from '../../config/places';
import { DestinationSuggestion } from '../../types/passenger';
import { AppLanguage } from '../../types/settings';

interface PhotonFeatureProperties {
  osm_id?: number | string;
  name?: string;
  street?: string;
  housenumber?: string;
  city?: string;
  district?: string;
  suburb?: string;
  locality?: string;
  state?: string;
  country?: string;
  postcode?: string;
}

interface PhotonFeature {
  geometry?: {
    coordinates?: [number, number];
  };
  properties?: PhotonFeatureProperties;
}

function parseFeatures(payload: unknown): PhotonFeature[] {
  if (!isRecord(payload) || !Array.isArray(payload.features)) throw new Error('Invalid places response');
  return payload.features.flatMap((feature: unknown): PhotonFeature[] => {
    if (!isRecord(feature) || !isRecord(feature.geometry) || !isRecord(feature.properties)) return [];
    const coords = feature.geometry.coordinates;
    if (!Array.isArray(coords) || coords.length < 2 || typeof coords[0] !== 'number' || typeof coords[1] !== 'number' ||
        !Number.isFinite(coords[0]) || !Number.isFinite(coords[1]) || Math.abs(coords[0]) > 180 || Math.abs(coords[1]) > 90) return [];
    const properties: PhotonFeatureProperties = {};
    const keys = ['name', 'street', 'housenumber', 'city', 'district', 'suburb', 'locality', 'state', 'country', 'postcode'] as const;
    for (const key of keys) { const value = feature.properties[key]; if (typeof value === 'string') properties[key] = value; }
    const id = feature.properties.osm_id;
    if (typeof id === 'string' || typeof id === 'number') properties.osm_id = id;
    return [{ geometry: { coordinates: [coords[0], coords[1]] }, properties }];
  });
}

const normalizeText = (value: string): string => value.trim().toLowerCase();
const collapseWhitespace = (value: string): string => value.replace(/\s+/g, ' ').trim();
const containsUkrainianCharacters = (value: string): boolean => /[А-Яа-яЇїІіЄєҐґ]/.test(value);

const KYIV_QUERY_REPLACEMENTS: Array<[RegExp, string]> = [
  [/(^|[\s,])вул\.?(?=$|[\s,])/giu, '$1вулиця'],
  [/(^|[\s,])пр-?т\.?(?=$|[\s,])/giu, '$1проспект'],
  [/(^|[\s,])просп\.?(?=$|[\s,])/giu, '$1проспект'],
  [/(^|[\s,])бул\.?(?=$|[\s,])/giu, '$1бульвар'],
  [/(^|[\s,])пл\.?(?=$|[\s,])/giu, '$1площа'],
  [/(^|[\s,])пров\.?(?=$|[\s,])/giu, '$1провулок'],
  [/(^|[\s,])наб\.?(?=$|[\s,])/giu, '$1набережна'],
  [/(^|[\s,])ш\.?(?=$|[\s,])/giu, '$1шосе'],
  [/(^|[\s,])майд\.?(?=$|[\s,])/giu, '$1майдан'],
];

const uniqueParts = (parts: Array<string | undefined>): string[] => {
  const seen = new Set<string>();

  return parts.reduce<string[]>((acc, part) => {
    if (!part) {
      return acc;
    }

    const normalized = normalizeText(part);

    if (!normalized || seen.has(normalized)) {
      return acc;
    }

    seen.add(normalized);
    acc.push(part.trim());
    return acc;
  }, []);
};

const buildSuggestionTitle = (properties: PhotonFeatureProperties): string => {
  const streetLine = [properties.street, properties.housenumber].filter(Boolean).join(' ').trim();

  if (streetLine) {
    return streetLine;
  }

  return (
    properties.name?.trim() ||
    properties.district?.trim() ||
    properties.suburb?.trim() ||
    properties.city?.trim() ||
    ''
  );
};

const buildSuggestionSubtitle = (
  properties: PhotonFeatureProperties,
  title: string,
  language: AppLanguage
): string => {
  const titleNormalized = normalizeText(title);
  const cityLabel = language === 'uk' ? 'Київ' : 'Kyiv';

  const areaParts = uniqueParts([
    properties.name && normalizeText(properties.name) !== titleNormalized ? properties.name : undefined,
    properties.locality,
    properties.suburb,
    properties.district,
    properties.city || cityLabel,
    properties.postcode,
  ]);

  return areaParts.join(', ');
};

const mapFeatureToSuggestion = (
  feature: PhotonFeature,
  language: AppLanguage,
  index: number
): DestinationSuggestion | null => {
  const properties = feature.properties || {};
  const coordinates = feature.geometry?.coordinates;

  if (!coordinates || coordinates.length < 2) {
    return null;
  }

  const title = buildSuggestionTitle(properties);

  if (!title) {
    return null;
  }

  return {
    id: `live-${properties.osm_id || index}`,
    title,
    subtitle: buildSuggestionSubtitle(properties, title, language),
    category: 'live',
    coords: {
      latitude: coordinates[1],
      longitude: coordinates[0],
    },
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

const normalizeKyivQuery = (query: string): string => {
  const expandedQuery = KYIV_QUERY_REPLACEMENTS.reduce((value, [pattern, replacement]) => {
    return value.replace(pattern, replacement);
  }, query);

  return collapseWhitespace(expandedQuery.replace(/[.,;]+/g, ' '));
};

const buildQueryVariants = (query: string): string[] => {
  const normalizedQuery = collapseWhitespace(query);
  const expandedQuery = normalizeKyivQuery(normalizedQuery);
  const citySuffix = containsUkrainianCharacters(expandedQuery) ? 'Київ' : 'Kyiv';
  const withCity = /(?:^|[\s,])(київ|kyiv|kiev)(?:$|[\s,])/i.test(expandedQuery)
    ? expandedQuery
    : `${expandedQuery}, ${citySuffix}`;

  return Array.from(
    new Set([normalizedQuery, expandedQuery, withCity].filter((value) => value.length >= 2))
  );
};

const buildAcceptLanguage = (query: string, language: AppLanguage): string => {
  const preferredLanguage = containsUkrainianCharacters(query) ? 'uk' : language;

  return preferredLanguage === 'uk'
    ? 'uk-UA,uk;q=0.9,en;q=0.8'
    : 'en-US,en;q=0.9,uk;q=0.7';
};

const fetchPhotonSuggestions = async (
  query: string,
  language: AppLanguage,
  limit: number,
  signal?: AbortSignal
): Promise<DestinationSuggestion[]> => {
  const params = new URLSearchParams({
    q: query,
    limit: String(limit),
    lon: String(KYIV_SEARCH_CENTER.longitude),
    lat: String(KYIV_SEARCH_CENTER.latitude),
    bbox: [
      KYIV_SEARCH_BBOX.minLongitude,
      KYIV_SEARCH_BBOX.minLatitude,
      KYIV_SEARCH_BBOX.maxLongitude,
      KYIV_SEARCH_BBOX.maxLatitude,
    ].join(','),
  });

  if (!PLACES_API_URL) throw new Error('Places configuration unavailable');
  const payload = await requestJson(`${PLACES_API_URL}/?${params.toString()}`, {
    headers: { 'Accept-Language': buildAcceptLanguage(query, language) }, signal, timeoutMs: 8000,
  });
  const features = parseFeatures(payload);

  return dedupeSuggestions(
    features
      .map((feature, index) => mapFeatureToSuggestion(feature, language, index))
      .filter((suggestion): suggestion is DestinationSuggestion => Boolean(suggestion))
  ).slice(0, limit);
};

export const searchKyivPlaceSuggestions = async (
  query: string,
  language: AppLanguage,
  limit = 6,
  signal?: AbortSignal
): Promise<DestinationSuggestion[]> => {
  const normalizedQuery = collapseWhitespace(query);

  if (normalizedQuery.length < 2) {
    return [];
  }

  const queryVariants = buildQueryVariants(normalizedQuery);

  for (const variant of queryVariants) {
    const suggestions = await fetchPhotonSuggestions(variant, language, limit, signal);

    if (suggestions.length) {
      return suggestions;
    }
  }

  return [];
};

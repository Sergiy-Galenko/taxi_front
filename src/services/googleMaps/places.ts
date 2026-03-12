import {
  buildGoogleMapsLanguageCode,
  getGoogleMapsApiKeyOrThrow,
  GOOGLE_AUTOCOMPLETE_FIELD_MASK,
  GOOGLE_MAPS_API_URLS,
  GOOGLE_PLACE_DETAILS_FIELD_MASK,
  hasGoogleMapsApiKey,
  KYIV_SEARCH_BOUNDS,
} from '../../config/googleMaps';
import { Coordinates, DestinationSuggestion } from '../../types/passenger';
import { AppLanguage } from '../../types/settings';

type AutocompleteSuggestion = {
  placePrediction?: {
    distanceMeters?: number;
    placeId?: string;
    structuredFormat?: {
      mainText?: {
        text?: string;
      };
      secondaryText?: {
        text?: string;
      };
    };
    text?: {
      text?: string;
    };
  };
};

type AutocompleteResponse = {
  suggestions?: AutocompleteSuggestion[];
};

type PlaceDetailsResponse = {
  displayName?: {
    text?: string;
  };
  formattedAddress?: string;
  id?: string;
  location?: {
    latitude?: number;
    longitude?: number;
  };
};

type GeocodeResponse = {
  results?: Array<{
    formatted_address?: string;
    geometry?: {
      location?: {
        lat?: number;
        lng?: number;
      };
    };
  }>;
  status?: string;
};

export interface GooglePlaceResult {
  coords: Coordinates;
  fullAddress: string;
  id: string;
  subtitle: string;
  title: string;
}

const normalizeText = (value: string): string => value.trim().toLowerCase();

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

const splitAddress = (address: string): { title: string; subtitle: string } => {
  const parts = address
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  if (!parts.length) {
    return {
      subtitle: '',
      title: '',
    };
  }

  return {
    subtitle: parts.slice(1).join(', '),
    title: parts[0],
  };
};

const mapAutocompleteSuggestion = (
  suggestion: AutocompleteSuggestion,
  index: number
): DestinationSuggestion | null => {
  const prediction = suggestion.placePrediction;
  const title =
    prediction?.structuredFormat?.mainText?.text?.trim() ||
    prediction?.text?.text?.trim() ||
    '';

  if (!title) {
    return null;
  }

  return {
    category: 'live' as const,
    fullAddress: [title, prediction?.structuredFormat?.secondaryText?.text?.trim()]
      .filter(Boolean)
      .join(', '),
    id: prediction?.placeId || `google-${index}`,
    placeId: prediction?.placeId,
    subtitle: prediction?.structuredFormat?.secondaryText?.text?.trim() || '',
    title,
  };
};

const getAutocompleteHeaders = () => ({
  'Content-Type': 'application/json',
  'X-Goog-Api-Key': getGoogleMapsApiKeyOrThrow(),
  'X-Goog-FieldMask': GOOGLE_AUTOCOMPLETE_FIELD_MASK,
});

const getPlaceDetailsHeaders = () => ({
  'X-Goog-Api-Key': getGoogleMapsApiKeyOrThrow(),
  'X-Goog-FieldMask': GOOGLE_PLACE_DETAILS_FIELD_MASK,
});

const buildGeocodingParams = (languageCode: 'en' | 'uk') => {
  const params = new URLSearchParams({
    components: 'country:UA',
    key: getGoogleMapsApiKeyOrThrow(),
    language: languageCode,
    region: 'ua',
  });

  return params;
};

export const searchGooglePlaceSuggestions = async (
  query: string,
  language: AppLanguage,
  limit = 6,
  proximity?: Coordinates,
  sessionToken?: string,
  signal?: AbortSignal
): Promise<DestinationSuggestion[]> => {
  const normalizedQuery = query.trim();

  if (normalizedQuery.length < 2 || !hasGoogleMapsApiKey()) {
    return [];
  }

  const languageCode = buildGoogleMapsLanguageCode(normalizedQuery, language);
  const body: Record<string, unknown> = {
    includedRegionCodes: ['ua'],
    input: normalizedQuery,
    languageCode,
    regionCode: 'UA',
  };

  if (sessionToken) {
    body.sessionToken = sessionToken;
  }

  if (proximity) {
    body.locationBias = {
      circle: {
        center: {
          latitude: proximity.latitude,
          longitude: proximity.longitude,
        },
        radius: 22000,
      },
    };
  } else {
    body.locationBias = {
      rectangle: {
        high: KYIV_SEARCH_BOUNDS.northEast,
        low: KYIV_SEARCH_BOUNDS.southWest,
      },
    };
  }

  const response = await fetch(GOOGLE_MAPS_API_URLS.autocomplete, {
    body: JSON.stringify(body),
    headers: getAutocompleteHeaders(),
    method: 'POST',
    signal,
  });

  if (!response.ok) {
    throw new Error(`Google Places autocomplete request failed with ${response.status}`);
  }

  const payload = (await response.json()) as AutocompleteResponse;

  return dedupeSuggestions(
    (payload.suggestions || [])
      .map((suggestion, index) => mapAutocompleteSuggestion(suggestion, index))
      .filter((suggestion): suggestion is DestinationSuggestion => suggestion !== null)
  ).slice(0, limit);
};

export const fetchGooglePlaceDetails = async (
  placeId: string,
  language: AppLanguage,
  sessionToken?: string,
  signal?: AbortSignal
): Promise<GooglePlaceResult | null> => {
  if (!placeId || !hasGoogleMapsApiKey()) {
    return null;
  }

  const languageCode = language === 'uk' ? 'uk' : 'en';
  const params = new URLSearchParams({
    languageCode,
    regionCode: 'UA',
  });

  if (sessionToken) {
    params.set('sessionToken', sessionToken);
  }

  const response = await fetch(
    `${GOOGLE_MAPS_API_URLS.placeDetails}/${encodeURIComponent(placeId)}?${params.toString()}`,
    {
      headers: getPlaceDetailsHeaders(),
      method: 'GET',
      signal,
    }
  );

  if (!response.ok) {
    throw new Error(`Google Place Details request failed with ${response.status}`);
  }

  const payload = (await response.json()) as PlaceDetailsResponse;
  const latitude = payload.location?.latitude;
  const longitude = payload.location?.longitude;
  const fullAddress = payload.formattedAddress?.trim() || payload.displayName?.text?.trim() || '';

  if (typeof latitude !== 'number' || typeof longitude !== 'number' || !fullAddress) {
    return null;
  }

  const split = splitAddress(fullAddress);

  return {
    coords: {
      latitude,
      longitude,
    },
    fullAddress,
    id: payload.id || placeId,
    subtitle: split.subtitle,
    title: payload.displayName?.text?.trim() || split.title || fullAddress,
  };
};

export const forwardGeocodeGoogleAddress = async (
  query: string,
  language: AppLanguage,
  signal?: AbortSignal
): Promise<GooglePlaceResult | null> => {
  const normalizedQuery = query.trim();

  if (!normalizedQuery || !hasGoogleMapsApiKey()) {
    return null;
  }

  const params = buildGeocodingParams(buildGoogleMapsLanguageCode(normalizedQuery, language));
  params.set('address', normalizedQuery);

  const response = await fetch(
    `${GOOGLE_MAPS_API_URLS.geocoding}?${params.toString()}`,
    {
      method: 'GET',
      signal,
    }
  );

  if (!response.ok) {
    throw new Error(`Google Geocoding request failed with ${response.status}`);
  }

  const payload = (await response.json()) as GeocodeResponse;
  const result = payload.results?.[0];
  const latitude = result?.geometry?.location?.lat;
  const longitude = result?.geometry?.location?.lng;
  const fullAddress = result?.formatted_address?.trim() || '';

  if (typeof latitude !== 'number' || typeof longitude !== 'number' || !fullAddress) {
    return null;
  }

  const split = splitAddress(fullAddress);

  return {
    coords: {
      latitude,
      longitude,
    },
    fullAddress,
    id: `${normalizedQuery}-${latitude}-${longitude}`,
    subtitle: split.subtitle,
    title: split.title || fullAddress,
  };
};

export const reverseGeocodeGoogleAddress = async (
  coords: Coordinates,
  language: AppLanguage,
  signal?: AbortSignal
): Promise<GooglePlaceResult | null> => {
  if (!hasGoogleMapsApiKey()) {
    return null;
  }

  const params = buildGeocodingParams(buildGoogleMapsLanguageCode('', language));
  params.set('latlng', `${coords.latitude},${coords.longitude}`);
  params.set('result_type', 'street_address|premise|subpremise|route');

  const response = await fetch(
    `${GOOGLE_MAPS_API_URLS.geocoding}?${params.toString()}`,
    {
      method: 'GET',
      signal,
    }
  );

  if (!response.ok) {
    throw new Error(`Google Reverse Geocoding request failed with ${response.status}`);
  }

  const payload = (await response.json()) as GeocodeResponse;
  const result = payload.results?.[0];
  const fullAddress = result?.formatted_address?.trim() || '';

  if (!fullAddress) {
    return null;
  }

  const split = splitAddress(fullAddress);

  return {
    coords,
    fullAddress,
    id: `reverse-${coords.latitude}-${coords.longitude}`,
    subtitle: split.subtitle,
    title: split.title || fullAddress,
  };
};

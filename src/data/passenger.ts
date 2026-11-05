import type { Region } from 'react-native-maps';
import { passengerPalette } from '../theme/passenger';
import {
  Coordinates,
  DestinationSuggestion,
  LocationSuggestion,
  PaymentMethodKey,
  RideOption,
  RideOptionKey,
  TripHistoryEntry,
  TripSummary,
} from '../types/passenger';

export const DEFAULT_CITY_CENTER: Coordinates = {
  latitude: 50.4501,
  longitude: 30.5234,
};

export const DEFAULT_REGION: Region = {
  ...DEFAULT_CITY_CENTER,
  latitudeDelta: 0.06,
  longitudeDelta: 0.04,
};

export const RIDE_OPTIONS: RideOption[] = [
  {
    key: 'economy',
    label: 'Economy',
    description: 'Best price for everyday rides',
    capacity: '1-4 seats',
    icon: 'car-sport-outline',
    accentColor: passengerPalette.primary,
  },
  {
    key: 'comfort',
    label: 'Comfort',
    description: 'More leg room and quieter pickup',
    capacity: '1-4 seats',
    icon: 'car-outline',
    accentColor: passengerPalette.accent,
  },
  {
    key: 'xl',
    label: 'XL',
    description: 'More space for people and luggage',
    capacity: '1-6 seats',
    icon: 'people-outline',
    accentColor: passengerPalette.info,
  },
];

export const LOCATION_SUGGESTIONS: LocationSuggestion[] = [
  {
    id: 'airport',
    title: 'Boryspil Airport',
    subtitle: 'Terminal D',
    coords: { latitude: 50.3419, longitude: 30.8951 },
    category: 'hub',
  },
  {
    id: 'station',
    title: 'Central Station',
    subtitle: 'Vokzalna Square',
    coords: { latitude: 50.4416, longitude: 30.4881 },
    category: 'hub',
  },
  {
    id: 'mall',
    title: 'Ocean Plaza',
    subtitle: 'Antonovycha St.',
    coords: { latitude: 50.4129, longitude: 30.5229 },
    category: 'hub',
  },
  {
    id: 'square',
    title: 'Sofiivska Square',
    subtitle: 'Historic center',
    coords: { latitude: 50.4539, longitude: 30.5164 },
    category: 'hub',
  },
];

export const TRIP_HISTORY: TripHistoryEntry[] = [];

export const PAYMENT_METHODS: PaymentMethodKey[] = ['visa', 'apple_pay', 'cash'];

export const getRideOption = (key: RideOptionKey): RideOption =>
  RIDE_OPTIONS.find((option) => option.key === key) ?? RIDE_OPTIONS[0];

const normalizeSuggestionText = (value: string): string => value.trim().toLowerCase();

const destinationMatches = (query: string, suggestion: DestinationSuggestion): boolean => {
  if (!query) {
    return true;
  }

  const normalizedQuery = normalizeSuggestionText(query);
  const title = normalizeSuggestionText(suggestion.title);
  const subtitle = normalizeSuggestionText(suggestion.subtitle);

  return title.includes(normalizedQuery) || subtitle.includes(normalizedQuery);
};

const destinationScore = (query: string, suggestion: DestinationSuggestion): number => {
  if (!query) {
    return 0;
  }

  const normalizedQuery = normalizeSuggestionText(query);
  const title = normalizeSuggestionText(suggestion.title);
  const subtitle = normalizeSuggestionText(suggestion.subtitle);

  if (title.startsWith(normalizedQuery)) {
    return 0;
  }

  if (title.includes(normalizedQuery)) {
    return 1;
  }

  if (subtitle.startsWith(normalizedQuery)) {
    return 2;
  }

  if (subtitle.includes(normalizedQuery)) {
    return 3;
  }

  return 4;
};

const categoryWeight: Record<DestinationSuggestion['category'], number> = {
  favorite: 0,
  hub: 1,
  recent: 2,
  history: 3,
  live: 4,
};

const recentDestinationSuggestions: DestinationSuggestion[] = TRIP_HISTORY.reduce<DestinationSuggestion[]>(
  (acc, trip, index) => {
    const existingSuggestion = LOCATION_SUGGESTIONS.find((suggestion) => {
      const normalizedDestination = normalizeSuggestionText(trip.destination);

      return (
        normalizeSuggestionText(suggestion.title) === normalizedDestination ||
        normalizeSuggestionText(suggestion.subtitle) === normalizedDestination
      );
    });

    const duplicate = acc.some((suggestion) => {
      return normalizeSuggestionText(suggestion.title) === normalizeSuggestionText(trip.destination);
    });

    if (duplicate) {
      return acc;
    }

    acc.push({
      id: `history-${index + 1}`,
      title: trip.destination,
      subtitle: `${trip.dateLabel} · ${trip.paymentLabel}`,
      category: 'history',
      coords: existingSuggestion?.coords,
    });

    return acc;
  },
  []
);

const DESTINATION_SUGGESTIONS: DestinationSuggestion[] = [
  ...LOCATION_SUGGESTIONS,
  ...recentDestinationSuggestions,
];

export const findLocationSuggestion = (label: string): LocationSuggestion | undefined => {
  const normalizedLabel = label.trim().toLowerCase();

  return LOCATION_SUGGESTIONS.find((suggestion) => {
    return (
      suggestion.title.toLowerCase() === normalizedLabel ||
      suggestion.subtitle.toLowerCase() === normalizedLabel
    );
  });
};

export const searchDestinationSuggestions = (
  query: string,
  limit = 6
): DestinationSuggestion[] => {
  const normalizedQuery = normalizeSuggestionText(query);

  return DESTINATION_SUGGESTIONS.filter((suggestion) => {
    return destinationMatches(normalizedQuery, suggestion);
  })
    .sort((left, right) => {
      const scoreDifference = destinationScore(normalizedQuery, left) - destinationScore(normalizedQuery, right);

      if (scoreDifference !== 0) {
        return scoreDifference;
      }

      const categoryDifference = categoryWeight[left.category] - categoryWeight[right.category];

      if (categoryDifference !== 0) {
        return categoryDifference;
      }

      return left.title.localeCompare(right.title);
    })
    .slice(0, limit);
};

// Route distance, ETA and fare require a server quote. Geographic proximity is not a route.
export const calculateTripSummary = (
  _pickup: Coordinates | null,
  _destination: Coordinates | null,
  _rideKey: RideOptionKey
): TripSummary => ({ distanceKm: null, durationMin: null, pickupEtaMin: null, price: null });

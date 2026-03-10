import { Region } from 'react-native-maps';
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
    baseFare: 72,
    perKm: 9,
    etaMin: 3,
    icon: 'car-sport-outline',
    accentColor: passengerPalette.primary,
  },
  {
    key: 'comfort',
    label: 'Comfort',
    description: 'More leg room and quieter pickup',
    capacity: '1-4 seats',
    baseFare: 96,
    perKm: 12,
    etaMin: 4,
    icon: 'car-outline',
    accentColor: passengerPalette.accent,
  },
  {
    key: 'xl',
    label: 'XL',
    description: 'More space for people and luggage',
    capacity: '1-6 seats',
    baseFare: 128,
    perKm: 15,
    etaMin: 6,
    icon: 'people-outline',
    accentColor: passengerPalette.info,
  },
];

export const LOCATION_SUGGESTIONS: LocationSuggestion[] = [
  {
    id: 'home',
    title: 'Home',
    subtitle: '12 Shevchenka St.',
    coords: { latitude: 50.4386, longitude: 30.5148 },
    category: 'favorite',
  },
  {
    id: 'work',
    title: 'Office',
    subtitle: '67 Saksahanskoho St.',
    coords: { latitude: 50.4359, longitude: 30.5124 },
    category: 'favorite',
  },
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
    category: 'recent',
  },
  {
    id: 'square',
    title: 'Sofiivska Square',
    subtitle: 'Historic center',
    coords: { latitude: 50.4539, longitude: 30.5164 },
    category: 'recent',
  },
];

export const TRIP_HISTORY: TripHistoryEntry[] = [
  {
    id: 'trip-1',
    pickup: 'Home',
    destination: 'Boryspil Airport',
    dateLabel: 'Today, 08:10',
    price: 348,
    rideType: 'comfort',
    paymentLabel: 'Visa •••• 4219',
    status: 'Completed',
  },
  {
    id: 'trip-2',
    pickup: 'Office',
    destination: 'Podil coworking',
    dateLabel: 'Yesterday, 18:45',
    price: 164,
    rideType: 'economy',
    paymentLabel: 'Apple Pay',
    status: 'Completed',
  },
  {
    id: 'trip-3',
    pickup: 'Central Station',
    destination: 'Home',
    dateLabel: 'Mar 6, 21:05',
    price: 121,
    rideType: 'economy',
    paymentLabel: 'Cash',
    status: 'Completed',
  },
  {
    id: 'trip-4',
    pickup: 'Home',
    destination: 'Clinic visit',
    dateLabel: 'Mar 3, 11:30',
    price: 196,
    rideType: 'xl',
    paymentLabel: 'Visa •••• 4219',
    status: 'Completed',
  },
];

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

const distanceBetweenKm = (from: Coordinates, to: Coordinates): number => {
  const latDelta = (from.latitude - to.latitude) * 111;
  const averageLatitude = ((from.latitude + to.latitude) / 2) * (Math.PI / 180);
  const lngDelta = (from.longitude - to.longitude) * 111 * Math.cos(averageLatitude);

  return Math.sqrt(latDelta * latDelta + lngDelta * lngDelta);
};

export const calculateTripSummary = (
  pickup: Coordinates | null,
  destination: Coordinates | null,
  rideKey: RideOptionKey
): TripSummary => {
  const rideOption = getRideOption(rideKey);

  if (!pickup || !destination) {
    return {
      distanceKm: 0,
      durationMin: 0,
      pickupEtaMin: rideOption.etaMin,
      price: rideOption.baseFare,
    };
  }

  const distanceKm = Math.max(1.6, distanceBetweenKm(pickup, destination));
  const durationMin = Math.max(8, Math.round(distanceKm * 3.1));

  return {
    distanceKm: Number(distanceKm.toFixed(1)),
    durationMin,
    pickupEtaMin: Math.max(rideOption.etaMin, Math.round(distanceKm * 0.55)),
    price: Math.round(rideOption.baseFare + distanceKm * rideOption.perKm),
  };
};

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

export const RIDE_OPTIONS: RideOption[] = [
  {
    key: 'economy',
    label: 'Економ',
    description: 'Найкраща ціна для щоденних поїздок містом',
    shortDescription: 'Доступно і швидко',
    capacity: '1-4',
    baseFare: 72,
    perKm: 9,
    etaMin: 3,
    icon: 'car-outline',
    accentColor: passengerPalette.primary,
  },
  {
    key: 'comfort',
    label: 'Комфорт',
    description: 'Більше простору, чисті авто та вища якість подачі',
    shortDescription: 'Оптимальний вибір',
    capacity: '1-4',
    baseFare: 96,
    perKm: 12,
    etaMin: 4,
    icon: 'car-sport-outline',
    accentColor: passengerPalette.accent,
    recommended: true,
  },
  {
    key: 'business',
    label: 'Бізнес',
    description: 'Преміальні авто для зустрічей, аеропорту та важливих поїздок',
    shortDescription: 'Преміум салон',
    capacity: '1-4',
    baseFare: 152,
    perKm: 18,
    etaMin: 6,
    icon: 'diamond-outline',
    accentColor: '#4E5F5A',
  },
  {
    key: 'minivan',
    label: 'Мінівен',
    description: 'Просторе авто для компанії, дітей або багажу',
    shortDescription: 'Більше місця',
    capacity: '1-6',
    baseFare: 136,
    perKm: 16,
    etaMin: 6,
    icon: 'people-outline',
    accentColor: passengerPalette.info,
  },
  {
    key: 'delivery',
    label: 'Доставка',
    description: 'Передайте посилку містом без поїздки пасажира',
    shortDescription: 'Для речей',
    capacity: 'до 20 кг',
    baseFare: 64,
    perKm: 8,
    etaMin: 5,
    icon: 'cube-outline',
    accentColor: passengerPalette.danger,
  },
];

export const LOCATION_SUGGESTIONS: LocationSuggestion[] = [
  {
    id: 'home',
    title: 'Дім',
    subtitle: 'вул. Шевченка, 12',
    coords: { latitude: 50.4386, longitude: 30.5148 },
    category: 'favorite',
  },
  {
    id: 'work',
    title: 'Робота',
    subtitle: 'вул. Саксаганського, 67',
    coords: { latitude: 50.4359, longitude: 30.5124 },
    category: 'favorite',
  },
  {
    id: 'airport',
    title: 'Бориспіль',
    subtitle: 'Термінал D',
    coords: { latitude: 50.3419, longitude: 30.8951 },
    category: 'hub',
  },
  {
    id: 'station',
    title: 'Центральний вокзал',
    subtitle: 'Вокзальна площа',
    coords: { latitude: 50.4416, longitude: 30.4881 },
    category: 'hub',
  },
  {
    id: 'mall',
    title: 'Ocean Plaza',
    subtitle: 'вул. Антоновича',
    coords: { latitude: 50.4129, longitude: 30.5229 },
    category: 'recent',
  },
  {
    id: 'square',
    title: 'Софійська площа',
    subtitle: 'Історичний центр',
    coords: { latitude: 50.4539, longitude: 30.5164 },
    category: 'recent',
  },
];

export const TRIP_HISTORY: TripHistoryEntry[] = [
  {
    id: 'trip-1',
    pickup: 'Дім',
    destination: 'Бориспіль',
    dateLabel: 'Сьогодні, 08:10',
    price: 348,
    rideType: 'comfort',
    paymentLabel: 'Visa •••• 4219',
    status: 'Завершено',
  },
  {
    id: 'trip-2',
    pickup: 'Робота',
    destination: 'Коворкінг на Подолі',
    dateLabel: 'Вчора, 18:45',
    price: 164,
    rideType: 'economy',
    paymentLabel: 'Apple Pay',
    status: 'Завершено',
  },
  {
    id: 'trip-3',
    pickup: 'Центральний вокзал',
    destination: 'Дім',
    dateLabel: '6 березня, 21:05',
    price: 121,
    rideType: 'economy',
    paymentLabel: 'Готівка',
    status: 'Завершено',
  },
  {
    id: 'trip-4',
    pickup: 'Дім',
    destination: 'Клініка',
    dateLabel: '3 березня, 11:30',
    price: 196,
    rideType: 'minivan',
    paymentLabel: 'Visa •••• 4219',
    status: 'Завершено',
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

export const calculateTripSummaryFromMetrics = (
  distanceKm: number,
  durationMin: number,
  rideKey: RideOptionKey
): TripSummary => {
  const rideOption = getRideOption(rideKey);
  const normalizedDistanceKm = Math.max(1.0, Number(distanceKm.toFixed(1)));
  const normalizedDurationMin = Math.max(1, Math.round(durationMin));

  return {
    distanceKm: normalizedDistanceKm,
    durationMin: normalizedDurationMin,
    pickupEtaMin: Math.max(rideOption.etaMin, Math.round(normalizedDistanceKm * 0.55)),
    price: Math.round(rideOption.baseFare + normalizedDistanceKm * rideOption.perKm),
  };
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

  return calculateTripSummaryFromMetrics(distanceKm, durationMin, rideKey);
};

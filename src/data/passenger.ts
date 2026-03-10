import { Region } from 'react-native-maps';
import { passengerPalette } from '../theme/passenger';
import {
  Coordinates,
  LocationSuggestion,
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

export const PAYMENT_OPTIONS = ['Visa •••• 4219', 'Apple Pay', 'Cash'];

export const LANGUAGE_OPTIONS = ['English', 'Ukrainian', 'Polish'];

export const getRideOption = (key: RideOptionKey): RideOption =>
  RIDE_OPTIONS.find((option) => option.key === key) ?? RIDE_OPTIONS[0];

export const findLocationSuggestion = (label: string): LocationSuggestion | undefined => {
  const normalizedLabel = label.trim().toLowerCase();

  return LOCATION_SUGGESTIONS.find((suggestion) => {
    return (
      suggestion.title.toLowerCase() === normalizedLabel ||
      suggestion.subtitle.toLowerCase() === normalizedLabel
    );
  });
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


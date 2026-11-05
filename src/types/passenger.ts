export type RideOptionKey = 'economy' | 'comfort' | 'xl';
export type PaymentMethodKey = 'visa' | 'apple_pay' | 'cash';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationSuggestion {
  id: string;
  title: string;
  subtitle: string;
  coords: Coordinates;
  category: 'favorite' | 'recent' | 'hub';
}

export interface DestinationSuggestion {
  id: string;
  title: string;
  subtitle: string;
  category: 'favorite' | 'recent' | 'hub' | 'history' | 'live';
  coords?: Coordinates;
}

export interface RideOption {
  key: RideOptionKey;
  label: string;
  description: string;
  capacity: string;
  icon: string;
  accentColor: string;
}

export interface TripSummary {
  distanceKm: number | null;
  durationMin: number | null;
  pickupEtaMin: number | null;
  price: number | null;
}

export interface TripHistoryEntry {
  id: string;
  pickup: string;
  destination: string;
  dateLabel: string;
  price: number;
  rideType: RideOptionKey;
  paymentLabel: string;
  status: string;
}

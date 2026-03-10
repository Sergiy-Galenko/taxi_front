export type RideOptionKey = 'economy' | 'comfort' | 'xl';

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
  category: 'favorite' | 'recent' | 'hub' | 'history';
  coords?: Coordinates;
}

export interface RideOption {
  key: RideOptionKey;
  label: string;
  description: string;
  capacity: string;
  baseFare: number;
  perKm: number;
  etaMin: number;
  icon: string;
  accentColor: string;
}

export interface TripSummary {
  distanceKm: number;
  durationMin: number;
  pickupEtaMin: number;
  price: number;
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

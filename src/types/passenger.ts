export type RideOptionKey = 'economy' | 'comfort' | 'business' | 'minivan' | 'delivery';
export type PaymentMethodKey = 'visa' | 'apple_pay' | 'cash';
export type RideLifecycleState =
  | 'loading'
  | 'idle'
  | 'route_ready'
  | 'searching_driver'
  | 'driver_found'
  | 'active'
  | 'completed'
  | 'cancelled'
  | 'driver_not_found'
  | 'no_internet'
  | 'location_denied'
  | 'error';

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
  fullAddress?: string;
  placeId?: string;
}

export interface RideOption {
  key: RideOptionKey;
  label: string;
  description: string;
  capacity: string;
  shortDescription: string;
  baseFare: number;
  perKm: number;
  etaMin: number;
  icon: string;
  accentColor: string;
  recommended?: boolean;
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

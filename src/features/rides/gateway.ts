import { Coordinates, PaymentMethodKey, RideOptionKey } from '../../types/passenger';

export type MatchingStatus = 'idle' | 'submitting' | 'searching' | 'matched' | 'no_drivers' | 'cancelled' | 'expired' | 'failed';
export type RideStatus = 'matched' | 'arriving' | 'arrived' | 'in_progress' | 'completed' | 'cancelled';
export interface BookingDraft {
  from: string; to: string;
  pickupCoords: Coordinates; destinationCoords: Coordinates;
  rideType: RideOptionKey; paymentMethod: PaymentMethodKey;
}
export interface FareQuote {
  id: string; expiresAt: string; amount: number; currency: string;
  routeDistanceKm: number; routeDurationMin: number;
}
export interface DriverMatch { id: string; name: string; car: string; plate: string }
export interface RideSnapshot {
  id: string;
  // The transport adapter must supply a monotonic server revision, never a local timer.
  revision: number;
  status: RideStatus;
  driver: DriverMatch;
}
export type IntegrationResult<T> =
  | { available: true; data: T }
  | { available: false; reason: 'backend_contract_missing' };
export interface RideGateway {
  quote(draft: BookingDraft, signal: AbortSignal): Promise<IntegrationResult<FareQuote>>;
  create(draft: BookingDraft, quoteId: string, idempotencyKey: string, signal: AbortSignal): Promise<IntegrationResult<{ rideId: string; status: MatchingStatus }>>;
  read(rideId: string, signal: AbortSignal): Promise<IntegrationResult<RideSnapshot>>;
  restore(signal: AbortSignal): Promise<IntegrationResult<RideSnapshot | null>>;
  cancel(rideId: string, idempotencyKey: string, signal: AbortSignal): Promise<IntegrationResult<RideSnapshot>>;
}
const unavailable = async (): Promise<{ available: false; reason: 'backend_contract_missing' }> => ({ available: false, reason: 'backend_contract_missing' });
// No route/quote/booking/status/cancellation endpoint or transport is defined in this repository.
export const rideGateway: RideGateway = {
  quote: unavailable, create: unavailable, read: unavailable, restore: unavailable, cancel: unavailable,
};
const transitions: Record<RideStatus, readonly RideStatus[]> = {
  matched: ['matched', 'arriving', 'arrived', 'in_progress', 'completed', 'cancelled'],
  arriving: ['arriving', 'arrived', 'in_progress', 'completed', 'cancelled'],
  arrived: ['arrived', 'in_progress', 'completed', 'cancelled'],
  in_progress: ['in_progress', 'completed', 'cancelled'],
  completed: ['completed'], cancelled: ['cancelled'],
};
/** Accept complete server snapshots, including skipped states after reconnect; ignore stale events. */
export function reconcileRide(current: RideSnapshot | null, next: RideSnapshot): RideSnapshot | null {
  if (!next.id.trim() || !next.driver.id.trim() || !next.driver.name.trim() ||
      !next.driver.car.trim() || !next.driver.plate.trim() ||
      !Number.isSafeInteger(next.revision) || next.revision < 0 || !transitions[next.status]) return current;
  if (!current) return next;
  if (next.id !== current.id || next.revision <= current.revision || !transitions[current.status].includes(next.status)) return current;
  return next;
}

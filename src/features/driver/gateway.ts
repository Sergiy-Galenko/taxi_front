import { IntegrationResult, RideSnapshot } from '../rides/gateway';
export interface DriverOffer { id: string; expiresAt: string; pickup: string; destination: string; fareQuoteId: string }
export interface DriverShift { id: string; status: 'online' | 'offline' }
export interface DriverEarnings { amount: number; currency: string; periodStart: string; periodEnd: string }
export type OfferAcceptance = { status: 'accepted'; ride: RideSnapshot } | { status: 'already_taken' | 'expired' | 'unverified' };
/** Internal integration port, not a claimed backend endpoint or wire schema. */
export interface DriverGateway {
  shift(signal: AbortSignal): Promise<IntegrationResult<DriverShift | null>>;
  offers(signal: AbortSignal): Promise<IntegrationResult<DriverOffer[]>>;
  activeTrip(signal: AbortSignal): Promise<IntegrationResult<RideSnapshot | null>>;
  earnings(signal: AbortSignal): Promise<IntegrationResult<DriverEarnings>>;
  accept(offerId: string, idempotencyKey: string, signal: AbortSignal): Promise<IntegrationResult<OfferAcceptance>>;
}
const unavailable = async (): Promise<{ available: false; reason: 'backend_contract_missing' }> => ({ available: false, reason: 'backend_contract_missing' });
export const driverGateway: DriverGateway = { shift: unavailable, offers: unavailable, activeTrip: unavailable, earnings: unavailable, accept: unavailable };

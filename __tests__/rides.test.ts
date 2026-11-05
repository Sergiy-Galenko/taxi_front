import { RideSnapshot, reconcileRide, rideGateway } from '../src/features/rides/gateway';
import { calculateTripSummary } from '../src/data/passenger';
const matched: RideSnapshot = { id: 'server-ride-1', revision: 1, status: 'matched', driver: { id: 'driver-1', name: 'Driver', car: 'Car', plate: 'AA0000AA' } };
test('accepts authoritative matches and skips missed states on reconnect', () => {
  expect(reconcileRide(null, matched)).toEqual(matched);
  expect(reconcileRide(matched, { ...matched, revision: 5, status: 'in_progress' })?.status).toBe('in_progress');
});
test('rejects duplicates, stale events, other ride IDs, missing matches, and backwards transitions', () => {
  expect(reconcileRide(matched, matched)).toBe(matched);
  expect(reconcileRide(matched, { ...matched, revision: 0 })).toBe(matched);
  expect(reconcileRide(matched, { ...matched, id: 'other', revision: 3 })).toBe(matched);
  expect(reconcileRide(null, { ...matched, driver: { ...matched.driver, id: '' } })).toBeNull();
  const completed: RideSnapshot = { ...matched, revision: 6, status: 'completed' };
  expect(reconcileRide(completed, { ...matched, revision: 7 })).toBe(completed);
});
test('unconfigured ride integrations cannot invent transactions or matches', async () => {
  const signal = new AbortController().signal;
  expect(await rideGateway.restore(signal)).toEqual({ available: false, reason: 'backend_contract_missing' });
  expect(await rideGateway.read('existing', signal)).toEqual({ available: false, reason: 'backend_contract_missing' });
  expect(await rideGateway.cancel('existing', 'idempotency', signal)).toEqual({ available: false, reason: 'backend_contract_missing' });
});
test('coordinates never yield an accepted price, route duration or pickup ETA', () => {
  expect(calculateTripSummary({ latitude: 50, longitude: 30 }, { latitude: 51, longitude: 31 }, 'economy')).toEqual({ price: null, durationMin: null, distanceKm: null, pickupEtaMin: null });
});

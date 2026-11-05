import { RideFilters, Ride } from '../types/driverTypes';
export { getDriverProfile } from '../../services/api/driver';
export async function searchRides(_filters: RideFilters): Promise<Ride[]> {
  throw new Error('Driver offer API is unavailable: backend contract required.');
}

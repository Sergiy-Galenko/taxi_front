import { AuthState } from '../core/auth/session';
export const AUTH_ROUTES = ['Login', 'RoleSelection', 'PassengerRegistration', 'DriverRegistration', 'DriverPersonalInfo', 'DriverContactInfo', 'DriverCarInfo', 'DriverLicenseInfo', 'DriverPasswordSetup', 'DriverVerification'] as const;
export const PASSENGER_ROUTES = ['Home', 'VehicleSelection', 'DriverSearch', 'ActiveRide', 'Preorder', 'TripHistory', 'Settings'] as const;
export const DRIVER_ROUTES = ['DriverHome'] as const;
export function sessionArea(state: AuthState): 'initializing' | 'auth' | 'passenger' | 'driver' {
  if (state.status === 'initializing') return 'initializing';
  return state.status === 'authenticated' ? state.session.user.role : 'auth';
}
export function allowedRoutes(state: AuthState): readonly string[] {
  const area = sessionArea(state);
  if (area === 'initializing') return [];
  if (area === 'auth') return AUTH_ROUTES;
  return area === 'driver' ? DRIVER_ROUTES : PASSENGER_ROUTES;
}
export const canAccessRoute = (state: AuthState, name: string): boolean => allowedRoutes(state).includes(name);

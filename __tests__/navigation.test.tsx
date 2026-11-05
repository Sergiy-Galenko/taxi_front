import React from 'react';
import { Text as MockText, View as MockView } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { AuthState, User } from '../src/core/auth/session';
import AppNavigator from '../src/navigation/AppNavigator';
let mockState: AuthState = { status: 'guest', session: null };
jest.mock('../src/hooks/UserContext', () => ({ useUser: () => ({ state: mockState }) }));
jest.mock('../src/hooks/useTheme', () => ({ useTheme: () => ({ isDark: false, theme: { colors: {} } }) }));
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
  DefaultTheme: { colors: {} }, DarkTheme: { colors: {} },
}));
jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }: { children: React.ReactNode }) => <MockView>{children}</MockView>,
    Screen: ({ name }: { name: string }) => <MockText>{name}</MockText>,
  }),
}));
jest.mock('../src/screens/auth/Login', () => () => null);
jest.mock('../src/screens/auth/RoleSelection', () => () => null);
jest.mock('../src/screens/auth/PassengerRegistration', () => () => null);
jest.mock('../src/screens/auth/driver/Registration', () => () => null);
jest.mock('../src/screens/auth/driver/PersonalInfo', () => () => null);
jest.mock('../src/screens/auth/driver/ContactInfo', () => () => null);
jest.mock('../src/screens/auth/driver/CarInfo', () => () => null);
jest.mock('../src/screens/auth/driver/LicenseInfo', () => () => null);
jest.mock('../src/screens/auth/driver/PasswordSetup', () => () => null);
jest.mock('../src/screens/auth/driver/Verification', () => () => null);
jest.mock('../src/screens/Home', () => () => null);
jest.mock('../src/screens/Settings', () => () => null);
jest.mock('../src/screens/TripHistoryScreen', () => () => null);
jest.mock('../src/screens/PreorderScreen', () => () => null);
jest.mock('../src/screens/driver/Home', () => () => null);
jest.mock('../src/screens/passenger/VehicleSelection', () => () => null);
jest.mock('../src/screens/passenger/DriverSearch', () => () => null);
jest.mock('../src/screens/passenger/ActiveRide', () => () => null);
const user: User = { id: '1', fullName: 'Account', email: 'test@example.test', role: 'passenger' };
test.each(['guest', 'expired'] as const)('%s mounts only authentication routes', (status) => {
  mockState = { status, session: null }; render(<AppNavigator />);
  expect(screen.getByText('Login')).toBeTruthy(); expect(screen.queryByText('Home')).toBeNull(); expect(screen.queryByText('DriverHome')).toBeNull();
});
test('passenger cannot navigate to driver or authentication screens', () => {
  mockState = { status: 'authenticated', session: { token: 'token', user } }; render(<AppNavigator />);
  expect(screen.getByText('Home')).toBeTruthy(); expect(screen.queryByText('DriverHome')).toBeNull(); expect(screen.queryByText('Login')).toBeNull();
});
test('driver cannot navigate to passenger booking', () => {
  mockState = { status: 'authenticated', session: { token: 'token', user: { ...user, role: 'driver' } } }; render(<AppNavigator />);
  expect(screen.getByText('DriverHome')).toBeTruthy(); expect(screen.queryByText('Home')).toBeNull(); expect(screen.queryByText('VehicleSelection')).toBeNull();
});
test('logout removes protected navigator state', () => {
  mockState = { status: 'authenticated', session: { token: 'token', user } }; const view = render(<AppNavigator />);
  mockState = { status: 'guest', session: null }; view.rerender(<AppNavigator />);
  expect(screen.queryByText('Home')).toBeNull(); expect(screen.getByText('Login')).toBeTruthy();
});

import React from 'react';
import { Text as MockText, View as MockView } from 'react-native';
import { act, render, screen } from '@testing-library/react-native';
import DriverSearch from '../src/screens/passenger/DriverSearch';
import ActiveRide from '../src/screens/passenger/ActiveRide';
import { RootStackParamList } from '../src/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
jest.mock('../src/components/passenger/BookingFlowLayout', () => ({ children }: { children: React.ReactNode }) => <MockView>{children}</MockView>);
jest.mock('../src/components/passenger/RouteSummaryCard', () => ({ pickup, destination }: { pickup: string; destination: string }) => <MockText>{pickup} → {destination}</MockText>);
jest.mock('../src/shared/components/IntegrationNotice', () => () => <MockText>Service unavailable. No ride or payment confirmed.</MockText>);
jest.mock('../src/hooks/useI18n', () => ({ useI18n: () => ({ t: (key: string) => key }) }));
test('search cannot match a driver or navigate after demo timeout', () => {
  jest.useFakeTimers();
  const props: Pick<NativeStackScreenProps<RootStackParamList, 'DriverSearch'>, 'route'> = { route: { key: 'search', name: 'DriverSearch', params: { from: 'Pickup', to: 'Destination', rideType: 'comfort', paymentMethod: 'cash' } } };
  render(<DriverSearch {...props} />);
  act(() => jest.advanceTimersByTime(60000));
  expect(screen.getByText('Pickup → Destination')).toBeTruthy();
  expect(screen.getByText('Service unavailable. No ride or payment confirmed.')).toBeTruthy();
  expect(jest.getTimerCount()).toBe(0); jest.useRealTimers();
});
test('active ride never completes or issues payment from elapsed time', () => {
  jest.useFakeTimers(); render(<ActiveRide />);
  act(() => jest.advanceTimersByTime(60000));
  expect(screen.getByText('Service unavailable. No ride or payment confirmed.')).toBeTruthy();
  expect(jest.getTimerCount()).toBe(0); jest.useRealTimers();
});

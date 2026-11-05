import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SettingsProvider, useSettings } from '../src/hooks/useSettings';
import { parseSettings } from '../src/core/storage/preferences';
const wrapper = ({ children }: { children: React.ReactNode }) => <SettingsProvider>{children}</SettingsProvider>;
afterEach(() => jest.restoreAllMocks());
test('validates persistent settings rather than spreading arbitrary JSON', () => {
  expect(parseSettings({ notificationsEnabled: 'yes', defaultPaymentMethod: 'bitcoin' })).toMatchObject({ notificationsEnabled: true, defaultPaymentMethod: 'cash' });
});
test('concurrent settings changes are not lost and writes are ordered', async () => {
  const set = jest.spyOn(AsyncStorage, 'setItem');
  const { result } = renderHook(useSettings, { wrapper });
  await waitFor(() => expect(result.current.settingsReady).toBe(true));
  await act(async () => { await Promise.all([result.current.updateSetting('notificationsEnabled', false), result.current.updateSetting('rideUpdatesEnabled', false)]); });
  expect(result.current.notificationsEnabled).toBe(false); expect(result.current.rideUpdatesEnabled).toBe(false);
  expect(JSON.parse(set.mock.calls.at(-1)?.[1] ?? '{}')).toMatchObject({ notificationsEnabled: false, rideUpdatesEnabled: false });
});
test('storage failure is surfaced without an unhandled rejection', async () => {
  jest.spyOn(AsyncStorage, 'setItem').mockRejectedValue(new Error('disk'));
  const { result } = renderHook(useSettings, { wrapper });
  await waitFor(() => expect(result.current.settingsReady).toBe(true));
  await act(async () => { await result.current.updateSetting('shareRideEnabled', true); });
  expect(result.current.storageError).toBe(true);
});

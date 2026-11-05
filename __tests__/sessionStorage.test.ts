import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { sessionStorage } from '../src/core/storage/sessionStorage';
afterEach(() => jest.restoreAllMocks());
test('clears token-only legacy storage rather than restoring an unverified identity', async () => {
  await sessionStorage.read();
  expect(AsyncStorage.multiRemove).toHaveBeenCalledWith(['authToken', 'driverId']);
});
test('writes sensitive session only to SecureStore', async () => {
  const secure = jest.mocked(SecureStore.setItemAsync);
  await sessionStorage.write('sensitive-session');
  expect(secure).toHaveBeenCalledWith('taxi.session.v1', 'sensitive-session', expect.any(Object));
  expect(AsyncStorage.setItem).not.toHaveBeenCalledWith(expect.any(String), 'sensitive-session');
});
test('logout invalidation blocks restoration even if secure deletion fails', async () => {
  jest.spyOn(SecureStore, 'deleteItemAsync').mockRejectedValue(new Error('keychain locked'));
  jest.spyOn(SecureStore, 'getItemAsync').mockResolvedValue('old-private-session');
  await expect(sessionStorage.clear()).rejects.toThrow('Could not clear');
  expect(await sessionStorage.read()).toBeNull();
});

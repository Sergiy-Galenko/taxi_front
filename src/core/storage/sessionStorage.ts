import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SessionStorage } from '../auth/session';
const KEY = 'taxi.session.v1';
const INVALIDATED = 'taxi.session.invalidated';
const clearLegacy = () => AsyncStorage.multiRemove(['authToken', 'driverId']);
export const sessionStorage: SessionStorage = {
  async read() {
    // Legacy token-only storage has no validated identity. Require login once.
    await clearLegacy();
    if (await AsyncStorage.getItem(INVALIDATED) === 'true') return null;
    return SecureStore.getItemAsync(KEY);
  },
  async write(value) {
    await clearLegacy();
    await SecureStore.setItemAsync(KEY, value, { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY });
    await AsyncStorage.removeItem(INVALIDATED);
  },
  async clear() {
    // Attempt both removals even when one storage provider is unavailable.
    const results = await Promise.allSettled([AsyncStorage.setItem(INVALIDATED, 'true'), SecureStore.deleteItemAsync(KEY), clearLegacy()]);
    if (results.some((result) => result.status === 'rejected')) throw new Error('Could not clear stored session. Please retry.');
  },
};

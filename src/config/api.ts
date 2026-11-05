import { NativeModules, Platform } from 'react-native';
import { resolveApiUrl } from '../core/config/apiUrl';

function developmentFallback(): string {
  if (__DEV__) {
    const source: unknown = NativeModules.SourceCode;
    if (source && typeof source === 'object' && 'scriptURL' in source && typeof source.scriptURL === 'string') {
      try {
        const host = new URL(source.scriptURL).hostname;
        if (host) return `http://${host}:3001`;
      } catch { /* Use simulator fallback. */ }
    }
  }
  return Platform.OS === 'android' ? 'http://10.0.2.2:3001' : 'http://localhost:3001';
}
// Expo only inlines statically referenced process.env.EXPO_PUBLIC_* values.
export const API_URL = resolveApiUrl(process.env.EXPO_PUBLIC_API_URL, __DEV__, developmentFallback());
export function apiEndpoint(path: string): string {
  if (!API_URL) throw new Error('API configuration unavailable. Please contact support.');
  return `${API_URL}${path}`;
}

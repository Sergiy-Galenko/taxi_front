import Constants from 'expo-constants';
import { getAuthToken } from '../utils/auth';
import { Platform } from 'react-native';

// Конфігурація для різних платформ та середовищ
const getApiUrl = () => {
  if (!__DEV__) {
    // Для продакшену використовуємо реальний сервер
    return 'https://your-production-server.com';
  }

  // Дозволяємо вказати базовий URL через змінні середовища Expo
  const envUrl =
    process.env.EXPO_PUBLIC_API_URL ??
    process.env.API_URL ??
    ((Constants.expoConfig?.extra as Record<string, any> | undefined)?.apiUrl);
  if (envUrl) {
    return envUrl;
  }

  // Expo Go віддає адресу менеджера пакунків, яку можна використати як IP машини
  const constants: Record<string, any> = Constants as unknown as Record<string, any>;
  const debuggerHost: string | undefined =
    constants.expoGoConfig?.debuggerHost ??
    constants.expoGoConfig?.hostUri ??
    constants.expoConfig?.hostUri ??
    constants.manifest?.debuggerHost;

  if (debuggerHost) {
    const hostname = debuggerHost.split(':')[0];
    if (hostname) {
      return `http://${hostname}:3001`;
    }
  }

  // Фолбек для емулютора Android та iOS-симулятора
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3001';
  }

  return 'http://127.0.0.1:3001';
};

export const API_URL = getApiUrl();

console.log('🌐 API URL:', API_URL, 'Platform:', Platform.OS);

export const createAuthHeaders = async (): Promise<HeadersInit> => {
  const token = await getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const headers = await createAuthHeaders();
  
  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });
};

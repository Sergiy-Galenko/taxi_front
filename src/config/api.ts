import { NativeModules, Platform } from 'react-native';

type SourceCodeModule = {
  scriptURL?: string;
  bundleURL?: string;
};

const ENV_API_URL = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.EXPO_PUBLIC_API_URL?.trim();

const normalizeApiUrl = (url: string): string => url.replace(/\/+$/, '');

const tryParseUrl = (value: string): URL | null => {
  try {
    return new URL(value);
  } catch {
    return null;
  }
};

const extractHost = (hostUri?: string | null): string | null => {
  if (!hostUri) {
    return null;
  }

  const sanitized = hostUri.replace(/^https?:\/\//, '').split('/')[0];
  return sanitized?.split(':')[0] || null;
};

const isLikelyLocalDevHost = (host: string): boolean => {
  return (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host.endsWith('.local') ||
    /^(10|192\.168|172\.(1[6-9]|2\d|3[0-1]))\.\d{1,3}\.\d{1,3}$/.test(host)
  );
};

const getBundleHost = (): string | null => {
  const sourceCode = (NativeModules.SourceCode || {}) as SourceCodeModule;
  const candidates = [sourceCode.scriptURL, sourceCode.bundleURL];

  for (const candidate of candidates) {
    const host = extractHost(candidate);
    if (host && isLikelyLocalDevHost(host)) {
      return host;
    }
  }

  return null;
};

const getResolvedEnvApiUrl = (): string | null => {
  if (!ENV_API_URL) {
    return null;
  }

  const parsedEnvUrl = tryParseUrl(ENV_API_URL);
  const bundleHost = getBundleHost();

  if (!parsedEnvUrl || !bundleHost || !isLikelyLocalDevHost(parsedEnvUrl.hostname)) {
    return normalizeApiUrl(ENV_API_URL);
  }

  if (parsedEnvUrl.hostname === bundleHost) {
    return normalizeApiUrl(parsedEnvUrl.toString());
  }

  parsedEnvUrl.hostname = bundleHost;
  return normalizeApiUrl(parsedEnvUrl.toString());
};

const getDefaultApiUrl = (): string => {
  const bundleHost = getBundleHost();

  if (bundleHost) {
    return `http://${bundleHost}:3001`;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3001';
  }

  return 'http://localhost:3001';
};

export const API_URL = getResolvedEnvApiUrl() || getDefaultApiUrl();

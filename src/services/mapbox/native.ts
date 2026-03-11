import { NativeModules } from 'react-native';
import { hasMapboxAccessToken } from '../../config/mapbox';

export type MapboxModule = typeof import('@rnmapbox/maps').default;

export type MapboxRuntimeIssue =
  | 'missing_native_module'
  | 'missing_access_token'
  | null;

export const isMapboxNativeModuleAvailable = (): boolean => Boolean(NativeModules.RNMBXModule);

export const getMapboxRuntimeIssue = (): MapboxRuntimeIssue => {
  if (!isMapboxNativeModuleAvailable()) {
    return 'missing_native_module';
  }

  if (!hasMapboxAccessToken()) {
    return 'missing_access_token';
  }

  return null;
};

export const getMapboxModule = (): MapboxModule | null => {
  if (!isMapboxNativeModuleAvailable()) {
    return null;
  }

  try {
    return require('@rnmapbox/maps').default as MapboxModule;
  } catch {
    return null;
  }
};

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettingsState, PaymentMethodKey } from '../types/settings';
import { defaultSettings, parseSettings } from '../core/storage/preferences';
const SETTINGS_STORAGE_KEY = 'app.settings';
interface SettingsContextValue extends AppSettingsState {
  setDefaultPaymentMethod: (method: PaymentMethodKey) => Promise<void>;
  updateSetting: <K extends keyof AppSettingsState>(key: K, value: AppSettingsState[K]) => Promise<void>;
  settingsReady: boolean;
  storageError: boolean;
}
const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);
export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [settingsReady, setSettingsReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const current = useRef(settings);
  const revision = useRef(0);
  const writes = useRef<Promise<void>>(Promise.resolve());
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    const initialRevision = revision.current;
    void AsyncStorage.getItem(SETTINGS_STORAGE_KEY).then((stored) => {
      if (!mounted.current || revision.current !== initialRevision) return;
      current.current = stored ? parseSettings(JSON.parse(stored)) : defaultSettings;
      setSettings(current.current);
    }).catch(() => { if (mounted.current) setStorageError(true); })
      .finally(() => { if (mounted.current) setSettingsReady(true); });
    return () => { mounted.current = false; };
  }, []);
  const value = useMemo(() => {
    const updateSetting = async <K extends keyof AppSettingsState>(key: K, next: AppSettingsState[K]) => {
      ++revision.current;
      current.current = { ...current.current, [key]: next };
      setSettings(current.current);
      const serialized = JSON.stringify(current.current);
      const write = writes.current.then(() => AsyncStorage.setItem(SETTINGS_STORAGE_KEY, serialized));
      writes.current = write.catch(() => undefined);
      try { await write; if (mounted.current) setStorageError(false); }
      catch { if (mounted.current) setStorageError(true); }
    };
    return { ...settings, settingsReady, storageError, updateSetting,
      setDefaultPaymentMethod: (method: PaymentMethodKey) => updateSetting('defaultPaymentMethod', method) };
  }, [settings, settingsReady, storageError]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
export function useSettings() {
  const value = useContext(SettingsContext);
  if (!value) throw new Error('useSettings must be used within a SettingsProvider');
  return value;
}

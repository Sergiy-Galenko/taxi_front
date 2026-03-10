import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettingsState, PaymentMethodKey } from '../types/settings';

const SETTINGS_STORAGE_KEY = 'app.settings';

const defaultSettings: AppSettingsState = {
  defaultPaymentMethod: 'visa',
  notificationsEnabled: true,
  rideUpdatesEnabled: true,
  driverAlertsEnabled: true,
  paymentUpdatesEnabled: true,
  shareRideEnabled: false,
  priceAlertsEnabled: true,
};

interface SettingsContextValue extends AppSettingsState {
  setDefaultPaymentMethod: (method: PaymentMethodKey) => Promise<void>;
  updateSetting: <K extends keyof AppSettingsState>(key: K, value: AppSettingsState[K]) => Promise<void>;
  settingsReady: boolean;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [settings, setSettings] = useState<AppSettingsState>(defaultSettings);
  const [settingsReady, setSettingsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    AsyncStorage.getItem(SETTINGS_STORAGE_KEY)
      .then((storedSettings) => {
        if (!mounted) {
          return;
        }

        if (!storedSettings) {
          setSettingsReady(true);
          return;
        }

        try {
          const parsed = JSON.parse(storedSettings) as Partial<AppSettingsState>;
          setSettings({ ...defaultSettings, ...parsed });
        } catch {
          setSettings(defaultSettings);
        } finally {
          setSettingsReady(true);
        }
      })
      .catch(() => setSettingsReady(true));

    return () => {
      mounted = false;
    };
  }, []);

  const persistSettings = async (nextSettings: AppSettingsState) => {
    setSettings(nextSettings);
    await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(nextSettings));
  };

  const updateSetting = async <K extends keyof AppSettingsState>(key: K, value: AppSettingsState[K]) => {
    const nextSettings = {
      ...settings,
      [key]: value,
    };

    await persistSettings(nextSettings);
  };

  const setDefaultPaymentMethod = async (method: PaymentMethodKey) => {
    await updateSetting('defaultPaymentMethod', method);
  };

  const value = useMemo(
    () => ({
      ...settings,
      setDefaultPaymentMethod,
      updateSetting,
      settingsReady,
    }),
    [settings, settingsReady]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }

  return context;
};

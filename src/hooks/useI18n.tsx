import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { translations } from '../i18n/translations';
import { AppLanguage } from '../types/settings';

const LANGUAGE_STORAGE_KEY = 'app.language';

const getDeviceLanguage = (): AppLanguage => {
  const locale = getLocales()[0];
  return locale?.languageCode === 'uk' ? 'uk' : 'en';
};

const interpolate = (template: string, params?: Record<string, string | number>): string => {
  if (!params) {
    return template;
  }

  return Object.entries(params).reduce((result, [key, value]) => {
    return result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
  }, template);
};

interface I18nContextValue {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => Promise<void>;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<AppLanguage>('en');

  useEffect(() => {
    let mounted = true;

    AsyncStorage.getItem(LANGUAGE_STORAGE_KEY).then((storedLanguage) => {
      if (!mounted) {
        return;
      }

      if (storedLanguage === 'en' || storedLanguage === 'uk') {
        setLanguageState(storedLanguage);
        return;
      }

      setLanguageState(getDeviceLanguage());
    });

    return () => {
      mounted = false;
    };
  }, []);

  const setLanguage = async (nextLanguage: AppLanguage) => {
    setLanguageState(nextLanguage);
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
  };

  const t = useMemo(() => {
    return (key: string, params?: Record<string, string | number>) => {
      const dictionary = translations[language] || translations.en;
      const fallback = translations.en[key] || key;
      return interpolate(dictionary[key] || fallback, params);
    };
  }, [language]);

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }

  return context;
};

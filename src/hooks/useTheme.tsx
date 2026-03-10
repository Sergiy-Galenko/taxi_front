import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppTheme, darkTheme, lightTheme } from '../theme';

export type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeContextValue {
  theme: AppTheme;
  mode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
}

const THEME_STORAGE_KEY = 'themeMode';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const resolveTheme = (mode: ThemeMode, colorScheme: ReturnType<typeof useColorScheme>) => {
  if (mode === 'dark') {
    return darkTheme;
  }

  if (mode === 'auto') {
    return colorScheme === 'dark' ? darkTheme : lightTheme;
  }

  return lightTheme;
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const colorScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('auto');

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((storedMode) => {
      if (storedMode === 'light' || storedMode === 'dark' || storedMode === 'auto') {
        setMode(storedMode);
      }
    });
  }, []);

  const setThemeMode = useCallback((nextMode: ThemeMode) => {
    setMode(nextMode);
    void AsyncStorage.setItem(THEME_STORAGE_KEY, nextMode);
  }, []);

  const theme = useMemo(() => resolveTheme(mode, colorScheme), [mode, colorScheme]);
  const isDark = theme.dark;

  return (
    <ThemeContext.Provider value={{ theme, mode, isDark, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};

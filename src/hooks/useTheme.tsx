import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme as lightTheme } from '../theme';

const darkTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    background: '#000000',
    text: '#FFFFFF',
    surface: '#222222',
    primary: '#E50914',
  },
};

const ThemeContext = createContext({
  theme: lightTheme,
  mode: 'auto',
  setThemeMode: (mode: 'light' | 'dark' | 'auto') => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const colorScheme = useColorScheme();
  const [mode, setMode] = useState<'light' | 'dark' | 'auto'>('auto');
  const [theme, setTheme] = useState(lightTheme);

  useEffect(() => {
    AsyncStorage.getItem('themeMode').then(val => {
      if (val === 'light' || val === 'dark' || val === 'auto') setMode(val);
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('themeMode', mode);
    let resolvedTheme = lightTheme;
    if (mode === 'auto') {
      const hour = new Date().getHours();
      resolvedTheme = (hour >= 20 || hour < 7) ? darkTheme : lightTheme;
    } else if (mode === 'dark') {
      resolvedTheme = darkTheme;
    }
    setTheme(resolvedTheme);
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ theme, mode, setThemeMode: setMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext); 
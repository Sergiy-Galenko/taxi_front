import { MD3DarkTheme, MD3LightTheme, configureFonts } from 'react-native-paper';

const fontConfig = {
  fontFamily: 'System',
};

const sharedTheme = {
  roundness: 12,
  fonts: configureFonts({ config: fontConfig }),
  animation: {
    scale: 1.0,
  },
};

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#4F8FCB',
    secondary: '#8C8CD6',
    error: '#D96B5A',
    background: '#F2F2F7',
    surface: '#FFFFFF',
    text: '#222222',
    placeholder: '#8E8E93',
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
  ...sharedTheme,
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#63A6FF',
    secondary: '#8FB7E8',
    error: '#F07D72',
    background: '#08131B',
    surface: '#12212B',
    text: '#F3F7FA',
    placeholder: '#93A8B7',
    backdrop: 'rgba(0, 0, 0, 0.7)',
  },
  ...sharedTheme,
};

export const theme = lightTheme;
export type AppTheme = typeof lightTheme;

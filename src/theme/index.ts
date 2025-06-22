import { MD3LightTheme, configureFonts } from 'react-native-paper';

const fontConfig = {
  fontFamily: 'System',
};

export const theme = {
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
  roundness: 12,
  fonts: configureFonts({ config: fontConfig }),
  animation: {
    scale: 1.0,
  },
}; 
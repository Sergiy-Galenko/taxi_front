import { useColorScheme } from 'react-native';

export const useTheme = () => {
  const colorScheme = useColorScheme();

  const theme = {
    colors: {
      primary: '#007AFF',
      background: colorScheme === 'dark' ? '#000000' : '#FFFFFF',
      text: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
      error: '#FF3B30',
      success: '#34C759',
    },
  };

  return { theme };
}; 
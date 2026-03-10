import { useMemo } from 'react';
import { getPassengerPalette, passengerRadius } from '../theme/passenger';
import { useTheme } from './useTheme';

export const usePassengerTheme = () => {
  const { isDark } = useTheme();
  const palette = useMemo(() => getPassengerPalette(isDark), [isDark]);

  return {
    isDark,
    palette,
    radius: passengerRadius,
  };
};

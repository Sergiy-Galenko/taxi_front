export interface PassengerPalette {
  background: string;
  backgroundSecondary: string;
  backgroundAccent: string;
  surface: string;
  surfaceMuted: string;
  border: string;
  text: string;
  mutedText: string;
  primary: string;
  primaryDeep: string;
  primarySoft: string;
  accent: string;
  accentSoft: string;
  danger: string;
  info: string;
  overlay: string;
  tabBar: string;
  shadow: string;
  statusBar: 'dark-content' | 'light-content';
  mapOverlay: string;
  warningSurface: string;
  warningBorder: string;
}

export const passengerLightPalette: PassengerPalette = {
  background: '#F6F1E7',
  backgroundSecondary: '#FFFDF8',
  backgroundAccent: '#EADBC1',
  surface: '#FFFFFF',
  surfaceMuted: '#FBF6EC',
  border: '#E8DEC9',
  text: '#15202B',
  mutedText: '#677382',
  primary: '#F4B400',
  primaryDeep: '#926000',
  primarySoft: '#FFF1C2',
  accent: '#0F766E',
  accentSoft: '#D8F3EE',
  danger: '#D45B53',
  info: '#2563EB',
  overlay: 'rgba(21, 32, 43, 0.62)',
  tabBar: 'rgba(255, 255, 255, 0.94)',
  shadow: 'rgba(21, 32, 43, 0.14)',
  statusBar: 'dark-content',
  mapOverlay: 'rgba(21, 32, 43, 0.72)',
  warningSurface: '#FFF8E6',
  warningBorder: '#F1D8A3',
};

export const passengerDarkPalette: PassengerPalette = {
  background: '#08131B',
  backgroundSecondary: '#0E1A23',
  backgroundAccent: '#16303D',
  surface: '#12212B',
  surfaceMuted: '#1A2B36',
  border: '#274150',
  text: '#F3F7FA',
  mutedText: '#9DB0BD',
  primary: '#F3C44B',
  primaryDeep: '#926000',
  primarySoft: '#413116',
  accent: '#33B2A6',
  accentSoft: '#113C38',
  danger: '#F07D72',
  info: '#63A6FF',
  overlay: 'rgba(4, 10, 15, 0.74)',
  tabBar: 'rgba(18, 33, 43, 0.94)',
  shadow: 'rgba(0, 0, 0, 0.32)',
  statusBar: 'light-content',
  mapOverlay: 'rgba(4, 10, 15, 0.82)',
  warningSurface: '#332A17',
  warningBorder: '#5C4921',
};

export const passengerPalette = passengerLightPalette;

export const passengerRadius = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 30,
};

export const getPassengerPalette = (isDark: boolean): PassengerPalette => {
  return isDark ? passengerDarkPalette : passengerLightPalette;
};

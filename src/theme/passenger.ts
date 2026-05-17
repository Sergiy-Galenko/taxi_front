export interface PassengerPalette {
  background: string;
  backgroundSecondary: string;
  backgroundAccent: string;
  backgroundElevated: string;
  surface: string;
  surfaceMuted: string;
  surfaceStrong: string;
  border: string;
  borderStrong: string;
  text: string;
  mutedText: string;
  subtleText: string;
  primary: string;
  primaryDeep: string;
  primarySoft: string;
  accent: string;
  accentSoft: string;
  success: string;
  successSoft: string;
  danger: string;
  dangerSoft: string;
  info: string;
  infoSoft: string;
  overlay: string;
  tabBar: string;
  shadow: string;
  statusBar: 'dark-content' | 'light-content';
  mapOverlay: string;
  warningSurface: string;
  warningBorder: string;
}

export const passengerLightPalette: PassengerPalette = {
  background: '#F7F8F5',
  backgroundSecondary: '#FFFFFF',
  backgroundAccent: '#ECE7D8',
  backgroundElevated: '#F1F4F0',
  surface: '#FFFFFF',
  surfaceMuted: '#F4F6F2',
  surfaceStrong: '#111817',
  border: '#E0E5DD',
  borderStrong: '#CCD6CE',
  text: '#111817',
  mutedText: '#64716C',
  subtleText: '#8A9690',
  primary: '#F7C948',
  primaryDeep: '#E5A800',
  primarySoft: '#FFF4C7',
  accent: '#197A68',
  accentSoft: '#DDF3EC',
  success: '#168A5B',
  successSoft: '#DFF4E9',
  danger: '#C94A4A',
  dangerSoft: '#FCE5E2',
  info: '#2E6DD8',
  infoSoft: '#E5EDFF',
  overlay: 'rgba(17, 24, 23, 0.58)',
  tabBar: 'rgba(255, 255, 255, 0.94)',
  shadow: 'rgba(17, 24, 23, 0.14)',
  statusBar: 'dark-content',
  mapOverlay: 'rgba(17, 24, 23, 0.72)',
  warningSurface: '#FFF7DD',
  warningBorder: '#F0D58B',
};

export const passengerDarkPalette: PassengerPalette = {
  background: '#0D1110',
  backgroundSecondary: '#141A18',
  backgroundAccent: '#202A25',
  backgroundElevated: '#18211E',
  surface: '#171E1C',
  surfaceMuted: '#202B27',
  surfaceStrong: '#F4F8F4',
  border: '#2E3B36',
  borderStrong: '#475852',
  text: '#F4F8F4',
  mutedText: '#A5B2AD',
  subtleText: '#76847F',
  primary: '#FFD75A',
  primaryDeep: '#F0B90B',
  primarySoft: '#423815',
  accent: '#42C2A6',
  accentSoft: '#123A32',
  success: '#45C784',
  successSoft: '#143B2A',
  danger: '#FF8177',
  dangerSoft: '#411F1D',
  info: '#7DA7FF',
  infoSoft: '#18294E',
  overlay: 'rgba(5, 8, 7, 0.76)',
  tabBar: 'rgba(23, 30, 28, 0.94)',
  shadow: 'rgba(0, 0, 0, 0.32)',
  statusBar: 'light-content',
  mapOverlay: 'rgba(5, 8, 7, 0.82)',
  warningSurface: '#332B15',
  warningBorder: '#67551C',
};

export const passengerPalette = passengerLightPalette;

export const passengerRadius = {
  xs: 6,
  sm: 8,
  md: 10,
  lg: 12,
  xl: 16,
  pill: 999,
};

export const passengerSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const passengerTypography = {
  hero: 34,
  title: 26,
  section: 20,
  body: 16,
  bodySmall: 14,
  caption: 12,
};

export const passengerShadows = {
  card: {
    elevation: 4,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 22,
  },
  sheet: {
    elevation: 12,
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 1,
    shadowRadius: 28,
  },
};

export const passengerLayout = {
  controlHeight: 52,
  buttonHeight: 58,
  iconButton: 46,
  bottomSheetRadius: 24,
};

export const getPassengerPalette = (isDark: boolean): PassengerPalette => {
  return isDark ? passengerDarkPalette : passengerLightPalette;
};

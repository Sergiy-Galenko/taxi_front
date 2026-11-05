import {
  Colors,
  darkColors,
  lightColors,
  radii,
} from "../design-system/tokens";
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
  statusBar: "dark-content" | "light-content";
  mapOverlay: string;
  warningSurface: string;
  warningBorder: string;
}

function palette(colors: Colors, dark: boolean): PassengerPalette {
  return {
    background: colors.background,
    backgroundSecondary: colors.background,
    backgroundAccent: colors.inset,
    surface: colors.surface,
    surfaceMuted: colors.inset,
    border: colors.border,
    text: colors.text,
    mutedText: colors.secondary,
    primary: colors.primary,
    primaryDeep: colors.primary,
    primarySoft: colors.primarySoft,
    accent: colors.success,
    accentSoft: colors.successSoft,
    danger: colors.danger,
    info: colors.primary,
    overlay: colors.scrim,
    tabBar: colors.surface,
    shadow: colors.shadow,
    statusBar: dark ? "light-content" : "dark-content",
    mapOverlay: colors.scrim,
    warningSurface: colors.warningSoft,
    warningBorder: colors.warning,
  };
}
export const passengerLightPalette = palette(lightColors, false);
export const passengerDarkPalette = palette(darkColors, true);
export const passengerPalette = passengerLightPalette;
export const passengerRadius = {
  sm: radii.sm,
  md: radii.md,
  lg: radii.lg,
  xl: radii.xl,
};
export const getPassengerPalette = (isDark: boolean): PassengerPalette =>
  isDark ? passengerDarkPalette : passengerLightPalette;

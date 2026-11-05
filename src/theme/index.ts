import {
  MD3DarkTheme,
  MD3LightTheme,
  configureFonts,
} from "react-native-paper";
import {
  Colors,
  darkColors,
  lightColors,
  radii,
} from "../design-system/tokens";
function buildTheme(dark: boolean, colors: Colors) {
  const base = dark ? MD3DarkTheme : MD3LightTheme;
  return {
    ...base,
    roundness: radii.md,
    fonts: configureFonts({ config: { fontFamily: "System" } }),
    colors: {
      ...base.colors,
      primary: colors.primary,
      onPrimary: colors.onPrimary,
      secondary: colors.secondary,
      background: colors.background,
      surface: colors.surface,
      surfaceVariant: colors.inset,
      onSurface: colors.text,
      onSurfaceVariant: colors.secondary,
      onBackground: colors.text,
      outline: colors.border,
      error: colors.danger,
      text: colors.text,
      placeholder: colors.muted,
      backdrop: colors.scrim,
    },
  };
}
export const lightTheme = buildTheme(false, lightColors);
export const darkTheme = buildTheme(true, darkColors);
export const theme = lightTheme;
export type AppTheme = typeof lightTheme;

import { useTheme } from "../../hooks/useTheme";
import { darkColors, lightColors } from "../tokens";
export function useDesign() {
  const { isDark } = useTheme();
  return { colors: isDark ? darkColors : lightColors, isDark };
}

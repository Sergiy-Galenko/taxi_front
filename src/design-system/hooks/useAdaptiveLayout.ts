import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { windowLayout } from "../adaptive";
export function useAdaptiveLayout() {
  const window = useWindowDimensions();
  const insets = useSafeAreaInsets();
  return {
    ...windowLayout(
      window.width,
      window.height,
      window.fontScale,
      insets.left + insets.right,
    ),
    ...window,
    insets,
  };
}

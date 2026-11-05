import React, { ReactNode } from "react";
import { View } from "react-native";
import { useAdaptiveLayout } from "../hooks/useAdaptiveLayout";
/** Stable sibling slots: changing composition never remounts business-state children. */
export function AdaptiveScreen({
  panel,
  map,
}: {
  panel: ReactNode;
  map: ReactNode;
}) {
  const { sidePanel, panelWidth } = useAdaptiveLayout();
  return (
    <View
      style={{ flex: 1, flexDirection: sidePanel ? "row" : "column-reverse" }}
    >
      <View
        style={{
          width: sidePanel ? panelWidth : undefined,
          flexShrink: 0,
          zIndex: 1,
        }}
      >
        {panel}
      </View>
      <View style={{ flex: 1, minWidth: 0, minHeight: 0 }}>{map}</View>
    </View>
  );
}

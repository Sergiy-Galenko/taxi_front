import React, { forwardRef, useImperativeHandle, useState } from "react";
import { StyleSheet, View } from "react-native";
import { DEFAULT_REGION } from "../../data/passenger";
import { AppText } from "../../design-system/components/ui";
import { useDesign } from "../../design-system/hooks/useDesign";
import { TaxiMapHandle, TaxiMapProps } from "./types";
import { Coordinates } from "../../types/passenger";
/** Browser rendering uses a real OSM embed. Native platforms retain react-native-maps. */
export default forwardRef<TaxiMapHandle, TaxiMapProps>(function TaxiMap(
  { pickup, destination, pickupLabel },
  ref,
) {
  const [overview, setOverview] = useState<Coordinates | null>(null);
  const { colors } = useDesign();
  useImperativeHandle(
    ref,
    () => ({
      animateToRegion: setOverview,
      fitToCoordinates: (points) => {
        if (points.length)
          setOverview({
            latitude:
              points.reduce((sum, point) => sum + point.latitude, 0) /
              points.length,
            longitude:
              points.reduce((sum, point) => sum + point.longitude, 0) /
              points.length,
          });
      },
    }),
    [],
  );
  const center = overview ?? pickup ?? destination ?? DEFAULT_REGION;
  const dx = Math.max(
    0.035,
    pickup && destination
      ? Math.abs(pickup.longitude - destination.longitude)
      : 0.035,
  );
  const dy = Math.max(
    0.025,
    pickup && destination
      ? Math.abs(pickup.latitude - destination.latitude)
      : 0.025,
  );
  const params = new URLSearchParams({
    bbox: `${center.longitude - dx},${center.latitude - dy},${center.longitude + dx},${center.latitude + dy}`,
    layer: "mapnik",
    ...(pickup ? { marker: `${pickup.latitude},${pickup.longitude}` } : {}),
  });
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.inset }]}>
      <iframe
        title={pickupLabel || "OpenStreetMap"}
        src={`https://www.openstreetmap.org/export/embed.html?${params}`}
        style={{ width: "100%", height: "100%", border: 0 }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          backgroundColor: colors.surface,
          padding: 4,
        }}
      >
        <AppText variant="caption" tone="secondary">
          OpenStreetMap · Web
        </AppText>
      </View>
    </View>
  );
});

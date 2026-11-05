import React, { ReactNode, useEffect } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SheetPosition, sheetStops } from "../adaptive";
import { useAdaptiveLayout } from "../hooks/useAdaptiveLayout";
import { useDesign } from "../hooks/useDesign";
import { useReducedMotion } from "../../shared/hooks/useReducedMotion";
import { useI18n } from "../../hooks/useI18n";
import { motion, radii, space } from "../tokens";
import { AppText, MapControlButton } from "./ui";
export default function BookingSheet({
  children,
  footer,
  title,
  subtitle,
  availableHeight,
  position,
  onPositionChange,
}: {
  children: ReactNode;
  footer: ReactNode;
  title: string;
  subtitle?: string;
  availableHeight: number;
  position: SheetPosition;
  onPositionChange: (position: SheetPosition) => void;
}) {
  const { sidePanel, fontScale } = useAdaptiveLayout();
  const { colors } = useDesign();
  const { t } = useI18n();
  const reduced = useReducedMotion();
  const stops = sheetStops(availableHeight, fontScale);
  const tight = availableHeight < 360;
  const targetHeight = tight && !sidePanel ? Math.max(0, availableHeight - 48) : stops[position];
  const height = useSharedValue(stops[position]);
  const start = useSharedValue(0);
  useEffect(() => {
    height.value = withTiming(targetHeight, {
      duration: reduced ? 0 : motion.standard,
    });
  }, [
    height,
    position,
    targetHeight,
    stops.collapsed,
    stops.partial,
    stops.expanded,
    reduced,
    sidePanel,
  ]);
  const gesture = Gesture.Pan()
    .enabled(!sidePanel && !tight)
    .onBegin(() => {
      start.value = height.value;
    })
    .onUpdate((event) => {
      height.value = Math.max(
        stops.collapsed,
        Math.min(stops.expanded, start.value - event.translationY),
      );
    })
    .onEnd(() => {
      const values: SheetPosition[] = ["collapsed", "partial", "expanded"];
      let nearest: SheetPosition = "partial";
      let difference = Infinity;
      for (const value of values) {
        const distance = Math.abs(stops[value] - height.value);
        if (distance < difference) {
          difference = distance;
          nearest = value;
        }
      }
      height.value = withTiming(stops[nearest], {
        duration: reduced ? 0 : motion.settle,
      });
      runOnJS(onPositionChange)(nearest);
    });
  const animated = useAnimatedStyle(() => ({ height: height.value }));
  const toggle = () =>
    onPositionChange(position === "expanded" ? "partial" : "expanded");
  return (
    <Animated.View
      testID="booking-sheet"
      style={[
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
          borderTopLeftRadius: sidePanel ? 0 : radii.sheet,
          borderTopRightRadius: sidePanel ? 0 : radii.sheet,
          overflow: "hidden",
        },
        sidePanel ? { height: availableHeight } : animated,
      ]}
    >
      {!sidePanel && !tight ? (
        <GestureDetector gesture={gesture}>
          <View>
            <Pressable
              accessibilityRole="adjustable"
              accessibilityLabel={t("ui.bookingPanel")}
              aria-valuetext={t(`ui.sheet.${position}`)}
              aria-valuemin={0}
              aria-valuemax={2}
              aria-valuenow={
                position === "collapsed" ? 0 : position === "partial" ? 1 : 2
              }
              accessibilityValue={{
                text: t(`ui.sheet.${position}`),
                min: 0,
                max: 2,
                now:
                  position === "collapsed" ? 0 : position === "partial" ? 1 : 2,
              }}
              accessibilityActions={[
                { name: "increment", label: t("ui.expand") },
                { name: "decrement", label: t("ui.collapse") },
              ]}
              onAccessibilityAction={(event) =>
                onPositionChange(
                  event.nativeEvent.actionName === "increment"
                    ? "expanded"
                    : "collapsed",
                )
              }
              onPress={toggle}
              style={{
                minHeight: 48,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 4,
                  borderRadius: radii.pill,
                  backgroundColor: colors.border,
                }}
              />
            </Pressable>
          </View>
        </GestureDetector>
      ) : null}
      <View
        style={{
          display: tight ? "none" : "flex",
          flexDirection: "row",
          gap: space.md,
          alignItems: "flex-start",
          paddingHorizontal: space.xl,
          paddingTop: sidePanel ? space.xxl : 0,
          paddingBottom: space.md,
        }}
      >
        <View style={{ flex: 1, gap: space.xs }}>
          <AppText variant={fontScale > 1.4 ? "card" : "section"}>
            {position === "collapsed" && !sidePanel ? t("ui.yourRoute") : title}
          </AppText>
          {subtitle &&
          position !== "collapsed" &&
          fontScale < 1.5 &&
          availableHeight >= 480 ? (
            <AppText variant="secondary" tone="secondary">
              {subtitle}
            </AppText>
          ) : null}
        </View>
        {!sidePanel && !tight ? (
          <MapControlButton
            icon={position === "expanded" ? "chevron-down" : "chevron-up"}
            label={t(position === "expanded" ? "ui.collapse" : "ui.expand")}
            onPress={() =>
              onPositionChange(
                position === "expanded" ? "collapsed" : "expanded",
              )
            }
          />
        ) : null}
      </View>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        style={{
          flex: 1,
          display: position === "collapsed" && !sidePanel && !tight ? "none" : "flex",
        }}
        contentContainerStyle={{ padding: space.xl, gap: space.xl }}
      >
        {children}
        {tight ? footer : null}
      </ScrollView>
      <View
        style={{
          display: tight ? "none" : "flex",
          padding: space.lg,
          borderTopWidth: 1,
          borderColor: colors.border,
        }}
      >
        {footer}
      </View>
    </Animated.View>
  );
}

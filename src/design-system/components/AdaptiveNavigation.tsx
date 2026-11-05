import React, { useState } from "react";
import { Pressable, View } from "react-native";
import { AppIcon, AppText, IconName } from "./ui";
import { useDesign } from "../hooks/useDesign";
import { layout, radii, space } from "../tokens";
export interface NavigationItem<T extends string> {
  key: T;
  label: string;
  icon: IconName;
}
export default function AdaptiveNavigation<T extends string>({
  items,
  active,
  onSelect,
  rail = false,
}: {
  items: readonly NavigationItem<T>[];
  active: T;
  onSelect: (key: T) => void;
  rail?: boolean;
}) {
  const { colors } = useDesign();
  const [focused, setFocused] = useState<T | null>(null);
  return (
    <View
      accessibilityRole="tablist"
      style={{
        width: rail ? layout.rail : undefined,
        flexDirection: rail ? "column" : "row",
        borderTopWidth: rail ? 0 : 1,
        borderRightWidth: rail ? 1 : 0,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        padding: space.sm,
        paddingTop: rail ? space.xxl : space.sm,
        gap: space.xs,
      }}
    >
      {rail ? (
        <View
          accessible={false}
          style={{
            alignItems: "center",
            paddingVertical: space.xl,
            marginBottom: space.xl,
          }}
        >
          <AppIcon name="navigate" tone="primary" size={26} />
        </View>
      ) : null}
      {items.map((item) => (
        <Pressable
          key={item.key}
          accessibilityRole="tab"
          aria-selected={item.key === active}
          accessibilityLabel={item.label}
          accessibilityState={{ selected: item.key === active }}
          onFocus={() => setFocused(item.key)}
          onBlur={() => setFocused(null)}
          onPress={() => onSelect(item.key)}
          style={({ pressed }) => ({
            flex: rail ? undefined : 1,
            minWidth: 0,
            minHeight: layout.touch,
            justifyContent: "center",
            alignItems: "center",
            gap: space.xs,
            paddingVertical: space.md,
            paddingHorizontal: space.xs,
            borderRadius: radii.md,
            borderWidth: 1,
            borderColor:
              focused === item.key ? colors.focus : colors.transparent,
            backgroundColor:
              item.key === active ? colors.primarySoft : colors.transparent,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <AppIcon
            name={item.icon}
            tone={item.key === active ? "primary" : "secondary"}
          />
          <AppText
            variant="caption"
            tone={item.key === active ? "primary" : "secondary"}
            style={{ textAlign: "center", letterSpacing: 0 }}
          >
            {item.label}
          </AppText>
        </Pressable>
      ))}
    </View>
  );
}

import React from "react";
import { Pressable, View } from "react-native";
import { AppIcon, AppText } from "./ui";
import { useDesign } from "../hooks/useDesign";
import { layout, radii, space } from "../tokens";
export function CheckField({
  value,
  onChange,
  label,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  const { colors } = useDesign();
  return (
    <Pressable
      accessibilityRole="checkbox"
      aria-checked={value}
      accessibilityState={{ checked: value }}
      accessibilityLabel={label}
      onPress={() => onChange(!value)}
      style={{
        flexDirection: "row",
        gap: space.md,
        alignItems: "center",
        minHeight: layout.touch,
        paddingVertical: space.sm,
      }}
    >
      <View
        style={{
          borderWidth: 1,
          borderColor: value ? colors.primary : colors.secondary,
          borderRadius: radii.sm,
          padding: 3,
          backgroundColor: value ? colors.primarySoft : colors.transparent,
        }}
      >
        <AppIcon
          name={value ? "checkmark" : "remove-outline"}
          tone={value ? "primary" : "secondary"}
          size={18}
        />
      </View>
      <AppText variant="secondary" style={{ flex: 1 }}>
        {label}
      </AppText>
    </Pressable>
  );
}

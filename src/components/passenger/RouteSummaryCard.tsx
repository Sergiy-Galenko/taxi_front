import React from "react";
import { View } from "react-native";
import {
  AppButton,
  AppCard,
  AppText,
  InfoRow,
  IconName,
} from "../../design-system/components/ui";
import { useI18n } from "../../hooks/useI18n";
import { space } from "../../design-system/tokens";
export default function RouteSummaryCard({
  pickup,
  destination,
  badge,
  meta = [],
  onPressEdit,
}: {
  pickup: string;
  destination: string;
  badge?: string;
  meta?: Array<{ icon: IconName; label: string }>;
  onPressEdit?: () => void;
}) {
  const { t } = useI18n();
  return (
    <AppCard>
      {badge ? (
        <AppText variant="caption" tone="primary">
          {badge}
        </AppText>
      ) : null}
      <InfoRow
        icon="location-outline"
        label={t("home.pickupLabel")}
        value={pickup || t("ui.notSelected")}
      />
      <InfoRow
        icon="flag-outline"
        label={t("home.destinationLabel")}
        value={destination || t("ui.notSelected")}
      />
      {meta.length ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.md }}>
          {meta.map((item) => (
            <AppText key={item.label} variant="secondary" tone="secondary">
              {item.label}
            </AppText>
          ))}
        </View>
      ) : null}
      {onPressEdit ? (
        <AppButton
          label={t("ui.editRoute")}
          icon="create-outline"
          variant="ghost"
          onPress={onPressEdit}
        />
      ) : null}
    </AppCard>
  );
}

import React from "react";
import { View } from "react-native";
import {
  AppCard,
  AppIcon,
  AppText,
  TripStatusBadge,
} from "../../design-system/components/ui";
import { useI18n } from "../../hooks/useI18n";
import { RideOption, TripSummary } from "../../types/passenger";
import { radii, space } from "../../design-system/tokens";
import { useDesign } from "../../design-system/hooks/useDesign";
const icons = {
  economy: "car-sport-outline",
  comfort: "car-outline",
  xl: "people-outline",
} as const;
export default function VehicleOptionCard({
  option,
  summary,
  selected,
  onPress,
}: {
  option: RideOption;
  summary: TripSummary;
  selected: boolean;
  onPress: () => void;
}) {
  const { t } = useI18n();
  const { colors } = useDesign();
  return (
    <AppCard
      selected={selected}
      onPress={onPress}
      accessibilityLabel={`${t(`rideOptions.${option.key}.label`)}, ${t(selected ? "vehicleSelection.selected" : "ui.chooseClass")}`}
    >
      <View
        style={{ flexDirection: "row", alignItems: "center", gap: space.lg }}
      >
        <View
          style={{
            backgroundColor: colors.inset,
            borderRadius: radii.md,
            width: 56,
            height: 48,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AppIcon
            name={icons[option.key]}
            tone={selected ? "primary" : "secondary"}
            size={30}
          />
        </View>
        <View style={{ flex: 1, gap: space.xs }}>
          <AppText variant="card">
            {t(`rideOptions.${option.key}.label`)}
          </AppText>
          <AppText variant="secondary" tone="secondary">
            {t(`rideOptions.${option.key}.description`)}
          </AppText>
        </View>
        <AppIcon
          name={selected ? "checkmark-circle" : "ellipse-outline"}
          tone={selected ? "primary" : "muted"}
        />
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.md }}>
        <TripStatusBadge
          label={t(`ui.capacity.${option.key}`)}
          icon="people-outline"
        />
        <TripStatusBadge
          label={
            summary.pickupEtaMin === null
              ? t("ui.etaUnknown")
              : t("common.minutesShort", { count: summary.pickupEtaMin })
          }
          icon="time-outline"
        />
      </View>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "baseline",
          gap: space.sm,
          justifyContent: "space-between",
        }}
      >
        <AppText tone="secondary" variant="secondary">
          {t("vehicleSelection.fare")}
        </AppText>
        <AppText variant="card">
          {summary.price === null
            ? t("ui.quoteUnavailable")
            : t("common.priceUah", { amount: summary.price })}
        </AppText>
      </View>
      <AppText variant="caption" tone="secondary">
        {t("ui.availabilityUnconfirmed")}
      </AppText>
    </AppCard>
  );
}

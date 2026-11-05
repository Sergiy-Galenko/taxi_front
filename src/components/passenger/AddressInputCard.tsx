import React from "react";
import { View } from "react-native";
import { AppInput, MapControlButton } from "../../design-system/components/ui";
import { useI18n } from "../../hooks/useI18n";
import { space } from "../../design-system/tokens";
interface Props {
  headerLabel: string;
  pickupLabel: string;
  destinationLabel: string;
  pickupPlaceholder: string;
  destinationPlaceholder: string;
  pickup: string;
  destination: string;
  onPickupChange: (value: string) => void;
  onDestinationChange: (value: string) => void;
  onUseCurrentLocation: () => void;
  onSwap: () => void;
  onPickupFocus: () => void;
  onDestinationFocus: () => void;
  focusedField?: "pickup" | "destination" | null;
}
export default function AddressInputCard({
  pickupLabel,
  destinationLabel,
  pickupPlaceholder,
  destinationPlaceholder,
  pickup,
  destination,
  onPickupChange,
  onDestinationChange,
  onSwap,
  onPickupFocus,
  onDestinationFocus,
}: Props) {
  const { t } = useI18n();
  return (
    <View style={{ gap: space.md }}>
      <AppInput
        label={pickupLabel}
        value={pickup}
        onChangeText={onPickupChange}
        onFocus={onPickupFocus}
        placeholder={pickupPlaceholder}
        icon="location-outline"
        returnKeyType="next"
      />
      <View
        style={{ flexDirection: "row", gap: space.sm, alignItems: "center" }}
      >
        <View style={{ flex: 1 }}>
          <AppInput
            label={destinationLabel}
            value={destination}
            onChangeText={onDestinationChange}
            onFocus={onDestinationFocus}
            placeholder={destinationPlaceholder}
            icon="flag-outline"
            returnKeyType="done"
          />
        </View>
        <View style={{ paddingTop: space.xxl }}>
          <MapControlButton
            icon="swap-vertical"
            label={t("accessibility.swap")}
            onPress={onSwap}
          />
        </View>
      </View>
    </View>
  );
}

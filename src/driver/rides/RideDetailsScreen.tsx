import React, { useState } from "react";
import { View } from "react-native";
import {
  AppButton,
  AppCard,
  AppText,
  ConfirmationDialog,
} from "../../design-system/components/ui";
import { RideSnapshot } from "../../features/rides/gateway";
import { RideStatusPanel } from "../../features/rides/components/RidePresentation";
import { useI18n } from "../../hooks/useI18n";
import { space } from "../../design-system/tokens";
export default function RideDetailsScreen({
  ride,
  onArrive,
  onStart,
  onComplete,
}: {
  ride?: RideSnapshot;
  onArrive?: () => void;
  onStart?: () => void;
  onComplete?: () => void;
}) {
  const { t } = useI18n();
  const [confirm, setConfirm] = useState(false);
  return (
    <AppCard>
      {ride ? (
        <RideStatusPanel status={ride.status} />
      ) : (
        <>
          <AppText variant="card">{t("ui.activeTripUnavailable")}</AppText>
          <AppText tone="secondary" variant="secondary">
            {t("ui.activeTripHint")}
          </AppText>
        </>
      )}
      <View style={{ gap: space.sm }}>
        <AppButton
          label={t("ui.navigatePickup")}
          icon="navigate-outline"
          variant="secondary"
          disabled
        />
        <AppButton
          label={t("ui.confirmArrival")}
          onPress={onArrive}
          disabled={
            !onArrive || !ride || !["matched", "arriving"].includes(ride.status)
          }
          variant="secondary"
        />
        <AppButton
          label={t("ui.startRide")}
          onPress={onStart}
          disabled={!onStart || ride?.status !== "arrived"}
          variant="secondary"
        />
        <AppButton
          label={t("ui.completeRide")}
          onPress={() => setConfirm(true)}
          disabled={!onComplete || ride?.status !== "in_progress"}
          variant="secondary"
        />
      </View>
      <ConfirmationDialog
        visible={confirm}
        title={t("ui.completeRide")}
        description={t("ui.completeRideHint")}
        confirmLabel={t("ui.completeRide")}
        cancelLabel={t("common.cancel")}
        onCancel={() => setConfirm(false)}
        onConfirm={() => {
          setConfirm(false);
          onComplete?.();
        }}
      />
    </AppCard>
  );
}

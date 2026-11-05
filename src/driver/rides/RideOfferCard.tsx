import React, { useRef, useState } from "react";
import {
  AppButton,
  AppCard,
  AppText,
  ConfirmationDialog,
  InfoRow,
  TripStatusBadge,
} from "../../design-system/components/ui";
import { Ride } from "../types/driverTypes";
import { useI18n } from "../../hooks/useI18n";
export default function RideOfferCard({
  ride,
  onAccept,
  onDecline,
  distanceKm,
  earningsLabel,
  paymentLabel,
  note,
}: {
  ride: Ride;
  distanceKm?: number;
  earningsLabel?: string;
  paymentLabel?: string;
  note?: string;
  onAccept?: (id: string) => Promise<void>;
  onDecline?: (id: string) => void;
}) {
  const { t } = useI18n();
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState("");
  const lock = useRef(false);
  const accept = async () => {
    if (!onAccept || lock.current) return;
    lock.current = true;
    setBusy(true);
    try {
      await onAccept(ride.id);
      setConfirm(false);
    } catch {
      setFailure(t("ui.offerChanged"));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  return (
    <AppCard>
      <InfoRow
        icon="location-outline"
        label={t("home.pickupLabel")}
        value={ride.from}
      />
      <InfoRow
        icon="flag-outline"
        label={t("home.destinationLabel")}
        value={ride.to}
      />
      <InfoRow
        label={t("history.fare")}
        value={t("common.priceUah", { amount: ride.price })}
      />
      {distanceKm !== undefined ? (
        <TripStatusBadge
          label={t("common.kilometersShort", { count: distanceKm })}
          icon="map-outline"
        />
      ) : null}
      {earningsLabel ? (
        <InfoRow label={t("ui.estimatedEarnings")} value={earningsLabel} />
      ) : null}
      {paymentLabel ? (
        <InfoRow label={t("ui.paymentPreference")} value={paymentLabel} />
      ) : null}
      {note ? (
        <AppText variant="secondary" tone="secondary">
          {note}
        </AppText>
      ) : null}
      {failure ? (
        <AppText tone="danger" accessibilityRole="alert">
          {failure}
        </AppText>
      ) : null}
      <AppButton
        label={t("ui.acceptOffer")}
        disabled={!onAccept}
        onPress={() => setConfirm(true)}
      />
      <AppButton
        label={t("ui.declineOffer")}
        variant="ghost"
        disabled={!onDecline || busy}
        onPress={() => onDecline?.(ride.id)}
      />
      <ConfirmationDialog
        visible={confirm}
        title={t("ui.acceptOffer")}
        description={t("ui.acceptOfferHint")}
        confirmLabel={t("ui.acceptOffer")}
        cancelLabel={t("common.cancel")}
        busy={busy}
        onCancel={() => setConfirm(false)}
        onConfirm={() => {
          void accept();
        }}
      />
    </AppCard>
  );
}

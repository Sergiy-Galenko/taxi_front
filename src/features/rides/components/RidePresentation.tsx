import React from "react";
import { View } from "react-native";
import {
  AppButton,
  AppCard,
  AppIcon,
  AppText,
  IconName,
  LoadingState,
  StateTone,
  TripStatusBadge,
} from "../../../design-system/components/ui";
import { useI18n } from "../../../hooks/useI18n";
import { useReducedMotion } from "../../../shared/hooks/useReducedMotion";
import { DriverMatch, MatchingStatus, RideStatus } from "../gateway";
import { radii, space } from "../../../design-system/tokens";
import { useDesign } from "../../../design-system/hooks/useDesign";
export function DriverCard({
  driver,
  rating,
  eta,
  onContact,
}: {
  driver: DriverMatch;
  rating?: string;
  eta?: string;
  onContact?: () => void;
}) {
  const { t } = useI18n();
  const { colors } = useDesign();
  return (
    <AppCard>
      <View
        style={{ flexDirection: "row", alignItems: "center", gap: space.lg }}
      >
        <View
          style={{
            padding: space.md,
            borderRadius: radii.md,
            backgroundColor: colors.inset,
          }}
        >
          <AppIcon name="person-outline" tone="primary" size={28} />
        </View>
        <View style={{ flex: 1, gap: space.xs }}>
          <AppText variant="card">{driver.name}</AppText>
          <AppText tone="secondary" variant="secondary">
            {driver.car}
          </AppText>
        </View>
        {rating ? <TripStatusBadge label={rating} icon="star" /> : null}
      </View>
      <AppText variant="card">{driver.plate}</AppText>
      {eta ? <TripStatusBadge label={eta} icon="time-outline" /> : null}
      <AppButton
        label={t("ui.contactDriver")}
        icon="call-outline"
        variant="secondary"
        onPress={onContact}
        disabled={!onContact}
      />
    </AppCard>
  );
}
const matchingIcons: Record<
  MatchingStatus | "unavailable" | "offline",
  IconName
> = {
  idle: "time-outline",
  submitting: "cloud-upload-outline",
  searching: "radio-outline",
  matched: "checkmark-circle-outline",
  no_drivers: "car-outline",
  cancelled: "close-circle-outline",
  expired: "hourglass-outline",
  failed: "alert-circle-outline",
  unavailable: "cloud-offline-outline",
  offline: "cloud-offline-outline",
};
type MatchingPanelProps = (
  | { status: "matched"; driver: DriverMatch }
  | {
      status: Exclude<MatchingStatus, "matched"> | "unavailable" | "offline";
      driver?: never;
    }
) & { onCancel?: () => void; onRetry?: () => void };
export function MatchingPanel({
  status,
  driver,
  onCancel,
  onRetry,
}: MatchingPanelProps) {
  const { t } = useI18n();
  const reduced = useReducedMotion();
  return (
    <View style={{ gap: space.lg }}>
      <AppCard>
        <AppIcon
          name={matchingIcons[status]}
          size={32}
          tone={
            status === "matched"
              ? "success"
              : status === "failed"
                ? "danger"
                : "primary"
          }
        />
        <AppText accessibilityRole="header" variant="section">
          {t(`ui.match.${status}.title`)}
        </AppText>
        <AppText accessibilityLiveRegion="polite" tone="secondary">
          {t(`ui.match.${status}.hint`)}
        </AppText>
        {!reduced && (status === "searching" || status === "submitting") ? (
          <LoadingState label={t(`ui.match.${status}.title`)} />
        ) : null}
        {onRetry ? (
          <AppButton
            label={t("integration.retry")}
            variant="secondary"
            onPress={onRetry}
          />
        ) : null}
        {status === "searching" ? (
          <AppButton
            label={t("driverSearch.cancelRequest")}
            variant="ghost"
            disabled={!onCancel}
            onPress={onCancel}
          />
        ) : null}
      </AppCard>
      {status === "matched" && driver ? <DriverCard driver={driver} /> : null}
    </View>
  );
}
const rideStates: Record<
  RideStatus | "offline" | "unavailable",
  { icon: IconName; tone: StateTone }
> = {
  matched: { icon: "checkmark-circle-outline", tone: "success" },
  arriving: { icon: "navigate-outline", tone: "neutral" },
  arrived: { icon: "location-outline", tone: "success" },
  in_progress: { icon: "car-sport-outline", tone: "neutral" },
  completed: { icon: "flag-outline", tone: "success" },
  cancelled: { icon: "close-circle-outline", tone: "warning" },
  offline: { icon: "cloud-offline-outline", tone: "danger" },
  unavailable: { icon: "information-circle-outline", tone: "neutral" },
};
export function RideStatusPanel({
  status,
}: {
  status: keyof typeof rideStates;
}) {
  const { t } = useI18n();
  const state = rideStates[status];
  return (
    <AppCard>
      <TripStatusBadge
        label={t(`ui.ride.${status}.title`)}
        icon={state.icon}
        tone={state.tone}
      />
      <AppText variant="section">{t(`ui.ride.${status}.title`)}</AppText>
      <AppText accessibilityLiveRegion="polite" tone="secondary">
        {t(`ui.ride.${status}.hint`)}
      </AppText>
    </AppCard>
  );
}

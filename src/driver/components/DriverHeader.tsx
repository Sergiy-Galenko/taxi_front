import React from "react";
import { AppHeader, TripStatusBadge } from "../../design-system/components/ui";
import { useI18n } from "../../hooks/useI18n";
export default function DriverHeader({ name }: { name?: string }) {
  const { t } = useI18n();
  return (
    <AppHeader
      title={name || t("ui.driverWorkspace")}
      eyebrow={t("ui.driverWorkspace")}
      subtitle={t("ui.driverWelcome")}
      right={
        <TripStatusBadge
          label={t("ui.notConnected")}
          icon="cloud-offline-outline"
        />
      }
    />
  );
}

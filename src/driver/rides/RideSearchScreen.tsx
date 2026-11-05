import React from "react";
import { StatePanel } from "../../design-system/components/ui";
import { useI18n } from "../../hooks/useI18n";
export default function RideSearchScreen() {
  const { t } = useI18n();
  return (
    <StatePanel
      icon="car-outline"
      title={t("ui.requestsUnavailable")}
      description={t("integration.driver")}
    />
  );
}

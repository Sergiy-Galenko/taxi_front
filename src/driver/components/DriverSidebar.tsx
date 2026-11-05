import React from "react";
import AdaptiveNavigation from "../../design-system/components/AdaptiveNavigation";
import { useI18n } from "../../hooks/useI18n";
export type DriverSection = "overview" | "requests" | "account";
export default function DriverSidebar({
  active,
  onSelect,
  rail,
}: {
  active: DriverSection;
  onSelect: (section: DriverSection) => void;
  rail: boolean;
}) {
  const { t } = useI18n();
  return (
    <AdaptiveNavigation
      active={active}
      onSelect={onSelect}
      rail={rail}
      items={[
        {
          key: "overview",
          label: t("ui.driverOverview"),
          icon: "grid-outline",
        },
        { key: "requests", label: t("ui.requests"), icon: "car-outline" },
        { key: "account", label: t("ui.account"), icon: "person-outline" },
      ]}
    />
  );
}

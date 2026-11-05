import React from "react";
import { AppCard, AppText } from "../../design-system/components/ui";
import { useI18n } from "../../hooks/useI18n";
export default function RideFilters() {
  const { t } = useI18n();
  return (
    <AppCard>
      <AppText variant="card">{t("ui.requestPreferences")}</AppText>
      <AppText variant="secondary" tone="secondary">
        {t("ui.requestPreferencesHint")}
      </AppText>
    </AppCard>
  );
}

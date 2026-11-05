import React from "react";
import { StatePanel } from "../../design-system/components/ui";
import { useI18n } from "../../hooks/useI18n";
export default function EditProfileScreen() {
  const { t } = useI18n();
  return (
    <StatePanel
      icon="person-outline"
      title={t("ui.profileEditingUnavailable")}
      description={t("ui.profileEditingHint")}
    />
  );
}

import React from "react";
import { useNavigation } from "@react-navigation/native";
import AuthLayout from "../../../design-system/components/AuthLayout";
import {
  AppButton,
  AppCard,
  InfoRow,
  TripStatusBadge,
} from "../../../design-system/components/ui";
import { useI18n } from "../../../hooks/useI18n";
import { NavigationProp } from "../../../types/navigation";
import IntegrationNotice from "../../../shared/components/IntegrationNotice";
export default function DriverVerification() {
  const { t } = useI18n();
  const navigation = useNavigation<NavigationProp>();
  return (
    <AuthLayout
      title={t("integration.verificationTitle")}
      description={t("ui.verificationHint")}
      step={6}
    >
      <TripStatusBadge
        label={t("ui.uploadUnavailable")}
        icon="cloud-offline-outline"
        tone="warning"
      />
      <AppCard>
        <InfoRow
          label={t("ui.document1")}
          value={t("ui.notSubmitted")}
          icon="card-outline"
        />
        <InfoRow
          label={t("ui.document2")}
          value={t("ui.notSubmitted")}
          icon="car-outline"
        />
        <InfoRow
          label={t("ui.document3")}
          value={t("ui.notSubmitted")}
          icon="person-outline"
        />
      </AppCard>
      <IntegrationNotice detail="integration.verification" />
      <AppButton
        label={t("ui.uploadDocuments")}
        icon="cloud-upload-outline"
        disabled
      />
      <AppButton
        label={t("integration.signIn")}
        onPress={() =>
          navigation.reset({ index: 0, routes: [{ name: "Login" }] })
        }
      />
    </AuthLayout>
  );
}

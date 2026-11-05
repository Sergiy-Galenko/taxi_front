import React from "react";
import { useNavigation } from "@react-navigation/native";
import AuthLayout from "../../../design-system/components/AuthLayout";
import {
  AppButton,
  AppCard,
  InfoRow,
} from "../../../design-system/components/ui";
import { useI18n } from "../../../hooks/useI18n";
import { NavigationProp } from "../../../types/navigation";
export default function DriverRegistration() {
  const { t } = useI18n();
  const navigation = useNavigation<NavigationProp>();
  return (
    <AuthLayout
      title={t("ui.driverSignup")}
      description={t("ui.driverSignupHint")}
      onBack={() => navigation.goBack()}
    >
      <AppCard>
        <InfoRow
          icon="person-outline"
          label={t("ui.beforeYouBegin")}
          value={t("ui.driverChecklist1")}
        />
        <InfoRow
          icon="car-outline"
          label={t("ui.vehicle")}
          value={t("ui.driverChecklist2")}
        />
        <InfoRow
          icon="shield-checkmark-outline"
          label={t("ui.verification")}
          value={t("ui.driverChecklist3")}
        />
      </AppCard>
      <AppButton
        label={t("Почати реєстрацію")}
        icon="arrow-forward"
        onPress={() => navigation.navigate("DriverPersonalInfo")}
      />
    </AuthLayout>
  );
}

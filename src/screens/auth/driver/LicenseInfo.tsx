import React, { useState } from "react";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import AuthLayout from "../../../design-system/components/AuthLayout";
import { AppButton, AppInput } from "../../../design-system/components/ui";
import { useDriverDraft } from "../../../features/auth/DriverDraft";
import { useI18n } from "../../../hooks/useI18n";
import { NavigationProp, RootStackParamList } from "../../../types/navigation";
import { getLicenseNumberError } from "../../../utils/validation";
export default function DriverLicenseInfo() {
  const { t } = useI18n();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, "DriverLicenseInfo">>();
  const { draft, update } = useDriverDraft();
  const [touched, setTouched] = useState(false);
  const error = getLicenseNumberError(draft.licenseNumber);
  const change = (value: string) => {
    const clean = value.toUpperCase().replace(/[\s-]/g, "").slice(0, 8);
    update({
      licenseNumber:
        /^[A-ZА-ЯІЇЄҐ]/.test(clean) && clean.length > 2
          ? `${clean.slice(0, 2)} ${clean.slice(2)}`
          : /^\d/.test(clean) && clean.length > 4
            ? `${clean.slice(0, 4)}-${clean.slice(4)}`
            : clean,
    });
  };
  return (
    <AuthLayout
      title={t("Водійське посвідчення")}
      description={t("Вкажіть номер вашого водійського посвідчення")}
      step={4}
      onBack={() => navigation.goBack()}
    >
      <AppInput
        label={t("Номер водійського посвідчення")}
        value={draft.licenseNumber}
        onChangeText={change}
        onBlur={() => setTouched(true)}
        error={touched ? error : null}
        icon="card-outline"
        autoCapitalize="characters"
        placeholder={t("АВ 123456 або 1234-5678")}
        hint={t("ui.licenseHint")}
      />
      <AppButton
        label={t("Далі")}
        icon="arrow-forward"
        onPress={() => {
          setTouched(true);
          if (!error)
            navigation.navigate("DriverPasswordSetup", {
              ...route.params,
              licenseNumber: draft.licenseNumber,
            });
        }}
      />
    </AuthLayout>
  );
}

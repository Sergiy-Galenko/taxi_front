import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import AuthLayout from "../../../design-system/components/AuthLayout";
import { AppButton, AppInput } from "../../../design-system/components/ui";
import { useDriverDraft } from "../../../features/auth/DriverDraft";
import { useI18n } from "../../../hooks/useI18n";
import { NavigationProp } from "../../../types/navigation";
import { getFullNameError } from "../../../utils/validation";
export default function DriverPersonalInfo() {
  const { t } = useI18n();
  const navigation = useNavigation<NavigationProp>();
  const { draft, update } = useDriverDraft();
  const [touched, setTouched] = useState(false);
  const error = getFullNameError(draft.fullName);
  return (
    <AuthLayout
      title={t("Ваші персональні дані")}
      description={t("Вкажіть своє повне ім'я для реєстрації")}
      step={1}
      onBack={() => navigation.goBack()}
    >
      <AppInput
        label={t("Повне ім'я")}
        icon="person-outline"
        value={draft.fullName}
        onChangeText={(fullName) => update({ fullName })}
        onBlur={() => setTouched(true)}
        error={touched ? error : null}
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
      />
      <AppButton
        label={t("Далі")}
        icon="arrow-forward"
        onPress={() => {
          setTouched(true);
          if (!error)
            navigation.navigate("DriverContactInfo", {
              fullName: draft.fullName.trim(),
            });
        }}
      />
    </AuthLayout>
  );
}

import React, { useState } from "react";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import AuthLayout from "../../../design-system/components/AuthLayout";
import { AppButton, AppInput } from "../../../design-system/components/ui";
import { useDriverDraft } from "../../../features/auth/DriverDraft";
import { useI18n } from "../../../hooks/useI18n";
import { NavigationProp, RootStackParamList } from "../../../types/navigation";
import { getEmailError, getPhoneError } from "../../../utils/validation";
export default function DriverContactInfo() {
  const { t } = useI18n();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, "DriverContactInfo">>();
  const { draft, update } = useDriverDraft();
  const [touched, setTouched] = useState({ email: false, phone: false });
  const errors = {
    email: getEmailError(draft.email.trim()),
    phone: getPhoneError(draft.phone),
  };
  return (
    <AuthLayout
      title={t("Контактна інформація")}
      description={t("Вкажіть свою електронну пошту та номер телефону")}
      step={2}
      onBack={() => navigation.goBack()}
    >
      <AppInput
        label={t("Електронна пошта")}
        icon="mail-outline"
        value={draft.email}
        onChangeText={(email) => update({ email })}
        onBlur={() => setTouched((v) => ({ ...v, email: true }))}
        error={touched.email ? errors.email : null}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
      />
      <AppInput
        label={t("Номер телефону")}
        icon="call-outline"
        value={draft.phone}
        onChangeText={(phone) => update({ phone })}
        onBlur={() => setTouched((v) => ({ ...v, phone: true }))}
        error={touched.phone ? errors.phone : null}
        keyboardType="phone-pad"
        autoComplete="tel"
        textContentType="telephoneNumber"
        placeholder="+380"
      />
      <AppButton
        label={t("Далі")}
        icon="arrow-forward"
        onPress={() => {
          setTouched({ email: true, phone: true });
          if (!errors.email && !errors.phone)
            navigation.navigate("DriverCarInfo", {
              fullName: route.params.fullName,
              email: draft.email.trim(),
              phone: draft.phone,
            });
        }}
      />
    </AuthLayout>
  );
}

import React, { useEffect, useRef, useState } from "react";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import AuthLayout from "../../../design-system/components/AuthLayout";
import {
  AppButton,
  AppInput,
  ErrorState,
} from "../../../design-system/components/ui";
import { CheckField } from "../../../design-system/components/CheckField";
import { useDriverDraft } from "../../../features/auth/DriverDraft";
import { useI18n } from "../../../hooks/useI18n";
import { NavigationProp, RootStackParamList } from "../../../types/navigation";
import { getPasswordError } from "../../../utils/validation";
import { createPassword } from "../../../utils/password";
import { registerDriver } from "../../../services/api/driver";
export default function DriverPasswordSetup() {
  const { t } = useI18n();
  const navigation = useNavigation<NavigationProp>();
  const route =
    useRoute<RouteProp<RootStackParamList, "DriverPasswordSetup">>();
  const { clear } = useDriverDraft();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [terms, setTerms] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState("");
  const lock = useRef(false);
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);
  const error = getPasswordError(password);
  const confirmError = confirm !== password ? t("Паролі не співпадають") : null;
  const submit = async () => {
    if (lock.current) return;
    setSubmitted(true);
    if (error || confirmError || !terms) return;
    lock.current = true;
    setBusy(true);
    setFailure("");
    request.current = new AbortController();
    try {
      const result = await registerDriver(
        {
          ...route.params,
          yearsOfExperience: Number(route.params.yearsOfExperience),
          password,
        },
        request.current.signal,
      );
      if (request.current.signal.aborted) return;
      if (!result.success || !result.data)
        throw new Error(t("ui.registrationFailed"));
      clear();
      navigation.reset({
        index: 1,
        routes: [{ name: "Login" }, { name: "DriverVerification" }],
      });
    } catch (error) {
      if (!request.current.signal.aborted)
        setFailure(
          error instanceof Error ? error.message : t("ui.registrationFailed"),
        );
    } finally {
      lock.current = false;
      if (!request.current.signal.aborted) setBusy(false);
    }
  };
  return (
    <AuthLayout
      title={t("Створення паролю")}
      description={t("ui.passwordHint")}
      step={5}
      onBack={() => navigation.goBack()}
    >
      <AppInput
        label={t("Пароль")}
        value={password}
        onChangeText={setPassword}
        error={submitted ? error : null}
        secureTextEntry
        icon="lock-closed-outline"
        autoComplete="new-password"
        textContentType="newPassword"
      />
      <AppInput
        label={t("Підтвердження паролю")}
        value={confirm}
        onChangeText={setConfirm}
        error={submitted ? confirmError : null}
        secureTextEntry
        icon="lock-closed-outline"
        autoComplete="new-password"
        textContentType="newPassword"
      />
      <AppButton
        label={t("Згенерувати надійний пароль")}
        variant="ghost"
        icon="key-outline"
        onPress={() => {
          const value = createPassword();
          setPassword(value);
          setConfirm(value);
        }}
      />
      <CheckField
        label={t("Я приймаю умови використання та політику конфіденційності")}
        value={terms}
        onChange={setTerms}
      />
      {submitted && !terms ? (
        <ErrorState
          title={t("ui.termsRequired")}
          description={t("Будь ласка, прийміть умови використання")}
        />
      ) : null}
      {failure ? (
        <ErrorState title={t("Помилка реєстрації")} description={failure} />
      ) : null}
      <AppButton
        label={t("Завершити реєстрацію")}
        loading={busy}
        onPress={() => {
          void submit();
        }}
      />
    </AuthLayout>
  );
}

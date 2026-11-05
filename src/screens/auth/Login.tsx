import React, { useEffect, useRef, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import AuthLayout from "../../design-system/components/AuthLayout";
import {
  AppButton,
  AppInput,
  AppText,
  ErrorState,
} from "../../design-system/components/ui";
import { useI18n } from "../../hooks/useI18n";
import { useUser } from "../../hooks/UserContext";
import { loginUser } from "../../services/api/auth";
import { getEmailError } from "../../utils/validation";
import { NavigationProp } from "../../types/navigation";
export default function Login() {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useI18n();
  const { signIn, state } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({ email: false, password: false });
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState("");
  const lock = useRef(false);
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);
  const emailError = getEmailError(email.trim());
  const passwordError = password ? null : t("Введіть пароль");
  const submit = async () => {
    if (lock.current) return;
    setTouched({ email: true, password: true });
    if (emailError || passwordError) return;
    lock.current = true;
    setBusy(true);
    setFailure("");
    request.current = new AbortController();
    try {
      const session = await loginUser(
        { email: email.trim(), password },
        request.current.signal,
      );
      if (!request.current.signal.aborted)
        await signIn(session.token, session.user);
    } catch (error) {
      if (!request.current.signal.aborted)
        setFailure(
          error instanceof Error
            ? error.message
            : t("Помилка мережі або сервера"),
        );
    } finally {
      lock.current = false;
      if (!request.current.signal.aborted) setBusy(false);
    }
  };
  return (
    <AuthLayout
      title={t("ui.welcomeBack")}
      description={t("ui.loginHint")}
      footer={
        <AppButton
          label={t("ui.createAccount")}
          variant="secondary"
          onPress={() => navigation.navigate("RoleSelection")}
        />
      }
    >
      {state.status === "expired" ? (
        <AppText
          accessibilityLiveRegion="polite"
          tone="warning"
          variant="secondary"
        >
          {t("integration.sessionExpired")}
        </AppText>
      ) : null}
      <AppInput
        label={t("Електронна пошта")}
        value={email}
        onChangeText={setEmail}
        onBlur={() => setTouched((value) => ({ ...value, email: true }))}
        error={touched.email ? emailError : null}
        icon="mail-outline"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="username"
        placeholder="name@example.com"
        returnKeyType="next"
      />
      <AppInput
        label={t("Пароль")}
        value={password}
        onChangeText={setPassword}
        onBlur={() => setTouched((value) => ({ ...value, password: true }))}
        error={touched.password ? passwordError : null}
        icon="lock-closed-outline"
        secureTextEntry
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={() => {
          void submit();
        }}
      />
      {failure ? (
        <ErrorState title={t("ui.signInFailed")} description={failure} />
      ) : null}
      <AppButton
        label={t("Увійти")}
        icon="arrow-forward"
        loading={busy}
        onPress={() => {
          void submit();
        }}
      />
      <AppText
        variant="secondary"
        tone="secondary"
        style={{ textAlign: "center" }}
      >
        {t("ui.oneAccount")}
      </AppText>
    </AuthLayout>
  );
}

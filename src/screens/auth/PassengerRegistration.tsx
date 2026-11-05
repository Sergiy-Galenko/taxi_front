import React, { useEffect, useRef, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import AuthLayout from "../../design-system/components/AuthLayout";
import {
  AppButton,
  AppInput,
  ErrorState,
} from "../../design-system/components/ui";
import { CheckField } from "../../design-system/components/CheckField";
import { useI18n } from "../../hooks/useI18n";
import { useUser } from "../../hooks/UserContext";
import { registerPassenger } from "../../services/api/auth";
import {
  getEmailError,
  getFullNameError,
  getPasswordError,
  getPhoneError,
} from "../../utils/validation";
import { createPassword } from "../../utils/password";
import { NavigationProp } from "../../types/navigation";
export default function PassengerRegistration() {
  const { t } = useI18n();
  const { signIn } = useUser();
  const navigation = useNavigation<NavigationProp>();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [terms, setTerms] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState<
    Partial<Record<keyof typeof form, boolean>>
  >({});
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState("");
  const request = useRef<AbortController | null>(null);
  const lock = useRef(false);
  useEffect(() => () => request.current?.abort(), []);
  const errors = {
    fullName: getFullNameError(form.fullName),
    email: getEmailError(form.email.trim()),
    phone: getPhoneError(form.phone),
    password: getPasswordError(form.password),
    confirmPassword:
      form.password !== form.confirmPassword
        ? t("Паролі не співпадають")
        : null,
  };
  const submit = async () => {
    if (lock.current) return;
    setSubmitted(true);
    if (!terms || Object.values(errors).some(Boolean)) return;
    lock.current = true;
    setBusy(true);
    setFailure("");
    request.current = new AbortController();
    try {
      const session = await registerPassenger(
        {
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          phone: form.phone,
          password: form.password,
        },
        request.current.signal,
      );
      if (!request.current.signal.aborted)
        await signIn(session.token, session.user);
    } catch (error) {
      if (!request.current.signal.aborted)
        setFailure(
          error instanceof Error ? error.message : t("Сталася помилка"),
        );
    } finally {
      lock.current = false;
      if (!request.current.signal.aborted) setBusy(false);
    }
  };
  return (
    <AuthLayout
      title={t("ui.passengerSignup")}
      description={t("ui.passengerSignupHint")}
      onBack={() => navigation.goBack()}
      footer={
        <AppButton
          label={t("ui.haveAccount")}
          variant="ghost"
          onPress={() => navigation.navigate("Login")}
        />
      }
    >
      {(
        [
          {
            key: "fullName",
            label: "Повне ім'я",
            icon: "person-outline",
            autoComplete: "name",
            textContentType: "name",
            autoCapitalize: "words",
          },
          {
            key: "email",
            label: "Електронна пошта",
            icon: "mail-outline",
            autoComplete: "email",
            textContentType: "emailAddress",
            keyboardType: "email-address",
            autoCapitalize: "none",
          },
          {
            key: "phone",
            label: "Телефон",
            icon: "call-outline",
            autoComplete: "tel",
            textContentType: "telephoneNumber",
            keyboardType: "phone-pad",
          },
          {
            key: "password",
            label: "Пароль",
            icon: "lock-closed-outline",
            autoComplete: "new-password",
            textContentType: "newPassword",
            secureTextEntry: true,
          },
          {
            key: "confirmPassword",
            label: "Підтвердження паролю",
            icon: "lock-closed-outline",
            autoComplete: "new-password",
            textContentType: "newPassword",
            secureTextEntry: true,
          },
        ] as const
      ).map(({ key, label, ...props }) => (
        <AppInput
          key={key}
          {...props}
          label={t(label)}
          value={form[key]}
          onChangeText={(text) =>
            setForm((value) => ({ ...value, [key]: text }))
          }
          onBlur={() => setTouched((value) => ({ ...value, [key]: true }))}
          error={submitted || touched[key] ? errors[key] : null}
        />
      ))}
      <AppButton
        label={t("Згенерувати надійний пароль")}
        icon="key-outline"
        variant="ghost"
        onPress={() => {
          const password = createPassword();
          setForm((value) => ({
            ...value,
            password,
            confirmPassword: password,
          }));
        }}
      />
      <CheckField
        label={t(
          "Я погоджуюсь з умовами використання та політикою конфіденційності",
        )}
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
        label={t("ui.createAccount")}
        loading={busy}
        onPress={() => {
          void submit();
        }}
      />
      {__DEV__ && process.env.EXPO_PUBLIC_ENABLE_PREVIEW === "true" ? (
        <AppButton
          label={t("Заповнити тестовими даними")}
          variant="ghost"
          onPress={() => {
            const password = createPassword();
            setForm({
              fullName: "Test Passenger",
              email: `passenger${Date.now()}@test.dev`,
              phone: "+380501234567",
              password,
              confirmPassword: password,
            });
          }}
        />
      ) : null}
    </AuthLayout>
  );
}

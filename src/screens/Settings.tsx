import React, { useState } from "react";
import { Linking, ScrollView, Switch, View } from "react-native";
import PassengerScreenLayout from "../components/passenger/PassengerScreenLayout";
import {
  AppButton,
  AppCard,
  AppIcon,
  AppText,
  ConfirmationDialog,
  ErrorState,
  InfoRow,
  LoadingState,
  ResponsiveGrid,
  SectionHeading,
  pageStyles,
} from "../design-system/components/ui";
import { useDesign } from "../design-system/hooks/useDesign";
import { radii, space } from "../design-system/tokens";
import { useUser } from "../hooks/UserContext";
import { useI18n } from "../hooks/useI18n";
import { useTheme } from "../hooks/useTheme";
import { useSettings } from "../hooks/useSettings";
import { useNotifications } from "../hooks/useNotifications";
import { PAYMENT_METHODS } from "../data/passenger";
import { AppSettingsState } from "../types/settings";
function ToggleRow({
  label,
  hint,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  hint?: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  const { colors } = useDesign();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: space.lg,
        paddingVertical: space.sm,
      }}
    >
      <View style={{ flex: 1, gap: space.xs }}>
        <AppText>{label}</AppText>
        {hint ? (
          <AppText variant="secondary" tone="secondary">
            {hint}
          </AppText>
        ) : null}
      </View>
      <Switch
        accessibilityLabel={label}
        accessibilityHint={hint}
        value={value}
        disabled={disabled}
        onValueChange={onChange}
        trackColor={{ false: colors.border, true: colors.primary }}
      />
    </View>
  );
}
export default function SettingsScreen() {
  const { user, signOut } = useUser();
  const { t, language, setLanguage } = useI18n();
  const { mode, setThemeMode } = useTheme();
  const { colors } = useDesign();
  const settings = useSettings();
  const notifications = useNotifications();
  const [logout, setLogout] = useState(false);
  const [failure, setFailure] = useState("");
  const booleanChange = (
    key: keyof Pick<
      AppSettingsState,
      | "priceAlertsEnabled"
      | "shareRideEnabled"
      | "rideUpdatesEnabled"
      | "driverAlertsEnabled"
      | "paymentUpdatesEnabled"
    >,
    value: boolean,
  ) => {
    void settings.updateSetting(key, value);
  };
  const masterChange = async (value: boolean) => {
    const granted = value ? await notifications.requestPermissions() : false;
    await settings.updateSetting("notificationsEnabled", value && granted);
  };
  return (
    <PassengerScreenLayout
      activeRoute="Settings"
      title={t("ui.yourAccount")}
      subtitle={t("ui.settingsHint")}
    >
      <ScrollView contentContainerStyle={pageStyles.content}>
        {!settings.settingsReady ? (
          <LoadingState label={t("common.loading")} />
        ) : null}
        {settings.storageError ? (
          <ErrorState
            title={t("ui.saveFailed")}
            description={t("integration.preferencesError")}
          />
        ) : null}
        <AppCard>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: space.lg,
            }}
          >
            <View
              style={{
                backgroundColor: colors.primarySoft,
                borderRadius: radii.lg,
                padding: space.lg,
              }}
            >
              <AppIcon name="person-outline" size={28} tone="primary" />
            </View>
            <View style={{ flex: 1, gap: space.xs }}>
              <AppText variant="section">
                {user?.fullName || t("ui.account")}
              </AppText>
              <AppText variant="secondary" tone="secondary">
                {user?.email || t("ui.accountDetailsUnavailable")}
              </AppText>
            </View>
          </View>
          {user?.phoneNumber ? (
            <InfoRow
              label={t("Телефон")}
              value={user.phoneNumber}
              icon="call-outline"
            />
          ) : null}
        </AppCard>
        <ResponsiveGrid>
          <AppCard>
            <SectionHeading
              title={t("settings.sectionExperience")}
              detail={t("ui.personalize")}
            />
            <AppText variant="secondary" tone="secondary">
              {t("settings.language")}
            </AppText>
            <View
              style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm }}
            >
              {(["en", "uk"] as const).map((value) => (
                <AppButton
                  key={value}
                  label={t(`languages.${value}`)}
                  accessibilityState={{ selected: language === value }}
                  variant={language === value ? "primary" : "secondary"}
                  onPress={() => {
                    void setLanguage(value);
                  }}
                />
              ))}
            </View>
            <AppText variant="secondary" tone="secondary">
              {t("settings.theme")}
            </AppText>
            <View
              style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm }}
            >
              {(["light", "dark", "auto"] as const).map((value) => (
                <AppButton
                  key={value}
                  label={t(`themes.${value}`)}
                  icon={
                    value === "light"
                      ? "sunny-outline"
                      : value === "dark"
                        ? "moon-outline"
                        : "phone-portrait-outline"
                  }
                  accessibilityState={{ selected: mode === value }}
                  variant={mode === value ? "primary" : "secondary"}
                  onPress={() => setThemeMode(value)}
                />
              ))}
            </View>
          </AppCard>
          <AppCard>
            <SectionHeading
              title={t("ui.paymentPreference")}
              detail={t("integration.paymentPreference")}
            />
            {PAYMENT_METHODS.map((method) => (
              <AppButton
                key={method}
                icon={method === "cash" ? "cash-outline" : "card-outline"}
                label={t(`payments.${method}`)}
                accessibilityState={{
                  selected: settings.defaultPaymentMethod === method,
                }}
                variant={
                  settings.defaultPaymentMethod === method
                    ? "primary"
                    : "secondary"
                }
                onPress={() => {
                  void settings.setDefaultPaymentMethod(method);
                }}
              />
            ))}
            <ToggleRow
              label={t("settings.priceAlerts")}
              hint={t("integration.preferenceOnly")}
              value={settings.priceAlertsEnabled}
              onChange={(value) => booleanChange("priceAlertsEnabled", value)}
            />
          </AppCard>
          <AppCard>
            <SectionHeading title={t("settings.sectionNotifications")} />
            <ToggleRow
              label={t("settings.notificationsMaster")}
              hint={t("settings.notificationsMasterHint")}
              value={settings.notificationsEnabled}
              onChange={(value) => {
                void masterChange(value);
              }}
              disabled={!notifications.notificationsSupported}
            />
            {!notifications.notificationsSupported ? (
              <AppText variant="secondary" tone="secondary">
                {t("settings.notificationsExpoGoBanner")}
              </AppText>
            ) : null}
            {(
              [
                "rideUpdatesEnabled",
                "driverAlertsEnabled",
                "paymentUpdatesEnabled",
              ] as const
            ).map((key) => (
              <ToggleRow
                key={key}
                label={t(
                  key === "rideUpdatesEnabled"
                    ? "settings.rideUpdates"
                    : key === "driverAlertsEnabled"
                      ? "settings.driverAlerts"
                      : "settings.paymentUpdates",
                )}
                value={settings[key]}
                disabled={
                  !notifications.notificationsSupported ||
                  !settings.notificationsEnabled
                }
                onChange={(value) => booleanChange(key, value)}
              />
            ))}
            {notifications.notificationsSupported &&
            !notifications.notificationsGranted ? (
              <AppButton
                label={t("settings.openSystemSettings")}
                icon="open-outline"
                variant="ghost"
                onPress={() => {
                  void Linking.openSettings().catch(() =>
                    setFailure(t("ui.systemSettingsFailed")),
                  );
                }}
              />
            ) : null}
          </AppCard>
          <AppCard>
            <SectionHeading title={t("ui.safetyPrivacy")} />
            <ToggleRow
              label={t("settings.shareRide")}
              hint={t("integration.preferenceOnly")}
              value={settings.shareRideEnabled}
              onChange={(value) => booleanChange("shareRideEnabled", value)}
            />
            <AppText variant="secondary" tone="secondary">
              {t("ui.safetyHint")}
            </AppText>
            <AppButton
              label={t("settings.safetyCenter")}
              icon="shield-checkmark-outline"
              variant="secondary"
              disabled
            />
          </AppCard>
        </ResponsiveGrid>
        {failure ? (
          <AppText accessibilityRole="alert" tone="danger">
            {failure}
          </AppText>
        ) : null}
        <AppButton
          label={t("settings.signOut")}
          icon="log-out-outline"
          variant="danger"
          onPress={() => setLogout(true)}
        />
      </ScrollView>
      <ConfirmationDialog
        visible={logout}
        title={t("settings.signOut")}
        description={t("ui.logoutHint")}
        confirmLabel={t("settings.signOut")}
        cancelLabel={t("common.cancel")}
        onCancel={() => setLogout(false)}
        onConfirm={() => {
          setLogout(false);
          void signOut().catch(() => setFailure(t("integration.storageError")));
        }}
      />
    </PassengerScreenLayout>
  );
}

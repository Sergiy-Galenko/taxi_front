import React from "react";
import { View } from "react-native";
import {
  AppButton,
  AppCard,
  InfoRow,
  SectionHeading,
} from "../../design-system/components/ui";
import { DriverProfileResponse } from "../../types/driver";
import { useI18n } from "../../hooks/useI18n";
import { useTheme } from "../../hooks/useTheme";
import { space } from "../../design-system/tokens";
export default function DriverProfileScreen({
  profile,
}: {
  profile?: NonNullable<DriverProfileResponse["data"]>["driver"] | null;
}) {
  const { t, language, setLanguage } = useI18n();
  const { mode, setThemeMode } = useTheme();
  return (
    <View style={{ gap: space.xl }}>
      <AppCard>
        <SectionHeading title={t("ui.account")} />
        {profile ? (
          <>
            <InfoRow
              label={t("Повне ім'я")}
              value={profile.fullName}
              icon="person-outline"
            />
            <InfoRow
              label={t("Електронна пошта")}
              value={profile.email}
              icon="mail-outline"
            />
            <InfoRow
              label={t("ui.vehicle")}
              value={`${profile.carModel} · ${profile.carNumber}`}
              icon="car-outline"
            />
          </>
        ) : (
          <InfoRow
            label={t("ui.profileUnavailable")}
            value={t("integration.profileError")}
          />
        )}
      </AppCard>
      <AppCard>
        <SectionHeading title={t("settings.language")} />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm }}>
          {(["en", "uk"] as const).map((value) => (
            <AppButton
              key={value}
              label={t(`languages.${value}`)}
              variant={value === language ? "primary" : "secondary"}
              onPress={() => {
                void setLanguage(value);
              }}
            />
          ))}
        </View>
        <SectionHeading title={t("settings.theme")} />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm }}>
          {(["light", "dark", "auto"] as const).map((value) => (
            <AppButton
              key={value}
              label={t(`themes.${value}`)}
              variant={value === mode ? "primary" : "secondary"}
              onPress={() => setThemeMode(value)}
            />
          ))}
        </View>
      </AppCard>
    </View>
  );
}

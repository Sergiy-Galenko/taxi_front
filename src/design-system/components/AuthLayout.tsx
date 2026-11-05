import React, { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import {
  AppButton,
  AppIcon,
  AppText,
  ProgressIndicator,
  ScreenContainer,
} from "./ui";
import { useAdaptiveLayout } from "../hooks/useAdaptiveLayout";
import { useDesign } from "../hooks/useDesign";
import { layout, radii, space } from "../tokens";
import { useI18n } from "../../hooks/useI18n";
import { useTheme } from "../../hooks/useTheme";
export function Brand({ small = false }: { small?: boolean }) {
  const { colors } = useDesign();
  return (
    <View style={{ flexDirection: "row", gap: space.md, alignItems: "center" }}>
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: radii.md,
          backgroundColor: colors.primarySoft,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <AppIcon name="navigate" tone="primary" size={22} />
      </View>
      <AppText
        variant={small ? "card" : "section"}
        style={{ letterSpacing: -0.8 }}
      >
        taxi
      </AppText>
    </View>
  );
}
export default function AuthLayout({
  title,
  description,
  children,
  onBack,
  step,
  footer,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  onBack?: () => void;
  step?: number;
  footer?: ReactNode;
}) {
  const { sidePanel: roomForSplit, sizeClass, gutter, short } = useAdaptiveLayout();
  const split = roomForSplit && sizeClass === "expanded" && !short;
  const { colors } = useDesign();
  const { t, language, setLanguage } = useI18n();
  const { isDark, setThemeMode } = useTheme();
  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            padding: gutter,
            gap: space.section,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: space.md,
            }}
          >
            <Brand />
            <View style={{ flexDirection: "row", gap: space.xs }}>
              <AppButton
                label={language === "en" ? "УК" : "EN"}
                accessibilityLabel={t("ui.changeLanguage")}
                variant="ghost"
                onPress={() => {
                  void setLanguage(language === "en" ? "uk" : "en");
                }}
              />
              <AppButton
                label={t(isDark ? "themes.light" : "themes.dark")}
                icon={isDark ? "sunny-outline" : "moon-outline"}
                variant="ghost"
                onPress={() => setThemeMode(isDark ? "light" : "dark")}
              />
            </View>
          </View>
          <View
            style={{
              flex: 1,
              flexDirection: split ? "row" : "column",
              justifyContent: "center",
              alignItems: split ? "center" : "stretch",
              gap: split ? space.hero * 2 : space.xxl,
              width: "100%",
              maxWidth: layout.contentMax,
              alignSelf: "center",
            }}
          >
            <View
              style={{
                display: split ? "flex" : "none",
                flex: 1,
                maxWidth: 420,
                gap: space.xxl,
                paddingVertical: space.section,
              }}
            >
              <AppText variant="caption" tone="primary">
                {t("ui.authEyebrow")}
              </AppText>
              <AppText variant="display">{t("ui.authHeadline")}</AppText>
              <AppText tone="secondary">{t("ui.authIntro")}</AppText>
              <View
                style={{
                  marginTop: space.section,
                  paddingLeft: space.xl,
                  borderLeftWidth: 2,
                  borderLeftColor: colors.primary,
                  gap: space.section,
                }}
              >
                {(
                  [
                    "ui.authBenefit1",
                    "ui.authBenefit2",
                    "ui.authBenefit3",
                  ] as const
                ).map((key, index) => (
                  <View key={key} style={{ gap: space.xs }}>
                    <AppText variant="caption" tone="primary">
                      0{index + 1}
                    </AppText>
                    <AppText variant="card">{t(key)}</AppText>
                  </View>
                ))}
              </View>
            </View>
            <View
              style={{
                width: "100%",
                maxWidth: layout.formMax,
                alignSelf: "center",
                flexShrink: 1,
                gap: space.xxl,
                padding: sizeClass === "compact" ? 0 : space.section,
                borderRadius: radii.xl,
                backgroundColor:
                  sizeClass === "compact" ? colors.background : colors.surface,
                borderWidth: sizeClass === "compact" ? 0 : 1,
                borderColor: colors.border,
                marginVertical: short ? 0 : space.lg,
              }}
            >
              {onBack ? (
                <AppButton
                  label={t("accessibility.back")}
                  icon="arrow-back"
                  variant="ghost"
                  onPress={onBack}
                  style={{ alignSelf: "flex-start", paddingHorizontal: 0 }}
                />
              ) : null}
              {step ? (
                <ProgressIndicator
                  current={step}
                  label={t("ui.wizardStep", { current: step, total: 6 })}
                />
              ) : null}
              <View style={{ gap: space.md }}>
                <AppText accessibilityRole="header" variant="title">
                  {title}
                </AppText>
                {description ? (
                  <AppText tone="secondary">{description}</AppText>
                ) : null}
              </View>
              <View style={{ gap: space.xl }}>{children}</View>
              {footer}
            </View>
          </View>
          <AppText
            variant="caption"
            tone="secondary"
            style={{ textAlign: "center" }}
          >
            {t("ui.authFootnote")}
          </AppText>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

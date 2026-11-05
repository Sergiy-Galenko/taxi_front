import React from "react";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AuthLayout from "../../design-system/components/AuthLayout";
import { AppCard, AppIcon, AppText } from "../../design-system/components/ui";
import { useI18n } from "../../hooks/useI18n";
import { NavigationProp } from "../../types/navigation";
import { space } from "../../design-system/tokens";
export default function RoleSelection() {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useI18n();
  return (
    <AuthLayout
      title={t("ui.roleTitle")}
      description={t("ui.roleHint")}
      onBack={() => navigation.goBack()}
    >
      {(
        [
          {
            route: "PassengerRegistration",
            icon: "person-outline",
            title: "Я пасажир",
            description: "ui.passengerRole",
          },
          {
            route: "DriverRegistration",
            icon: "car-sport-outline",
            title: "Я водій",
            description: "ui.driverRole",
          },
        ] as const
      ).map((role) => (
        <AppCard
          key={role.route}
          onPress={() => navigation.navigate(role.route)}
          accessibilityLabel={t(role.title)}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: space.lg,
            }}
          >
            <AppIcon name={role.icon} tone="primary" size={28} />
            <View style={{ flex: 1, gap: space.xs }}>
              <AppText variant="card">{t(role.title)}</AppText>
              <AppText tone="secondary" variant="secondary">
                {t(role.description)}
              </AppText>
            </View>
            <AppIcon name="arrow-forward" size={20} />
          </View>
        </AppCard>
      ))}
    </AuthLayout>
  );
}

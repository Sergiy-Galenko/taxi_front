// Compatibility export. The passenger screen shell owns adaptive navigation.
import React from "react";
import { useNavigation } from "@react-navigation/native";
import AdaptiveNavigation from "../../design-system/components/AdaptiveNavigation";
import { useI18n } from "../../hooks/useI18n";
import { NavigationProp } from "../../types/navigation";
import { PassengerRoute } from "./PassengerScreenLayout";
export default function PassengerTabBar({
  activeRoute,
}: {
  activeRoute: PassengerRoute;
}) {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useI18n();
  return (
    <AdaptiveNavigation
      active={activeRoute}
      items={[
        { key: "Home", label: t("tabs.book"), icon: "navigate-outline" },
        {
          key: "Preorder",
          label: t("tabs.schedule"),
          icon: "calendar-outline",
        },
        { key: "TripHistory", label: t("tabs.trips"), icon: "receipt-outline" },
        { key: "Settings", label: t("tabs.profile"), icon: "person-outline" },
      ]}
      onSelect={(key) => navigation.navigate(key)}
    />
  );
}

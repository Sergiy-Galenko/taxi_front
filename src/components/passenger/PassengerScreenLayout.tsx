import React, { ReactNode } from "react";
import { StatusBar, StyleProp, TextStyle, View, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NavigationProp } from "../../types/navigation";
import { AppHeader } from "../../design-system/components/ui";
import AdaptiveNavigation from "../../design-system/components/AdaptiveNavigation";
import { useAdaptiveLayout } from "../../design-system/hooks/useAdaptiveLayout";
import { useDesign } from "../../design-system/hooks/useDesign";
import { useI18n } from "../../hooks/useI18n";
export type PassengerRoute = "Home" | "Preorder" | "TripHistory" | "Settings";
export default function PassengerScreenLayout({
  activeRoute,
  children,
  title,
  subtitle,
  rightAction,
  showHeader = true,
  contentStyle,
}: {
  activeRoute: PassengerRoute;
  children: ReactNode;
  title?: string;
  subtitle?: string;
  rightAction?: ReactNode;
  showHeader?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
}) {
  const { colors, isDark } = useDesign();
  const { rail } = useAdaptiveLayout();
  const { t } = useI18n();
  const navigation = useNavigation<NavigationProp>();
  const items = [
    { key: "Home", label: t("tabs.book"), icon: "navigate-outline" },
    { key: "Preorder", label: t("tabs.schedule"), icon: "calendar-outline" },
    { key: "TripHistory", label: t("tabs.trips"), icon: "receipt-outline" },
    { key: "Settings", label: t("tabs.profile"), icon: "person-outline" },
  ] as const;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <View style={{ flex: 1, flexDirection: rail ? "row" : "column-reverse" }}>
        <AdaptiveNavigation
          items={items}
          active={activeRoute}
          onSelect={(route) => {
            if (activeRoute !== route) navigation.navigate(route);
          }}
          rail={rail}
        />
        <View style={{ flex: 1, minWidth: 0 }}>
          {showHeader && title ? (
            <AppHeader title={title} subtitle={subtitle} right={rightAction} />
          ) : null}
          <View style={[{ flex: 1 }, contentStyle]}>{children}</View>
        </View>
      </View>
    </SafeAreaView>
  );
}

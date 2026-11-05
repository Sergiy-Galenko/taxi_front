import React from "react";
import { ScrollView } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import BookingFlowLayout from "../../components/passenger/BookingFlowLayout";
import RouteSummaryCard from "../../components/passenger/RouteSummaryCard";
import { MatchingPanel } from "../../features/rides/components/RidePresentation";
import { AppButton, pageStyles } from "../../design-system/components/ui";
import IntegrationNotice from "../../shared/components/IntegrationNotice";
import { useI18n } from "../../hooks/useI18n";
import { RootStackParamList } from "../../types/navigation";
export default function DriverSearchScreen({
  route,
}: Pick<NativeStackScreenProps<RootStackParamList, "DriverSearch">, "route">) {
  const { t } = useI18n();
  return (
    <BookingFlowLayout
      title={t("ui.findYourDriver")}
      subtitle={t("ui.searchContext")}
      footer={
        <AppButton
          label={t("driverSearch.cancelRequest")}
          disabled
          variant="secondary"
        />
      }
    >
      <ScrollView contentContainerStyle={pageStyles.content}>
        <MatchingPanel status="unavailable" />
        <RouteSummaryCard
          pickup={route.params.from}
          destination={route.params.to}
        />
        <IntegrationNotice />
      </ScrollView>
    </BookingFlowLayout>
  );
}

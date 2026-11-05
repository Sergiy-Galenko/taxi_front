import React, { useState } from "react";
import { FlatList, Modal, ScrollView, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import PassengerScreenLayout from "../components/passenger/PassengerScreenLayout";
import RouteSummaryCard from "../components/passenger/RouteSummaryCard";
import {
  AppButton,
  AppCard,
  AppText,
  InfoRow,
  ScreenContainer,
  TripStatusBadge,
  pageStyles,
} from "../design-system/components/ui";
import { useAdaptiveLayout } from "../design-system/hooks/useAdaptiveLayout";
import { space } from "../design-system/tokens";
import IntegrationNotice from "../shared/components/IntegrationNotice";
import { useI18n } from "../hooks/useI18n";
import { TRIP_HISTORY } from "../data/passenger";
import { TripHistoryEntry } from "../types/passenger";
import { RootStackParamList } from "../types/navigation";
export default function TripHistoryScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "TripHistory">) {
  const { t } = useI18n();
  const { sidePanel } = useAdaptiveLayout();
  const [selected, setSelected] = useState<TripHistoryEntry | null>(null);
  const details = selected ? (
    <View style={{ gap: space.xl }}>
      <AppText variant="section">{selected.dateLabel}</AppText>
      <RouteSummaryCard
        pickup={selected.pickup}
        destination={selected.destination}
      />
      <AppCard>
        <InfoRow
          label={t("history.fare")}
          value={t("common.priceUah", { amount: selected.price })}
        />
        <InfoRow label={t("history.paidWith")} value={selected.paymentLabel} />
        <TripStatusBadge label={selected.status} icon="receipt-outline" />
      </AppCard>
      <AppButton
        label={t("history.repeatRide")}
        icon="reload-outline"
        onPress={() => {
          setSelected(null);
          navigation.navigate("Home", {
            from: selected.pickup,
            to: selected.destination,
            rideType: selected.rideType,
          });
        }}
      />
    </View>
  ) : null;
  return (
    <PassengerScreenLayout
      activeRoute="TripHistory"
      title={t("ui.yourJourneys")}
      subtitle={t("ui.historyHint")}
    >
      <View style={{ flex: 1, flexDirection: "row" }}>
        <FlatList
          data={TRIP_HISTORY}
          keyExtractor={(item) => item.id}
          contentContainerStyle={pageStyles.content}
          style={{ flex: 1 }}
          ListEmptyComponent={
            <IntegrationNotice detail="integration.history" />
          }
          renderItem={({ item }) => (
            <View style={{ marginBottom: space.lg }}>
              <AppCard
                onPress={() => setSelected(item)}
                accessibilityLabel={`${item.dateLabel}, ${item.pickup}, ${item.destination}`}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: space.md,
                  }}
                >
                  <AppText variant="card">{item.dateLabel}</AppText>
                  <AppText variant="card">
                    {t("common.priceUah", { amount: item.price })}
                  </AppText>
                </View>
                <InfoRow
                  label={t("home.pickupLabel")}
                  value={item.pickup}
                  icon="location-outline"
                />
                <InfoRow
                  label={t("home.destinationLabel")}
                  value={item.destination}
                  icon="flag-outline"
                />
                <TripStatusBadge label={item.status} icon="receipt-outline" />
              </AppCard>
            </View>
          )}
        />
        <ScrollView
          style={{ display: sidePanel && selected ? "flex" : "none", flex: 1 }}
          contentContainerStyle={pageStyles.content}
        >
          {details}
        </ScrollView>
      </View>
      <Modal
        visible={!!selected && !sidePanel}
        animationType="none"
        onRequestClose={() => setSelected(null)}
      >
        <ScreenContainer scroll>
          <AppButton
            label={t("accessibility.back")}
            variant="ghost"
            icon="arrow-back"
            onPress={() => setSelected(null)}
          />
          {details}
        </ScreenContainer>
      </Modal>
    </PassengerScreenLayout>
  );
}

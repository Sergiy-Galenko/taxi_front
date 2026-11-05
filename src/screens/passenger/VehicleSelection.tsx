import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import BookingFlowLayout from "../../components/passenger/BookingFlowLayout";
import RouteSummaryCard from "../../components/passenger/RouteSummaryCard";
import VehicleOptionCard from "../../components/passenger/VehicleOptionCard";
import {
  AppButton,
  AppCard,
  AppText,
  SectionHeading,
  pageStyles,
} from "../../design-system/components/ui";
import { useAdaptiveLayout } from "../../design-system/hooks/useAdaptiveLayout";
import { space } from "../../design-system/tokens";
import TaxiMap from "../../features/maps/TaxiMap";
import {
  calculateTripSummary,
  PAYMENT_METHODS,
  RIDE_OPTIONS,
} from "../../data/passenger";
import { useI18n } from "../../hooks/useI18n";
import { useSettings } from "../../hooks/useSettings";
import { RootStackParamList } from "../../types/navigation";
import { PaymentMethodKey, RideOptionKey } from "../../types/passenger";
import IntegrationNotice from "../../shared/components/IntegrationNotice";
export default function VehicleSelection({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParamList, "VehicleSelection">) {
  const { t } = useI18n();
  const { sidePanel } = useAdaptiveLayout();
  const { defaultPaymentMethod } = useSettings();
  const [rideType, setRideType] = useState<RideOptionKey>(
    route.params.rideType ?? "comfort",
  );
  const [payment, setPayment] =
    useState<PaymentMethodKey>(defaultPaymentMethod);
  return (
    <BookingFlowLayout
      title={t("ui.chooseYourRide")}
      subtitle={t("ui.vehicleHint")}
      footer={
        <AppButton
          label={t("ui.bookingUnavailable")}
          disabled
          icon="lock-closed-outline"
        />
      }
    >
      <View style={{ flex: 1, flexDirection: sidePanel ? "row" : "column" }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={pageStyles.content}
        >
          <RouteSummaryCard
            pickup={route.params.from}
            destination={route.params.to}
            onPressEdit={() => navigation.goBack()}
          />
          <SectionHeading
            title={t("ui.rideClass")}
            detail={t("ui.chooseClassHint")}
          />
          <View style={{ gap: space.md }}>
            {RIDE_OPTIONS.map((option) => (
              <VehicleOptionCard
                key={option.key}
                option={option}
                selected={option.key === rideType}
                onPress={() => setRideType(option.key)}
                summary={calculateTripSummary(
                  route.params.pickupCoords ?? null,
                  route.params.destinationCoords ?? null,
                  option.key,
                )}
              />
            ))}
          </View>
          <AppCard>
            <SectionHeading
              title={t("ui.paymentPreference")}
              detail={t("integration.paymentPreference")}
            />
            <View
              style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm }}
            >
              {PAYMENT_METHODS.map((method) => (
                <AppButton
                  key={method}
                  label={t(`payments.${method}`)}
                  accessibilityState={{ selected: payment === method }}
                  variant={payment === method ? "primary" : "secondary"}
                  onPress={() => setPayment(method)}
                />
              ))}
            </View>
          </AppCard>
          <IntegrationNotice />
          <AppButton
            label={t("ui.planLater")}
            icon="calendar-outline"
            variant="secondary"
            onPress={() =>
              navigation.navigate("Preorder", {
                pickup: route.params.from,
                destination: route.params.to,
                rideType,
              })
            }
          />
        </ScrollView>
        <View
          style={{ display: sidePanel ? "flex" : "none", flex: 1, minWidth: 0 }}
        >
          <TaxiMap
            pickup={route.params.pickupCoords}
            destination={route.params.destinationCoords}
            pickupLabel={route.params.from}
            destinationLabel={route.params.to}
          />
          <View style={{ padding: space.xl }}>
            <AppCard>
              <AppText variant="secondary" tone="secondary">
                {t("home.routeLineNotice")}
              </AppText>
            </AppCard>
          </View>
        </View>
      </View>
    </BookingFlowLayout>
  );
}

import React, { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { RouteProp } from "@react-navigation/native";
import BookingFlowLayout from "../../components/passenger/BookingFlowLayout";
import {
  DriverCard,
  RideStatusPanel,
} from "../../features/rides/components/RidePresentation";
import { RideSnapshot, rideGateway } from "../../features/rides/gateway";
import {
  AppButton,
  AppCard,
  AppText,
  LoadingState,
  pageStyles,
} from "../../design-system/components/ui";
import { useAdaptiveLayout } from "../../design-system/hooks/useAdaptiveLayout";
import { space } from "../../design-system/tokens";
import TaxiMap from "../../features/maps/TaxiMap";
import IntegrationNotice from "../../shared/components/IntegrationNotice";
import { useI18n } from "../../hooks/useI18n";
import { RootStackParamList } from "../../types/navigation";
export default function ActiveRide({
  route,
}: {
  route?: RouteProp<RootStackParamList, "ActiveRide">;
}) {
  const { t } = useI18n();
  const { sidePanel } = useAdaptiveLayout();
  const [ride, setRide] = useState<RideSnapshot | null>(null);
  const [state, setState] = useState<
    "loading" | "unavailable" | "offline" | "ready"
  >("unavailable");
  useEffect(() => {
    if (!route?.params.rideId) return;
    const controller = new AbortController();
    setState("loading");
    void rideGateway
      .read(route.params.rideId, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        if (result.available) {
          setRide(result.data);
          setState("ready");
        } else setState("unavailable");
      })
      .catch(() => {
        if (!controller.signal.aborted) setState("offline");
      });
    return () => controller.abort();
  }, [route?.params.rideId]);
  return (
    <BookingFlowLayout
      title={t("activeRide.title")}
      subtitle={t("ui.rideContext")}
    >
      <View
        style={{ flex: 1, flexDirection: sidePanel ? "row" : "column-reverse" }}
      >
        <ScrollView
          style={{
            flex: sidePanel ? undefined : 1,
            width: sidePanel ? 380 : undefined,
          }}
          contentContainerStyle={pageStyles.content}
        >
          {state === "loading" ? (
            <LoadingState label={t("integration.loading")} />
          ) : (
            <RideStatusPanel
              status={
                state === "ready" && ride
                  ? ride.status
                  : state === "offline"
                    ? "offline"
                    : "unavailable"
              }
            />
          )}
          {state === "ready" && ride ? (
            <DriverCard driver={ride.driver} />
          ) : null}
          <IntegrationNotice detail="integration.activeRide" />
          <AppCard>
            <AppText variant="card">{t("ui.tripTools")}</AppText>
            <AppButton
              label={t("activeRide.shareTrip")}
              icon="share-outline"
              variant="secondary"
              disabled
            />
            <AppButton
              label={t("ui.safety")}
              icon="shield-checkmark-outline"
              variant="secondary"
              disabled
            />
            <AppText variant="secondary" tone="secondary">
              {t("ui.tripToolsHint")}
            </AppText>
          </AppCard>
        </ScrollView>
        <View
          style={{
            flex: sidePanel ? 1 : undefined,
            height: sidePanel ? undefined : 180,
          }}
        >
          <TaxiMap />
          <View style={{ padding: space.lg }}>
            <AppCard>
              <AppText variant="secondary" tone="secondary">
                {t("ui.trackingMapUnavailable")}
              </AppText>
            </AppCard>
          </View>
        </View>
      </View>
    </BookingFlowLayout>
  );
}

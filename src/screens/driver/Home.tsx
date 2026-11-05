import React, { useEffect, useState } from "react";
import { AppState, ScrollView, Switch, View } from "react-native";
import {
  AppButton,
  AppCard,
  AppText,
  ConfirmationDialog,
  ErrorState,
  LoadingState,
  ResponsiveGrid,
  ScreenContainer,
  SectionHeading,
  TripStatusBadge,
  pageStyles,
} from "../../design-system/components/ui";
import { useAdaptiveLayout } from "../../design-system/hooks/useAdaptiveLayout";
import { useDesign } from "../../design-system/hooks/useDesign";
import { space } from "../../design-system/tokens";
import DriverSidebar, {
  DriverSection,
} from "../../driver/components/DriverSidebar";
import DriverHeader from "../../driver/components/DriverHeader";
import DriverProfile from "../../driver/profile/DriverProfileScreen";
import RideSearch from "../../driver/rides/RideSearchScreen";
import RideDetails from "../../driver/rides/RideDetailsScreen";
import { useUser } from "../../hooks/UserContext";
import { useI18n } from "../../hooks/useI18n";
import { getDriverProfile } from "../../services/api/driver";
import { DriverProfileResponse } from "../../types/driver";
type ProfileState =
  | { status: "loading" }
  | { status: "error" }
  | {
      status: "ready";
      profile: NonNullable<DriverProfileResponse["data"]>["driver"];
    };
export default function DriverHome() {
  const { user, signOut } = useUser();
  const { t } = useI18n();
  const { rail } = useAdaptiveLayout();
  const { colors } = useDesign();
  const [profile, setProfile] = useState<ProfileState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const [section, setSection] = useState<DriverSection>("overview");
  const [logout, setLogout] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  useEffect(() => {
    if (!user || user.role !== "driver") {
      setProfile({ status: "error" });
      return;
    }
    const controller = new AbortController();
    setProfile({ status: "loading" });
    void getDriverProfile(user.id, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        if (!result.success || !result.data) throw new Error("profile");
        setProfile({ status: "ready", profile: result.data.driver });
      })
      .catch(() => {
        if (!controller.signal.aborted) setProfile({ status: "error" });
      });
    return () => controller.abort();
  }, [user, attempt]);
  useEffect(() => {
    const listener = AppState.addEventListener("change", (state) => {
      if (state === "active") setAttempt((value) => value + 1);
    });
    return () => listener.remove();
  }, []);
  return (
    <ScreenContainer>
      <View style={{ flex: 1, flexDirection: rail ? "row" : "column-reverse" }}>
        <DriverSidebar active={section} onSelect={setSection} rail={rail} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <DriverHeader name={user?.fullName} />
          <ScrollView contentContainerStyle={pageStyles.content}>
            {profile.status === "loading" ? (
              <LoadingState label={t("integration.loading")} />
            ) : profile.status === "error" ? (
              <ErrorState
                title={t("ui.profileUnavailable")}
                description={t("integration.profileError")}
                action={
                  <AppButton
                    label={t("integration.retry")}
                    variant="secondary"
                    onPress={() => setAttempt((value) => value + 1)}
                  />
                }
              />
            ) : (
              <TripStatusBadge
                label={t(`integration.driverStatus.${profile.profile.status}`)}
                icon={
                  profile.profile.status === "active"
                    ? "shield-checkmark-outline"
                    : "time-outline"
                }
                tone={
                  profile.profile.status === "active" ? "success" : "warning"
                }
              />
            )}
            {section === "overview" ? (
              <>
                <ResponsiveGrid>
                  <AppCard>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        gap: space.md,
                        alignItems: "center",
                      }}
                    >
                      <View style={{ flex: 1, gap: space.xs }}>
                        <AppText variant="card">{t("ui.availability")}</AppText>
                        <AppText variant="secondary" tone="secondary">
                          {t("ui.dispatchUnavailable")}
                        </AppText>
                      </View>
                      <Switch
                        disabled
                        value={false}
                        accessibilityLabel={t("ui.availability")}
                        accessibilityHint={t("ui.dispatchUnavailable")}
                        trackColor={{
                          false: colors.border,
                          true: colors.primary,
                        }}
                      />
                    </View>
                    <TripStatusBadge
                      label={t("ui.notConnected")}
                      icon="cloud-offline-outline"
                    />
                  </AppCard>
                  <AppCard>
                    <AppText variant="secondary" tone="secondary">
                      {t("ui.shiftEarnings")}
                    </AppText>
                    <AppText variant="display">—</AppText>
                    <AppText variant="secondary" tone="secondary">
                      {t("ui.earningsUnavailable")}
                    </AppText>
                  </AppCard>
                </ResponsiveGrid>
                <SectionHeading title={t("ui.activeTrip")} />
                <RideDetails />
                <SectionHeading title={t("ui.requests")} />
                <RideSearch />
              </>
            ) : section === "requests" ? (
              <RideSearch />
            ) : (
              <DriverProfile
                profile={profile.status === "ready" ? profile.profile : null}
              />
            )}
            {logoutError ? (
              <AppText tone="danger" accessibilityRole="alert">
                {logoutError}
              </AppText>
            ) : null}
            {section === "account" ? (
              <AppButton
                label={t("settings.signOut")}
                icon="log-out-outline"
                variant="danger"
                onPress={() => setLogout(true)}
              />
            ) : null}
          </ScrollView>
        </View>
      </View>
      <ConfirmationDialog
        visible={logout}
        title={t("settings.signOut")}
        description={t("ui.logoutHint")}
        confirmLabel={t("settings.signOut")}
        cancelLabel={t("common.cancel")}
        onCancel={() => setLogout(false)}
        onConfirm={() => {
          setLogout(false);
          void signOut().catch(() =>
            setLogoutError(t("integration.storageError")),
          );
        }}
      />
    </ScreenContainer>
  );
}

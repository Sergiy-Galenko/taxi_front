import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import PassengerScreenLayout from "../components/passenger/PassengerScreenLayout";
import {
  AppButton,
  AppCard,
  AppInput,
  AppText,
  ResponsiveGrid,
  SectionHeading,
  pageStyles,
} from "../design-system/components/ui";
import { useI18n } from "../hooks/useI18n";
import { RIDE_OPTIONS } from "../data/passenger";
import { RideOptionKey } from "../types/passenger";
import { RootStackParamList } from "../types/navigation";
import { space } from "../design-system/tokens";
import IntegrationNotice from "../shared/components/IntegrationNotice";
export default function PreorderScreen({
  route,
}: NativeStackScreenProps<RootStackParamList, "Preorder">) {
  const { t, language } = useI18n();
  const locale = language === "uk" ? "uk-UA" : "en-GB";
  const [pickup, setPickup] = useState(route.params?.pickup ?? "");
  const [destination, setDestination] = useState(
    route.params?.destination ?? "",
  );
  const [rideType, setRideType] = useState<RideOptionKey>(
    route.params?.rideType ?? "comfort",
  );
  const [note, setNote] = useState("");
  const [date, setDate] = useState(() => new Date(Date.now() + 3600000));
  const [picker, setPicker] = useState<"date" | "time" | null>(null);
  return (
    <PassengerScreenLayout
      activeRoute="Preorder"
      title={t("ui.planAhead")}
      subtitle={t("ui.scheduleHint")}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={pageStyles.content}
        >
          <ResponsiveGrid>
            <AppCard>
              <SectionHeading title={t("ui.yourRoute")} />
              <AppInput
                label={t("home.pickupLabel")}
                icon="location-outline"
                value={pickup}
                onChangeText={setPickup}
              />
              <AppInput
                label={t("home.destinationLabel")}
                icon="flag-outline"
                value={destination}
                onChangeText={setDestination}
              />
              <SectionHeading title={t("ui.rideClass")} />
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: space.sm,
                }}
              >
                {RIDE_OPTIONS.map((option) => (
                  <AppButton
                    key={option.key}
                    label={t(`rideOptions.${option.key}.label`)}
                    variant={rideType === option.key ? "primary" : "secondary"}
                    onPress={() => setRideType(option.key)}
                  />
                ))}
              </View>
            </AppCard>
            <AppCard>
              <SectionHeading title={t("ui.whenToGo")} />
              <AppButton
                label={date.toLocaleDateString(locale, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
                accessibilityLabel={t("ui.chooseDate")}
                icon="calendar-outline"
                variant="secondary"
                onPress={() => setPicker("date")}
              />
              <AppButton
                label={date.toLocaleTimeString(locale, {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                accessibilityLabel={t("ui.chooseTime")}
                icon="time-outline"
                variant="secondary"
                onPress={() => setPicker("time")}
              />
              {date.getTime() <= Date.now() ? (
                <AppText tone="danger" accessibilityRole="alert">
                  {t("ui.futureTimeRequired")}
                </AppText>
              ) : null}
              {picker ? (
                <DateTimePicker
                  mode={picker}
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  minimumDate={picker === "date" ? new Date() : undefined}
                  value={date}
                  onChange={(event, value) => {
                    if (value && event.type !== "dismissed") {
                      const next = new Date(date);
                      if (picker === "date")
                        next.setFullYear(
                          value.getFullYear(),
                          value.getMonth(),
                          value.getDate(),
                        );
                      else
                        next.setHours(
                          value.getHours(),
                          value.getMinutes(),
                          0,
                          0,
                        );
                      setDate(next);
                    }
                    if (Platform.OS !== "ios") setPicker(null);
                  }}
                />
              ) : null}
              {picker && Platform.OS === "ios" ? (
                <AppButton
                  label={t("common.done")}
                  variant="ghost"
                  onPress={() => setPicker(null)}
                />
              ) : null}
              <AppInput
                label={t("preorder.pickupNote")}
                hint={t("preorder.pickupNoteHint")}
                value={note}
                onChangeText={setNote}
                multiline
                maxLength={500}
                textAlignVertical="top"
              />
            </AppCard>
          </ResponsiveGrid>
          <IntegrationNotice detail="integration.schedule" />
          <AppButton
            label={t("ui.schedulingUnavailable")}
            icon="lock-closed-outline"
            disabled
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </PassengerScreenLayout>
  );
}

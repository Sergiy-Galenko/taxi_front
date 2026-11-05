import React, { useState } from "react";
import { View } from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import AuthLayout from "../../../design-system/components/AuthLayout";
import {
  AppButton,
  AppInput,
  AppText,
} from "../../../design-system/components/ui";
import { useDriverDraft } from "../../../features/auth/DriverDraft";
import { CAR_BRANDS } from "../../../features/auth/carCatalog";
import { useI18n } from "../../../hooks/useI18n";
import { NavigationProp, RootStackParamList } from "../../../types/navigation";
import { getCarNumberError } from "../../../utils/validation";
import { space } from "../../../design-system/tokens";
export default function DriverCarInfo() {
  const { t } = useI18n();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, "DriverCarInfo">>();
  const { draft, update } = useDriverDraft();
  const [submitted, setSubmitted] = useState(false);
  const [field, setField] = useState<"brand" | "model" | null>(null);
  const errors = {
    carBrand: draft.carBrand.trim() ? null : t("Вкажіть марку автомобіля"),
    carModel: draft.carModel.trim() ? null : t("Вкажіть модель автомобіля"),
    carColor: draft.carColor.trim() ? null : t("Вкажіть колір автомобіля"),
    carNumber: getCarNumberError(draft.carNumber),
    yearsOfExperience:
      draft.yearsOfExperience.trim() &&
      Number.isSafeInteger(Number(draft.yearsOfExperience)) &&
      Number(draft.yearsOfExperience) >= 0
        ? null
        : t("Вкажіть коректний досвід водіння"),
  };
  const options =
    field === "brand"
      ? Object.keys(CAR_BRANDS)
          .filter((brand) =>
            brand.toLowerCase().includes(draft.carBrand.toLowerCase()),
          )
          .slice(0, 6)
      : field === "model"
        ? (CAR_BRANDS[draft.carBrand] ?? [])
            .filter((model) =>
              model.toLowerCase().includes(draft.carModel.toLowerCase()),
            )
            .slice(0, 6)
        : [];
  return (
    <AuthLayout
      title={t("Інформація про автомобіль")}
      description={t("Вкажіть дані вашого автомобіля")}
      step={3}
      onBack={() => navigation.goBack()}
    >
      <AppInput
        label={t("Марка автомобіля")}
        value={draft.carBrand}
        onChangeText={(carBrand) => update({ carBrand, carModel: "" })}
        onFocus={() => setField("brand")}
        error={submitted ? errors.carBrand : null}
        icon="car-outline"
      />
      <AppInput
        label={t("Модель автомобіля")}
        value={draft.carModel}
        onChangeText={(carModel) => update({ carModel })}
        onFocus={() => setField("model")}
        error={submitted ? errors.carModel : null}
        icon="car-sport-outline"
      />
      {options.length ? (
        <View style={{ gap: space.xs }}>
          <AppText variant="caption" tone="secondary">
            {t("ui.suggestions")}
          </AppText>
          {options.map((option) => (
            <AppButton
              key={option}
              label={option}
              variant="secondary"
              onPress={() => {
                if (field === "brand")
                  update({ carBrand: option, carModel: "" });
                else update({ carModel: option });
                setField(null);
              }}
            />
          ))}
        </View>
      ) : null}
      <AppInput
        label={t("Колір автомобіля")}
        value={draft.carColor}
        onChangeText={(carColor) => update({ carColor })}
        onFocus={() => setField(null)}
        error={submitted ? errors.carColor : null}
        icon="color-palette-outline"
      />
      <AppInput
        label={t("Номер автомобіля")}
        value={draft.carNumber}
        onChangeText={(value) => update({ carNumber: value.toUpperCase() })}
        onFocus={() => setField(null)}
        error={submitted ? errors.carNumber : null}
        icon="reader-outline"
        autoCapitalize="characters"
        placeholder="AA 1234 BB"
        maxLength={10}
      />
      <AppInput
        label={t("Досвід водіння (роки)")}
        value={draft.yearsOfExperience}
        onChangeText={(yearsOfExperience) => update({ yearsOfExperience })}
        onFocus={() => setField(null)}
        error={submitted ? errors.yearsOfExperience : null}
        icon="time-outline"
        keyboardType="number-pad"
      />
      <AppButton
        label={t("Далі")}
        icon="arrow-forward"
        onPress={() => {
          setSubmitted(true);
          if (!Object.values(errors).some(Boolean))
            navigation.navigate("DriverLicenseInfo", {
              ...route.params,
              carModel: `${draft.carBrand.trim()} ${draft.carModel.trim()}`,
              carColor: draft.carColor.trim(),
              carNumber: draft.carNumber,
              yearsOfExperience: draft.yearsOfExperience,
            });
        }}
      />
    </AuthLayout>
  );
}

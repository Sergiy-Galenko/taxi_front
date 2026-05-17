import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import PaymentMethod from '../../components/PaymentMethod';
import TariffCard from '../../components/TariffCard';
import BookingFlowLayout from '../../components/passenger/BookingFlowLayout';
import RouteSummaryCard from '../../components/passenger/RouteSummaryCard';
import {
  calculateTripSummary,
  calculateTripSummaryFromMetrics,
  getRideOption,
  PAYMENT_METHODS,
  RIDE_OPTIONS,
} from '../../data/passenger';
import { useI18n } from '../../hooks/useI18n';
import { useSettings } from '../../hooks/useSettings';
import { PassengerPalette } from '../../theme/passenger';
import { usePassengerTheme } from '../../hooks/usePassengerTheme';
import { RootStackParamList } from '../../types/navigation';
import { PaymentMethodKey, RideOptionKey } from '../../types/passenger';

type VehicleSelectionScreenProps = NativeStackScreenProps<RootStackParamList, 'VehicleSelection'>;

export default function VehicleSelectionScreen({ navigation, route }: VehicleSelectionScreenProps) {
  const { t } = useI18n();
  const { defaultPaymentMethod, setDefaultPaymentMethod, priceAlertsEnabled } = useSettings();
  const { palette, radius } = usePassengerTheme();
  const styles = useMemo(() => createStyles(palette, radius), [palette, radius]);
  const [selectedRide, setSelectedRide] = useState<RideOptionKey>(route.params.rideType ?? 'comfort');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodKey>(defaultPaymentMethod);
  const selectedRideOption = useMemo(() => getRideOption(selectedRide), [selectedRide]);

  const summary = useMemo(() => {
    if (route.params.routeDistanceKm != null && route.params.routeDurationMin != null) {
      return calculateTripSummaryFromMetrics(
        route.params.routeDistanceKm,
        route.params.routeDurationMin,
        selectedRide
      );
    }

    return calculateTripSummary(route.params.pickupCoords ?? null, route.params.destinationCoords ?? null, selectedRide);
  }, [
    route.params.destinationCoords,
    route.params.pickupCoords,
    route.params.routeDistanceKm,
    route.params.routeDurationMin,
    selectedRide,
  ]);

  const handleConfirmRide = async () => {
    await setDefaultPaymentMethod(paymentMethod);

    navigation.navigate('OrderConfirm', {
      ...route.params,
      rideType: selectedRide,
      paymentMethod,
      price: summary.price,
      pickupEtaMin: summary.pickupEtaMin,
      durationMin: summary.durationMin,
      distanceKm: summary.distanceKm,
    });
  };

  return (
    <BookingFlowLayout
      subtitle={t('vehicleSelection.subtitle')}
      title={t('vehicleSelection.title')}
      footer={
        <TouchableOpacity activeOpacity={0.92} onPress={handleConfirmRide} style={styles.primaryButton}>
          <View>
            <Text style={styles.primaryEyebrow}>
              {t('vehicleSelection.confirmEyebrow', { ride: t(`rideOptions.${selectedRide}.label`) })}
            </Text>
              <Text style={styles.primaryTitle}>{t('orderConfirm.title')} · {t('common.priceUah', { amount: summary.price })}</Text>
          </View>
          <Ionicons color="#FFFFFF" name="arrow-forward" size={18} />
        </TouchableOpacity>
      }
    >
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <RouteSummaryCard
          badge={t('common.stepOf', { current: 2, total: 4 })}
          destination={route.params.to}
          meta={[
            { icon: 'time-outline', label: t('common.minutesShort', { count: summary.durationMin }) },
            { icon: 'map-outline', label: t('common.kilometersShort', { count: summary.distanceKm || 0 }) },
            { icon: 'car-outline', label: t('common.minutesShort', { count: summary.pickupEtaMin }) },
          ]}
          onPressEdit={() => navigation.goBack()}
          pickup={route.params.from}
        />

        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={styles.heroCopy}>
              <Text style={styles.heroEyebrow}>{t('vehicleSelection.title')}</Text>
              <Text style={styles.heroTitle}>{t(`rideOptions.${selectedRide}.label`)}</Text>
              <Text style={styles.heroHint}>{t(`rideOptions.${selectedRide}.description`)}</Text>
            </View>
            <View style={styles.heroPriceWrap}>
              <Text style={styles.heroPriceLabel}>{t('vehicleSelection.fare')}</Text>
              <Text style={styles.heroPriceValue}>{t('common.priceUah', { amount: summary.price })}</Text>
            </View>
          </View>

          <View style={styles.heroMetrics}>
            <View style={styles.heroMetric}>
              <Text style={styles.heroMetricLabel}>{t('vehicleSelection.arrival')}</Text>
              <Text style={styles.heroMetricValue}>{t('common.minutesShort', { count: summary.pickupEtaMin })}</Text>
            </View>
            <View style={styles.heroMetric}>
              <Text style={styles.heroMetricLabel}>{t('vehicleSelection.trip')}</Text>
              <Text style={styles.heroMetricValue}>{t('common.minutesShort', { count: summary.durationMin })}</Text>
            </View>
            <View style={styles.heroMetric}>
              <Text style={styles.heroMetricLabel}>{t('vehicleSelection.capacity')}</Text>
              <Text style={styles.heroMetricValue}>{selectedRideOption.capacity}</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('vehicleSelection.availableCars')}</Text>
          <Text style={styles.sectionMeta}>{t('vehicleSelection.optionsNearby', { count: RIDE_OPTIONS.length })}</Text>
        </View>

        <View style={styles.vehicleList}>
          {RIDE_OPTIONS.map((option) => (
            <TariffCard
              key={option.key}
              onPress={() => setSelectedRide(option.key)}
              option={option}
              selected={selectedRide === option.key}
              summary={
                route.params.routeDistanceKm != null && route.params.routeDurationMin != null
                  ? calculateTripSummaryFromMetrics(
                      route.params.routeDistanceKm,
                      route.params.routeDurationMin,
                      option.key
                    )
                  : calculateTripSummary(
                      route.params.pickupCoords ?? null,
                      route.params.destinationCoords ?? null,
                      option.key
                    )
              }
            />
          ))}
        </View>

        <View style={styles.paymentCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('vehicleSelection.payment')}</Text>
            <Text style={styles.sectionMeta}>{t('vehicleSelection.paymentHint')}</Text>
          </View>

          <View style={styles.paymentRow}>
            {PAYMENT_METHODS.map((option) => {
              const active = option === paymentMethod;

              return (
                <PaymentMethod
                  key={option}
                  method={option}
                  onPress={() => setPaymentMethod(option)}
                  selected={active}
                />
              );
            })}
          </View>
        </View>

        {priceAlertsEnabled ? (
          <View style={styles.infoCard}>
            <Ionicons color={palette.primaryDeep} name="pricetag-outline" size={18} />
            <View style={styles.infoCopy}>
              <Text style={styles.infoTitle}>{t('home.priceAlertTitle')}</Text>
              <Text style={styles.infoHint}>{t('home.priceAlertText')}</Text>
            </View>
          </View>
        ) : null}

        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() =>
            navigation.navigate('Preorder', {
              pickup: route.params.from,
              destination: route.params.to,
              rideType: selectedRide,
            })
          }
          style={styles.scheduleCard}
        >
          <View style={styles.scheduleIconWrap}>
            <Ionicons color={palette.text} name="calendar-outline" size={18} />
          </View>
          <View style={styles.scheduleCopy}>
            <Text style={styles.scheduleTitle}>{t('vehicleSelection.scheduleTitle')}</Text>
            <Text style={styles.scheduleHint}>{t('vehicleSelection.scheduleHint')}</Text>
          </View>
          <Ionicons color={palette.mutedText} name="chevron-forward" size={18} />
        </TouchableOpacity>
      </ScrollView>
    </BookingFlowLayout>
  );
}

const createStyles = (palette: PassengerPalette, radius: typeof import('../../theme/passenger').passengerRadius) => StyleSheet.create({
  content: {
    gap: 18,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionTitle: {
    color: palette.text,
    fontSize: 18,
    fontWeight: '800',
  },
  sectionMeta: {
    color: palette.mutedText,
    fontSize: 12,
    fontWeight: '700',
  },
  vehicleList: {
    gap: 12,
  },
  heroCard: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: 14,
    padding: 18,
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 4,
  },
  heroHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
  },
  heroCopy: {
    flex: 1,
    gap: 4,
  },
  heroEyebrow: {
    color: palette.primaryDeep,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: palette.text,
    fontSize: 24,
    fontWeight: '800',
  },
  heroHint: {
    color: palette.mutedText,
    fontSize: 13,
    lineHeight: 19,
  },
  heroPriceWrap: {
    alignItems: 'flex-end',
    gap: 4,
  },
  heroPriceLabel: {
    color: palette.mutedText,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  heroPriceValue: {
    color: palette.text,
    fontSize: 20,
    fontWeight: '800',
  },
  heroMetrics: {
    flexDirection: 'row',
    gap: 10,
  },
  heroMetric: {
    backgroundColor: palette.surfaceMuted,
    borderRadius: radius.md,
    flex: 1,
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  heroMetricLabel: {
    color: palette.mutedText,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  heroMetricValue: {
    color: palette.text,
    fontSize: 13,
    fontWeight: '800',
  },
  paymentCard: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: 14,
    padding: 18,
  },
  paymentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  paymentChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surfaceMuted,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  paymentChipActive: {
    backgroundColor: palette.text,
    borderColor: palette.text,
  },
  paymentChipText: {
    color: palette.text,
    fontSize: 13,
    fontWeight: '700',
  },
  paymentChipTextActive: {
    color: '#FFFFFF',
  },
  infoCard: {
    alignItems: 'flex-start',
    backgroundColor: palette.warningSurface,
    borderColor: palette.warningBorder,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 16,
  },
  infoCopy: {
    flex: 1,
    gap: 2,
  },
  infoTitle: {
    color: palette.text,
    fontSize: 14,
    fontWeight: '800',
  },
  infoHint: {
    color: palette.mutedText,
    fontSize: 12,
    lineHeight: 18,
  },
  scheduleCard: {
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    padding: 18,
  },
  scheduleIconWrap: {
    alignItems: 'center',
    backgroundColor: palette.primarySoft,
    borderRadius: 16,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  scheduleCopy: {
    flex: 1,
    gap: 4,
  },
  scheduleTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '800',
  },
  scheduleHint: {
    color: palette.mutedText,
    fontSize: 13,
    lineHeight: 18,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: palette.primaryDeep,
    borderRadius: radius.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  primaryEyebrow: {
    color: '#FDE6B8',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  primaryTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
});

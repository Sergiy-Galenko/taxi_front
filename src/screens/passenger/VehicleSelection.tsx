import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import BookingFlowLayout from '../../components/passenger/BookingFlowLayout';
import RouteSummaryCard from '../../components/passenger/RouteSummaryCard';
import VehicleOptionCard from '../../components/passenger/VehicleOptionCard';
import {
  calculateTripSummary,
  calculateTripSummaryFromMetrics,
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

    navigation.navigate('DriverSearch', {
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
            <Text style={styles.primaryTitle}>{t('vehicleSelection.confirmTitle', { price: summary.price })}</Text>
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

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('vehicleSelection.availableCars')}</Text>
          <Text style={styles.sectionMeta}>{t('vehicleSelection.optionsNearby', { count: RIDE_OPTIONS.length })}</Text>
        </View>

        <View style={styles.vehicleList}>
          {RIDE_OPTIONS.map((option) => (
            <VehicleOptionCard
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
                <TouchableOpacity
                  key={option}
                  activeOpacity={0.88}
                  onPress={() => setPaymentMethod(option)}
                  style={[styles.paymentChip, active && styles.paymentChipActive]}
                >
                  <Text style={[styles.paymentChipText, active && styles.paymentChipTextActive]}>{t(`payments.${option}`)}</Text>
                </TouchableOpacity>
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

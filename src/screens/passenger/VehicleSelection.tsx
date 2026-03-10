import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import BookingFlowLayout from '../../components/passenger/BookingFlowLayout';
import RouteSummaryCard from '../../components/passenger/RouteSummaryCard';
import VehicleOptionCard from '../../components/passenger/VehicleOptionCard';
import {
  calculateTripSummary,
  getRideOption,
  PAYMENT_OPTIONS,
  RIDE_OPTIONS,
} from '../../data/passenger';
import { passengerPalette, passengerRadius } from '../../theme/passenger';
import { RootStackParamList } from '../../types/navigation';
import { RideOptionKey } from '../../types/passenger';

type VehicleSelectionScreenProps = NativeStackScreenProps<RootStackParamList, 'VehicleSelection'>;

export default function VehicleSelectionScreen({ navigation, route }: VehicleSelectionScreenProps) {
  const [selectedRide, setSelectedRide] = useState<RideOptionKey>(route.params.rideType ?? 'comfort');
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_OPTIONS[0]);

  const summary = useMemo(() => {
    return calculateTripSummary(route.params.pickupCoords ?? null, route.params.destinationCoords ?? null, selectedRide);
  }, [route.params.destinationCoords, route.params.pickupCoords, selectedRide]);

  const selectedRideConfig = getRideOption(selectedRide);

  const handleConfirmRide = () => {
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
      subtitle="Compare the options, pick the best fit, and confirm without leaving this step."
      title="Choose your ride"
      footer={
        <TouchableOpacity activeOpacity={0.92} onPress={handleConfirmRide} style={styles.primaryButton}>
          <View>
            <Text style={styles.primaryEyebrow}>{selectedRideConfig.label} selected</Text>
            <Text style={styles.primaryTitle}>Confirm ride · UAH {summary.price}</Text>
          </View>
          <Ionicons color="#FFFFFF" name="arrow-forward" size={18} />
        </TouchableOpacity>
      }
    >
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <RouteSummaryCard
          badge="Step 2 of 4"
          destination={route.params.to}
          meta={[
            { icon: 'time-outline', label: `${summary.durationMin} min ride` },
            { icon: 'map-outline', label: `${summary.distanceKm || 0} km` },
            { icon: 'car-outline', label: `${summary.pickupEtaMin} min pickup` },
          ]}
          onPressEdit={() => navigation.goBack()}
          pickup={route.params.from}
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available cars</Text>
          <Text style={styles.sectionMeta}>{RIDE_OPTIONS.length} options nearby</Text>
        </View>

        <View style={styles.vehicleList}>
          {RIDE_OPTIONS.map((option) => (
            <VehicleOptionCard
              key={option.key}
              onPress={() => setSelectedRide(option.key)}
              option={option}
              selected={selectedRide === option.key}
              summary={calculateTripSummary(
                route.params.pickupCoords ?? null,
                route.params.destinationCoords ?? null,
                option.key
              )}
            />
          ))}
        </View>

        <View style={styles.paymentCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Payment</Text>
            <Text style={styles.sectionMeta}>Change anytime</Text>
          </View>

          <View style={styles.paymentRow}>
            {PAYMENT_OPTIONS.map((option) => {
              const active = option === paymentMethod;

              return (
                <TouchableOpacity
                  key={option}
                  activeOpacity={0.88}
                  onPress={() => setPaymentMethod(option)}
                  style={[styles.paymentChip, active && styles.paymentChipActive]}
                >
                  <Text style={[styles.paymentChipText, active && styles.paymentChipTextActive]}>{option}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

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
            <Ionicons color={passengerPalette.text} name="calendar-outline" size={18} />
          </View>
          <View style={styles.scheduleCopy}>
            <Text style={styles.scheduleTitle}>Need pickup later?</Text>
            <Text style={styles.scheduleHint}>Schedule this route instead of booking immediately.</Text>
          </View>
          <Ionicons color={passengerPalette.mutedText} name="chevron-forward" size={18} />
        </TouchableOpacity>
      </ScrollView>
    </BookingFlowLayout>
  );
}

const styles = StyleSheet.create({
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
    color: passengerPalette.text,
    fontSize: 18,
    fontWeight: '800',
  },
  sectionMeta: {
    color: passengerPalette.mutedText,
    fontSize: 12,
    fontWeight: '700',
  },
  vehicleList: {
    gap: 12,
  },
  paymentCard: {
    backgroundColor: passengerPalette.surface,
    borderColor: passengerPalette.border,
    borderRadius: passengerRadius.lg,
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
    borderColor: passengerPalette.border,
    backgroundColor: passengerPalette.surfaceMuted,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  paymentChipActive: {
    backgroundColor: passengerPalette.text,
    borderColor: passengerPalette.text,
  },
  paymentChipText: {
    color: passengerPalette.text,
    fontSize: 13,
    fontWeight: '700',
  },
  paymentChipTextActive: {
    color: '#FFFFFF',
  },
  scheduleCard: {
    alignItems: 'center',
    backgroundColor: passengerPalette.surface,
    borderColor: passengerPalette.border,
    borderRadius: passengerRadius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    padding: 18,
  },
  scheduleIconWrap: {
    alignItems: 'center',
    backgroundColor: passengerPalette.primarySoft,
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
    color: passengerPalette.text,
    fontSize: 16,
    fontWeight: '800',
  },
  scheduleHint: {
    color: passengerPalette.mutedText,
    fontSize: 13,
    lineHeight: 18,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: passengerPalette.primaryDeep,
    borderRadius: passengerRadius.lg,
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

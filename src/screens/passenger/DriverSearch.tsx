import React, { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import BookingFlowLayout from '../../components/passenger/BookingFlowLayout';
import RouteSummaryCard from '../../components/passenger/RouteSummaryCard';
import { getRideOption } from '../../data/passenger';
import { passengerPalette, passengerRadius } from '../../theme/passenger';
import { RootStackParamList } from '../../types/navigation';

type DriverSearchScreenProps = NativeStackScreenProps<RootStackParamList, 'DriverSearch'>;

const driverMatches = {
  economy: {
    name: 'Dmytro P.',
    car: 'Toyota Corolla',
    plate: 'AA 4821 PX',
    rating: '4.93',
    etaMin: 4,
  },
  comfort: {
    name: 'Olha K.',
    car: 'Skoda Superb',
    plate: 'KA 1108 AB',
    rating: '4.98',
    etaMin: 3,
  },
  xl: {
    name: 'Yaroslav M.',
    car: 'Volkswagen Caravelle',
    plate: 'AI 9033 MX',
    rating: '4.95',
    etaMin: 5,
  },
} as const;

export default function DriverSearchScreen({ navigation, route }: DriverSearchScreenProps) {
  const [driverFound, setDriverFound] = useState(false);
  const rideOption = getRideOption(route.params.rideType);
  const matchedDriver = useMemo(() => driverMatches[route.params.rideType], [route.params.rideType]);

  useEffect(() => {
    const timer = setTimeout(() => setDriverFound(true), 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <BookingFlowLayout
      subtitle="We keep this step focused: matching first, details next, tracking after that."
      title={driverFound ? 'Driver found' : 'Looking for a driver'}
      footer={
        driverFound ? (
          <TouchableOpacity
            activeOpacity={0.92}
            onPress={() =>
              navigation.replace('ActiveRide', {
                ...route.params,
                driverName: matchedDriver.name,
                driverCar: matchedDriver.car,
                driverPlate: matchedDriver.plate,
                driverRating: matchedDriver.rating,
                driverEtaMin: matchedDriver.etaMin,
              })
            }
            style={styles.primaryButton}
          >
            <View>
              <Text style={styles.primaryEyebrow}>{matchedDriver.etaMin} min away</Text>
              <Text style={styles.primaryTitle}>Track driver</Text>
            </View>
            <Ionicons color="#FFFFFF" name="navigate-outline" size={18} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            activeOpacity={0.92}
            onPress={() => navigation.navigate('Home')}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>Cancel request</Text>
          </TouchableOpacity>
        )
      }
    >
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animatable.View animation="pulse" duration={1800} iterationCount="infinite" style={styles.searchHero}>
          <View style={styles.searchRingOuter}>
            <View style={styles.searchRingInner}>
              <View style={styles.searchCore}>
                <Ionicons color="#FFFFFF" name="car-sport" size={26} />
              </View>
            </View>
          </View>
          <Text style={styles.searchTitle}>
            {driverFound ? 'Your driver accepted the ride' : 'Matching the best driver nearby'}
          </Text>
          <Text style={styles.searchHint}>
            {driverFound
              ? 'Vehicle and contact details are ready. Open live tracking when you are ready.'
              : 'We are checking drivers around your pickup point and prioritizing the fastest arrival.'}
          </Text>
        </Animatable.View>

        <RouteSummaryCard
          badge="Step 3 of 4"
          destination={route.params.to}
          meta={[
            { icon: 'car-outline', label: rideOption.label },
            { icon: 'wallet-outline', label: route.params.paymentMethod },
            { icon: 'cash-outline', label: `UAH ${route.params.price}` },
          ]}
          pickup={route.params.from}
        />

        <View style={styles.progressCard}>
          {[
            {
              title: 'Request sent',
              hint: 'Your trip request is already in the queue.',
              active: true,
            },
            {
              title: 'Driver matched',
              hint: driverFound ? 'A driver accepted your request.' : 'Usually takes a few seconds.',
              active: driverFound,
            },
            {
              title: 'Ready for live tracking',
              hint: 'Driver card and route details appear before pickup.',
              active: driverFound,
            },
          ].map((step) => (
            <View key={step.title} style={styles.progressRow}>
              <View style={[styles.progressDot, step.active && styles.progressDotActive]} />
              <View style={styles.progressCopy}>
                <Text style={styles.progressTitle}>{step.title}</Text>
                <Text style={styles.progressHint}>{step.hint}</Text>
              </View>
            </View>
          ))}
        </View>

        {driverFound ? (
          <View style={styles.driverCard}>
            <View style={styles.driverAvatar}>
              <Text style={styles.driverAvatarText}>{matchedDriver.name.charAt(0)}</Text>
            </View>
            <View style={styles.driverCopy}>
              <Text style={styles.driverName}>{matchedDriver.name}</Text>
              <Text style={styles.driverMeta}>{matchedDriver.car} • {matchedDriver.plate}</Text>
              <View style={styles.driverRatingRow}>
                <Ionicons color={passengerPalette.primaryDeep} name="star" size={14} />
                <Text style={styles.driverRatingText}>{matchedDriver.rating} driver rating</Text>
              </View>
            </View>
            <TouchableOpacity
              activeOpacity={0.86}
              onPress={() => Alert.alert('Driver call', 'Calling is a placeholder in this demo flow.')}
              style={styles.callButton}
            >
              <Ionicons color={passengerPalette.text} name="call-outline" size={18} />
            </TouchableOpacity>
          </View>
        ) : null}
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
  searchHero: {
    alignItems: 'center',
    backgroundColor: passengerPalette.surface,
    borderColor: passengerPalette.border,
    borderRadius: passengerRadius.lg,
    borderWidth: 1,
    gap: 12,
    paddingHorizontal: 22,
    paddingVertical: 28,
  },
  searchRingOuter: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 138,
    height: 138,
    borderRadius: 69,
    backgroundColor: 'rgba(244, 180, 0, 0.12)',
  },
  searchRingInner: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 102,
    height: 102,
    borderRadius: 51,
    backgroundColor: 'rgba(244, 180, 0, 0.18)',
  },
  searchCore: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: passengerPalette.primaryDeep,
  },
  searchTitle: {
    color: passengerPalette.text,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  searchHint: {
    color: passengerPalette.mutedText,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  progressCard: {
    backgroundColor: passengerPalette.surface,
    borderColor: passengerPalette.border,
    borderRadius: passengerRadius.lg,
    borderWidth: 1,
    gap: 16,
    padding: 18,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 12,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: passengerPalette.border,
    marginTop: 6,
  },
  progressDotActive: {
    backgroundColor: passengerPalette.accent,
  },
  progressCopy: {
    flex: 1,
    gap: 4,
  },
  progressTitle: {
    color: passengerPalette.text,
    fontSize: 15,
    fontWeight: '800',
  },
  progressHint: {
    color: passengerPalette.mutedText,
    fontSize: 13,
    lineHeight: 18,
  },
  driverCard: {
    backgroundColor: passengerPalette.surface,
    borderColor: passengerPalette.border,
    borderRadius: passengerRadius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    padding: 18,
  },
  driverAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: passengerPalette.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverAvatarText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  driverCopy: {
    flex: 1,
    gap: 4,
  },
  driverName: {
    color: passengerPalette.text,
    fontSize: 18,
    fontWeight: '800',
  },
  driverMeta: {
    color: passengerPalette.mutedText,
    fontSize: 13,
  },
  driverRatingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  driverRatingText: {
    color: passengerPalette.text,
    fontSize: 12,
    fontWeight: '700',
  },
  callButton: {
    alignItems: 'center',
    backgroundColor: passengerPalette.surfaceMuted,
    borderRadius: 16,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: passengerPalette.accent,
    borderRadius: passengerRadius.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  primaryEyebrow: {
    color: '#D8F3EE',
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
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: passengerPalette.surface,
    borderColor: passengerPalette.border,
    borderRadius: passengerRadius.lg,
    borderWidth: 1,
    paddingVertical: 18,
  },
  secondaryButtonText: {
    color: passengerPalette.text,
    fontSize: 16,
    fontWeight: '700',
  },
});

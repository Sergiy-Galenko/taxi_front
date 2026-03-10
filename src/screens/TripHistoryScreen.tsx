import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import PassengerScreenLayout from '../components/passenger/PassengerScreenLayout';
import { getRideOption, TRIP_HISTORY } from '../data/passenger';
import { passengerPalette, passengerRadius } from '../theme/passenger';
import { RootStackParamList } from '../types/navigation';

type TripHistoryScreenProps = NativeStackScreenProps<RootStackParamList, 'TripHistory'>;

const totalSpent = TRIP_HISTORY.reduce((sum, trip) => sum + trip.price, 0);
const averageFare = Math.round(totalSpent / TRIP_HISTORY.length);

export default function TripHistoryScreen({ navigation }: TripHistoryScreenProps) {
  return (
    <PassengerScreenLayout
      activeRoute="TripHistory"
      subtitle="Recent rides stay actionable so repeating them takes one tap."
      title="Recent rides"
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.analyticsRow}>
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsValue}>{TRIP_HISTORY.length}</Text>
            <Text style={styles.analyticsLabel}>Trips this month</Text>
          </View>
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsValue}>UAH {averageFare}</Text>
            <Text style={styles.analyticsLabel}>Average fare</Text>
          </View>
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsValue}>4.9</Text>
            <Text style={styles.analyticsLabel}>Average rating</Text>
          </View>
        </View>

        {TRIP_HISTORY.map((trip) => {
          const rideOption = getRideOption(trip.rideType);

          return (
            <View key={trip.id} style={styles.tripCard}>
              <View style={styles.tripHeader}>
                <View>
                  <Text style={styles.tripDate}>{trip.dateLabel}</Text>
                  <Text style={styles.tripStatus}>{trip.status}</Text>
                </View>
                <View style={styles.tripPill}>
                  <Ionicons color={passengerPalette.text} name="car-outline" size={14} />
                  <Text style={styles.tripPillText}>{rideOption.label}</Text>
                </View>
              </View>

              <View style={styles.routeGroup}>
                <View style={styles.routeRow}>
                  <View style={[styles.routeDot, styles.pickupDot]} />
                  <View style={styles.routeText}>
                    <Text style={styles.routeLabel}>Pickup</Text>
                    <Text style={styles.routeValue}>{trip.pickup}</Text>
                  </View>
                </View>

                <View style={styles.routeDivider} />

                <View style={styles.routeRow}>
                  <View style={[styles.routeDot, styles.destinationDot]} />
                  <View style={styles.routeText}>
                    <Text style={styles.routeLabel}>Destination</Text>
                    <Text style={styles.routeValue}>{trip.destination}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.tripFooter}>
                <View>
                  <Text style={styles.metaLabel}>Paid with</Text>
                  <Text style={styles.metaValue}>{trip.paymentLabel}</Text>
                </View>
                <View>
                  <Text style={styles.metaLabel}>Fare</Text>
                  <Text style={styles.priceValue}>UAH {trip.price}</Text>
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() =>
                  navigation.navigate('Home', {
                    from: trip.pickup,
                    to: trip.destination,
                    rideType: trip.rideType,
                  })
                }
                style={styles.repeatButton}
              >
                <Text style={styles.repeatButtonText}>Repeat this ride</Text>
                <Ionicons color={passengerPalette.text} name="arrow-forward" size={18} />
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </PassengerScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 18,
    paddingBottom: 150,
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  analyticsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  analyticsCard: {
    backgroundColor: passengerPalette.surface,
    borderColor: passengerPalette.border,
    borderRadius: passengerRadius.lg,
    borderWidth: 1,
    flex: 1,
    padding: 16,
  },
  analyticsValue: {
    color: passengerPalette.text,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  analyticsLabel: {
    color: passengerPalette.mutedText,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
  tripCard: {
    backgroundColor: passengerPalette.surface,
    borderColor: passengerPalette.border,
    borderRadius: passengerRadius.lg,
    borderWidth: 1,
    gap: 18,
    padding: 18,
  },
  tripHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tripDate: {
    color: passengerPalette.text,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  tripStatus: {
    color: passengerPalette.mutedText,
    fontSize: 12,
    fontWeight: '700',
  },
  tripPill: {
    alignItems: 'center',
    backgroundColor: passengerPalette.surfaceMuted,
    borderRadius: 999,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tripPillText: {
    color: passengerPalette.text,
    fontSize: 12,
    fontWeight: '700',
  },
  routeGroup: {
    gap: 12,
  },
  routeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  routeDot: {
    borderRadius: 6,
    height: 12,
    marginTop: 5,
    width: 12,
  },
  pickupDot: {
    backgroundColor: passengerPalette.accent,
  },
  destinationDot: {
    backgroundColor: passengerPalette.danger,
  },
  routeText: {
    flex: 1,
    gap: 4,
  },
  routeLabel: {
    color: passengerPalette.mutedText,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  routeValue: {
    color: passengerPalette.text,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 21,
  },
  routeDivider: {
    backgroundColor: passengerPalette.border,
    height: 1,
    marginLeft: 24,
  },
  tripFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaLabel: {
    color: passengerPalette.mutedText,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  metaValue: {
    color: passengerPalette.text,
    fontSize: 14,
    fontWeight: '700',
  },
  priceValue: {
    color: passengerPalette.text,
    fontSize: 18,
    fontWeight: '800',
  },
  repeatButton: {
    alignItems: 'center',
    backgroundColor: passengerPalette.primary,
    borderRadius: passengerRadius.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  repeatButtonText: {
    color: passengerPalette.text,
    fontSize: 15,
    fontWeight: '800',
  },
});


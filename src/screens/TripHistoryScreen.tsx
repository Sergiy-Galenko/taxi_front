import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import PassengerScreenLayout from '../components/passenger/PassengerScreenLayout';
import { TRIP_HISTORY } from '../data/passenger';
import { useI18n } from '../hooks/useI18n';
import { getPaymentMethodTranslationKey } from '../hooks/useNotifications';
import { PassengerPalette } from '../theme/passenger';
import { usePassengerTheme } from '../hooks/usePassengerTheme';
import { RootStackParamList } from '../types/navigation';

type TripHistoryScreenProps = NativeStackScreenProps<RootStackParamList, 'TripHistory'>;

const totalSpent = TRIP_HISTORY.reduce((sum, trip) => sum + trip.price, 0);
const averageFare = Math.round(totalSpent / TRIP_HISTORY.length);

const paymentLabelToKey = (paymentLabel: string) => {
  if (paymentLabel.toLowerCase().includes('apple')) {
    return 'apple_pay' as const;
  }

  if (paymentLabel.toLowerCase().includes('cash') || paymentLabel.toLowerCase().includes('готів')) {
    return 'cash' as const;
  }

  return 'visa' as const;
};

export default function TripHistoryScreen({ navigation }: TripHistoryScreenProps) {
  const { t } = useI18n();
  const { palette, radius } = usePassengerTheme();
  const styles = useMemo(() => createStyles(palette, radius), [palette, radius]);

  return (
    <PassengerScreenLayout
      activeRoute="TripHistory"
      subtitle={t('history.subtitle')}
      title={t('history.title')}
    >
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.analyticsRow}>
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsValue}>{TRIP_HISTORY.length}</Text>
            <Text style={styles.analyticsLabel}>{t('history.tripsThisMonth')}</Text>
          </View>
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsValue}>{t('common.priceUah', { amount: averageFare })}</Text>
            <Text style={styles.analyticsLabel}>{t('history.averageFare')}</Text>
          </View>
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsValue}>4.9</Text>
            <Text style={styles.analyticsLabel}>{t('history.averageRating')}</Text>
          </View>
        </View>

        {TRIP_HISTORY.map((trip) => (
          <View key={trip.id} style={styles.tripCard}>
            <View style={styles.tripHeader}>
              <View>
                <Text style={styles.tripDate}>{trip.dateLabel}</Text>
                <Text style={styles.tripStatus}>{t('history.completed')}</Text>
              </View>
              <View style={styles.tripPill}>
                <Ionicons color={palette.text} name="car-outline" size={14} />
                <Text style={styles.tripPillText}>{t(`rideOptions.${trip.rideType}.label`)}</Text>
              </View>
            </View>

            <View style={styles.routeGroup}>
              <View style={styles.routeRow}>
                <View style={[styles.routeDot, styles.pickupDot]} />
                <View style={styles.routeText}>
                  <Text style={styles.routeLabel}>{t('history.pickup')}</Text>
                  <Text style={styles.routeValue}>{trip.pickup}</Text>
                </View>
              </View>

              <View style={styles.routeDivider} />

              <View style={styles.routeRow}>
                <View style={[styles.routeDot, styles.destinationDot]} />
                <View style={styles.routeText}>
                  <Text style={styles.routeLabel}>{t('history.destination')}</Text>
                  <Text style={styles.routeValue}>{trip.destination}</Text>
                </View>
              </View>
            </View>

            <View style={styles.tripFooter}>
              <View>
                <Text style={styles.metaLabel}>{t('history.paidWith')}</Text>
                <Text style={styles.metaValue}>{t(getPaymentMethodTranslationKey(paymentLabelToKey(trip.paymentLabel)))}</Text>
              </View>
              <View>
                <Text style={styles.metaLabel}>{t('history.fare')}</Text>
                <Text style={styles.priceValue}>{t('common.priceUah', { amount: trip.price })}</Text>
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
              <Text style={styles.repeatButtonText}>{t('history.repeatRide')}</Text>
              <Ionicons color={palette.text} name="arrow-forward" size={18} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </PassengerScreenLayout>
  );
}

const createStyles = (palette: PassengerPalette, radius: typeof import('../theme/passenger').passengerRadius) => StyleSheet.create({
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
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flex: 1,
    padding: 16,
  },
  analyticsValue: {
    color: palette.text,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  analyticsLabel: {
    color: palette.mutedText,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
  tripCard: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: radius.lg,
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
    color: palette.text,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  tripStatus: {
    color: palette.mutedText,
    fontSize: 12,
    fontWeight: '700',
  },
  tripPill: {
    alignItems: 'center',
    backgroundColor: palette.surfaceMuted,
    borderRadius: 999,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tripPillText: {
    color: palette.text,
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
    backgroundColor: palette.accent,
  },
  destinationDot: {
    backgroundColor: palette.danger,
  },
  routeText: {
    flex: 1,
    gap: 4,
  },
  routeLabel: {
    color: palette.mutedText,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  routeValue: {
    color: palette.text,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 21,
  },
  routeDivider: {
    backgroundColor: palette.border,
    height: 1,
    marginLeft: 24,
  },
  tripFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaLabel: {
    color: palette.mutedText,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  metaValue: {
    color: palette.text,
    fontSize: 14,
    fontWeight: '700',
  },
  priceValue: {
    color: palette.text,
    fontSize: 18,
    fontWeight: '800',
  },
  repeatButton: {
    alignItems: 'center',
    backgroundColor: palette.primary,
    borderRadius: radius.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  repeatButtonText: {
    color: palette.text,
    fontSize: 15,
    fontWeight: '800',
  },
});

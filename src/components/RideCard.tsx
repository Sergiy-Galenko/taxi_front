import React, { memo, useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '../hooks/useI18n';
import { usePassengerTheme } from '../hooks/usePassengerTheme';
import { PassengerPalette, passengerSpacing } from '../theme/passenger';
import { TripHistoryEntry } from '../types/passenger';

interface RideCardProps {
  trip: TripHistoryEntry;
  onRepeat?: () => void;
}

function RideCard({ trip, onRepeat }: RideCardProps) {
  const { t } = useI18n();
  const { palette, radius } = usePassengerTheme();
  const styles = useMemo(() => createStyles(palette, radius), [palette, radius]);

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onRepeat} style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.date}>{trip.dateLabel}</Text>
          <Text style={styles.status}>{t('history.completed')}</Text>
        </View>
        <Text style={styles.price}>{t('common.priceUah', { amount: trip.price })}</Text>
      </View>

      <View style={styles.route}>
        <View style={styles.routeRow}>
          <View style={[styles.dot, styles.pickupDot]} />
          <Text style={styles.routeText} numberOfLines={1}>{trip.pickup}</Text>
        </View>
        <View style={styles.routeLine} />
        <View style={styles.routeRow}>
          <View style={[styles.dot, styles.destinationDot]} />
          <Text style={styles.routeText} numberOfLines={1}>{trip.destination}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.meta}>
          <Ionicons color={palette.mutedText} name="car-outline" size={15} />
          <Text style={styles.metaText}>{t(`rideOptions.${trip.rideType}.label`)}</Text>
        </View>
        <View style={styles.repeat}>
          <Text style={styles.repeatText}>{t('history.repeatRide')}</Text>
          <Ionicons color={palette.text} name="arrow-forward" size={16} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (
  palette: PassengerPalette,
  radius: typeof import('../theme/passenger').passengerRadius
) =>
  StyleSheet.create({
    card: {
      backgroundColor: palette.surface,
      borderColor: palette.border,
      borderRadius: radius.lg,
      borderWidth: 1,
      gap: passengerSpacing.lg,
      padding: passengerSpacing.lg,
    },
    date: {
      color: palette.text,
      fontSize: 16,
      fontWeight: '900',
    },
    destinationDot: {
      backgroundColor: palette.danger,
    },
    dot: {
      borderRadius: radius.pill,
      height: 10,
      width: 10,
    },
    footer: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: passengerSpacing.md,
    },
    header: {
      alignItems: 'flex-start',
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: passengerSpacing.md,
    },
    meta: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: passengerSpacing.xs,
    },
    metaText: {
      color: palette.mutedText,
      fontSize: 12,
      fontWeight: '800',
    },
    pickupDot: {
      backgroundColor: palette.accent,
    },
    price: {
      color: palette.text,
      fontSize: 18,
      fontWeight: '900',
    },
    repeat: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: passengerSpacing.xs,
    },
    repeatText: {
      color: palette.text,
      fontSize: 13,
      fontWeight: '900',
    },
    route: {
      gap: passengerSpacing.sm,
    },
    routeLine: {
      backgroundColor: palette.border,
      height: 18,
      marginLeft: 4,
      width: 2,
    },
    routeRow: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: passengerSpacing.md,
    },
    routeText: {
      color: palette.text,
      flex: 1,
      fontSize: 15,
      fontWeight: '800',
    },
    status: {
      color: palette.mutedText,
      fontSize: 12,
      fontWeight: '800',
      marginTop: 4,
    },
  });

export default memo(RideCard);

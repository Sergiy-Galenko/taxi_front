import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Button from '../../components/Button';
import RatingModal from '../../components/RatingModal';
import BookingFlowLayout from '../../components/passenger/BookingFlowLayout';
import RouteSummaryCard from '../../components/passenger/RouteSummaryCard';
import { useI18n } from '../../hooks/useI18n';
import { getPaymentMethodTranslationKey } from '../../hooks/useNotifications';
import { usePassengerTheme } from '../../hooks/usePassengerTheme';
import { PassengerPalette, passengerSpacing } from '../../theme/passenger';
import { RootStackParamList } from '../../types/navigation';

type RideCompleteScreenProps = NativeStackScreenProps<RootStackParamList, 'RideComplete'>;

export default function RideCompleteScreen({ navigation, route }: RideCompleteScreenProps) {
  const { t } = useI18n();
  const { palette, radius } = usePassengerTheme();
  const styles = useMemo(() => createStyles(palette, radius), [palette, radius]);
  const [ratingVisible, setRatingVisible] = useState(true);
  const [ratingSummary, setRatingSummary] = useState<{ rating: number; tip: number } | null>(null);
  const total = route.params.price + (ratingSummary?.tip ?? 0);

  return (
    <BookingFlowLayout
      onBack={() => navigation.navigate('Home')}
      subtitle={t('rideComplete.subtitle')}
      title={t('rideComplete.title')}
      footer={
        <View style={styles.footer}>
          <Button
            onPress={() =>
              navigation.navigate('Home', {
                from: route.params.from,
                rideType: route.params.rideType,
                to: route.params.to,
              })
            }
            rightIcon="refresh"
            title={t('rideComplete.repeat')}
          />
          <Button
            onPress={() => navigation.navigate('TripHistory')}
            title={t('tabs.trips')}
            variant="secondary"
          />
        </View>
      }
    >
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons color="#FFFFFF" name="checkmark" size={30} />
          </View>
          <Text style={styles.heroTitle}>{t('rideComplete.heroTitle')}</Text>
          <Text style={styles.heroText}>{t('rideComplete.heroText', { destination: route.params.to })}</Text>
        </View>

        <RouteSummaryCard
          badge={t('common.stepOf', { current: 4, total: 4 })}
          destination={route.params.to}
          meta={[
            { icon: 'map-outline', label: t('common.kilometersShort', { count: route.params.distanceKm }) },
            { icon: 'time-outline', label: t('common.minutesShort', { count: route.params.durationMin }) },
            { icon: 'wallet-outline', label: t(getPaymentMethodTranslationKey(route.params.paymentMethod)) },
          ]}
          pickup={route.params.from}
        />

        <View style={styles.receiptCard}>
          <Text style={styles.cardTitle}>{t('rideComplete.receipt')}</Text>
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>{t('history.fare')}</Text>
            <Text style={styles.receiptValue}>{t('common.priceUah', { amount: route.params.price })}</Text>
          </View>
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>{t('rideComplete.tip')}</Text>
            <Text style={styles.receiptValue}>{t('common.priceUah', { amount: ratingSummary?.tip ?? 0 })}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.receiptRow}>
            <Text style={styles.totalLabel}>{t('rideComplete.total')}</Text>
            <Text style={styles.totalValue}>{t('common.priceUah', { amount: total })}</Text>
          </View>
        </View>

        <View style={styles.driverCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{route.params.driverName.charAt(0)}</Text>
          </View>
          <View style={styles.driverCopy}>
            <Text style={styles.driverName}>{route.params.driverName}</Text>
            <Text style={styles.driverMeta}>{route.params.driverCar} • {route.params.driverPlate}</Text>
            <Text style={styles.driverMeta}>
              {ratingSummary ? `${ratingSummary.rating}/5` : t('rideComplete.ratingPending')}
            </Text>
          </View>
        </View>
      </ScrollView>

      <RatingModal
        driverName={route.params.driverName}
        onClose={() => setRatingVisible(false)}
        onSubmit={(rating, tip) => {
          setRatingSummary({ rating, tip });
          setRatingVisible(false);
        }}
        visible={ratingVisible}
      />
    </BookingFlowLayout>
  );
}

const createStyles = (
  palette: PassengerPalette,
  radius: typeof import('../../theme/passenger').passengerRadius
) =>
  StyleSheet.create({
    avatar: {
      alignItems: 'center',
      backgroundColor: palette.accent,
      borderRadius: radius.pill,
      height: 58,
      justifyContent: 'center',
      width: 58,
    },
    avatarText: {
      color: '#FFFFFF',
      fontSize: 23,
      fontWeight: '900',
    },
    cardTitle: {
      color: palette.text,
      fontSize: 18,
      fontWeight: '900',
      marginBottom: passengerSpacing.sm,
    },
    content: {
      gap: passengerSpacing.lg,
      paddingBottom: passengerSpacing.xl,
      paddingHorizontal: passengerSpacing.xl,
      paddingTop: passengerSpacing.lg,
    },
    divider: {
      backgroundColor: palette.border,
      height: 1,
    },
    driverCard: {
      alignItems: 'center',
      backgroundColor: palette.surface,
      borderColor: palette.border,
      borderRadius: radius.lg,
      borderWidth: 1,
      flexDirection: 'row',
      gap: passengerSpacing.md,
      padding: passengerSpacing.lg,
    },
    driverCopy: {
      flex: 1,
      gap: 4,
    },
    driverMeta: {
      color: palette.mutedText,
      fontSize: 13,
      fontWeight: '700',
    },
    driverName: {
      color: palette.text,
      fontSize: 18,
      fontWeight: '900',
    },
    footer: {
      gap: passengerSpacing.md,
    },
    heroCard: {
      alignItems: 'center',
      backgroundColor: palette.successSoft,
      borderRadius: radius.xl,
      gap: passengerSpacing.md,
      padding: passengerSpacing.xxl,
    },
    heroIcon: {
      alignItems: 'center',
      backgroundColor: palette.success,
      borderRadius: radius.pill,
      height: 70,
      justifyContent: 'center',
      width: 70,
    },
    heroText: {
      color: palette.mutedText,
      fontSize: 14,
      lineHeight: 20,
      textAlign: 'center',
    },
    heroTitle: {
      color: palette.text,
      fontSize: 24,
      fontWeight: '900',
      textAlign: 'center',
    },
    receiptCard: {
      backgroundColor: palette.surface,
      borderColor: palette.border,
      borderRadius: radius.lg,
      borderWidth: 1,
      gap: passengerSpacing.md,
      padding: passengerSpacing.lg,
    },
    receiptLabel: {
      color: palette.mutedText,
      fontSize: 14,
      fontWeight: '800',
    },
    receiptRow: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: passengerSpacing.md,
    },
    receiptValue: {
      color: palette.text,
      fontSize: 15,
      fontWeight: '900',
    },
    totalLabel: {
      color: palette.text,
      fontSize: 17,
      fontWeight: '900',
    },
    totalValue: {
      color: palette.text,
      fontSize: 22,
      fontWeight: '900',
    },
  });

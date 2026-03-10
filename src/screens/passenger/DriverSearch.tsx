import React, { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import BookingFlowLayout from '../../components/passenger/BookingFlowLayout';
import RouteSummaryCard from '../../components/passenger/RouteSummaryCard';
import { useI18n } from '../../hooks/useI18n';
import { useNotifications, getPaymentMethodTranslationKey } from '../../hooks/useNotifications';
import { PassengerPalette } from '../../theme/passenger';
import { usePassengerTheme } from '../../hooks/usePassengerTheme';
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
  const { t } = useI18n();
  const { notifyRideEvent } = useNotifications();
  const { palette, radius } = usePassengerTheme();
  const styles = useMemo(() => createStyles(palette, radius), [palette, radius]);
  const [driverFound, setDriverFound] = useState(false);
  const matchedDriver = useMemo(() => driverMatches[route.params.rideType], [route.params.rideType]);

  useEffect(() => {
    void notifyRideEvent('search_started');

    const timer = setTimeout(() => {
      setDriverFound(true);
      void notifyRideEvent('driver_found', {
        driver: matchedDriver.name,
        car: matchedDriver.car,
      });
    }, 2200);

    return () => clearTimeout(timer);
  }, [matchedDriver.car, matchedDriver.name, notifyRideEvent]);

  return (
    <BookingFlowLayout
      subtitle={t('driverSearch.subtitle')}
      title={driverFound ? t('driverSearch.titleFound') : t('driverSearch.titleSearching')}
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
              <Text style={styles.primaryEyebrow}>{t('driverSearch.trackEyebrow', { count: matchedDriver.etaMin })}</Text>
              <Text style={styles.primaryTitle}>{t('driverSearch.trackTitle')}</Text>
            </View>
            <Ionicons color="#FFFFFF" name="navigate-outline" size={18} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            activeOpacity={0.92}
            onPress={() => {
              Alert.alert(t('alerts.searchCancelledTitle'), t('alerts.searchCancelledText'));
              navigation.navigate('Home');
            }}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>{t('driverSearch.cancelRequest')}</Text>
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
          <Text style={styles.searchTitle}>{driverFound ? t('driverSearch.heroFound') : t('driverSearch.heroSearching')}</Text>
          <Text style={styles.searchHint}>{driverFound ? t('driverSearch.foundHint') : t('driverSearch.searchHint')}</Text>
        </Animatable.View>

        <RouteSummaryCard
          badge={t('common.stepOf', { current: 3, total: 4 })}
          destination={route.params.to}
          meta={[
            { icon: 'car-outline', label: t(`rideOptions.${route.params.rideType}.label`) },
            { icon: 'wallet-outline', label: t(getPaymentMethodTranslationKey(route.params.paymentMethod)) },
            { icon: 'cash-outline', label: t('common.priceUah', { amount: route.params.price }) },
          ]}
          pickup={route.params.from}
        />

        <View style={styles.progressCard}>
          {[
            {
              title: t('driverSearch.progress.sentTitle'),
              hint: t('driverSearch.progress.sentHint'),
              active: true,
            },
            {
              title: t('driverSearch.progress.matchedTitle'),
              hint: driverFound ? t('driverSearch.progress.matchedHintReady') : t('driverSearch.progress.matchedHintPending'),
              active: driverFound,
            },
            {
              title: t('driverSearch.progress.liveTitle'),
              hint: t('driverSearch.progress.liveHint'),
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
                <Ionicons color={palette.primaryDeep} name="star" size={14} />
                <Text style={styles.driverRatingText}>{t('driverSearch.driverRating', { rating: matchedDriver.rating })}</Text>
              </View>
            </View>
            <TouchableOpacity
              activeOpacity={0.86}
              onPress={() => Alert.alert(t('driverSearch.callDriver'), t('driverSearch.callDriverHint'))}
              style={styles.callButton}
            >
              <Ionicons color={palette.text} name="call-outline" size={18} />
            </TouchableOpacity>
          </View>
        ) : null}
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
  searchHero: {
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: radius.lg,
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
    backgroundColor: palette.primaryDeep,
  },
  searchTitle: {
    color: palette.text,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  searchHint: {
    color: palette.mutedText,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  progressCard: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: radius.lg,
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
    backgroundColor: palette.border,
    marginTop: 6,
  },
  progressDotActive: {
    backgroundColor: palette.accent,
  },
  progressCopy: {
    flex: 1,
    gap: 4,
  },
  progressTitle: {
    color: palette.text,
    fontSize: 15,
    fontWeight: '800',
  },
  progressHint: {
    color: palette.mutedText,
    fontSize: 13,
    lineHeight: 18,
  },
  driverCard: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    padding: 18,
  },
  driverAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: palette.accent,
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
    color: palette.text,
    fontSize: 18,
    fontWeight: '800',
  },
  driverMeta: {
    color: palette.mutedText,
    fontSize: 13,
  },
  driverRatingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  driverRatingText: {
    color: palette.text,
    fontSize: 12,
    fontWeight: '700',
  },
  callButton: {
    alignItems: 'center',
    backgroundColor: palette.surfaceMuted,
    borderRadius: 16,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: palette.accent,
    borderRadius: radius.lg,
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
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingVertical: 18,
  },
  secondaryButtonText: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '700',
  },
});

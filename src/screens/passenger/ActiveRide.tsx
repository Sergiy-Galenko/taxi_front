import React, { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import BookingFlowLayout from '../../components/passenger/BookingFlowLayout';
import RouteSummaryCard from '../../components/passenger/RouteSummaryCard';
import { DEFAULT_CITY_CENTER, DEFAULT_REGION } from '../../data/passenger';
import { useI18n } from '../../hooks/useI18n';
import { getPaymentMethodTranslationKey, useNotifications } from '../../hooks/useNotifications';
import { useSettings } from '../../hooks/useSettings';
import { PassengerPalette } from '../../theme/passenger';
import { usePassengerTheme } from '../../hooks/usePassengerTheme';
import { RootStackParamList } from '../../types/navigation';
import { Coordinates } from '../../types/passenger';

type ActiveRideScreenProps = NativeStackScreenProps<RootStackParamList, 'ActiveRide'>;

type RideStage = 'driver_delayed' | 'driver_arriving' | 'driver_arrived' | 'trip_started' | 'trip_completed';

const buildDriverCoords = (pickup: Coordinates | null | undefined, destination: Coordinates | null | undefined): Coordinates => {
  if (pickup && destination) {
    return {
      latitude: pickup.latitude + (destination.latitude - pickup.latitude) * 0.18,
      longitude: pickup.longitude + (destination.longitude - pickup.longitude) * 0.12,
    };
  }

  if (pickup) {
    return {
      latitude: pickup.latitude + 0.006,
      longitude: pickup.longitude - 0.004,
    };
  }

  return {
    latitude: DEFAULT_CITY_CENTER.latitude + 0.01,
    longitude: DEFAULT_CITY_CENTER.longitude - 0.01,
  };
};

const buildRegion = (pickup: Coordinates | null | undefined, destination: Coordinates | null | undefined) => {
  if (!pickup || !destination) {
    return DEFAULT_REGION;
  }

  return {
    latitude: (pickup.latitude + destination.latitude) / 2,
    longitude: (pickup.longitude + destination.longitude) / 2,
    latitudeDelta: Math.max(Math.abs(pickup.latitude - destination.latitude) * 1.8, 0.05),
    longitudeDelta: Math.max(Math.abs(pickup.longitude - destination.longitude) * 1.8, 0.04),
  };
};

export default function ActiveRideScreen({ navigation, route }: ActiveRideScreenProps) {
  const { t } = useI18n();
  const { notifyRideEvent } = useNotifications();
  const { shareRideEnabled } = useSettings();
  const { palette, radius } = usePassengerTheme();
  const styles = useMemo(() => createStyles(palette, radius), [palette, radius]);
  const [rideStage, setRideStage] = useState<RideStage>('driver_delayed');
  const driverCoords = useMemo(
    () => buildDriverCoords(route.params.pickupCoords ?? null, route.params.destinationCoords ?? null),
    [route.params.destinationCoords, route.params.pickupCoords]
  );
  const region = useMemo(
    () => buildRegion(route.params.pickupCoords ?? null, route.params.destinationCoords ?? null),
    [route.params.destinationCoords, route.params.pickupCoords]
  );
  const routeLine = [driverCoords, route.params.pickupCoords ?? DEFAULT_CITY_CENTER, route.params.destinationCoords ?? DEFAULT_CITY_CENTER];

  useEffect(() => {
    const timers = [
      setTimeout(() => {
        setRideStage('driver_delayed');
        void notifyRideEvent('driver_delayed', { count: route.params.driverEtaMin + 2 });
      }, 1200),
      setTimeout(() => {
        setRideStage('driver_arriving');
        void notifyRideEvent('driver_arriving_soon', { driver: route.params.driverName });
      }, 5200),
      setTimeout(() => {
        setRideStage('driver_arrived');
        void notifyRideEvent('driver_arrived', { driver: route.params.driverName });
      }, 9200),
      setTimeout(() => {
        setRideStage('trip_started');
        void notifyRideEvent('trip_started', { destination: route.params.to });
      }, 13200),
      setTimeout(() => {
        setRideStage('trip_completed');
        void notifyRideEvent('trip_completed', { destination: route.params.to });
        void notifyRideEvent('payment_update', {
          amount: String(route.params.price),
          paymentMethod: t(getPaymentMethodTranslationKey(route.params.paymentMethod)),
        });
      }, 18200),
    ];

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [notifyRideEvent, route.params.driverEtaMin, route.params.driverName, route.params.paymentMethod, route.params.price, route.params.to, t]);

  const statusContent = useMemo(() => {
    switch (rideStage) {
      case 'driver_delayed':
        return {
          title: t('activeRide.driverDelayedTitle'),
          text: t('activeRide.driverDelayedText', { count: route.params.driverEtaMin + 2 }),
          accentColor: palette.warningSurface,
          icon: 'time-outline' as const,
        };
      case 'driver_arriving':
        return {
          title: t('activeRide.driverArrivingTitle'),
          text: t('activeRide.driverArrivingText', { driver: route.params.driverName }),
          accentColor: palette.warningSurface,
          icon: 'navigate-outline' as const,
        };
      case 'driver_arrived':
        return {
          title: t('activeRide.driverArrivedTitle'),
          text: t('activeRide.driverArrivedText', { driver: route.params.driverName }),
          accentColor: palette.accentSoft,
          icon: 'checkmark-circle-outline' as const,
        };
      case 'trip_started':
        return {
          title: t('activeRide.tripStartedTitle'),
          text: t('activeRide.tripStartedText', { destination: route.params.to }),
          accentColor: palette.backgroundAccent,
          icon: 'car-outline' as const,
        };
      case 'trip_completed':
      default:
        return {
          title: t('activeRide.tripCompletedTitle'),
          text: t('activeRide.tripCompletedText', { destination: route.params.to }),
          accentColor: palette.surfaceMuted,
          icon: 'flag-outline' as const,
        };
    }
  }, [palette.accentSoft, palette.backgroundAccent, palette.surfaceMuted, palette.warningSurface, rideStage, route.params.driverEtaMin, route.params.driverName, route.params.to, t]);

  const arrivalValue = rideStage === 'driver_delayed' ? route.params.driverEtaMin + 2 : rideStage === 'driver_arrived' ? 0 : Math.max(1, route.params.driverEtaMin - 1);

  return (
    <BookingFlowLayout
      subtitle={t('activeRide.subtitle')}
      title={t('activeRide.title')}
      footer={
        <View style={styles.footerActions}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => Alert.alert(t('activeRide.shareTrip'), t('activeRide.shareHint'))}
            style={styles.ghostButton}
          >
            <Text style={styles.ghostButtonText}>{t('activeRide.shareTrip')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.92}
            onPress={() => navigation.navigate('Home')}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>{t('common.done')}</Text>
          </TouchableOpacity>
        </View>
      }
    >
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.mapCard}>
          <MapView initialRegion={region} region={region} scrollEnabled={false} style={styles.map}>
            <Marker coordinate={driverCoords}>
              <View style={styles.driverMarker}>
                <Ionicons color="#FFFFFF" name="car-sport" size={14} />
              </View>
            </Marker>
            {route.params.pickupCoords ? (
              <Marker coordinate={route.params.pickupCoords}>
                <View style={styles.pickupMarker} />
              </Marker>
            ) : null}
            {route.params.destinationCoords ? (
              <Marker coordinate={route.params.destinationCoords}>
                <View style={styles.destinationMarker}>
                  <Ionicons color="#FFFFFF" name="flag" size={12} />
                </View>
              </Marker>
            ) : null}
            <Polyline coordinates={routeLine} strokeColor={palette.primaryDeep} strokeWidth={4} />
          </MapView>

          <View style={styles.arrivalCard}>
            <Text style={styles.arrivalEyebrow}>{t('activeRide.arrivingSoon')}</Text>
            <Text style={styles.arrivalValue}>
              {arrivalValue <= 0 ? t('common.now') : t('common.minutesShort', { count: arrivalValue })}
            </Text>
          </View>
        </View>

        <View style={[styles.statusCard, { backgroundColor: statusContent.accentColor }]}> 
          <Ionicons color={palette.text} name={statusContent.icon} size={18} />
          <View style={styles.statusCopy}>
            <Text style={styles.statusTitle}>{statusContent.title}</Text>
            <Text style={styles.statusText}>{statusContent.text}</Text>
          </View>
        </View>

        <View style={styles.driverCard}>
          <View style={styles.driverIdentity}>
            <View style={styles.driverAvatar}>
              <Text style={styles.driverAvatarText}>{route.params.driverName.charAt(0)}</Text>
            </View>
            <View style={styles.driverCopy}>
              <Text style={styles.driverName}>{route.params.driverName}</Text>
              <Text style={styles.driverMeta}>{route.params.driverCar} • {route.params.driverPlate}</Text>
              <View style={styles.ratingRow}>
                <Ionicons color={palette.primaryDeep} name="star" size={14} />
                <Text style={styles.ratingText}>{route.params.driverRating}</Text>
              </View>
            </View>
          </View>

          <View style={styles.driverActions}>
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => Alert.alert(t('alerts.driverCallTitle'), t('alerts.driverCallText'))}
              style={styles.actionButton}
            >
              <Ionicons color={palette.text} name="call-outline" size={18} />
              <Text style={styles.actionButtonText}>{t('activeRide.call')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => Alert.alert(t('alerts.driverMessageTitle'), t('alerts.driverMessageText'))}
              style={styles.actionButton}
            >
              <Ionicons color={palette.text} name="chatbubble-ellipses-outline" size={18} />
              <Text style={styles.actionButtonText}>{t('activeRide.message')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {shareRideEnabled ? (
          <View style={styles.shareCard}>
            <Ionicons color={palette.accent} name="share-social-outline" size={18} />
            <View style={styles.shareCopy}>
              <Text style={styles.shareTitle}>{t('activeRide.autoShareTitle')}</Text>
              <Text style={styles.shareText}>{t('activeRide.autoShareText')}</Text>
            </View>
          </View>
        ) : null}

        <RouteSummaryCard
          badge={t('common.stepOf', { current: 4, total: 4 })}
          destination={route.params.to}
          meta={[
            { icon: 'car-outline', label: t(`rideOptions.${route.params.rideType}.label`) },
            { icon: 'wallet-outline', label: t(getPaymentMethodTranslationKey(route.params.paymentMethod)) },
            { icon: 'cash-outline', label: t('common.priceUah', { amount: route.params.price }) },
          ]}
          pickup={route.params.from}
        />

        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>{t('activeRide.pickupCode')}</Text>
          <Text style={styles.noteValue}>2743</Text>
          <Text style={styles.noteHint}>{t('activeRide.pickupCodeHint')}</Text>
        </View>
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
  mapCard: {
    overflow: 'hidden',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
  },
  map: {
    height: 230,
  },
  driverMarker: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: palette.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickupMarker: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: palette.accent,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  destinationMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: palette.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrivalCard: {
    position: 'absolute',
    right: 14,
    top: 14,
    backgroundColor: palette.surface,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  arrivalEyebrow: {
    color: palette.mutedText,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  arrivalValue: {
    color: palette.text,
    fontSize: 20,
    fontWeight: '800',
  },
  statusCard: {
    flexDirection: 'row',
    gap: 10,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 16,
  },
  statusCopy: {
    flex: 1,
    gap: 3,
  },
  statusTitle: {
    color: palette.text,
    fontSize: 15,
    fontWeight: '800',
  },
  statusText: {
    color: palette.mutedText,
    fontSize: 13,
    lineHeight: 18,
  },
  driverCard: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: 16,
    padding: 18,
  },
  driverIdentity: {
    flexDirection: 'row',
    gap: 14,
  },
  driverAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: palette.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverAvatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  driverCopy: {
    flex: 1,
    gap: 4,
  },
  driverName: {
    color: palette.text,
    fontSize: 19,
    fontWeight: '800',
  },
  driverMeta: {
    color: palette.mutedText,
    fontSize: 14,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  ratingText: {
    color: palette.text,
    fontSize: 12,
    fontWeight: '700',
  },
  driverActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    borderRadius: 16,
    backgroundColor: palette.surfaceMuted,
    paddingVertical: 14,
  },
  actionButtonText: {
    color: palette.text,
    fontSize: 14,
    fontWeight: '700',
  },
  shareCard: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    gap: 10,
  },
  shareCopy: {
    flex: 1,
    gap: 3,
  },
  shareTitle: {
    color: palette.text,
    fontSize: 15,
    fontWeight: '800',
  },
  shareText: {
    color: palette.mutedText,
    fontSize: 13,
    lineHeight: 18,
  },
  noteCard: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: 18,
    gap: 8,
  },
  noteTitle: {
    color: palette.mutedText,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  noteValue: {
    color: palette.text,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 3,
  },
  noteHint: {
    color: palette.mutedText,
    fontSize: 13,
    lineHeight: 18,
  },
  footerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  ghostButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    paddingVertical: 18,
  },
  ghostButtonText: {
    color: palette.text,
    fontSize: 15,
    fontWeight: '700',
  },
  primaryButton: {
    flex: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    backgroundColor: palette.primaryDeep,
    paddingVertical: 18,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});

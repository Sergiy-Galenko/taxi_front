import React, { useMemo } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import BookingFlowLayout from '../../components/passenger/BookingFlowLayout';
import RouteSummaryCard from '../../components/passenger/RouteSummaryCard';
import { DEFAULT_CITY_CENTER, DEFAULT_REGION, getRideOption } from '../../data/passenger';
import { passengerPalette, passengerRadius } from '../../theme/passenger';
import { RootStackParamList } from '../../types/navigation';
import { Coordinates } from '../../types/passenger';

type ActiveRideScreenProps = NativeStackScreenProps<RootStackParamList, 'ActiveRide'>;

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
  const rideOption = getRideOption(route.params.rideType);
  const driverCoords = useMemo(
    () => buildDriverCoords(route.params.pickupCoords ?? null, route.params.destinationCoords ?? null),
    [route.params.destinationCoords, route.params.pickupCoords]
  );
  const region = useMemo(
    () => buildRegion(route.params.pickupCoords ?? null, route.params.destinationCoords ?? null),
    [route.params.destinationCoords, route.params.pickupCoords]
  );
  const routeLine = [driverCoords, route.params.pickupCoords ?? DEFAULT_CITY_CENTER, route.params.destinationCoords ?? DEFAULT_CITY_CENTER];

  return (
    <BookingFlowLayout
      subtitle="Key details stay close to the thumb: arrival, driver card, support, and destination."
      title="Driver on the way"
      footer={
        <View style={styles.footerActions}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => Alert.alert('Share trip', 'Sharing is a placeholder in this redesigned flow.')}
            style={styles.ghostButton}
          >
            <Text style={styles.ghostButtonText}>Share trip</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.92}
            onPress={() => navigation.navigate('Home')}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Done</Text>
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
            <Polyline coordinates={routeLine} strokeColor={passengerPalette.primaryDeep} strokeWidth={4} />
          </MapView>

          <View style={styles.arrivalCard}>
            <Text style={styles.arrivalEyebrow}>Arriving soon</Text>
            <Text style={styles.arrivalValue}>{route.params.driverEtaMin} min</Text>
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
                <Ionicons color={passengerPalette.primaryDeep} name="star" size={14} />
                <Text style={styles.ratingText}>{route.params.driverRating} rating</Text>
              </View>
            </View>
          </View>

          <View style={styles.driverActions}>
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => Alert.alert('Call driver', 'Calling is a placeholder in this demo.')}
              style={styles.actionButton}
            >
              <Ionicons color={passengerPalette.text} name="call-outline" size={18} />
              <Text style={styles.actionButtonText}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => Alert.alert('Message driver', 'Messaging is a placeholder in this demo.')}
              style={styles.actionButton}
            >
              <Ionicons color={passengerPalette.text} name="chatbubble-ellipses-outline" size={18} />
              <Text style={styles.actionButtonText}>Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        <RouteSummaryCard
          badge="Step 4 of 4"
          destination={route.params.to}
          meta={[
            { icon: 'car-outline', label: rideOption.label },
            { icon: 'wallet-outline', label: route.params.paymentMethod },
            { icon: 'cash-outline', label: `UAH ${route.params.price}` },
          ]}
          pickup={route.params.from}
        />

        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>Pickup code</Text>
          <Text style={styles.noteValue}>2743</Text>
          <Text style={styles.noteHint}>
            Share this code with the driver only after the car arrives and the license plate matches.
          </Text>
        </View>
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
  mapCard: {
    overflow: 'hidden',
    borderRadius: passengerRadius.xl,
    borderWidth: 1,
    borderColor: passengerPalette.border,
    backgroundColor: passengerPalette.surface,
  },
  map: {
    height: 230,
  },
  driverMarker: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: passengerPalette.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickupMarker: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: passengerPalette.accent,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  destinationMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: passengerPalette.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrivalCard: {
    position: 'absolute',
    right: 14,
    top: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  arrivalEyebrow: {
    color: passengerPalette.mutedText,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  arrivalValue: {
    color: passengerPalette.text,
    fontSize: 20,
    fontWeight: '800',
  },
  driverCard: {
    backgroundColor: passengerPalette.surface,
    borderColor: passengerPalette.border,
    borderRadius: passengerRadius.lg,
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
    backgroundColor: passengerPalette.accent,
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
    color: passengerPalette.text,
    fontSize: 19,
    fontWeight: '800',
  },
  driverMeta: {
    color: passengerPalette.mutedText,
    fontSize: 14,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  ratingText: {
    color: passengerPalette.text,
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
    backgroundColor: passengerPalette.surfaceMuted,
    paddingVertical: 14,
  },
  actionButtonText: {
    color: passengerPalette.text,
    fontSize: 14,
    fontWeight: '700',
  },
  noteCard: {
    backgroundColor: passengerPalette.surface,
    borderColor: passengerPalette.border,
    borderRadius: passengerRadius.lg,
    borderWidth: 1,
    padding: 18,
    gap: 8,
  },
  noteTitle: {
    color: passengerPalette.mutedText,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  noteValue: {
    color: passengerPalette.text,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 3,
  },
  noteHint: {
    color: passengerPalette.mutedText,
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
    borderRadius: passengerRadius.lg,
    borderWidth: 1,
    borderColor: passengerPalette.border,
    backgroundColor: passengerPalette.surface,
    paddingVertical: 18,
  },
  ghostButtonText: {
    color: passengerPalette.text,
    fontSize: 15,
    fontWeight: '700',
  },
  primaryButton: {
    flex: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: passengerRadius.lg,
    backgroundColor: passengerPalette.primaryDeep,
    paddingVertical: 18,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});

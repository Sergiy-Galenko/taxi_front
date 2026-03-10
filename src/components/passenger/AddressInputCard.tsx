import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { passengerPalette, passengerRadius } from '../../theme/passenger';

interface AddressInputCardProps {
  pickup: string;
  destination: string;
  onPickupChange: (value: string) => void;
  onDestinationChange: (value: string) => void;
  onUseCurrentLocation: () => void;
  onSwap: () => void;
  onDestinationFocus: () => void;
}

export default function AddressInputCard({
  pickup,
  destination,
  onPickupChange,
  onDestinationChange,
  onUseCurrentLocation,
  onSwap,
  onDestinationFocus,
}: AddressInputCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.header}>Route</Text>

      <View style={styles.row}>
        <View style={styles.timelineColumn}>
          <View style={[styles.marker, styles.pickupMarker]} />
          <View style={styles.timelineLine} />
          <View style={[styles.marker, styles.destinationMarker]} />
        </View>

        <View style={styles.fieldsColumn}>
          <View style={styles.fieldRow}>
            <View style={styles.fieldCopy}>
              <Text style={styles.label}>Pickup</Text>
              <TextInput
                onChangeText={onPickupChange}
                placeholder="Use current location"
                placeholderTextColor={passengerPalette.mutedText}
                style={styles.input}
                value={pickup}
              />
            </View>
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={onUseCurrentLocation}
              style={styles.sideButton}
            >
              <Ionicons color={passengerPalette.info} name="locate-outline" size={20} />
            </TouchableOpacity>
          </View>

          <View style={styles.innerDivider} />

          <View style={styles.fieldRow}>
            <View style={styles.fieldCopy}>
              <Text style={styles.label}>Destination</Text>
              <TextInput
                onChangeText={onDestinationChange}
                onFocus={onDestinationFocus}
                placeholder="Where to?"
                placeholderTextColor={passengerPalette.mutedText}
                style={styles.input}
                value={destination}
              />
            </View>
            <TouchableOpacity activeOpacity={0.88} onPress={onSwap} style={styles.sideButton}>
              <Ionicons color={passengerPalette.text} name="swap-vertical-outline" size={20} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: passengerPalette.surface,
    borderColor: passengerPalette.border,
    borderRadius: passengerRadius.xl,
    borderWidth: 1,
    gap: 16,
    padding: 18,
    shadowColor: passengerPalette.shadow,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 1,
    shadowRadius: 28,
    elevation: 8,
  },
  header: {
    color: passengerPalette.mutedText,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  timelineColumn: {
    alignItems: 'center',
    paddingTop: 12,
  },
  marker: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  pickupMarker: {
    backgroundColor: passengerPalette.accent,
  },
  destinationMarker: {
    backgroundColor: passengerPalette.danger,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 42,
    backgroundColor: passengerPalette.border,
    marginVertical: 6,
  },
  fieldsColumn: {
    flex: 1,
    gap: 10,
  },
  fieldRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  fieldCopy: {
    flex: 1,
    gap: 4,
  },
  label: {
    color: passengerPalette.mutedText,
    fontSize: 12,
    fontWeight: '700',
  },
  input: {
    color: passengerPalette.text,
    fontSize: 18,
    fontWeight: '700',
    paddingVertical: 0,
  },
  sideButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: passengerPalette.surfaceMuted,
    borderWidth: 1,
    borderColor: passengerPalette.border,
  },
  innerDivider: {
    height: 1,
    backgroundColor: passengerPalette.border,
  },
});

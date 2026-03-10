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
      <View style={styles.row}>
        <View style={[styles.marker, styles.pickupMarker]} />
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Pickup</Text>
          <TextInput
            onChangeText={onPickupChange}
            placeholder="Set pickup point"
            placeholderTextColor={passengerPalette.mutedText}
            style={styles.input}
            value={pickup}
          />
        </View>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onUseCurrentLocation}
          style={styles.iconButton}
        >
          <Ionicons color={passengerPalette.info} name="locate-outline" size={20} />
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <View style={[styles.marker, styles.destinationMarker]} />
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Destination</Text>
          <TextInput
            onChangeText={onDestinationChange}
            onFocus={onDestinationFocus}
            placeholder="Where do you need to go?"
            placeholderTextColor={passengerPalette.mutedText}
            style={styles.input}
            value={destination}
          />
        </View>
        <TouchableOpacity activeOpacity={0.85} onPress={onSwap} style={styles.iconButton}>
          <Ionicons color={passengerPalette.text} name="swap-vertical-outline" size={20} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: passengerPalette.surface,
    borderColor: passengerPalette.border,
    borderRadius: passengerRadius.lg,
    borderWidth: 1,
    gap: 12,
    padding: 18,
    shadowColor: passengerPalette.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 6,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  marker: {
    borderRadius: 6,
    height: 12,
    width: 12,
  },
  pickupMarker: {
    backgroundColor: passengerPalette.accent,
  },
  destinationMarker: {
    backgroundColor: passengerPalette.danger,
  },
  inputGroup: {
    flex: 1,
    gap: 2,
  },
  label: {
    color: passengerPalette.mutedText,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  input: {
    color: passengerPalette.text,
    fontSize: 16,
    fontWeight: '700',
    paddingVertical: 2,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: passengerPalette.surfaceMuted,
    borderRadius: passengerRadius.sm,
    borderWidth: 1,
    borderColor: passengerPalette.border,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  divider: {
    backgroundColor: passengerPalette.border,
    height: 1,
    marginLeft: 24,
  },
});


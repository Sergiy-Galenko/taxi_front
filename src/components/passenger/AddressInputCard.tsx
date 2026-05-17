import React, { useMemo } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePassengerTheme } from '../../hooks/usePassengerTheme';
import { PassengerPalette } from '../../theme/passenger';

interface AddressInputCardProps {
  headerLabel: string;
  pickupLabel: string;
  destinationLabel: string;
  pickupPlaceholder: string;
  destinationPlaceholder: string;
  pickup: string;
  destination: string;
  onPickupChange: (value: string) => void;
  onDestinationChange: (value: string) => void;
  onUseCurrentLocation: () => void;
  onSwap: () => void;
  onPickupFocus: () => void;
  onDestinationFocus: () => void;
  focusedField?: 'pickup' | 'destination' | null;
}

export default function AddressInputCard({
  headerLabel,
  pickupLabel,
  destinationLabel,
  pickupPlaceholder,
  destinationPlaceholder,
  pickup,
  destination,
  onPickupChange,
  onDestinationChange,
  onUseCurrentLocation,
  onSwap,
  onPickupFocus,
  onDestinationFocus,
  focusedField = null,
}: AddressInputCardProps) {
  const { palette, radius } = usePassengerTheme();
  const styles = useMemo(() => createStyles(palette, radius), [palette, radius]);

  return (
    <View style={styles.card}>
      <Text style={styles.header}>{headerLabel}</Text>

      <View style={styles.row}>
        <View style={styles.timelineColumn}>
          <View style={[styles.marker, styles.pickupMarker]} />
          <View style={styles.timelineLine} />
          <View style={[styles.marker, styles.destinationMarker]} />
        </View>

        <View style={styles.fieldsColumn}>
          <View style={[styles.fieldRow, focusedField === 'pickup' && styles.fieldRowActive]}>
            <View style={styles.fieldCopy}>
              <Text style={styles.label}>{pickupLabel}</Text>
              <TextInput
                onChangeText={onPickupChange}
                onFocus={onPickupFocus}
                placeholder={pickupPlaceholder}
                placeholderTextColor={palette.mutedText}
                style={styles.input}
                value={pickup}
              />
            </View>
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={onUseCurrentLocation}
              style={styles.sideButton}
            >
              <Ionicons color={palette.info} name="locate-outline" size={20} />
            </TouchableOpacity>
          </View>

          <View style={styles.innerDivider} />

          <View style={[styles.fieldRow, focusedField === 'destination' && styles.fieldRowActive]}>
            <View style={styles.fieldCopy}>
              <Text style={styles.label}>{destinationLabel}</Text>
              <TextInput
                onChangeText={onDestinationChange}
                onFocus={onDestinationFocus}
                placeholder={destinationPlaceholder}
                placeholderTextColor={palette.mutedText}
                style={styles.input}
                value={destination}
              />
            </View>
            <TouchableOpacity activeOpacity={0.88} onPress={onSwap} style={styles.sideButton}>
              <Ionicons color={palette.text} name="swap-vertical-outline" size={20} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const createStyles = (
  palette: PassengerPalette,
  radius: typeof import('../../theme/passenger').passengerRadius
) => StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: radius.xl,
    borderWidth: 1,
    gap: 16,
    padding: 18,
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 1,
    shadowRadius: 28,
    elevation: 8,
  },
  header: {
    color: palette.mutedText,
    fontSize: 12,
    fontWeight: '700',
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
    backgroundColor: palette.accent,
  },
  destinationMarker: {
    backgroundColor: palette.danger,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 42,
    backgroundColor: palette.border,
    marginVertical: 6,
  },
  fieldsColumn: {
    flex: 1,
    gap: 10,
  },
  fieldRow: {
    alignItems: 'center',
    borderRadius: 18,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  fieldRowActive: {
    backgroundColor: palette.surfaceMuted,
  },
  fieldCopy: {
    flex: 1,
    gap: 4,
  },
  label: {
    color: palette.mutedText,
    fontSize: 12,
    fontWeight: '700',
  },
  input: {
    color: palette.text,
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
    backgroundColor: palette.surfaceMuted,
    borderWidth: 1,
    borderColor: palette.border,
  },
  innerDivider: {
    height: 1,
    backgroundColor: palette.border,
  },
});

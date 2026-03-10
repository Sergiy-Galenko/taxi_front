import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { passengerPalette, passengerRadius } from '../../theme/passenger';

interface MetaItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}

interface RouteSummaryCardProps {
  pickup: string;
  destination: string;
  badge?: string;
  meta?: MetaItem[];
  onPressEdit?: () => void;
}

export default function RouteSummaryCard({
  pickup,
  destination,
  badge,
  meta = [],
  onPressEdit,
}: RouteSummaryCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        {badge ? <Text style={styles.badge}>{badge}</Text> : <View />}
        {onPressEdit ? (
          <TouchableOpacity activeOpacity={0.85} onPress={onPressEdit} style={styles.editButton}>
            <Text style={styles.editText}>Edit route</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.routeBlock}>
        <View style={styles.routeRow}>
          <View style={[styles.dot, styles.pickupDot]} />
          <View style={styles.routeText}>
            <Text style={styles.routeLabel}>Pickup</Text>
            <Text style={styles.routeValue}>{pickup}</Text>
          </View>
        </View>

        <View style={styles.routeDivider} />

        <View style={styles.routeRow}>
          <View style={[styles.dot, styles.destinationDot]} />
          <View style={styles.routeText}>
            <Text style={styles.routeLabel}>Destination</Text>
            <Text style={styles.routeValue}>{destination}</Text>
          </View>
        </View>
      </View>

      {meta.length ? (
        <View style={styles.metaRow}>
          {meta.map((item) => (
            <View key={`${item.icon}-${item.label}`} style={styles.metaChip}>
              <Ionicons color={passengerPalette.text} name={item.icon} size={15} />
              <Text style={styles.metaChipText}>{item.label}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: passengerPalette.surface,
    borderColor: passengerPalette.border,
    borderRadius: passengerRadius.lg,
    borderWidth: 1,
    gap: 16,
    padding: 18,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: passengerPalette.primarySoft,
    color: passengerPalette.text,
    borderRadius: 999,
    overflow: 'hidden',
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  editButton: {
    backgroundColor: passengerPalette.surfaceMuted,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  editText: {
    color: passengerPalette.text,
    fontSize: 12,
    fontWeight: '700',
  },
  routeBlock: {
    gap: 12,
  },
  routeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 6,
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
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  routeDivider: {
    height: 1,
    backgroundColor: passengerPalette.border,
    marginLeft: 24,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaChip: {
    alignItems: 'center',
    backgroundColor: passengerPalette.surfaceMuted,
    borderRadius: 999,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  metaChipText: {
    color: passengerPalette.text,
    fontSize: 12,
    fontWeight: '700',
  },
});

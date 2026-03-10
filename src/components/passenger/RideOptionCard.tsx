import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { passengerPalette, passengerRadius } from '../../theme/passenger';
import { RideOption, TripSummary } from '../../types/passenger';

interface RideOptionCardProps {
  option: RideOption;
  selected: boolean;
  summary: TripSummary;
  onPress: () => void;
}

export default function RideOptionCard({
  option,
  selected,
  summary,
  onPress,
}: RideOptionCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={[styles.card, selected && styles.selectedCard]}
    >
      <View style={styles.header}>
        <View style={[styles.iconBadge, { backgroundColor: selected ? option.accentColor : passengerPalette.surfaceMuted }]}>
          <Ionicons
            color={selected ? '#FFFFFF' : passengerPalette.text}
            name={option.icon as keyof typeof Ionicons.glyphMap}
            size={20}
          />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.label}>{option.label}</Text>
          <Text style={styles.description}>{option.description}</Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View>
          <Text style={styles.metricLabel}>Pickup</Text>
          <Text style={styles.metricValue}>{summary.pickupEtaMin} min</Text>
        </View>
        <View>
          <Text style={styles.metricLabel}>Seats</Text>
          <Text style={styles.metricValue}>{option.capacity}</Text>
        </View>
        <View>
          <Text style={styles.metricLabel}>Fare</Text>
          <Text style={styles.metricValue}>UAH {summary.price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: passengerPalette.surface,
    borderColor: passengerPalette.border,
    borderRadius: passengerRadius.lg,
    borderWidth: 1,
    gap: 16,
    marginRight: 12,
    minWidth: 240,
    padding: 18,
  },
  selectedCard: {
    borderColor: passengerPalette.primary,
    shadowColor: passengerPalette.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    gap: 12,
  },
  iconBadge: {
    alignItems: 'center',
    borderRadius: 16,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  label: {
    color: passengerPalette.text,
    fontSize: 16,
    fontWeight: '800',
  },
  description: {
    color: passengerPalette.mutedText,
    fontSize: 13,
    lineHeight: 18,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricLabel: {
    color: passengerPalette.mutedText,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  metricValue: {
    color: passengerPalette.text,
    fontSize: 13,
    fontWeight: '700',
  },
});

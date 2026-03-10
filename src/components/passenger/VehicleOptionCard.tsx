import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { passengerPalette, passengerRadius } from '../../theme/passenger';
import { RideOption, TripSummary } from '../../types/passenger';

interface VehicleOptionCardProps {
  option: RideOption;
  summary: TripSummary;
  selected: boolean;
  onPress: () => void;
}

export default function VehicleOptionCard({
  option,
  summary,
  selected,
  onPress,
}: VehicleOptionCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.card, selected && styles.cardSelected]}
    >
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: selected ? option.accentColor : passengerPalette.surfaceMuted }]}> 
          <Ionicons
            color={selected ? '#FFFFFF' : passengerPalette.text}
            name={option.icon as keyof typeof Ionicons.glyphMap}
            size={22}
          />
        </View>

        <View style={styles.headerCopy}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{option.label}</Text>
            {selected ? (
              <View style={styles.selectedPill}>
                <Ionicons color={passengerPalette.text} name="checkmark-circle" size={14} />
                <Text style={styles.selectedText}>Selected</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.description}>{option.description}</Text>
        </View>

        <View style={styles.priceWrap}>
          <Text style={styles.priceLabel}>Fare</Text>
          <Text style={styles.priceValue}>UAH {summary.price}</Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaBlock}>
          <Text style={styles.metaLabel}>Arrival</Text>
          <Text style={styles.metaValue}>{summary.pickupEtaMin} min</Text>
        </View>
        <View style={styles.metaBlock}>
          <Text style={styles.metaLabel}>Trip</Text>
          <Text style={styles.metaValue}>{summary.durationMin} min</Text>
        </View>
        <View style={styles.metaBlock}>
          <Text style={styles.metaLabel}>Capacity</Text>
          <Text style={styles.metaValue}>{option.capacity}</Text>
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
    padding: 18,
  },
  cardSelected: {
    borderColor: passengerPalette.primaryDeep,
    shadowColor: passengerPalette.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    gap: 14,
  },
  iconWrap: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
    gap: 5,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  title: {
    color: passengerPalette.text,
    fontSize: 18,
    fontWeight: '800',
  },
  selectedPill: {
    alignItems: 'center',
    backgroundColor: passengerPalette.primarySoft,
    borderRadius: 999,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  selectedText: {
    color: passengerPalette.text,
    fontSize: 11,
    fontWeight: '700',
  },
  description: {
    color: passengerPalette.mutedText,
    fontSize: 14,
    lineHeight: 20,
  },
  priceWrap: {
    alignItems: 'flex-end',
    minWidth: 78,
  },
  priceLabel: {
    color: passengerPalette.mutedText,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  priceValue: {
    color: passengerPalette.text,
    fontSize: 18,
    fontWeight: '800',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metaBlock: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: passengerPalette.surfaceMuted,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  metaLabel: {
    color: passengerPalette.mutedText,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  metaValue: {
    color: passengerPalette.text,
    fontSize: 13,
    fontWeight: '700',
  },
});

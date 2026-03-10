import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '../../hooks/useI18n';
import { usePassengerTheme } from '../../hooks/usePassengerTheme';
import { PassengerPalette } from '../../theme/passenger';
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
  const { t } = useI18n();
  const { palette, radius } = usePassengerTheme();
  const styles = useMemo(() => createStyles(palette, radius), [palette, radius]);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.card, selected && styles.cardSelected]}
    >
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: selected ? option.accentColor : palette.surfaceMuted }]}> 
          <Ionicons
            color={selected ? '#FFFFFF' : palette.text}
            name={option.icon as keyof typeof Ionicons.glyphMap}
            size={22}
          />
        </View>

        <View style={styles.headerCopy}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{t(`rideOptions.${option.key}.label`)}</Text>
            {selected ? (
              <View style={styles.selectedPill}>
                <Ionicons color={palette.text} name="checkmark-circle" size={14} />
                <Text style={styles.selectedText}>{t('vehicleSelection.selected')}</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.description}>{t(`rideOptions.${option.key}.description`)}</Text>
        </View>

        <View style={styles.priceWrap}>
          <Text style={styles.priceLabel}>{t('vehicleSelection.fare')}</Text>
          <Text style={styles.priceValue}>{t('common.priceUah', { amount: summary.price })}</Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaBlock}>
          <Text style={styles.metaLabel}>{t('vehicleSelection.arrival')}</Text>
          <Text style={styles.metaValue}>{t('common.minutesShort', { count: summary.pickupEtaMin })}</Text>
        </View>
        <View style={styles.metaBlock}>
          <Text style={styles.metaLabel}>{t('vehicleSelection.trip')}</Text>
          <Text style={styles.metaValue}>{t('common.minutesShort', { count: summary.durationMin })}</Text>
        </View>
        <View style={styles.metaBlock}>
          <Text style={styles.metaLabel}>{t('vehicleSelection.capacity')}</Text>
          <Text style={styles.metaValue}>{option.capacity}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (
  palette: PassengerPalette,
  radius: typeof import('../../theme/passenger').passengerRadius
) => StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: 16,
    padding: 18,
  },
  cardSelected: {
    borderColor: palette.primaryDeep,
    shadowColor: palette.shadow,
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
    color: palette.text,
    fontSize: 18,
    fontWeight: '800',
  },
  selectedPill: {
    alignItems: 'center',
    backgroundColor: palette.primarySoft,
    borderRadius: 999,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  selectedText: {
    color: palette.text,
    fontSize: 11,
    fontWeight: '700',
  },
  description: {
    color: palette.mutedText,
    fontSize: 14,
    lineHeight: 20,
  },
  priceWrap: {
    alignItems: 'flex-end',
    minWidth: 78,
  },
  priceLabel: {
    color: palette.mutedText,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  priceValue: {
    color: palette.text,
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
    backgroundColor: palette.surfaceMuted,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  metaLabel: {
    color: palette.mutedText,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  metaValue: {
    color: palette.text,
    fontSize: 13,
    fontWeight: '700',
  },
});

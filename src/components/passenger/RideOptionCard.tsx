import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '../../hooks/useI18n';
import { usePassengerTheme } from '../../hooks/usePassengerTheme';
import { PassengerPalette } from '../../theme/passenger';
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
  onPress,
}: RideOptionCardProps) {
  const { t } = useI18n();
  const { palette, radius } = usePassengerTheme();
  const styles = useMemo(() => createStyles(palette, radius), [palette, radius]);

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={[styles.card, selected && styles.selectedCard]}
    >
      <View style={styles.header}>
        <View style={[styles.iconBadge, { backgroundColor: selected ? option.accentColor : palette.surfaceMuted }]}>
          <Ionicons
            color={selected ? '#FFFFFF' : palette.text}
            name={option.icon as keyof typeof Ionicons.glyphMap}
            size={20}
          />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.label}>{t(`rideOptions.${option.key}.label`)}</Text>
          <Text style={styles.description}>{t(`rideOptions.${option.key}.description`)}</Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View>
          <Text style={styles.metricLabel}>{t('home.pickupStat')}</Text>
          <Text style={styles.metricValue}>{t('integration.unknown')}</Text>
        </View>
        <View>
          <Text style={styles.metricLabel}>{t('vehicleSelection.capacity')}</Text>
          <Text style={styles.metricValue}>{option.capacity}</Text>
        </View>
        <View>
          <Text style={styles.metricLabel}>{t('vehicleSelection.fare')}</Text>
          <Text style={styles.metricValue}>{t('integration.unknown')}</Text>
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
    marginRight: 12,
    minWidth: 240,
    padding: 18,
  },
  selectedCard: {
    borderColor: palette.primary,
    shadowColor: palette.shadow,
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
    color: palette.text,
    fontSize: 16,
    fontWeight: '800',
  },
  description: {
    color: palette.mutedText,
    fontSize: 13,
    lineHeight: 18,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricLabel: {
    color: palette.mutedText,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  metricValue: {
    color: palette.text,
    fontSize: 13,
    fontWeight: '700',
  },
});

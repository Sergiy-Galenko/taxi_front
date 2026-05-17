import React, { memo, useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '../hooks/useI18n';
import { usePassengerTheme } from '../hooks/usePassengerTheme';
import { PassengerPalette, passengerSpacing } from '../theme/passenger';
import { RideOption, TripSummary } from '../types/passenger';

interface TariffCardProps {
  option: RideOption;
  selected: boolean;
  summary: TripSummary;
  onPress: () => void;
}

function TariffCard({ option, selected, summary, onPress }: TariffCardProps) {
  const { t } = useI18n();
  const { palette, radius } = usePassengerTheme();
  const styles = useMemo(() => createStyles(palette, radius), [palette, radius]);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.card, selected && styles.cardSelected]}
    >
      <View style={[styles.iconWrap, { backgroundColor: selected ? option.accentColor : palette.surfaceMuted }]}>
        <Ionicons
          color={selected ? '#FFFFFF' : palette.text}
          name={option.icon as keyof typeof Ionicons.glyphMap}
          size={24}
        />
      </View>

      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{t(`rideOptions.${option.key}.label`)}</Text>
          {option.recommended ? <Text style={styles.recommended}>{t('vehicleSelection.recommended')}</Text> : null}
        </View>
        <Text style={styles.description}>{t(`rideOptions.${option.key}.description`)}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>{t('common.minutesShort', { count: summary.pickupEtaMin })}</Text>
          <Text style={styles.meta}>{option.capacity}</Text>
          <Text style={styles.meta}>{option.shortDescription}</Text>
        </View>
      </View>

      <View style={styles.priceWrap}>
        <Text style={styles.price}>{t('common.priceUah', { amount: summary.price })}</Text>
        {selected ? <Ionicons color={palette.success} name="checkmark-circle" size={20} /> : null}
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (
  palette: PassengerPalette,
  radius: typeof import('../theme/passenger').passengerRadius
) =>
  StyleSheet.create({
    card: {
      alignItems: 'center',
      backgroundColor: palette.surface,
      borderColor: palette.border,
      borderRadius: radius.lg,
      borderWidth: 1,
      flexDirection: 'row',
      gap: passengerSpacing.md,
      padding: passengerSpacing.lg,
    },
    cardSelected: {
      borderColor: palette.surfaceStrong,
      backgroundColor: palette.backgroundSecondary,
    },
    copy: {
      flex: 1,
      gap: 5,
    },
    description: {
      color: palette.mutedText,
      fontSize: 13,
      lineHeight: 18,
    },
    iconWrap: {
      alignItems: 'center',
      borderRadius: radius.lg,
      height: 54,
      justifyContent: 'center',
      width: 54,
    },
    meta: {
      color: palette.mutedText,
      fontSize: 12,
      fontWeight: '700',
    },
    metaRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: passengerSpacing.sm,
    },
    price: {
      color: palette.text,
      fontSize: 16,
      fontWeight: '900',
      textAlign: 'right',
    },
    priceWrap: {
      alignItems: 'flex-end',
      gap: passengerSpacing.sm,
      minWidth: 76,
    },
    recommended: {
      backgroundColor: palette.primarySoft,
      borderRadius: radius.pill,
      color: palette.text,
      fontSize: 10,
      fontWeight: '900',
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    title: {
      color: palette.text,
      fontSize: 18,
      fontWeight: '900',
    },
    titleRow: {
      alignItems: 'center',
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: passengerSpacing.sm,
    },
  });

export default memo(TariffCard);

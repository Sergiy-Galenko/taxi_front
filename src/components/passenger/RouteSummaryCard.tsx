import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '../../hooks/useI18n';
import { usePassengerTheme } from '../../hooks/usePassengerTheme';
import { PassengerPalette } from '../../theme/passenger';

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
  const { t } = useI18n();
  const { palette, radius } = usePassengerTheme();
  const styles = useMemo(() => createStyles(palette, radius), [palette, radius]);

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        {badge ? <Text style={styles.badge}>{badge}</Text> : <View />}
        {onPressEdit ? (
          <TouchableOpacity activeOpacity={0.85} onPress={onPressEdit} style={styles.editButton}>
            <Text style={styles.editText}>{t('common.editRoute')}</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.routeBlock}>
        <View style={styles.routeRow}>
          <View style={[styles.dot, styles.pickupDot]} />
          <View style={styles.routeText}>
            <Text style={styles.routeLabel}>{t('history.pickup')}</Text>
            <Text style={styles.routeValue}>{pickup}</Text>
          </View>
        </View>

        <View style={styles.routeDivider} />

        <View style={styles.routeRow}>
          <View style={[styles.dot, styles.destinationDot]} />
          <View style={styles.routeText}>
            <Text style={styles.routeLabel}>{t('history.destination')}</Text>
            <Text style={styles.routeValue}>{destination}</Text>
          </View>
        </View>
      </View>

      {meta.length ? (
        <View style={styles.metaRow}>
          {meta.map((item) => (
            <View key={`${item.icon}-${item.label}`} style={styles.metaChip}>
              <Ionicons color={palette.text} name={item.icon} size={15} />
              <Text style={styles.metaChipText}>{item.label}</Text>
            </View>
          ))}
        </View>
      ) : null}
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
    borderRadius: radius.lg,
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
    backgroundColor: palette.primarySoft,
    color: palette.text,
    borderRadius: 999,
    overflow: 'hidden',
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  editButton: {
    backgroundColor: palette.surfaceMuted,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  editText: {
    color: palette.text,
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
    backgroundColor: palette.accent,
  },
  destinationDot: {
    backgroundColor: palette.danger,
  },
  routeText: {
    flex: 1,
    gap: 4,
  },
  routeLabel: {
    color: palette.mutedText,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  routeValue: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  routeDivider: {
    height: 1,
    backgroundColor: palette.border,
    marginLeft: 24,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaChip: {
    alignItems: 'center',
    backgroundColor: palette.surfaceMuted,
    borderRadius: 999,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  metaChipText: {
    color: palette.text,
    fontSize: 12,
    fontWeight: '700',
  },
});

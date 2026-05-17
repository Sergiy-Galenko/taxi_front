import React, { memo, useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePassengerTheme } from '../hooks/usePassengerTheme';
import { PassengerPalette, passengerSpacing } from '../theme/passenger';

interface DriverCardProps {
  name: string;
  car: string;
  plate: string;
  rating: string;
  etaMin?: number;
  onCall?: () => void;
  onChat?: () => void;
  onShare?: () => void;
}

function DriverCard({
  name,
  car,
  plate,
  rating,
  etaMin,
  onCall,
  onChat,
  onShare,
}: DriverCardProps) {
  const { palette, radius } = usePassengerTheme();
  const styles = useMemo(() => createStyles(palette, radius), [palette, radius]);

  return (
    <View style={styles.card}>
      <View style={styles.identity}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{name.trim().charAt(0) || 'D'}</Text>
        </View>
        <View style={styles.copy}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.meta}>{car}</Text>
          <View style={styles.badges}>
            <View style={styles.badge}>
              <Ionicons color={palette.primaryDeep} name="star" size={13} />
              <Text style={styles.badgeText}>{rating}</Text>
            </View>
            <View style={styles.plate}>
              <Text style={styles.plateText}>{plate}</Text>
            </View>
            {etaMin != null ? (
              <View style={styles.badge}>
                <Ionicons color={palette.info} name="time-outline" size={13} />
                <Text style={styles.badgeText}>{etaMin} хв</Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity activeOpacity={0.86} onPress={onCall} style={styles.action}>
          <Ionicons color={palette.text} name="call-outline" size={19} />
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.86} onPress={onChat} style={styles.action}>
          <Ionicons color={palette.text} name="chatbubble-ellipses-outline" size={19} />
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.86} onPress={onShare} style={styles.action}>
          <Ionicons color={palette.text} name="share-social-outline" size={19} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (
  palette: PassengerPalette,
  radius: typeof import('../theme/passenger').passengerRadius
) =>
  StyleSheet.create({
    action: {
      alignItems: 'center',
      backgroundColor: palette.surfaceMuted,
      borderRadius: radius.md,
      height: 44,
      justifyContent: 'center',
      width: 44,
    },
    actions: {
      flexDirection: 'row',
      gap: passengerSpacing.sm,
    },
    avatar: {
      alignItems: 'center',
      backgroundColor: palette.accent,
      borderRadius: radius.pill,
      height: 62,
      justifyContent: 'center',
      width: 62,
    },
    avatarText: {
      color: '#FFFFFF',
      fontSize: 24,
      fontWeight: '900',
    },
    badge: {
      alignItems: 'center',
      backgroundColor: palette.surfaceMuted,
      borderRadius: radius.pill,
      flexDirection: 'row',
      gap: 4,
      paddingHorizontal: 9,
      paddingVertical: 6,
    },
    badgeText: {
      color: palette.text,
      fontSize: 12,
      fontWeight: '800',
    },
    badges: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: passengerSpacing.sm,
      marginTop: passengerSpacing.xs,
    },
    card: {
      backgroundColor: palette.surface,
      borderColor: palette.border,
      borderRadius: radius.lg,
      borderWidth: 1,
      gap: passengerSpacing.lg,
      padding: passengerSpacing.lg,
    },
    copy: {
      flex: 1,
      gap: 3,
    },
    identity: {
      flexDirection: 'row',
      gap: passengerSpacing.md,
    },
    meta: {
      color: palette.mutedText,
      fontSize: 14,
      fontWeight: '700',
    },
    name: {
      color: palette.text,
      fontSize: 20,
      fontWeight: '900',
    },
    plate: {
      backgroundColor: palette.surfaceStrong,
      borderRadius: radius.sm,
      paddingHorizontal: 9,
      paddingVertical: 6,
    },
    plateText: {
      color: palette.backgroundSecondary,
      fontSize: 12,
      fontWeight: '900',
    },
  });

export default memo(DriverCard);

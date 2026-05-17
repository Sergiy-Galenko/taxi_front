import React, { memo, ReactNode, useMemo } from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { usePassengerTheme } from '../hooks/usePassengerTheme';
import { PassengerPalette, passengerLayout, passengerSpacing } from '../theme/passenger';

interface HeaderProps {
  title: string;
  subtitle?: string;
  rightAction?: ReactNode;
  onBack?: () => void;
  showBack?: boolean;
  style?: StyleProp<ViewStyle>;
}

function Header({
  title,
  subtitle,
  rightAction,
  onBack,
  showBack = true,
  style,
}: HeaderProps) {
  const navigation = useNavigation();
  const { palette, radius } = usePassengerTheme();
  const styles = useMemo(() => createStyles(palette, radius), [palette, radius]);

  return (
    <View style={[styles.header, style]}>
      {showBack ? (
        <TouchableOpacity
          activeOpacity={0.86}
          onPress={onBack ?? navigation.goBack}
          style={styles.iconButton}
        >
          <Ionicons color={palette.text} name="chevron-back" size={21} />
        </TouchableOpacity>
      ) : null}

      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      <View style={styles.right}>{rightAction}</View>
    </View>
  );
}

const createStyles = (
  palette: PassengerPalette,
  radius: typeof import('../theme/passenger').passengerRadius
) =>
  StyleSheet.create({
    copy: {
      flex: 1,
      gap: 3,
    },
    header: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: passengerSpacing.md,
      paddingHorizontal: passengerSpacing.xl,
      paddingVertical: passengerSpacing.md,
    },
    iconButton: {
      alignItems: 'center',
      backgroundColor: palette.surface,
      borderColor: palette.border,
      borderRadius: radius.md,
      borderWidth: 1,
      height: passengerLayout.iconButton,
      justifyContent: 'center',
      width: passengerLayout.iconButton,
    },
    right: {
      alignItems: 'flex-end',
      minWidth: passengerLayout.iconButton,
    },
    subtitle: {
      color: palette.mutedText,
      fontSize: 13,
      lineHeight: 18,
    },
    title: {
      color: palette.text,
      fontSize: 22,
      fontWeight: '800',
    },
  });

export default memo(Header);

import React, { memo, useMemo } from 'react';
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePassengerTheme } from '../hooks/usePassengerTheme';
import {
  PassengerPalette,
  passengerLayout,
  passengerSpacing,
} from '../theme/passenger';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface AppButtonProps {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

function AppButton({
  title,
  subtitle,
  icon,
  rightIcon,
  variant = 'primary',
  disabled = false,
  loading = false,
  onPress,
  style,
}: AppButtonProps) {
  const { palette, radius } = usePassengerTheme();
  const styles = useMemo(() => createStyles(palette, radius), [palette, radius]);
  const isFilled = variant === 'primary' || variant === 'danger';
  const textColor = variant === 'primary' ? palette.backgroundSecondary : isFilled ? '#FFFFFF' : palette.text;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      disabled={disabled || loading}
      onPress={onPress}
      style={[
        styles.base,
        styles[variant],
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : icon ? (
        <Ionicons color={textColor} name={icon} size={20} />
      ) : null}

      <View style={styles.copy}>
        {subtitle ? <Text style={[styles.subtitle, { color: textColor }]}>{subtitle}</Text> : null}
        <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
          {title}
        </Text>
      </View>

      {rightIcon ? <Ionicons color={textColor} name={rightIcon} size={20} /> : null}
    </TouchableOpacity>
  );
}

const createStyles = (
  palette: PassengerPalette,
  radius: typeof import('../theme/passenger').passengerRadius
) =>
  StyleSheet.create({
    base: {
      alignItems: 'center',
      borderRadius: radius.lg,
      flexDirection: 'row',
      gap: passengerSpacing.md,
      minHeight: passengerLayout.buttonHeight,
      paddingHorizontal: passengerSpacing.xl,
      paddingVertical: passengerSpacing.md,
    },
    copy: {
      flex: 1,
      gap: 2,
    },
    danger: {
      backgroundColor: palette.danger,
    },
    disabled: {
      opacity: 0.5,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderColor: palette.border,
      borderWidth: 1,
    },
    primary: {
      backgroundColor: palette.surfaceStrong,
    },
    secondary: {
      backgroundColor: palette.surface,
      borderColor: palette.border,
      borderWidth: 1,
    },
    subtitle: {
      fontSize: 12,
      fontWeight: '700',
    },
    title: {
      fontSize: 16,
      fontWeight: '800',
    },
  });

export default memo(AppButton);

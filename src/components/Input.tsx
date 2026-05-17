import React, { memo, useMemo } from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
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

interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
}

function AppInput({
  label,
  error,
  icon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  style,
  ...inputProps
}: AppInputProps) {
  const { palette, radius } = usePassengerTheme();
  const styles = useMemo(() => createStyles(palette, radius), [palette, radius]);

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputWrap, error ? styles.inputWrapError : null]}>
        {icon ? <Ionicons color={palette.mutedText} name={icon} size={19} /> : null}
        <TextInput
          placeholderTextColor={palette.subtleText}
          style={[styles.input, style]}
          {...inputProps}
        />
        {rightIcon ? (
          <TouchableOpacity
            activeOpacity={0.82}
            disabled={!onRightIconPress}
            onPress={onRightIconPress}
            style={styles.rightAction}
          >
            <Ionicons color={palette.text} name={rightIcon} size={19} />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const createStyles = (
  palette: PassengerPalette,
  radius: typeof import('../theme/passenger').passengerRadius
) =>
  StyleSheet.create({
    container: {
      gap: passengerSpacing.sm,
    },
    error: {
      color: palette.danger,
      fontSize: 12,
      fontWeight: '700',
    },
    input: {
      color: palette.text,
      flex: 1,
      fontSize: 16,
      fontWeight: '700',
      minHeight: passengerLayout.controlHeight,
      padding: 0,
    },
    inputWrap: {
      alignItems: 'center',
      backgroundColor: palette.surfaceMuted,
      borderColor: palette.border,
      borderRadius: radius.lg,
      borderWidth: 1,
      flexDirection: 'row',
      gap: passengerSpacing.md,
      minHeight: passengerLayout.controlHeight,
      paddingHorizontal: passengerSpacing.lg,
    },
    inputWrapError: {
      borderColor: palette.danger,
      backgroundColor: palette.dangerSoft,
    },
    label: {
      color: palette.mutedText,
      fontSize: 12,
      fontWeight: '800',
    },
    rightAction: {
      alignItems: 'center',
      height: 36,
      justifyContent: 'center',
      width: 36,
    },
  });

export default memo(AppInput);

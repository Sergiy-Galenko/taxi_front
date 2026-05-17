import React, { memo, useMemo } from 'react';
import { StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePassengerTheme } from '../hooks/usePassengerTheme';
import { PassengerPalette, passengerLayout, passengerSpacing } from '../theme/passenger';

interface MapControlsProps {
  onLocate?: () => void;
  onLayers?: () => void;
  onSafety?: () => void;
  style?: StyleProp<ViewStyle>;
}

function MapControls({ onLocate, onLayers, onSafety, style }: MapControlsProps) {
  const { palette, radius } = usePassengerTheme();
  const styles = useMemo(() => createStyles(palette, radius), [palette, radius]);

  return (
    <View style={[styles.wrap, style]}>
      <TouchableOpacity activeOpacity={0.86} onPress={onLocate} style={styles.button}>
        <Ionicons color={palette.text} name="locate-outline" size={20} />
      </TouchableOpacity>
      <TouchableOpacity activeOpacity={0.86} onPress={onLayers} style={styles.button}>
        <Ionicons color={palette.text} name="layers-outline" size={20} />
      </TouchableOpacity>
      <TouchableOpacity activeOpacity={0.86} onPress={onSafety} style={styles.button}>
        <Ionicons color={palette.text} name="shield-checkmark-outline" size={20} />
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (
  palette: PassengerPalette,
  radius: typeof import('../theme/passenger').passengerRadius
) =>
  StyleSheet.create({
    button: {
      alignItems: 'center',
      backgroundColor: palette.tabBar,
      borderColor: palette.border,
      borderRadius: radius.md,
      borderWidth: 1,
      height: passengerLayout.iconButton,
      justifyContent: 'center',
      width: passengerLayout.iconButton,
    },
    wrap: {
      gap: passengerSpacing.sm,
    },
  });

export default memo(MapControls);

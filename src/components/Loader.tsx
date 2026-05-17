import React, { memo, useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePassengerTheme } from '../hooks/usePassengerTheme';
import { PassengerPalette, passengerSpacing } from '../theme/passenger';

interface LoaderProps {
  title?: string;
  text?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

function Loader({ title = 'Завантаження', text, icon = 'car-sport' }: LoaderProps) {
  const { palette, radius } = usePassengerTheme();
  const styles = useMemo(() => createStyles(palette, radius), [palette, radius]);
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { duration: 780, toValue: 1.08, useNativeDriver: true }),
        Animated.timing(scale, { duration: 780, toValue: 1, useNativeDriver: true }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [scale]);

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.iconWrap, { transform: [{ scale }] }]}>
        <Ionicons color="#FFFFFF" name={icon} size={28} />
      </Animated.View>
      <Text style={styles.title}>{title}</Text>
      {text ? <Text style={styles.text}>{text}</Text> : null}
    </View>
  );
}

const createStyles = (
  palette: PassengerPalette,
  radius: typeof import('../theme/passenger').passengerRadius
) =>
  StyleSheet.create({
    iconWrap: {
      alignItems: 'center',
      backgroundColor: palette.surfaceStrong,
      borderRadius: radius.pill,
      height: 72,
      justifyContent: 'center',
      width: 72,
    },
    text: {
      color: palette.mutedText,
      fontSize: 14,
      lineHeight: 20,
      textAlign: 'center',
    },
    title: {
      color: palette.text,
      fontSize: 20,
      fontWeight: '800',
      textAlign: 'center',
    },
    wrap: {
      alignItems: 'center',
      gap: passengerSpacing.md,
      justifyContent: 'center',
      padding: passengerSpacing.xxl,
    },
  });

export default memo(Loader);

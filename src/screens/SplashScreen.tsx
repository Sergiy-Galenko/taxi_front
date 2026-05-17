import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { usePassengerTheme } from '../hooks/usePassengerTheme';
import { PassengerPalette, passengerSpacing } from '../theme/passenger';
import { RootStackParamList } from '../types/navigation';

type SplashScreenProps = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export default function SplashScreen({ navigation }: SplashScreenProps) {
  const { palette, radius } = usePassengerTheme();
  const styles = useMemo(() => createStyles(palette, radius), [palette, radius]);
  const scale = useRef(new Animated.Value(0.92)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        friction: 7,
        tension: 70,
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        duration: 420,
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(progress, {
        duration: 1250,
        toValue: 1,
        useNativeDriver: false,
      }),
    ]).start();

    const timer = setTimeout(async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          navigation.replace('Main');
        } else {
          navigation.replace('Login');
        }
      } catch {
        navigation.replace('Login');
      }
    }, 1350);

    return () => clearTimeout(timer);
  }, [navigation, opacity, progress, scale]);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['12%', '100%'],
  });

  return (
    <View style={styles.screen}>
      <StatusBar style={palette.statusBar === 'dark-content' ? 'dark' : 'light'} />
      <Animated.View style={[styles.logoWrap, { opacity, transform: [{ scale }] }]}>
        <View style={styles.logo}>
          <Ionicons color={palette.backgroundSecondary} name="navigate" size={34} />
        </View>
        <Text style={styles.brand}>SwiftTaxi</Text>
        <Text style={styles.slogan}>Таксі в кілька дотиків</Text>
      </Animated.View>

      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
      </View>
    </View>
  );
}

const createStyles = (
  palette: PassengerPalette,
  radius: typeof import('../theme/passenger').passengerRadius
) =>
  StyleSheet.create({
    brand: {
      color: palette.text,
      fontSize: 34,
      fontWeight: '900',
      marginTop: passengerSpacing.lg,
    },
    logo: {
      alignItems: 'center',
      backgroundColor: palette.surfaceStrong,
      borderRadius: radius.xl,
      height: 86,
      justifyContent: 'center',
      width: 86,
    },
    logoWrap: {
      alignItems: 'center',
    },
    progressBar: {
      backgroundColor: palette.surfaceStrong,
      borderRadius: radius.pill,
      height: 5,
    },
    progressTrack: {
      backgroundColor: palette.border,
      borderRadius: radius.pill,
      bottom: 56,
      height: 5,
      left: passengerSpacing.xxl,
      overflow: 'hidden',
      position: 'absolute',
      right: passengerSpacing.xxl,
    },
    screen: {
      alignItems: 'center',
      backgroundColor: palette.backgroundSecondary,
      flex: 1,
      justifyContent: 'center',
      padding: passengerSpacing.xxl,
    },
    slogan: {
      color: palette.mutedText,
      fontSize: 16,
      fontWeight: '700',
      marginTop: passengerSpacing.sm,
    },
  });

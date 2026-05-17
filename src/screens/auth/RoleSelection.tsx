import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePassengerTheme } from '../../hooks/usePassengerTheme';
import {
  PassengerPalette,
  passengerSpacing,
} from '../../theme/passenger';
import { RootStackParamList } from '../../types/navigation';

type RoleSelectionScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RoleSelection'>;

export default function RoleSelection() {
  const navigation = useNavigation<RoleSelectionScreenNavigationProp>();
  const { palette, radius } = usePassengerTheme();
  const styles = useMemo(() => createStyles(palette, radius), [palette, radius]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.logo}>
            <Ionicons color={palette.backgroundSecondary} name="people" size={34} />
          </View>
          <Text style={styles.title}>Оберіть свою роль</Text>
          <Text style={styles.subtitle}>Що ви хочете зробити зараз?</Text>
        </View>

        <View style={styles.panel}>
          <TouchableOpacity
            activeOpacity={0.92}
            onPress={() => navigation.replace('PassengerRegistration')}
            style={styles.roleCard}
          >
            <View style={[styles.roleIconWrap, styles.passengerIconWrap]}>
              <Ionicons color="#FFFFFF" name="person" size={24} />
            </View>
            <View style={styles.roleText}>
              <Text style={styles.roleTitle}>Я пасажир</Text>
              <Text style={styles.roleDescription}>
                Замовити поїздку, вказати адресу та швидко перейти до оформлення.
              </Text>
            </View>
            <Ionicons color={palette.mutedText} name="arrow-forward" size={20} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.92}
            onPress={() => navigation.replace('DriverRegistration')}
            style={styles.roleCard}
          >
            <View style={[styles.roleIconWrap, styles.driverIconWrap]}>
              <Ionicons color="#FFFFFF" name="car-sport" size={24} />
            </View>
            <View style={styles.roleText}>
              <Text style={styles.roleTitle}>Я водій</Text>
              <Text style={styles.roleDescription}>
                Почати реєстрацію водія та перейти до заповнення даних.
              </Text>
            </View>
            <Ionicons color={palette.mutedText} name="arrow-forward" size={20} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons color={palette.text} name="arrow-back" size={18} />
          <Text style={styles.backButtonText}>Повернутися назад</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (
  palette: PassengerPalette,
  radius: typeof import('../../theme/passenger').passengerRadius
) =>
  StyleSheet.create({
    safeArea: {
      backgroundColor: palette.backgroundSecondary,
      flex: 1,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      padding: passengerSpacing.xl,
      gap: passengerSpacing.xxl,
    },
    header: {
      alignItems: 'center',
      gap: passengerSpacing.md,
    },
    logo: {
      alignItems: 'center',
      backgroundColor: palette.surfaceStrong,
      borderRadius: radius.xl,
      height: 86,
      justifyContent: 'center',
      marginBottom: passengerSpacing.sm,
      width: 86,
    },
    title: {
      color: palette.text,
      fontSize: 30,
      fontWeight: '900',
      textAlign: 'center',
    },
    subtitle: {
      color: palette.mutedText,
      fontSize: 16,
      textAlign: 'center',
    },
    panel: {
      backgroundColor: palette.surface,
      borderColor: palette.border,
      borderRadius: radius.xl,
      borderWidth: 1,
      gap: passengerSpacing.md,
      padding: passengerSpacing.lg,
    },
    roleCard: {
      alignItems: 'center',
      backgroundColor: palette.surfaceMuted,
      borderColor: palette.border,
      borderRadius: radius.lg,
      borderWidth: 1,
      flexDirection: 'row',
      gap: passengerSpacing.md,
      minHeight: 88,
      paddingHorizontal: passengerSpacing.lg,
      paddingVertical: passengerSpacing.lg,
    },
    passengerIconWrap: {
      backgroundColor: palette.accent,
    },
    driverIconWrap: {
      backgroundColor: palette.info,
    },
    roleIconWrap: {
      alignItems: 'center',
      borderRadius: radius.lg,
      height: 48,
      justifyContent: 'center',
      width: 48,
    },
    roleText: {
      flex: 1,
      gap: 4,
    },
    roleTitle: {
      color: palette.text,
      fontSize: 18,
      fontWeight: '800',
    },
    roleDescription: {
      color: palette.mutedText,
      fontSize: 13,
      lineHeight: 19,
    },
    backButton: {
      alignItems: 'center',
      alignSelf: 'center',
      flexDirection: 'row',
      gap: passengerSpacing.sm,
      paddingHorizontal: passengerSpacing.md,
      paddingVertical: passengerSpacing.sm,
    },
    backButtonText: {
      color: palette.text,
      fontSize: 15,
      fontWeight: '700',
    },
  });

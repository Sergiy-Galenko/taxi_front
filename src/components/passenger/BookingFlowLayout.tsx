import React, { ReactNode } from 'react';
import {
  StatusBar,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { passengerPalette, passengerRadius } from '../../theme/passenger';

interface BookingFlowLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  rightAction?: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  onBack?: () => void;
}

export default function BookingFlowLayout({
  title,
  subtitle,
  children,
  footer,
  rightAction,
  contentStyle,
  onBack,
}: BookingFlowLayoutProps) {
  const navigation = useNavigation();

  return (
    <LinearGradient
      colors={[passengerPalette.background, '#FFFDF8', passengerPalette.background]}
      style={styles.background}
    >
      <StatusBar barStyle="dark-content" backgroundColor={passengerPalette.background} />
      <SafeAreaView style={styles.safeArea}>
        <View pointerEvents="none" style={[styles.blob, styles.blobPrimary]} />
        <View pointerEvents="none" style={[styles.blob, styles.blobSecondary]} />

        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={onBack ?? navigation.goBack}
            style={styles.backButton}
          >
            <Ionicons color={passengerPalette.text} name="chevron-back" size={20} />
          </TouchableOpacity>

          <View style={styles.headerText}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>

          <View style={styles.rightSlot}>{rightAction}</View>
        </View>

        <View style={[styles.content, contentStyle]}>{children}</View>
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
  },
  blobPrimary: {
    backgroundColor: passengerPalette.backgroundAccent,
    width: 220,
    height: 220,
    right: -80,
    top: -30,
    opacity: 0.45,
  },
  blobSecondary: {
    backgroundColor: passengerPalette.primarySoft,
    width: 180,
    height: 180,
    left: -70,
    bottom: 160,
    opacity: 0.4,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: passengerRadius.md,
    borderWidth: 1,
    borderColor: passengerPalette.border,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  headerText: {
    flex: 1,
    gap: 4,
    paddingTop: 2,
  },
  title: {
    color: passengerPalette.text,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  subtitle: {
    color: passengerPalette.mutedText,
    fontSize: 14,
    lineHeight: 20,
  },
  rightSlot: {
    minWidth: 42,
    alignItems: 'flex-end',
  },
  content: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 10,
  },
});

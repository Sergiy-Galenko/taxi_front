import React, { ReactNode, useMemo } from 'react';
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
import { useI18n } from '../../hooks/useI18n';
import { useNavigation } from '@react-navigation/native';
import { usePassengerTheme } from '../../hooks/usePassengerTheme';
import { PassengerPalette } from '../../theme/passenger';

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
  const { t } = useI18n();
  const navigation = useNavigation();
  const { palette, radius } = usePassengerTheme();
  const styles = useMemo(() => createStyles(palette, radius), [palette, radius]);

  return (
    <LinearGradient
      colors={[palette.background, palette.backgroundSecondary, palette.background]}
      style={styles.background}
    >
      <StatusBar barStyle={palette.statusBar} backgroundColor={palette.background} />
      <SafeAreaView style={styles.safeArea}>
        <View pointerEvents="none" style={[styles.blob, styles.blobPrimary]} />
        <View pointerEvents="none" style={[styles.blob, styles.blobSecondary]} />

        <View style={styles.header}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={t('accessibility.back')}
            activeOpacity={0.9}
            onPress={onBack ?? navigation.goBack}
            style={styles.backButton}
          >
            <Ionicons color={palette.text} name="chevron-back" size={20} />
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

const createStyles = (
  palette: PassengerPalette,
  radius: typeof import('../../theme/passenger').passengerRadius
) => StyleSheet.create({
  background: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: 960,
    alignSelf: 'center',
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
  },
  blobPrimary: {
    backgroundColor: palette.backgroundAccent,
    width: 220,
    height: 220,
    right: -80,
    top: -30,
    opacity: 0.45,
  },
  blobSecondary: {
    backgroundColor: palette.primarySoft,
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
    backgroundColor: palette.tabBar,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  headerText: {
    flex: 1,
    gap: 4,
    paddingTop: 2,
  },
  title: {
    color: palette.text,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  subtitle: {
    color: palette.mutedText,
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

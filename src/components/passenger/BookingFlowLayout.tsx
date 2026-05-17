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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
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
  const navigation = useNavigation();
  const { palette, radius } = usePassengerTheme();
  const styles = useMemo(() => createStyles(palette, radius), [palette, radius]);

  return (
    <View style={styles.background}>
      <StatusBar barStyle={palette.statusBar} backgroundColor={palette.background} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
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
    </View>
  );
}

const createStyles = (
  palette: PassengerPalette,
  radius: typeof import('../../theme/passenger').passengerRadius
) => StyleSheet.create({
  background: {
    backgroundColor: palette.background,
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
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
    color: palette.text,
    fontSize: 24,
    fontWeight: '900',
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

import React, { ReactNode, useMemo } from 'react';
import { StyleProp, StatusBar, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import PassengerTabBar from './PassengerTabBar';
import { usePassengerTheme } from '../../hooks/usePassengerTheme';
import { PassengerPalette } from '../../theme/passenger';

type PassengerRoute = 'Home' | 'Preorder' | 'TripHistory' | 'Settings';

interface PassengerScreenLayoutProps {
  activeRoute: PassengerRoute;
  children: ReactNode;
  title?: string;
  subtitle?: string;
  rightAction?: ReactNode;
  showHeader?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
}

export default function PassengerScreenLayout({
  activeRoute,
  children,
  title,
  subtitle,
  rightAction,
  showHeader = true,
  contentStyle,
  titleStyle,
}: PassengerScreenLayoutProps) {
  const { palette } = usePassengerTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);

  return (
    <LinearGradient
      colors={[palette.background, palette.backgroundSecondary, palette.background]}
      style={styles.background}
    >
      <StatusBar barStyle={palette.statusBar} backgroundColor={palette.background} />
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
        <View pointerEvents="none" style={[styles.blob, styles.blobPrimary]} />
        <View pointerEvents="none" style={[styles.blob, styles.blobSecondary]} />

        {showHeader ? (
          <View style={styles.header}>
            <View style={styles.headerText}>
              {title ? <Text style={[styles.title, titleStyle]}>{title}</Text> : null}
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
            {rightAction}
          </View>
        ) : null}

        <View style={[styles.content, contentStyle]}>{children}</View>
        <PassengerTabBar activeRoute={activeRoute} />
      </SafeAreaView>
    </LinearGradient>
  );
}

const createStyles = (palette: PassengerPalette) => StyleSheet.create({
  background: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
  },
  blobPrimary: {
    backgroundColor: palette.backgroundAccent,
    height: 220,
    opacity: 0.45,
    right: -70,
    top: -20,
    width: 220,
  },
  blobSecondary: {
    backgroundColor: palette.primarySoft,
    bottom: 160,
    height: 180,
    left: -90,
    opacity: 0.5,
    width: 180,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerText: {
    flex: 1,
    gap: 6,
  },
  title: {
    color: palette.text,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.7,
  },
  subtitle: {
    color: palette.mutedText,
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 320,
  },
  content: {
    flex: 1,
  },
});

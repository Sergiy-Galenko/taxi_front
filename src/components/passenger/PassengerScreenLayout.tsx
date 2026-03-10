import React, { ReactNode } from 'react';
import { StyleProp, StatusBar, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import PassengerTabBar from './PassengerTabBar';
import { passengerPalette } from '../../theme/passenger';

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
  return (
    <LinearGradient
      colors={[passengerPalette.background, '#FFFDF8', passengerPalette.background]}
      style={styles.background}
    >
      <StatusBar barStyle="dark-content" backgroundColor={passengerPalette.background} />
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
    height: 220,
    opacity: 0.45,
    right: -70,
    top: -20,
    width: 220,
  },
  blobSecondary: {
    backgroundColor: passengerPalette.primarySoft,
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
    color: passengerPalette.text,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.7,
  },
  subtitle: {
    color: passengerPalette.mutedText,
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 320,
  },
  content: {
    flex: 1,
  },
});


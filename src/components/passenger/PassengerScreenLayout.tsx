import React, { ReactNode, useMemo } from 'react';
import { StyleProp, StatusBar, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
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
    <View style={styles.background}>
      <StatusBar barStyle={palette.statusBar} backgroundColor={palette.background} />
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
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
    </View>
  );
}

const createStyles = (palette: PassengerPalette) => StyleSheet.create({
  background: {
    backgroundColor: palette.background,
    flex: 1,
  },
  safeArea: {
    flex: 1,
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
    fontSize: 28,
    fontWeight: '900',
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

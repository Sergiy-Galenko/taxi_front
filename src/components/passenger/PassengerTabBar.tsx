import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useI18n } from '../../hooks/useI18n';
import { usePassengerTheme } from '../../hooks/usePassengerTheme';
import { RootStackParamList } from '../../types/navigation';
import { PassengerPalette } from '../../theme/passenger';

type PassengerRoute = 'Home' | 'Preorder' | 'TripHistory' | 'Settings';

interface PassengerTabBarProps {
  activeRoute: PassengerRoute;
}

const tabs: Array<{
  route: PassengerRoute;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = [
  { route: 'Home', label: 'Book', icon: 'car-outline' },
  { route: 'Preorder', label: 'Schedule', icon: 'calendar-outline' },
  { route: 'TripHistory', label: 'Trips', icon: 'time-outline' },
  { route: 'Settings', label: 'Profile', icon: 'person-outline' },
];

export default function PassengerTabBar({ activeRoute }: PassengerTabBarProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const { palette, radius } = usePassengerTheme();
  const styles = useMemo(() => createStyles(palette, radius), [palette, radius]);

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.container}>
        {tabs.map((tab) => {
          const active = tab.route === activeRoute;

          return (
            <TouchableOpacity
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              key={tab.route}
              activeOpacity={0.9}
              onPress={() => {
                if (!active) {
                  navigation.navigate(tab.route);
                }
              }}
              style={[styles.tab, active && styles.activeTab]}
            >
              <Ionicons
                color={active ? palette.text : palette.mutedText}
                name={tab.icon}
                size={20}
              />
              <Text style={[styles.label, active && styles.activeLabel]}>{t(`tabs.${tab.route === 'Home' ? 'book' : tab.route === 'Preorder' ? 'schedule' : tab.route === 'TripHistory' ? 'trips' : 'profile'}`)}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (
  palette: PassengerPalette,
  radius: typeof import('../../theme/passenger').passengerRadius
) => StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
  },
  container: {
    backgroundColor: palette.tabBar,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    flexDirection: 'row',
    padding: 8,
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 10,
  },
  tab: {
    alignItems: 'center',
    borderRadius: radius.md,
    flex: 1,
    gap: 4,
    paddingVertical: 10,
  },
  activeTab: {
    backgroundColor: palette.primarySoft,
  },
  label: {
    color: palette.mutedText,
    fontSize: 12,
    fontWeight: '700',
  },
  activeLabel: {
    color: palette.text,
  },
});

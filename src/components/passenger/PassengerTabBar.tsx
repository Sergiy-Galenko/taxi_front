import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  icon: keyof typeof Ionicons.glyphMap;
  translationKey: string;
}> = [
  { route: 'Home', icon: 'car-outline', translationKey: 'tabs.book' },
  { route: 'Preorder', icon: 'calendar-outline', translationKey: 'tabs.schedule' },
  { route: 'TripHistory', icon: 'time-outline', translationKey: 'tabs.trips' },
  { route: 'Settings', icon: 'person-outline', translationKey: 'tabs.profile' },
];

export default function PassengerTabBar({ activeRoute }: PassengerTabBarProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const { palette, radius } = usePassengerTheme();
  const styles = useMemo(() => createStyles(palette, radius), [palette, radius]);
  const [open, setOpen] = useState(false);

  return (
    <View pointerEvents="box-none" style={[styles.wrapper, { top: Math.max(insets.top, 10) + 10 }]}>
      {open ? <Pressable onPress={() => setOpen(false)} style={styles.dismissLayer} /> : null}

      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => setOpen((value) => !value)}
        style={styles.menuButton}
      >
        <Ionicons color={palette.backgroundSecondary} name={open ? 'close' : 'menu'} size={24} />
      </TouchableOpacity>

      {open ? (
        <View style={styles.menuPanel}>
          {tabs.map((tab) => {
            const active = tab.route === activeRoute;

            return (
              <TouchableOpacity
                key={tab.route}
                activeOpacity={0.86}
                onPress={() => {
                  setOpen(false);
                  if (!active) {
                    navigation.navigate(tab.route);
                  }
                }}
                style={[styles.menuItem, active && styles.menuItemActive]}
              >
                <View style={[styles.itemIcon, active && styles.itemIconActive]}>
                  <Ionicons color={active ? palette.text : palette.backgroundSecondary} name={tab.icon} size={18} />
                </View>
                <Text style={[styles.itemLabel, active && styles.itemLabelActive]}>{t(tab.translationKey)}</Text>
                {active ? <Ionicons color={palette.text} name="checkmark" size={18} /> : null}
              </TouchableOpacity>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const createStyles = (
  palette: PassengerPalette,
  radius: typeof import('../../theme/passenger').passengerRadius
) => StyleSheet.create({
  dismissLayer: {
    ...StyleSheet.absoluteFillObject,
    bottom: -900,
    left: -900,
    right: -20,
    top: -20,
  },
  itemIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: radius.md,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  itemIconActive: {
    backgroundColor: palette.primary,
  },
  itemLabel: {
    color: palette.backgroundSecondary,
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
  },
  itemLabelActive: {
    color: palette.text,
  },
  menuButton: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: palette.surfaceStrong,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: radius.lg,
    borderWidth: 1,
    height: 54,
    justifyContent: 'center',
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 22,
    width: 54,
    elevation: 12,
  },
  menuItem: {
    alignItems: 'center',
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: 12,
    minHeight: 52,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  menuItemActive: {
    backgroundColor: palette.primary,
  },
  menuPanel: {
    alignSelf: 'flex-end',
    backgroundColor: palette.surfaceStrong,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: radius.xl,
    borderWidth: 1,
    gap: 4,
    marginTop: 8,
    padding: 8,
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 1,
    shadowRadius: 28,
    width: 218,
    elevation: 14,
  },
  wrapper: {
    position: 'absolute',
    right: 16,
    zIndex: 50,
  },
});

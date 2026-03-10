import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { passengerPalette, passengerRadius } from '../../theme/passenger';

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

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.container}>
        {tabs.map((tab) => {
          const active = tab.route === activeRoute;

          return (
            <TouchableOpacity
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
                color={active ? passengerPalette.text : passengerPalette.mutedText}
                name={tab.icon}
                size={20}
              />
              <Text style={[styles.label, active && styles.activeLabel]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 0,
  },
  container: {
    backgroundColor: passengerPalette.tabBar,
    borderRadius: passengerRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(232, 222, 201, 0.9)',
    flexDirection: 'row',
    padding: 8,
    shadowColor: passengerPalette.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 10,
  },
  tab: {
    alignItems: 'center',
    borderRadius: passengerRadius.md,
    flex: 1,
    gap: 4,
    paddingVertical: 10,
  },
  activeTab: {
    backgroundColor: passengerPalette.primarySoft,
  },
  label: {
    color: passengerPalette.mutedText,
    fontSize: 12,
    fontWeight: '700',
  },
  activeLabel: {
    color: passengerPalette.text,
  },
});


import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import PassengerScreenLayout from '../components/passenger/PassengerScreenLayout';
import { LANGUAGE_OPTIONS, PAYMENT_OPTIONS } from '../data/passenger';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { useUser } from '../hooks/UserContext';
import { passengerPalette, passengerRadius } from '../theme/passenger';
import { RootStackParamList } from '../types/navigation';

type SettingsScreenProps = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const getNextOption = (options: string[], current: string) => {
  const currentIndex = options.indexOf(current);
  const nextIndex = currentIndex === options.length - 1 ? 0 : currentIndex + 1;
  return options[nextIndex];
};

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const { signOut } = useAuth();
  const { mode, setThemeMode } = useTheme();
  const { user } = useUser();

  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_OPTIONS[0]);
  const [language, setLanguage] = useState(LANGUAGE_OPTIONS[0]);
  const [tripUpdatesEnabled, setTripUpdatesEnabled] = useState(true);
  const [shareRideEnabled, setShareRideEnabled] = useState(false);
  const [priceAlertsEnabled, setPriceAlertsEnabled] = useState(true);

  const handleLogout = async () => {
    await signOut();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <PassengerScreenLayout
      activeRoute="Settings"
      subtitle="Reduce friction by keeping preferences close to the booking flow."
      title="Profile and preferences"
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Ionicons color="#FFFFFF" name="person-outline" size={28} />
          </View>
          <View style={styles.profileCopy}>
            <Text style={styles.profileName}>{user?.fullName || 'Guest rider'}</Text>
            <Text style={styles.profileMeta}>{user?.email || 'Add email in account settings'}</Text>
            <View style={styles.profileBadge}>
              <Ionicons color={passengerPalette.primaryDeep} name="star" size={14} />
              <Text style={styles.profileBadgeText}>4.9 passenger rating</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ride preferences</Text>

          <TouchableOpacity
            activeOpacity={0.86}
            onPress={() => setPaymentMethod(getNextOption(PAYMENT_OPTIONS, paymentMethod))}
            style={styles.optionRow}
          >
            <View style={styles.optionIcon}>
              <Ionicons color={passengerPalette.text} name="card-outline" size={18} />
            </View>
            <View style={styles.optionCopy}>
              <Text style={styles.optionTitle}>Default payment</Text>
              <Text style={styles.optionHint}>Tap to cycle between saved payment methods.</Text>
            </View>
            <Text style={styles.optionValue}>{paymentMethod}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.86}
            onPress={() => setPriceAlertsEnabled((current) => !current)}
            style={styles.optionRow}
          >
            <View style={styles.optionIcon}>
              <Ionicons color={passengerPalette.text} name="pricetag-outline" size={18} />
            </View>
            <View style={styles.optionCopy}>
              <Text style={styles.optionTitle}>Price alerts</Text>
              <Text style={styles.optionHint}>Warn users when fares are likely to surge.</Text>
            </View>
            <Switch
              onValueChange={setPriceAlertsEnabled}
              thumbColor="#FFFFFF"
              trackColor={{ false: '#D6D3D1', true: passengerPalette.accent }}
              value={priceAlertsEnabled}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Communication</Text>

          <TouchableOpacity
            activeOpacity={0.86}
            onPress={() => setTripUpdatesEnabled((current) => !current)}
            style={styles.optionRow}
          >
            <View style={styles.optionIcon}>
              <Ionicons color={passengerPalette.text} name="notifications-outline" size={18} />
            </View>
            <View style={styles.optionCopy}>
              <Text style={styles.optionTitle}>Ride updates</Text>
              <Text style={styles.optionHint}>Driver arrival, plate number, and pickup status.</Text>
            </View>
            <Switch
              onValueChange={setTripUpdatesEnabled}
              thumbColor="#FFFFFF"
              trackColor={{ false: '#D6D3D1', true: passengerPalette.accent }}
              value={tripUpdatesEnabled}
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.86}
            onPress={() => setShareRideEnabled((current) => !current)}
            style={styles.optionRow}
          >
            <View style={styles.optionIcon}>
              <Ionicons color={passengerPalette.text} name="share-social-outline" size={18} />
            </View>
            <View style={styles.optionCopy}>
              <Text style={styles.optionTitle}>Share trip status</Text>
              <Text style={styles.optionHint}>Let contacts track the ride in real time.</Text>
            </View>
            <Switch
              onValueChange={setShareRideEnabled}
              thumbColor="#FFFFFF"
              trackColor={{ false: '#D6D3D1', true: passengerPalette.accent }}
              value={shareRideEnabled}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App experience</Text>

          <TouchableOpacity
            activeOpacity={0.86}
            onPress={() => setLanguage(getNextOption(LANGUAGE_OPTIONS, language))}
            style={styles.optionRow}
          >
            <View style={styles.optionIcon}>
              <Ionicons color={passengerPalette.text} name="language-outline" size={18} />
            </View>
            <View style={styles.optionCopy}>
              <Text style={styles.optionTitle}>Language</Text>
              <Text style={styles.optionHint}>Keep copy understandable for first-time riders.</Text>
            </View>
            <Text style={styles.optionValue}>{language}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.86}
            onPress={() => setThemeMode(mode === 'dark' ? 'light' : 'dark')}
            style={styles.optionRow}
          >
            <View style={styles.optionIcon}>
              <Ionicons color={passengerPalette.text} name="color-palette-outline" size={18} />
            </View>
            <View style={styles.optionCopy}>
              <Text style={styles.optionTitle}>Theme mode</Text>
              <Text style={styles.optionHint}>Use the mode that feels most readable on the go.</Text>
            </View>
            <Text style={styles.optionValue}>{mode === 'dark' ? 'Dark' : 'Light'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() =>
            Alert.alert(
              'Safety support',
              'In production, this would open SOS, trip support, and reporting actions.'
            )
          }
          style={styles.supportCard}
        >
          <View style={styles.supportIcon}>
            <Ionicons color="#FFFFFF" name="shield-checkmark-outline" size={20} />
          </View>
          <View style={styles.supportCopy}>
            <Text style={styles.supportTitle}>Safety center</Text>
            <Text style={styles.supportHint}>
              Keep help, reporting, and emergency actions accessible without cluttering the booking flow.
            </Text>
          </View>
          <Ionicons color={passengerPalette.text} name="arrow-forward" size={18} />
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.9} onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Sign out</Text>
          <Ionicons color={passengerPalette.danger} name="log-out-outline" size={18} />
        </TouchableOpacity>
      </ScrollView>
    </PassengerScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 18,
    paddingBottom: 150,
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  profileCard: {
    backgroundColor: passengerPalette.surface,
    borderColor: passengerPalette.border,
    borderRadius: passengerRadius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 16,
    padding: 18,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: passengerPalette.accent,
    borderRadius: 24,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  profileCopy: {
    flex: 1,
    gap: 6,
  },
  profileName: {
    color: passengerPalette.text,
    fontSize: 20,
    fontWeight: '800',
  },
  profileMeta: {
    color: passengerPalette.mutedText,
    fontSize: 13,
  },
  profileBadge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: passengerPalette.primarySoft,
    borderRadius: 999,
    flexDirection: 'row',
    gap: 6,
    marginTop: 2,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  profileBadgeText: {
    color: passengerPalette.text,
    fontSize: 12,
    fontWeight: '700',
  },
  section: {
    backgroundColor: passengerPalette.surface,
    borderColor: passengerPalette.border,
    borderRadius: passengerRadius.lg,
    borderWidth: 1,
    gap: 6,
    padding: 18,
  },
  sectionTitle: {
    color: passengerPalette.text,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 8,
  },
  optionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
  },
  optionIcon: {
    alignItems: 'center',
    backgroundColor: passengerPalette.surfaceMuted,
    borderRadius: 16,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  optionCopy: {
    flex: 1,
    gap: 4,
  },
  optionTitle: {
    color: passengerPalette.text,
    fontSize: 15,
    fontWeight: '700',
  },
  optionHint: {
    color: passengerPalette.mutedText,
    fontSize: 12,
    lineHeight: 17,
  },
  optionValue: {
    color: passengerPalette.text,
    fontSize: 13,
    fontWeight: '700',
    maxWidth: 110,
    textAlign: 'right',
  },
  supportCard: {
    alignItems: 'center',
    backgroundColor: passengerPalette.primarySoft,
    borderRadius: passengerRadius.lg,
    flexDirection: 'row',
    gap: 14,
    padding: 18,
  },
  supportIcon: {
    alignItems: 'center',
    backgroundColor: passengerPalette.text,
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  supportCopy: {
    flex: 1,
    gap: 4,
  },
  supportTitle: {
    color: passengerPalette.text,
    fontSize: 16,
    fontWeight: '800',
  },
  supportHint: {
    color: passengerPalette.mutedText,
    fontSize: 13,
    lineHeight: 18,
  },
  logoutButton: {
    alignItems: 'center',
    backgroundColor: passengerPalette.surface,
    borderColor: '#F2B0AB',
    borderRadius: passengerRadius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  logoutText: {
    color: passengerPalette.danger,
    fontSize: 16,
    fontWeight: '800',
  },
});


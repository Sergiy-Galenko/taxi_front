import React, { useMemo } from 'react';
import {
  Alert,
  Linking,
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
import { PAYMENT_METHODS } from '../data/passenger';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';
import { useNotifications } from '../hooks/useNotifications';
import { useSettings } from '../hooks/useSettings';
import { ThemeMode, useTheme } from '../hooks/useTheme';
import { useUser } from '../hooks/UserContext';
import { PassengerPalette } from '../theme/passenger';
import { usePassengerTheme } from '../hooks/usePassengerTheme';
import { RootStackParamList } from '../types/navigation';
import { AppLanguage, PaymentMethodKey } from '../types/settings';

type SettingsScreenProps = NativeStackScreenProps<RootStackParamList, 'Settings'>;

type IconName = keyof typeof Ionicons.glyphMap;

type ToggleSettingKey =
  | 'priceAlertsEnabled'
  | 'notificationsEnabled'
  | 'rideUpdatesEnabled'
  | 'driverAlertsEnabled'
  | 'paymentUpdatesEnabled'
  | 'shareRideEnabled';

const LANGUAGE_OPTIONS: AppLanguage[] = ['uk', 'en'];
const THEME_OPTIONS: ThemeMode[] = ['light', 'dark', 'auto'];

const paymentIcons: Record<PaymentMethodKey, IconName> = {
  visa: 'card-outline',
  apple_pay: 'logo-apple',
  cash: 'cash-outline',
};

const themeIcons: Record<ThemeMode, IconName> = {
  light: 'sunny-outline',
  dark: 'moon-outline',
  auto: 'contrast-outline',
};

const themeLabelKeys: Record<ThemeMode, string> = {
  light: 'settings.themeLight',
  dark: 'settings.themeDark',
  auto: 'settings.themeAuto',
};

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
  styles: any;
}

const SectionCard = ({ title, children, styles }: SectionCardProps) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionCard}>{children}</View>
  </View>
);

interface ChoiceChipProps {
  active: boolean;
  icon: IconName;
  label: string;
  onPress: () => void;
  palette: PassengerPalette;
  styles: any;
}

const ChoiceChip = ({ active, icon, label, onPress, palette, styles }: ChoiceChipProps) => (
  <TouchableOpacity
    activeOpacity={0.88}
    onPress={onPress}
    style={[styles.choiceChip, active && styles.choiceChipActive]}
  >
    <Ionicons
      color={active ? palette.text : palette.mutedText}
      name={icon}
      size={16}
    />
    <Text style={[styles.choiceChipLabel, active && styles.choiceChipLabelActive]}>{label}</Text>
  </TouchableOpacity>
);

interface SelectorRowProps {
  title: string;
  hint: string;
  children: React.ReactNode;
  styles: any;
}

const SelectorRow = ({ title, hint, children, styles }: SelectorRowProps) => (
  <View style={styles.selectorRow}>
    <View style={styles.rowCopy}>
      <Text style={styles.rowTitle}>{title}</Text>
      <Text style={styles.rowHint}>{hint}</Text>
    </View>
    <View style={styles.choiceGrid}>{children}</View>
  </View>
);

interface ToggleRowProps {
  icon: IconName;
  title: string;
  hint: string;
  value: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void | Promise<void>;
  palette: PassengerPalette;
  styles: any;
}

const ToggleRow = ({
  icon,
  title,
  hint,
  value,
  disabled = false,
  onChange,
  palette,
  styles,
}: ToggleRowProps) => (
  <TouchableOpacity
    activeOpacity={disabled ? 1 : 0.88}
    onPress={() => {
      if (!disabled) {
        void onChange(!value);
      }
    }}
    style={[styles.toggleRow, disabled && styles.toggleRowDisabled]}
  >
    <View style={styles.toggleIconWrap}>
      <Ionicons color={palette.text} name={icon} size={18} />
    </View>

    <View style={styles.rowCopy}>
      <Text style={styles.rowTitle}>{title}</Text>
      <Text style={styles.rowHint}>{hint}</Text>
    </View>

    <Switch
      disabled={disabled}
      onValueChange={(nextValue) => void onChange(nextValue)}
      thumbColor="#FFFFFF"
      trackColor={{ false: '#D6D3D1', true: palette.accent }}
      value={value}
    />
  </TouchableOpacity>
);

const getProfileInitial = (fullName?: string) => fullName?.trim().charAt(0).toUpperCase() || 'P';

const formatUserRating = (rating: unknown): string | null => {
  if (typeof rating === 'number' && Number.isFinite(rating)) {
    return rating.toFixed(1);
  }

  if (typeof rating === 'string') {
    const parsed = Number.parseFloat(rating);

    if (Number.isFinite(parsed)) {
      return parsed.toFixed(1);
    }
  }

  return null;
};

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const { signOut } = useAuth();
  const { mode, setThemeMode } = useTheme();
  const { palette, radius } = usePassengerTheme();
  const styles = useMemo(() => createStyles(palette, radius), [palette, radius]);
  const { user } = useUser();
  const { t, language, setLanguage } = useI18n();
  const {
    defaultPaymentMethod,
    notificationsEnabled,
    rideUpdatesEnabled,
    driverAlertsEnabled,
    paymentUpdatesEnabled,
    shareRideEnabled,
    priceAlertsEnabled,
    updateSetting,
    setDefaultPaymentMethod,
    settingsReady,
  } = useSettings();
  const { notificationsGranted, notificationsSupported, requestPermissions } = useNotifications();
  const formattedUserRating = formatUserRating(user?.rating);

  const handleLogout = async () => {
    await signOut();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const handleNotificationMasterChange = async (nextValue: boolean) => {
    if (!notificationsSupported) {
      await updateSetting('notificationsEnabled', false);
      return;
    }

    if (!nextValue) {
      await updateSetting('notificationsEnabled', false);
      return;
    }

    const granted = await requestPermissions();

    if (!granted) {
      await updateSetting('notificationsEnabled', false);
      Alert.alert(t('settings.notificationsPermissionTitle'), t('settings.notificationsPermissionText'));
      return;
    }

    await updateSetting('notificationsEnabled', true);
  };

  const handleBooleanSetting = async (key: ToggleSettingKey, value: boolean) => {
    await updateSetting(key, value);
  };

  const handleOpenSystemSettings = async () => {
    try {
      await Linking.openSettings();
    } catch {
      Alert.alert(t('settings.notificationsPermissionTitle'), t('settings.notificationsPermissionText'));
    }
  };

  if (!settingsReady) {
    return (
      <PassengerScreenLayout
        activeRoute="Settings"
        subtitle={t('settings.subtitle')}
        title={t('settings.title')}
      >
        <View style={styles.loadingState}>
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </PassengerScreenLayout>
    );
  }

  return (
    <PassengerScreenLayout
      activeRoute="Settings"
      subtitle={t('settings.subtitle')}
      title={t('settings.title')}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getProfileInitial(user?.fullName)}</Text>
          </View>

          <View style={styles.profileCopy}>
            <Text style={styles.profileName}>{user?.fullName || t('settings.guestRider')}</Text>
            <Text style={styles.profileMeta}>{user?.email || t('settings.addEmail')}</Text>
            <View style={styles.profileBadge}>
              <Ionicons color={palette.primaryDeep} name="star" size={14} />
              <Text style={styles.profileBadgeText}>
                {formattedUserRating ? `${formattedUserRating} ★` : t('settings.passengerRating')}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryPill}>
            <Ionicons color={palette.text} name="language-outline" size={16} />
            <Text style={styles.summaryPillText}>{t(`languages.${language}`)}</Text>
          </View>
          <View style={styles.summaryPill}>
            <Ionicons color={palette.text} name={themeIcons[mode]} size={16} />
            <Text style={styles.summaryPillText}>{t(themeLabelKeys[mode])}</Text>
          </View>
          <View style={styles.summaryPill}>
            <Ionicons
              color={palette.text}
              name={notificationsEnabled && notificationsGranted ? 'notifications-outline' : 'notifications-off-outline'}
              size={16}
            />
            <Text style={styles.summaryPillText}>
              {notificationsSupported && notificationsEnabled && notificationsGranted ? t('common.on') : t('common.off')}
            </Text>
          </View>
        </View>

        <SectionCard styles={styles} title={t('settings.sectionRide')}>
          <SelectorRow styles={styles} title={t('settings.defaultPayment')} hint={t('settings.defaultPaymentHint')}>
            {PAYMENT_METHODS.map((method) => (
              <ChoiceChip
                key={method}
                active={defaultPaymentMethod === method}
                icon={paymentIcons[method]}
                label={t(`payments.${method}`)}
                palette={palette}
                styles={styles}
                onPress={() => {
                  void setDefaultPaymentMethod(method);
                }}
              />
            ))}
          </SelectorRow>

          <ToggleRow
            palette={palette}
            styles={styles}
            hint={t('settings.priceAlertsHint')}
            icon="pricetag-outline"
            onChange={(value) => handleBooleanSetting('priceAlertsEnabled', value)}
            title={t('settings.priceAlerts')}
            value={priceAlertsEnabled}
          />
        </SectionCard>

        <SectionCard styles={styles} title={t('settings.sectionNotifications')}>
          <ToggleRow
            palette={palette}
            styles={styles}
            disabled={!notificationsSupported}
            hint={t('settings.notificationsMasterHint')}
            icon={notificationsEnabled ? 'notifications-outline' : 'notifications-off-outline'}
            onChange={handleNotificationMasterChange}
            title={t('settings.notificationsMaster')}
            value={notificationsEnabled}
          />

          {!notificationsSupported ? (
            <View style={[styles.banner, styles.bannerWarning]}>
              <Ionicons color={palette.mutedText} name="construct-outline" size={18} />
              <Text style={styles.bannerText}>{t('settings.notificationsExpoGoBanner')}</Text>
            </View>
          ) : null}

          {!notificationsEnabled ? (
            <View style={styles.banner}>
              <Ionicons color={palette.mutedText} name="notifications-off-outline" size={18} />
              <Text style={styles.bannerText}>{t('settings.notificationsDisabledBanner')}</Text>
            </View>
          ) : null}

          {notificationsSupported && notificationsEnabled && !notificationsGranted ? (
            <View style={[styles.banner, styles.bannerWarning]}>
              <View style={styles.bannerCopy}>
                <Text style={styles.bannerTitle}>{t('settings.notificationsPermissionTitle')}</Text>
                <Text style={styles.bannerText}>{t('settings.notificationsPermissionBanner')}</Text>
              </View>
              <TouchableOpacity activeOpacity={0.88} onPress={handleOpenSystemSettings} style={styles.bannerButton}>
                <Text style={styles.bannerButtonText}>{t('settings.openSystemSettings')}</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <ToggleRow
            palette={palette}
            styles={styles}
            disabled={!notificationsSupported || !notificationsEnabled}
            hint={t('settings.rideUpdatesHint')}
            icon="navigate-outline"
            onChange={(value) => handleBooleanSetting('rideUpdatesEnabled', value)}
            title={t('settings.rideUpdates')}
            value={rideUpdatesEnabled}
          />

          <ToggleRow
            palette={palette}
            styles={styles}
            disabled={!notificationsSupported || !notificationsEnabled}
            hint={t('settings.driverAlertsHint')}
            icon="car-sport-outline"
            onChange={(value) => handleBooleanSetting('driverAlertsEnabled', value)}
            title={t('settings.driverAlerts')}
            value={driverAlertsEnabled}
          />

          <ToggleRow
            palette={palette}
            styles={styles}
            disabled={!notificationsSupported || !notificationsEnabled}
            hint={t('settings.paymentUpdatesHint')}
            icon="wallet-outline"
            onChange={(value) => handleBooleanSetting('paymentUpdatesEnabled', value)}
            title={t('settings.paymentUpdates')}
            value={paymentUpdatesEnabled}
          />
        </SectionCard>

        <SectionCard styles={styles} title={t('settings.sectionExperience')}>
          <SelectorRow styles={styles} title={t('settings.language')} hint={t('settings.languageHint')}>
            {LANGUAGE_OPTIONS.map((option) => (
              <ChoiceChip
                key={option}
                active={language === option}
                icon={option === 'uk' ? 'flag-outline' : 'globe-outline'}
                label={t(`languages.${option}`)}
                palette={palette}
                styles={styles}
                onPress={() => {
                  void setLanguage(option);
                }}
              />
            ))}
          </SelectorRow>

          <SelectorRow styles={styles} title={t('settings.theme')} hint={t('settings.themeHint')}>
            {THEME_OPTIONS.map((themeOption) => (
              <ChoiceChip
                key={themeOption}
                active={mode === themeOption}
                icon={themeIcons[themeOption]}
                label={t(themeLabelKeys[themeOption])}
                palette={palette}
                styles={styles}
                onPress={() => setThemeMode(themeOption)}
              />
            ))}
          </SelectorRow>

          <ToggleRow
            palette={palette}
            styles={styles}
            hint={t('settings.shareRideHint')}
            icon="share-social-outline"
            onChange={(value) => handleBooleanSetting('shareRideEnabled', value)}
            title={t('settings.shareRide')}
            value={shareRideEnabled}
          />
        </SectionCard>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() =>
            Alert.alert(t('settings.safetyCenterTitle'), t('settings.safetyCenterAlert'))
          }
          style={styles.supportCard}
        >
          <View style={styles.supportIcon}>
            <Ionicons color="#FFFFFF" name="shield-checkmark-outline" size={20} />
          </View>
          <View style={styles.supportCopy}>
            <Text style={styles.supportTitle}>{t('settings.safetyCenter')}</Text>
            <Text style={styles.supportHint}>{t('settings.safetyCenterHint')}</Text>
          </View>
          <Ionicons color={palette.text} name="arrow-forward" size={18} />
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.9} onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>{t('settings.signOut')}</Text>
          <Ionicons color={palette.danger} name="log-out-outline" size={18} />
        </TouchableOpacity>
      </ScrollView>
    </PassengerScreenLayout>
  );
}

const createStyles = (palette: PassengerPalette, radius: typeof import('../theme/passenger').passengerRadius) => StyleSheet.create({
  content: {
    gap: 18,
    paddingBottom: 150,
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  loadingState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    color: palette.mutedText,
    fontSize: 15,
    fontWeight: '600',
  },
  profileCard: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 16,
    padding: 18,
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 4,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: palette.primarySoft,
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  avatarText: {
    color: palette.text,
    fontSize: 22,
    fontWeight: '800',
  },
  profileCopy: {
    flex: 1,
    gap: 6,
  },
  profileName: {
    color: palette.text,
    fontSize: 20,
    fontWeight: '800',
  },
  profileMeta: {
    color: palette.mutedText,
    fontSize: 13,
  },
  profileBadge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: palette.primarySoft,
    borderRadius: 999,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  profileBadgeText: {
    color: palette.primaryDeep,
    fontSize: 12,
    fontWeight: '700',
  },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  summaryPill: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: palette.tabBar,
    borderColor: palette.border,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  summaryPillText: {
    color: palette.text,
    fontSize: 12,
    fontWeight: '700',
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '800',
    paddingHorizontal: 4,
  },
  sectionCard: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  selectorRow: {
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  choiceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  choiceChip: {
    alignItems: 'center',
    backgroundColor: palette.surfaceMuted,
    borderColor: palette.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    minHeight: 42,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  choiceChipActive: {
    backgroundColor: palette.primarySoft,
    borderColor: '#E3C15E',
  },
  choiceChipLabel: {
    color: palette.mutedText,
    fontSize: 13,
    fontWeight: '700',
  },
  choiceChipLabelActive: {
    color: palette.text,
  },
  toggleRow: {
    alignItems: 'center',
    borderTopColor: palette.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  toggleRowDisabled: {
    opacity: 0.55,
  },
  toggleIconWrap: {
    alignItems: 'center',
    backgroundColor: palette.surfaceMuted,
    borderRadius: 16,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  rowCopy: {
    flex: 1,
    gap: 4,
  },
  rowTitle: {
    color: palette.text,
    fontSize: 15,
    fontWeight: '700',
  },
  rowHint: {
    color: palette.mutedText,
    fontSize: 13,
    lineHeight: 18,
  },
  banner: {
    alignItems: 'flex-start',
    backgroundColor: palette.surfaceMuted,
    borderTopColor: palette.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  bannerWarning: {
    backgroundColor: palette.warningSurface,
  },
  bannerCopy: {
    flex: 1,
    gap: 4,
  },
  bannerTitle: {
    color: palette.text,
    fontSize: 14,
    fontWeight: '800',
  },
  bannerText: {
    color: palette.mutedText,
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  bannerButton: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: palette.text,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  bannerButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  supportCard: {
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    padding: 18,
  },
  supportIcon: {
    alignItems: 'center',
    backgroundColor: palette.accent,
    borderRadius: 18,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  supportCopy: {
    flex: 1,
    gap: 4,
  },
  supportTitle: {
    color: palette.text,
    fontSize: 15,
    fontWeight: '800',
  },
  supportHint: {
    color: palette.mutedText,
    fontSize: 13,
    lineHeight: 18,
  },
  logoutButton: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: palette.surfaceMuted,
    borderColor: palette.danger,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  logoutText: {
    color: palette.danger,
    fontSize: 15,
    fontWeight: '800',
  },
});

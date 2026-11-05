import React, { useEffect, useState } from 'react';
import { AppState, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Text } from 'react-native-paper';
import { useUser } from '../../hooks/UserContext';
import { useI18n } from '../../hooks/useI18n';
import { useTheme } from '../../hooks/useTheme';
import { getDriverProfile } from '../../services/api/driver';
import { DriverProfileResponse } from '../../types/driver';
import IntegrationNotice from '../../shared/components/IntegrationNotice';

type ProfileState = { status: 'loading' } | { status: 'error'; message: string } |
  { status: 'ready'; profile: NonNullable<DriverProfileResponse['data']>['driver'] };
export default function DriverHome() {
  const { user, signOut } = useUser();
  const { t } = useI18n();
  const { theme } = useTheme();
  const [profile, setProfile] = useState<ProfileState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const [logoutError, setLogoutError] = useState('');
  useEffect(() => {
    if (!user || user.role !== 'driver') return;
    const controller = new AbortController();
    setProfile({ status: 'loading' });
    getDriverProfile(user.id, controller.signal).then((response) => {
      if (controller.signal.aborted) return;
      if (!response.success || !response.data) throw new Error(t('integration.profileError'));
      setProfile({ status: 'ready', profile: response.data.driver });
    }).catch(() => {
      if (!controller.signal.aborted) setProfile({ status: 'error', message: t('integration.profileError') });
    });
    return () => controller.abort();
  }, [user, attempt, t]);
  useEffect(() => {
    const listener = AppState.addEventListener('change', (state) => {
      if (state === 'active') setAttempt((value) => value + 1);
    });
    return () => listener.remove();
  }, []);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16, maxWidth: 840, width: '100%', alignSelf: 'center' }}>
        <Text variant="headlineMedium" accessibilityRole="header">{user?.fullName}</Text>
        {profile.status === 'loading' ? <Text>{t('integration.loading')}</Text> : null}
        {profile.status === 'error' ? <View><Text>{profile.message}</Text><Button onPress={() => setAttempt((value) => value + 1)}>{t('integration.retry')}</Button></View> : null}
        {profile.status === 'ready' ? (
          <View style={{ gap: 8 }}>
            <Text>{profile.profile.carModel} • {profile.profile.carNumber}</Text>
            <Text>{t(`integration.driverStatus.${profile.profile.status}`)}</Text>
          </View>
        ) : null}
        <IntegrationNotice detail="integration.driver" />
        <IntegrationNotice detail="integration.verification" />
        {logoutError ? <Text accessibilityLiveRegion="polite">{logoutError}</Text> : null}
        <Button onPress={() => { void signOut().catch(() => setLogoutError(t('integration.storageError'))); }}>{t('settings.signOut')}</Button>
      </ScrollView>
    </SafeAreaView>
  );
}

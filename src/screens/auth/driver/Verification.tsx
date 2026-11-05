import React from 'react';
import { ScrollView } from 'react-native';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '../../../types/navigation';
import BookingFlowLayout from '../../../components/passenger/BookingFlowLayout';
import IntegrationNotice from '../../../shared/components/IntegrationNotice';
import { useI18n } from '../../../hooks/useI18n';
export default function DriverVerification() {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useI18n();
  return (
    <BookingFlowLayout title={t('integration.verificationTitle')}>
      <ScrollView>
        <IntegrationNotice detail="integration.verification" />
        <Button onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })}>{t('integration.signIn')}</Button>
      </ScrollView>
    </BookingFlowLayout>
  );
}

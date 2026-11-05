import React from 'react';
import { ScrollView } from 'react-native';
import BookingFlowLayout from '../../components/passenger/BookingFlowLayout';
import IntegrationNotice from '../../shared/components/IntegrationNotice';
import { useI18n } from '../../hooks/useI18n';

export default function ActiveRideScreen() {
  const { t } = useI18n();
  return (
    <BookingFlowLayout title={t('activeRide.title')}>
      <ScrollView><IntegrationNotice detail="integration.activeRide" /></ScrollView>
    </BookingFlowLayout>
  );
}

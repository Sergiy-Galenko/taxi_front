import React from 'react';
import { StatePanel } from '../../design-system/components/ui';
import { useI18n } from '../../hooks/useI18n';
export default function IntegrationNotice({ detail = 'integration.booking' }: { detail?: string }) {
  const { t } = useI18n();
  return <StatePanel icon="cloud-offline-outline" title={t('integration.unavailable')} description={t(detail)} />;
}

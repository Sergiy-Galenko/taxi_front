import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useI18n } from '../../hooks/useI18n';
import { usePassengerTheme } from '../../hooks/usePassengerTheme';
export default function IntegrationNotice({ detail = 'integration.booking' }: { detail?: string }) {
  const { t } = useI18n();
  const { palette } = usePassengerTheme();
  return (
    <View accessibilityLiveRegion="polite" style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}>
      <Text accessibilityRole="header" style={[styles.title, { color: palette.text }]}>{t('integration.unavailable')}</Text>
      <Text style={[styles.detail, { color: palette.mutedText }]}>{t(detail)}</Text>
    </View>
  );
}
const styles = StyleSheet.create({ card: { padding: 20, margin: 16, borderWidth: 1, borderRadius: 16, gap: 12 }, title: { fontSize: 20, fontWeight: '700' }, detail: { fontSize: 16, lineHeight: 24 } });

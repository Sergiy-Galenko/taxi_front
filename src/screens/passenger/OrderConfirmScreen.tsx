import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Button from '../../components/Button';
import BookingFlowLayout from '../../components/passenger/BookingFlowLayout';
import RouteSummaryCard from '../../components/passenger/RouteSummaryCard';
import { getRideOption } from '../../data/passenger';
import { useI18n } from '../../hooks/useI18n';
import { getPaymentMethodTranslationKey } from '../../hooks/useNotifications';
import { usePassengerTheme } from '../../hooks/usePassengerTheme';
import { PassengerPalette, passengerSpacing } from '../../theme/passenger';
import { RootStackParamList } from '../../types/navigation';

type OrderConfirmScreenProps = NativeStackScreenProps<RootStackParamList, 'OrderConfirm'>;

export default function OrderConfirmScreen({ navigation, route }: OrderConfirmScreenProps) {
  const { t } = useI18n();
  const { palette, radius } = usePassengerTheme();
  const styles = useMemo(() => createStyles(palette, radius), [palette, radius]);
  const [comment, setComment] = useState(route.params.driverComment ?? '');
  const rideOption = useMemo(() => getRideOption(route.params.rideType), [route.params.rideType]);

  const handleOrder = () => {
    navigation.replace('DriverSearch', {
      ...route.params,
      driverComment: comment.trim() || undefined,
    });
  };

  return (
    <BookingFlowLayout
      subtitle={t('orderConfirm.subtitle')}
      title={t('orderConfirm.title')}
      footer={
        <View style={styles.footer}>
          <Button
            icon="close"
            onPress={() => navigation.navigate('Home')}
            title={t('common.cancel')}
            variant="secondary"
          />
          <Button
            onPress={handleOrder}
            rightIcon="arrow-forward"
            subtitle={t('orderConfirm.ctaSubtitle')}
            title={t('orderConfirm.cta')}
          />
        </View>
      }
    >
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <RouteSummaryCard
          badge={t('common.stepOf', { current: 3, total: 4 })}
          destination={route.params.to}
          meta={[
            { icon: 'time-outline', label: t('common.minutesShort', { count: route.params.durationMin }) },
            { icon: 'map-outline', label: t('common.kilometersShort', { count: route.params.distanceKm }) },
            { icon: 'car-outline', label: t('common.minutesShort', { count: route.params.pickupEtaMin }) },
          ]}
          onPressEdit={() => navigation.navigate('Home', { from: route.params.from, to: route.params.to, rideType: route.params.rideType })}
          pickup={route.params.from}
        />

        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={[styles.tariffIcon, { backgroundColor: rideOption.accentColor }]}>
              <Ionicons color="#FFFFFF" name={rideOption.icon as keyof typeof Ionicons.glyphMap} size={24} />
            </View>
            <View style={styles.summaryCopy}>
              <Text style={styles.summaryTitle}>{t(`rideOptions.${route.params.rideType}.label`)}</Text>
              <Text style={styles.summaryText}>{t(`rideOptions.${route.params.rideType}.description`)}</Text>
            </View>
            <Text style={styles.price}>{t('common.priceUah', { amount: route.params.price })}</Text>
          </View>

          <View style={styles.metrics}>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>{t('vehicleSelection.arrival')}</Text>
              <Text style={styles.metricValue}>{t('common.minutesShort', { count: route.params.pickupEtaMin })}</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>{t('vehicleSelection.trip')}</Text>
              <Text style={styles.metricValue}>{t('common.minutesShort', { count: route.params.durationMin })}</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>{t('vehicleSelection.capacity')}</Text>
              <Text style={styles.metricValue}>{rideOption.capacity}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons color={palette.text} name="wallet-outline" size={20} />
            <View style={styles.rowCopy}>
              <Text style={styles.rowTitle}>{t('vehicleSelection.payment')}</Text>
              <Text style={styles.rowText}>{t(getPaymentMethodTranslationKey(route.params.paymentMethod))}</Text>
            </View>
            <TouchableOpacity activeOpacity={0.86} onPress={() => navigation.goBack()} style={styles.editButton}>
              <Text style={styles.editButtonText}>{t('common.editRoute')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('orderConfirm.commentTitle')}</Text>
          <Text style={styles.cardHint}>{t('orderConfirm.commentHint')}</Text>
          <TextInput
            multiline
            onChangeText={setComment}
            placeholder={t('orderConfirm.commentPlaceholder')}
            placeholderTextColor={palette.subtleText}
            style={styles.commentInput}
            textAlignVertical="top"
            value={comment}
          />
        </View>

        <View style={styles.noticeCard}>
          <Ionicons color={palette.success} name="shield-checkmark-outline" size={18} />
          <Text style={styles.noticeText}>{t('orderConfirm.notice')}</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => Alert.alert(t('settings.safetyCenterTitle'), t('settings.safetyCenterAlert'))}
          style={styles.supportLink}
        >
          <Ionicons color={palette.text} name="help-circle-outline" size={18} />
          <Text style={styles.supportText}>{t('settings.safetyCenter')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </BookingFlowLayout>
  );
}

const createStyles = (
  palette: PassengerPalette,
  radius: typeof import('../../theme/passenger').passengerRadius
) =>
  StyleSheet.create({
    card: {
      backgroundColor: palette.surface,
      borderColor: palette.border,
      borderRadius: radius.lg,
      borderWidth: 1,
      gap: passengerSpacing.md,
      padding: passengerSpacing.lg,
    },
    cardHint: {
      color: palette.mutedText,
      fontSize: 13,
      lineHeight: 18,
    },
    cardTitle: {
      color: palette.text,
      fontSize: 17,
      fontWeight: '900',
    },
    commentInput: {
      backgroundColor: palette.surfaceMuted,
      borderRadius: radius.lg,
      color: palette.text,
      fontSize: 15,
      minHeight: 104,
      padding: passengerSpacing.lg,
    },
    content: {
      gap: passengerSpacing.lg,
      paddingBottom: passengerSpacing.xl,
      paddingHorizontal: passengerSpacing.xl,
      paddingTop: passengerSpacing.lg,
    },
    editButton: {
      backgroundColor: palette.surfaceMuted,
      borderRadius: radius.pill,
      paddingHorizontal: passengerSpacing.md,
      paddingVertical: passengerSpacing.sm,
    },
    editButtonText: {
      color: palette.text,
      fontSize: 12,
      fontWeight: '900',
    },
    footer: {
      gap: passengerSpacing.md,
    },
    metric: {
      backgroundColor: palette.surfaceMuted,
      borderRadius: radius.md,
      flex: 1,
      gap: 4,
      padding: passengerSpacing.md,
    },
    metricLabel: {
      color: palette.mutedText,
      fontSize: 11,
      fontWeight: '900',
    },
    metrics: {
      flexDirection: 'row',
      gap: passengerSpacing.sm,
    },
    metricValue: {
      color: palette.text,
      fontSize: 13,
      fontWeight: '900',
    },
    noticeCard: {
      alignItems: 'flex-start',
      backgroundColor: palette.successSoft,
      borderRadius: radius.lg,
      flexDirection: 'row',
      gap: passengerSpacing.sm,
      padding: passengerSpacing.lg,
    },
    noticeText: {
      color: palette.text,
      flex: 1,
      fontSize: 13,
      fontWeight: '700',
      lineHeight: 19,
    },
    price: {
      color: palette.text,
      fontSize: 20,
      fontWeight: '900',
      textAlign: 'right',
    },
    row: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: passengerSpacing.md,
    },
    rowCopy: {
      flex: 1,
      gap: 3,
    },
    rowText: {
      color: palette.mutedText,
      fontSize: 14,
      fontWeight: '700',
    },
    rowTitle: {
      color: palette.text,
      fontSize: 16,
      fontWeight: '900',
    },
    summaryCard: {
      backgroundColor: palette.surface,
      borderColor: palette.border,
      borderRadius: radius.lg,
      borderWidth: 1,
      gap: passengerSpacing.lg,
      padding: passengerSpacing.lg,
    },
    summaryCopy: {
      flex: 1,
      gap: 4,
    },
    summaryHeader: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: passengerSpacing.md,
    },
    summaryText: {
      color: palette.mutedText,
      fontSize: 13,
      lineHeight: 18,
    },
    summaryTitle: {
      color: palette.text,
      fontSize: 19,
      fontWeight: '900',
    },
    supportLink: {
      alignItems: 'center',
      alignSelf: 'center',
      flexDirection: 'row',
      gap: passengerSpacing.sm,
      padding: passengerSpacing.sm,
    },
    supportText: {
      color: palette.text,
      fontSize: 14,
      fontWeight: '900',
    },
    tariffIcon: {
      alignItems: 'center',
      borderRadius: radius.lg,
      height: 56,
      justifyContent: 'center',
      width: 56,
    },
  });

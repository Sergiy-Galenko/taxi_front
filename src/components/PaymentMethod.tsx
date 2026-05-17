import React, { memo, useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '../hooks/useI18n';
import { usePassengerTheme } from '../hooks/usePassengerTheme';
import { PassengerPalette, passengerSpacing } from '../theme/passenger';
import { PaymentMethodKey } from '../types/passenger';

const paymentIcons: Record<PaymentMethodKey, keyof typeof Ionicons.glyphMap> = {
  apple_pay: 'logo-apple',
  cash: 'cash-outline',
  visa: 'card-outline',
};

interface PaymentMethodProps {
  method: PaymentMethodKey;
  selected: boolean;
  onPress: () => void;
}

function PaymentMethod({ method, selected, onPress }: PaymentMethodProps) {
  const { t } = useI18n();
  const { palette, radius } = usePassengerTheme();
  const styles = useMemo(() => createStyles(palette, radius), [palette, radius]);

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={[styles.card, selected && styles.cardSelected]}
    >
      <View style={[styles.iconWrap, selected && styles.iconWrapSelected]}>
        <Ionicons
          color={selected ? '#FFFFFF' : palette.text}
          name={paymentIcons[method]}
          size={18}
        />
      </View>
      <Text style={[styles.label, selected && styles.labelSelected]}>
        {t(`payments.${method}`)}
      </Text>
      {selected ? <Ionicons color={palette.success} name="checkmark-circle" size={18} /> : null}
    </TouchableOpacity>
  );
}

const createStyles = (
  palette: PassengerPalette,
  radius: typeof import('../theme/passenger').passengerRadius
) =>
  StyleSheet.create({
    card: {
      alignItems: 'center',
      backgroundColor: palette.surface,
      borderColor: palette.border,
      borderRadius: radius.lg,
      borderWidth: 1,
      flexDirection: 'row',
      gap: passengerSpacing.md,
      padding: passengerSpacing.md,
    },
    cardSelected: {
      backgroundColor: palette.successSoft,
      borderColor: palette.success,
    },
    iconWrap: {
      alignItems: 'center',
      backgroundColor: palette.surfaceMuted,
      borderRadius: radius.md,
      height: 38,
      justifyContent: 'center',
      width: 38,
    },
    iconWrapSelected: {
      backgroundColor: palette.success,
    },
    label: {
      color: palette.text,
      flex: 1,
      fontSize: 14,
      fontWeight: '800',
    },
    labelSelected: {
      color: palette.text,
    },
  });

export default memo(PaymentMethod);

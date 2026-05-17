import React, { memo, useMemo, useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from './Button';
import { usePassengerTheme } from '../hooks/usePassengerTheme';
import { PassengerPalette, passengerSpacing } from '../theme/passenger';

interface RatingModalProps {
  visible: boolean;
  driverName: string;
  onClose: () => void;
  onSubmit: (rating: number, tip: number, comment: string) => void;
}

const tips = [0, 20, 40, 60];

function RatingModal({ visible, driverName, onClose, onSubmit }: RatingModalProps) {
  const { palette, radius } = usePassengerTheme();
  const styles = useMemo(() => createStyles(palette, radius), [palette, radius]);
  const [rating, setRating] = useState(5);
  const [tip, setTip] = useState(20);
  const [comment, setComment] = useState('');

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Оцініть поїздку</Text>
              <Text style={styles.subtitle}>{driverName}</Text>
            </View>
            <TouchableOpacity activeOpacity={0.86} onPress={onClose} style={styles.close}>
              <Ionicons color={palette.text} name="close" size={20} />
            </TouchableOpacity>
          </View>

          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} activeOpacity={0.82} onPress={() => setRating(star)}>
                <Ionicons
                  color={star <= rating ? palette.primaryDeep : palette.borderStrong}
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={34}
                />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Чайові</Text>
          <View style={styles.tips}>
            {tips.map((value) => (
              <TouchableOpacity
                key={value}
                activeOpacity={0.86}
                onPress={() => setTip(value)}
                style={[styles.tip, tip === value && styles.tipSelected]}
              >
                <Text style={[styles.tipText, tip === value && styles.tipTextSelected]}>
                  {value === 0 ? 'Без чайових' : `${value} грн`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            multiline
            onChangeText={setComment}
            placeholder="Що можна покращити?"
            placeholderTextColor={palette.subtleText}
            style={styles.comment}
            textAlignVertical="top"
            value={comment}
          />

          <Button
            onPress={() => onSubmit(rating, tip, comment)}
            rightIcon="checkmark"
            title="Готово"
          />
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (
  palette: PassengerPalette,
  radius: typeof import('../theme/passenger').passengerRadius
) =>
  StyleSheet.create({
    close: {
      alignItems: 'center',
      backgroundColor: palette.surfaceMuted,
      borderRadius: radius.md,
      height: 42,
      justifyContent: 'center',
      width: 42,
    },
    comment: {
      backgroundColor: palette.surfaceMuted,
      borderRadius: radius.lg,
      color: palette.text,
      fontSize: 15,
      minHeight: 94,
      padding: passengerSpacing.lg,
    },
    header: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: passengerSpacing.md,
    },
    modal: {
      backgroundColor: palette.backgroundSecondary,
      borderRadius: radius.xl,
      gap: passengerSpacing.lg,
      marginHorizontal: passengerSpacing.xl,
      padding: passengerSpacing.xl,
      width: '100%',
    },
    overlay: {
      alignItems: 'center',
      backgroundColor: palette.overlay,
      flex: 1,
      justifyContent: 'center',
      padding: passengerSpacing.xl,
    },
    sectionLabel: {
      color: palette.mutedText,
      fontSize: 12,
      fontWeight: '900',
    },
    stars: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: passengerSpacing.sm,
    },
    subtitle: {
      color: palette.mutedText,
      fontSize: 14,
      marginTop: 3,
    },
    tip: {
      backgroundColor: palette.surfaceMuted,
      borderColor: palette.border,
      borderRadius: radius.pill,
      borderWidth: 1,
      paddingHorizontal: passengerSpacing.md,
      paddingVertical: passengerSpacing.sm,
    },
    tipSelected: {
      backgroundColor: palette.primarySoft,
      borderColor: palette.primaryDeep,
    },
    tipText: {
      color: palette.mutedText,
      fontSize: 13,
      fontWeight: '800',
    },
    tipTextSelected: {
      color: palette.text,
    },
    tips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: passengerSpacing.sm,
    },
    title: {
      color: palette.text,
      fontSize: 22,
      fontWeight: '900',
    },
  });

export default memo(RatingModal);

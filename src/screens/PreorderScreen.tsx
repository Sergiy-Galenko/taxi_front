import React, { useMemo, useState } from 'react';
import {
  Alert,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import PassengerScreenLayout from '../components/passenger/PassengerScreenLayout';
import { useI18n } from '../hooks/useI18n';
import { PassengerPalette } from '../theme/passenger';
import { usePassengerTheme } from '../hooks/usePassengerTheme';
import { RootStackParamList } from '../types/navigation';

type PreorderScreenProps = NativeStackScreenProps<RootStackParamList, 'Preorder'>;

export default function PreorderScreen({ navigation, route }: PreorderScreenProps) {
  const { t } = useI18n();
  const { palette, radius } = usePassengerTheme();
  const styles = useMemo(() => createStyles(palette, radius), [palette, radius]);
  const [scheduledAt, setScheduledAt] = useState(() => {
    const nextHour = new Date();
    nextHour.setMinutes(0, 0, 0);
    nextHour.setHours(nextHour.getHours() + 1);
    return nextHour;
  });
  const [showPicker, setShowPicker] = useState(false);
  const [note, setNote] = useState('');

  const pickup = route.params?.pickup || t('preorder.chooseRouteFirst');
  const destination = route.params?.destination || t('preorder.chooseRouteFirst');
  const rideType = route.params?.rideType ?? 'comfort';
  const hasRoute = Boolean(route.params?.pickup && route.params?.destination);

  const handleScheduleRide = () => {
    if (!hasRoute) {
      navigation.navigate('Home');
      return;
    }

    Alert.alert(
      t('preorder.rideScheduledTitle'),
      t('preorder.rideScheduledText', {
        ride: t(`rideOptions.${rideType}.label`),
        date: scheduledAt.toLocaleString(),
      })
    );
  };

  return (
    <PassengerScreenLayout
      activeRoute="Preorder"
      subtitle={t('preorder.subtitle')}
      title={t('preorder.title')}
    >
      <TouchableWithoutFeedback accessible={false} onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{t('preorder.tripSnapshot')}</Text>
            <View style={styles.rideChip}>
              <Ionicons color={palette.text} name="car-outline" size={14} />
              <Text style={styles.rideChipText}>{t(`rideOptions.${rideType}.label`)}</Text>
            </View>
          </View>

          <View style={styles.routeRow}>
            <View style={[styles.routeDot, styles.pickupDot]} />
            <View style={styles.routeTextBlock}>
              <Text style={styles.routeLabel}>{t('history.pickup')}</Text>
              <Text style={styles.routeValue}>{pickup}</Text>
            </View>
          </View>

          <View style={styles.routeDivider} />

          <View style={styles.routeRow}>
            <View style={[styles.routeDot, styles.destinationDot]} />
            <View style={styles.routeTextBlock}>
              <Text style={styles.routeLabel}>{t('history.destination')}</Text>
              <Text style={styles.routeValue}>{destination}</Text>
            </View>
          </View>

          {!hasRoute ? (
            <TouchableOpacity activeOpacity={0.88} onPress={() => navigation.navigate('Home')} style={styles.routeAction}>
              <Text style={styles.routeActionText}>{t('preorder.chooseRouteFirst')}</Text>
              <Ionicons color={palette.text} name="arrow-forward" size={18} />
            </TouchableOpacity>
          ) : null}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('preorder.pickupTime')}</Text>
            <Text style={styles.cardHint}>{t('preorder.pickupTimeHint')}</Text>

          <TouchableOpacity activeOpacity={0.88} onPress={() => setShowPicker(true)} style={styles.timeButton}>
            <View>
              <Text style={styles.routeLabel}>{t('preorder.scheduledFor')}</Text>
              <Text style={styles.timeValue}>
                {scheduledAt.toLocaleDateString()} {' '}
                {scheduledAt.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
            <Ionicons color={palette.text} name="calendar-outline" size={22} />
          </TouchableOpacity>

          {showPicker ? (
            <DateTimePicker
              display="default"
              minimumDate={new Date()}
              mode="datetime"
              onChange={(_, selectedDate) => {
                setShowPicker(false);

                if (selectedDate) {
                  setScheduledAt(selectedDate);
                }
              }}
              value={scheduledAt}
            />
          ) : null}

          <View style={styles.timeline}>
            <View style={styles.timelineRow}>
              <View style={styles.timelineBadge}>
                <Ionicons color={palette.info} name="notifications-outline" size={16} />
              </View>
              <View style={styles.timelineText}>
                <Text style={styles.timelineTitle}>{t('preorder.reminderTitle')}</Text>
                <Text style={styles.timelineHint}>{t('preorder.reminderHint')}</Text>
              </View>
            </View>

            <View style={styles.timelineRow}>
              <View style={styles.timelineBadge}>
                <Ionicons color={palette.accent} name="shield-checkmark-outline" size={16} />
              </View>
              <View style={styles.timelineText}>
                <Text style={styles.timelineTitle}>{t('preorder.flexibleChangesTitle')}</Text>
                <Text style={styles.timelineHint}>{t('preorder.flexibleChangesHint')}</Text>
              </View>
            </View>
          </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('preorder.pickupNote')}</Text>
            <Text style={styles.cardHint}>{t('preorder.pickupNoteHint')}</Text>

          <TextInput
            multiline
            onChangeText={setNote}
            placeholder={t('preorder.pickupNotePlaceholder')}
            placeholderTextColor={palette.mutedText}
            style={styles.noteInput}
            textAlignVertical="top"
            value={note}
          />
          </View>

          <TouchableOpacity activeOpacity={0.92} onPress={handleScheduleRide} style={styles.primaryButton}>
            <View>
              <Text style={styles.primaryEyebrow}>{t('preorder.confirmEyebrow', { ride: t(`rideOptions.${rideType}.label`) })}</Text>
              <Text style={styles.primaryTitle}>{hasRoute ? t('preorder.confirmScheduledRide') : t('preorder.openBookingScreen')}</Text>
            </View>
            <Ionicons color={palette.text} name="arrow-forward" size={20} />
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
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
  card: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: 16,
    padding: 18,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardTitle: {
    color: palette.text,
    fontSize: 18,
    fontWeight: '800',
  },
  cardHint: {
    color: palette.mutedText,
    fontSize: 14,
    lineHeight: 20,
  },
  rideChip: {
    alignItems: 'center',
    backgroundColor: palette.primarySoft,
    borderRadius: 999,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  rideChipText: {
    color: palette.text,
    fontSize: 12,
    fontWeight: '700',
  },
  routeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  routeDot: {
    borderRadius: 6,
    height: 12,
    width: 12,
  },
  pickupDot: {
    backgroundColor: palette.accent,
  },
  destinationDot: {
    backgroundColor: palette.danger,
  },
  routeTextBlock: {
    flex: 1,
    gap: 4,
  },
  routeLabel: {
    color: palette.mutedText,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  routeValue: {
    color: palette.text,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 21,
  },
  routeDivider: {
    backgroundColor: palette.border,
    height: 1,
    marginLeft: 24,
  },
  routeAction: {
    alignItems: 'center',
    backgroundColor: palette.primarySoft,
    borderRadius: radius.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  routeActionText: {
    color: palette.text,
    fontSize: 14,
    fontWeight: '700',
  },
  timeButton: {
    alignItems: 'center',
    backgroundColor: palette.surfaceMuted,
    borderRadius: radius.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  timeValue: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
  },
  timeline: {
    gap: 12,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timelineBadge: {
    alignItems: 'center',
    backgroundColor: palette.surfaceMuted,
    borderRadius: 14,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  timelineText: {
    flex: 1,
    gap: 4,
  },
  timelineTitle: {
    color: palette.text,
    fontSize: 14,
    fontWeight: '800',
  },
  timelineHint: {
    color: palette.mutedText,
    fontSize: 12,
    lineHeight: 18,
  },
  noteInput: {
    backgroundColor: palette.surfaceMuted,
    borderRadius: radius.md,
    color: palette.text,
    fontSize: 14,
    minHeight: 112,
    padding: 14,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: palette.primary,
    borderRadius: radius.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  primaryEyebrow: {
    color: palette.text,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  primaryTitle: {
    color: palette.text,
    fontSize: 18,
    fontWeight: '800',
  },
});

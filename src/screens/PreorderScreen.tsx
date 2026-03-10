import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import PassengerScreenLayout from '../components/passenger/PassengerScreenLayout';
import { getRideOption } from '../data/passenger';
import { passengerPalette, passengerRadius } from '../theme/passenger';
import { RootStackParamList } from '../types/navigation';

type PreorderScreenProps = NativeStackScreenProps<RootStackParamList, 'Preorder'>;

export default function PreorderScreen({ navigation, route }: PreorderScreenProps) {
  const [scheduledAt, setScheduledAt] = useState(() => {
    const nextHour = new Date();
    nextHour.setMinutes(0, 0, 0);
    nextHour.setHours(nextHour.getHours() + 1);
    return nextHour;
  });
  const [showPicker, setShowPicker] = useState(false);
  const [note, setNote] = useState('');

  const pickup = route.params?.pickup || 'Pickup point not selected yet';
  const destination = route.params?.destination || 'Destination not selected yet';
  const rideOption = getRideOption(route.params?.rideType ?? 'comfort');
  const hasRoute = Boolean(route.params?.pickup && route.params?.destination);

  const handleScheduleRide = () => {
    if (!hasRoute) {
      navigation.navigate('Home');
      return;
    }

    Alert.alert(
      'Ride scheduled',
      `${rideOption.label} pickup is booked for ${scheduledAt.toLocaleString()}.`
    );
  };

  return (
    <PassengerScreenLayout
      activeRoute="Preorder"
      subtitle="Plan ahead without re-entering your route later."
      title="Schedule pickup"
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Trip snapshot</Text>
            <View style={styles.rideChip}>
              <Ionicons color={passengerPalette.text} name="car-outline" size={14} />
              <Text style={styles.rideChipText}>{rideOption.label}</Text>
            </View>
          </View>

          <View style={styles.routeRow}>
            <View style={[styles.routeDot, styles.pickupDot]} />
            <View style={styles.routeTextBlock}>
              <Text style={styles.routeLabel}>Pickup</Text>
              <Text style={styles.routeValue}>{pickup}</Text>
            </View>
          </View>

          <View style={styles.routeDivider} />

          <View style={styles.routeRow}>
            <View style={[styles.routeDot, styles.destinationDot]} />
            <View style={styles.routeTextBlock}>
              <Text style={styles.routeLabel}>Destination</Text>
              <Text style={styles.routeValue}>{destination}</Text>
            </View>
          </View>

          {!hasRoute ? (
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => navigation.navigate('Home')}
              style={styles.routeAction}
            >
              <Text style={styles.routeActionText}>Choose route first</Text>
              <Ionicons color={passengerPalette.text} name="arrow-forward" size={18} />
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pickup time</Text>
          <Text style={styles.cardHint}>
            The driver is dispatched shortly before the selected time to reduce waiting.
          </Text>

          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => setShowPicker(true)}
            style={styles.timeButton}
          >
            <View>
              <Text style={styles.routeLabel}>Scheduled for</Text>
              <Text style={styles.timeValue}>
                {scheduledAt.toLocaleDateString()} at{' '}
                {scheduledAt.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
            <Ionicons color={passengerPalette.text} name="calendar-outline" size={22} />
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
                <Ionicons color={passengerPalette.info} name="notifications-outline" size={16} />
              </View>
              <View style={styles.timelineText}>
                <Text style={styles.timelineTitle}>Reminder before pickup</Text>
                <Text style={styles.timelineHint}>The passenger gets a notification when dispatch starts.</Text>
              </View>
            </View>

            <View style={styles.timelineRow}>
              <View style={styles.timelineBadge}>
                <Ionicons color={passengerPalette.accent} name="shield-checkmark-outline" size={16} />
              </View>
              <View style={styles.timelineText}>
                <Text style={styles.timelineTitle}>Flexible changes</Text>
                <Text style={styles.timelineHint}>Time and route can be edited until dispatch begins.</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pickup note</Text>
          <Text style={styles.cardHint}>
            Add entrance, gate, terminal, or any detail that helps the driver find you faster.
          </Text>

          <TextInput
            multiline
            onChangeText={setNote}
            placeholder="Example: Meet at terminal entrance B"
            placeholderTextColor={passengerPalette.mutedText}
            style={styles.noteInput}
            textAlignVertical="top"
            value={note}
          />
        </View>

        <TouchableOpacity
          activeOpacity={0.92}
          onPress={handleScheduleRide}
          style={styles.primaryButton}
        >
          <View>
            <Text style={styles.primaryEyebrow}>{rideOption.label} preset</Text>
            <Text style={styles.primaryTitle}>
              {hasRoute ? 'Confirm scheduled ride' : 'Open booking screen'}
            </Text>
          </View>
          <Ionicons color={passengerPalette.text} name="arrow-forward" size={20} />
        </TouchableOpacity>
      </ScrollView>
    </PassengerScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 18,
    paddingBottom: 150,
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  card: {
    backgroundColor: passengerPalette.surface,
    borderColor: passengerPalette.border,
    borderRadius: passengerRadius.lg,
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
    color: passengerPalette.text,
    fontSize: 18,
    fontWeight: '800',
  },
  cardHint: {
    color: passengerPalette.mutedText,
    fontSize: 14,
    lineHeight: 20,
  },
  rideChip: {
    alignItems: 'center',
    backgroundColor: passengerPalette.primarySoft,
    borderRadius: 999,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  rideChipText: {
    color: passengerPalette.text,
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
    backgroundColor: passengerPalette.accent,
  },
  destinationDot: {
    backgroundColor: passengerPalette.danger,
  },
  routeTextBlock: {
    flex: 1,
    gap: 4,
  },
  routeLabel: {
    color: passengerPalette.mutedText,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  routeValue: {
    color: passengerPalette.text,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  routeDivider: {
    backgroundColor: passengerPalette.border,
    height: 1,
    marginLeft: 24,
  },
  routeAction: {
    alignItems: 'center',
    backgroundColor: passengerPalette.surfaceMuted,
    borderRadius: passengerRadius.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  routeActionText: {
    color: passengerPalette.text,
    fontSize: 14,
    fontWeight: '700',
  },
  timeButton: {
    alignItems: 'center',
    backgroundColor: passengerPalette.surfaceMuted,
    borderRadius: passengerRadius.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  timeValue: {
    color: passengerPalette.text,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },
  timeline: {
    gap: 14,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timelineBadge: {
    alignItems: 'center',
    backgroundColor: passengerPalette.surfaceMuted,
    borderRadius: 16,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  timelineText: {
    flex: 1,
    gap: 4,
  },
  timelineTitle: {
    color: passengerPalette.text,
    fontSize: 14,
    fontWeight: '700',
  },
  timelineHint: {
    color: passengerPalette.mutedText,
    fontSize: 13,
    lineHeight: 19,
  },
  noteInput: {
    backgroundColor: passengerPalette.surfaceMuted,
    borderRadius: passengerRadius.md,
    color: passengerPalette.text,
    fontSize: 15,
    minHeight: 112,
    padding: 14,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: passengerPalette.primary,
    borderRadius: passengerRadius.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  primaryEyebrow: {
    color: '#7A5400',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  primaryTitle: {
    color: passengerPalette.text,
    fontSize: 17,
    fontWeight: '800',
  },
});


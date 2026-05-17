import React, { memo, useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '../hooks/useI18n';
import { usePassengerTheme } from '../hooks/usePassengerTheme';
import { PassengerPalette, passengerSpacing } from '../theme/passenger';
import { DestinationSuggestion } from '../types/passenger';

interface AddressSearchProps {
  pickup: string;
  destination: string;
  pickupPlaceholder: string;
  destinationPlaceholder: string;
  focusedField: 'pickup' | 'destination' | null;
  suggestions: DestinationSuggestion[];
  loadingSuggestion?: boolean;
  onPickupChange: (value: string) => void;
  onDestinationChange: (value: string) => void;
  onPickupFocus: () => void;
  onDestinationFocus: () => void;
  onUseCurrentLocation: () => void;
  onSwap: () => void;
  onSelectSuggestion: (suggestion: DestinationSuggestion) => void;
}

const categoryIcon: Record<DestinationSuggestion['category'], keyof typeof Ionicons.glyphMap> = {
  favorite: 'heart-outline',
  history: 'reload-outline',
  hub: 'business-outline',
  live: 'location-outline',
  recent: 'time-outline',
};

function AddressSearch({
  pickup,
  destination,
  pickupPlaceholder,
  destinationPlaceholder,
  focusedField,
  suggestions,
  loadingSuggestion = false,
  onPickupChange,
  onDestinationChange,
  onPickupFocus,
  onDestinationFocus,
  onUseCurrentLocation,
  onSwap,
  onSelectSuggestion,
}: AddressSearchProps) {
  const { t } = useI18n();
  const { palette, radius } = usePassengerTheme();
  const styles = useMemo(() => createStyles(palette, radius), [palette, radius]);

  return (
    <View style={styles.wrap}>
      <View style={styles.routePanel}>
        <View style={styles.timeline}>
          <View style={[styles.routeDot, styles.pickupDot]} />
          <View style={styles.routeLine} />
          <View style={[styles.routeDot, styles.destinationDot]} />
        </View>

        <View style={styles.fields}>
          <View style={[styles.field, focusedField === 'pickup' && styles.fieldActive]}>
            <View style={styles.fieldCopy}>
              <Text style={styles.label}>{t('home.pickupLabel')}</Text>
              <TextInput
                onChangeText={onPickupChange}
                onFocus={onPickupFocus}
                placeholder={pickupPlaceholder}
                placeholderTextColor={palette.subtleText}
                style={styles.input}
                value={pickup}
              />
            </View>
            <TouchableOpacity activeOpacity={0.86} onPress={onUseCurrentLocation} style={styles.iconButton}>
              <Ionicons color={palette.info} name="locate-outline" size={19} />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={[styles.field, focusedField === 'destination' && styles.fieldActive]}>
            <View style={styles.fieldCopy}>
              <Text style={styles.label}>{t('home.destinationLabel')}</Text>
              <TextInput
                onChangeText={onDestinationChange}
                onFocus={onDestinationFocus}
                placeholder={destinationPlaceholder}
                placeholderTextColor={palette.subtleText}
                style={styles.input}
                value={destination}
              />
            </View>
            <TouchableOpacity activeOpacity={0.86} onPress={onSwap} style={styles.iconButton}>
              <Ionicons color={palette.text} name="swap-vertical-outline" size={19} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {focusedField ? (
        <View style={styles.suggestions}>
          <View style={styles.suggestionHeader}>
            <Text style={styles.suggestionTitle}>
              {focusedField === 'pickup'
                ? t('home.suggestionsForPickup')
                : t('home.suggestionsForDestination')}
            </Text>
            <Text style={styles.suggestionMeta}>
              {loadingSuggestion
                ? t('common.loading')
                : t('common.matchesCount', { count: suggestions.length })}
            </Text>
          </View>

          {suggestions.length ? (
            <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled showsVerticalScrollIndicator={false}>
              {suggestions.map((suggestion) => (
                <TouchableOpacity
                  key={suggestion.id}
                  activeOpacity={0.88}
                  onPress={() => onSelectSuggestion(suggestion)}
                  style={styles.suggestionRow}
                >
                  <View style={styles.suggestionIcon}>
                    <Ionicons color={palette.text} name={categoryIcon[suggestion.category]} size={18} />
                  </View>
                  <View style={styles.suggestionCopy}>
                    <Text style={styles.suggestionLabel}>{suggestion.title}</Text>
                    <Text style={styles.suggestionSubtitle}>{suggestion.subtitle}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.empty}>
              <Ionicons color={palette.mutedText} name="search-outline" size={18} />
              <Text style={styles.emptyText}>{t('home.noQuickMatchText')}</Text>
            </View>
          )}
        </View>
      ) : null}
    </View>
  );
}

const createStyles = (
  palette: PassengerPalette,
  radius: typeof import('../theme/passenger').passengerRadius
) =>
  StyleSheet.create({
    divider: {
      backgroundColor: palette.border,
      height: 1,
    },
    empty: {
      alignItems: 'center',
      backgroundColor: palette.surfaceMuted,
      borderRadius: radius.lg,
      flexDirection: 'row',
      gap: passengerSpacing.sm,
      padding: passengerSpacing.md,
    },
    emptyText: {
      color: palette.mutedText,
      flex: 1,
      fontSize: 13,
      lineHeight: 18,
    },
    field: {
      alignItems: 'center',
      borderRadius: radius.lg,
      flexDirection: 'row',
      gap: passengerSpacing.sm,
      paddingHorizontal: passengerSpacing.sm,
      paddingVertical: 4,
    },
    fieldActive: {
      backgroundColor: palette.surfaceMuted,
    },
    fieldCopy: {
      flex: 1,
      gap: 2,
    },
    fields: {
      flex: 1,
      gap: passengerSpacing.sm,
    },
    iconButton: {
      alignItems: 'center',
      backgroundColor: palette.surface,
      borderColor: palette.border,
      borderRadius: radius.md,
      borderWidth: 1,
      height: 40,
      justifyContent: 'center',
      width: 40,
    },
    input: {
      color: palette.text,
      fontSize: 16,
      fontWeight: '800',
      minHeight: 30,
      padding: 0,
    },
    label: {
      color: palette.mutedText,
      fontSize: 10,
      fontWeight: '900',
    },
    pickupDot: {
      backgroundColor: palette.accent,
    },
    destinationDot: {
      backgroundColor: palette.danger,
    },
    routeDot: {
      borderRadius: radius.pill,
      height: 12,
      width: 12,
    },
    routeLine: {
      backgroundColor: palette.borderStrong,
      flex: 1,
      marginVertical: 6,
      width: 2,
    },
    routePanel: {
      flexDirection: 'row',
      gap: passengerSpacing.sm,
    },
    suggestionCopy: {
      flex: 1,
      gap: 3,
    },
    suggestionHeader: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: passengerSpacing.md,
    },
    suggestionIcon: {
      alignItems: 'center',
      backgroundColor: palette.surfaceMuted,
      borderRadius: radius.md,
      height: 38,
      justifyContent: 'center',
      width: 38,
    },
    suggestionLabel: {
      color: palette.text,
      fontSize: 14,
      fontWeight: '900',
    },
    suggestionMeta: {
      color: palette.mutedText,
      fontSize: 12,
      fontWeight: '800',
    },
    suggestionRow: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: passengerSpacing.md,
      paddingVertical: passengerSpacing.sm,
    },
    suggestions: {
      gap: passengerSpacing.md,
      maxHeight: 236,
    },
    suggestionSubtitle: {
      color: palette.mutedText,
      fontSize: 12,
      lineHeight: 17,
    },
    suggestionTitle: {
      color: palette.text,
      fontSize: 15,
      fontWeight: '900',
    },
    timeline: {
      alignItems: 'center',
      paddingTop: 16,
    },
    wrap: {
      gap: passengerSpacing.lg,
    },
  });

export default memo(AddressSearch);

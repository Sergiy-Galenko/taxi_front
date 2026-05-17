import React, { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '../../types/navigation';

type DriverOffer = {
  id: string;
  passenger: string;
  pickup: string;
  dropoff: string;
  fare: number;
  distanceKm: number;
  etaMin: number;
  payment: 'card' | 'cash';
  note: string;
};

const initialOffers: DriverOffer[] = [
  {
    id: 'ride-101',
    passenger: 'Олена Б.',
    pickup: 'ТРЦ Gulliver',
    dropoff: 'Центральний вокзал',
    fare: 286,
    distanceKm: 6.4,
    etaMin: 7,
    payment: 'card',
    note: 'Пасажир із валізою',
  },
  {
    id: 'ride-102',
    passenger: 'Марк С.',
    pickup: 'UNIT.City',
    dropoff: 'Контрактова площа',
    fare: 214,
    distanceKm: 5.1,
    etaMin: 5,
    payment: 'cash',
    note: 'Тихий тариф',
  },
  {
    id: 'ride-103',
    passenger: 'Ірина Д.',
    pickup: 'Ocean Plaza',
    dropoff: 'ВДНГ',
    fare: 332,
    distanceKm: 8.8,
    etaMin: 9,
    payment: 'card',
    note: 'Потрібне місце для дитячого візка',
  },
];

const DriverHome = () => {
  const navigation = useNavigation<NavigationProp>();
  const [isOnline, setIsOnline] = useState(true);
  const [offers, setOffers] = useState(initialOffers);
  const [activeRide, setActiveRide] = useState<DriverOffer | null>(null);
  const [completedRides, setCompletedRides] = useState(12);
  const [earningsToday, setEarningsToday] = useState(1840);

  const acceptanceRate = useMemo(() => {
    const totalHandled = completedRides + (initialOffers.length - offers.length);
    if (totalHandled === 0) {
      return '100%';
    }

    return `${Math.max(84, Math.min(99, Math.round((completedRides / totalHandled) * 100)))}%`;
  }, [completedRides, offers.length]);

  const toggleOnline = () => {
    setIsOnline((prev) => !prev);
  };

  const handleAcceptOffer = (offer: DriverOffer) => {
    if (activeRide) {
      Alert.alert('Активна поїздка', 'Спочатку завершіть поточне замовлення.');
      return;
    }

    setActiveRide(offer);
    setOffers((prev) => prev.filter((item) => item.id !== offer.id));
    Alert.alert('Замовлення прийнято', `${offer.pickup} → ${offer.dropoff}`);
  };

  const handleDeclineOffer = (offerId: string) => {
    setOffers((prev) => prev.filter((item) => item.id !== offerId));
  };

  const handleCompleteRide = () => {
    if (!activeRide) {
      return;
    }

    setCompletedRides((prev) => prev + 1);
    setEarningsToday((prev) => prev + activeRide.fare);
    Alert.alert('Поїздку завершено', `Додано ${activeRide.fare} грн до зміни.`);
    setActiveRide(null);
  };

  return (
    <LinearGradient
      colors={['#0F0A09', '#1B1111', '#2A1110']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.screen}
    >
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroCard}>
            <View style={styles.heroRow}>
              <View style={styles.driverMeta}>
                <Text style={styles.eyebrow}>Тестовий екран водія</Text>
                <Text style={styles.driverName}>Андрій Коваленко</Text>
                <Text style={styles.driverCaption}>
                  Toyota Camry • AA 4321 KT • рейтинг 4.96
                </Text>
              </View>
              <Pressable
                onPress={toggleOnline}
                style={[
                  styles.statusPill,
                  isOnline ? styles.statusPillOnline : styles.statusPillOffline,
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    isOnline ? styles.statusDotOnline : styles.statusDotOffline,
                  ]}
                />
                <Text style={styles.statusText}>
                  {isOnline ? 'На лінії' : 'Офлайн'}
                </Text>
              </Pressable>
            </View>

            <View style={styles.balancePanel}>
              <View>
                <Text style={styles.balanceLabel}>Заробіток за зміну</Text>
                <Text style={styles.balanceValue}>{earningsToday} грн</Text>
              </View>
              <View style={styles.shiftBadge}>
                <MaterialCommunityIcons name="clock-outline" size={18} color="#FFD5C7" />
                <Text style={styles.shiftBadgeText}>6 год 20 хв у зміні</Text>
              </View>
            </View>

            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>{completedRides}</Text>
                <Text style={styles.metricLabel}>Поїздок сьогодні</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>{acceptanceRate}</Text>
                <Text style={styles.metricLabel}>Прийняття</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>4.96</Text>
                <Text style={styles.metricLabel}>Рейтинг</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Активна поїздка</Text>
              <Text style={styles.sectionHint}>
                {activeRide ? 'Можна завершити тестове замовлення' : 'Очікується нове замовлення'}
              </Text>
            </View>

            {activeRide ? (
              <View style={styles.activeRideCard}>
                <View style={styles.routeBadge}>
                  <MaterialCommunityIcons name="map-marker-path" size={18} color="#FF6B4A" />
                  <Text style={styles.routeBadgeText}>Виконується зараз</Text>
                </View>
                <Text style={styles.activeRideRoute}>
                  {activeRide.pickup} → {activeRide.dropoff}
                </Text>
                <Text style={styles.activeRideMeta}>
                  {activeRide.passenger} • {activeRide.distanceKm.toFixed(1)} км • {activeRide.etaMin} хв
                </Text>
                <Text style={styles.activeRideNote}>{activeRide.note}</Text>

                <View style={styles.activeRideFooter}>
                  <View>
                    <Text style={styles.activeRidePriceLabel}>До виплати</Text>
                    <Text style={styles.activeRidePrice}>{activeRide.fare} грн</Text>
                  </View>
                  <Pressable onPress={handleCompleteRide} style={styles.completeButton}>
                    <Text style={styles.completeButtonText}>Завершити</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <View style={styles.emptyRideCard}>
                <MaterialCommunityIcons name="car-clock" size={36} color="#FF6B4A" />
                <Text style={styles.emptyRideTitle}>Наразі немає активної поїздки</Text>
                <Text style={styles.emptyRideText}>
                  Прийми одну з заявок нижче або зайди офлайн, якщо хочеш зупинити нові запити.
                </Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Нові заявки поруч</Text>
              <Text style={styles.sectionHint}>{offers.length} доступно</Text>
            </View>

            {offers.map((offer) => (
              <View key={offer.id} style={styles.offerCard}>
                <View style={styles.offerTopRow}>
                  <View>
                    <Text style={styles.offerPassenger}>{offer.passenger}</Text>
                    <Text style={styles.offerRoute}>
                      {offer.pickup} → {offer.dropoff}
                    </Text>
                  </View>
                  <View style={styles.offerFareChip}>
                    <Text style={styles.offerFareChipText}>{offer.fare} грн</Text>
                  </View>
                </View>

                <View style={styles.offerMetaRow}>
                  <View style={styles.metaChip}>
                    <MaterialCommunityIcons name="map-marker-distance" size={16} color="#D8D2CF" />
                    <Text style={styles.metaChipText}>{offer.distanceKm.toFixed(1)} км</Text>
                  </View>
                  <View style={styles.metaChip}>
                    <MaterialCommunityIcons name="clock-fast" size={16} color="#D8D2CF" />
                    <Text style={styles.metaChipText}>{offer.etaMin} хв до подачі</Text>
                  </View>
                  <View style={styles.metaChip}>
                    <MaterialCommunityIcons
                      name={offer.payment === 'card' ? 'credit-card-outline' : 'cash-multiple'}
                      size={16}
                      color="#D8D2CF"
                    />
                    <Text style={styles.metaChipText}>
                      {offer.payment === 'card' ? 'Картка' : 'Готівка'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.offerNote}>{offer.note}</Text>

                <View style={styles.offerActions}>
                  <Pressable
                    onPress={() => handleDeclineOffer(offer.id)}
                    style={styles.skipButton}
                  >
                    <Text style={styles.skipButtonText}>Пропустити</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => handleAcceptOffer(offer)}
                    style={styles.acceptButton}
                  >
                    <Text style={styles.acceptButtonText}>Прийняти</Text>
                  </Pressable>
                </View>
              </View>
            ))}

            {offers.length === 0 ? (
              <View style={styles.queueDoneCard}>
                <Text style={styles.queueDoneTitle}>Черга тестових заявок порожня</Text>
                <Text style={styles.queueDoneText}>
                  Онови екран пізніше або перезапусти додаток, щоб знову побачити мокові заявки.
                </Text>
              </View>
            ) : null}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Швидкі дії</Text>
            <View style={styles.quickActionsRow}>
              <Pressable onPress={toggleOnline} style={styles.quickActionCard}>
                <MaterialCommunityIcons name="power" size={22} color="#FF6B4A" />
                <Text style={styles.quickActionTitle}>
                  {isOnline ? 'Вийти офлайн' : 'Повернутись онлайн'}
                </Text>
              </Pressable>
              <Pressable onPress={() => navigation.navigate('Login')} style={styles.quickActionCard}>
                <MaterialCommunityIcons name="logout" size={22} color="#FF6B4A" />
                <Text style={styles.quickActionTitle}>Назад до логіну</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 32,
    gap: 20,
  },
  heroCard: {
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 74, 0.22)',
    padding: 20,
    gap: 18,
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  driverMeta: {
    flex: 1,
    gap: 4,
  },
  eyebrow: {
    color: '#FF9B7C',
    fontSize: 13,
    textTransform: 'uppercase',
  },
  driverName: {
    color: '#FFF6F2',
    fontSize: 28,
    fontWeight: '700',
  },
  driverCaption: {
    color: '#CFC2BC',
    fontSize: 14,
    lineHeight: 20,
  },
  statusPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  statusPillOnline: {
    backgroundColor: 'rgba(59, 219, 164, 0.14)',
  },
  statusPillOffline: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusDotOnline: {
    backgroundColor: '#3BDBA4',
  },
  statusDotOffline: {
    backgroundColor: '#8F8782',
  },
  statusText: {
    color: '#FFF6F2',
    fontSize: 14,
    fontWeight: '600',
  },
  balancePanel: {
    borderRadius: 22,
    backgroundColor: '#FF6B4A',
    padding: 18,
    gap: 14,
  },
  balanceLabel: {
    color: '#FFE6DD',
    fontSize: 14,
  },
  balanceValue: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '800',
  },
  shiftBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(55, 16, 7, 0.22)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  shiftBadgeText: {
    color: '#FFF6F2',
    fontSize: 13,
    fontWeight: '600',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    gap: 6,
  },
  metricValue: {
    color: '#FFF6F2',
    fontSize: 24,
    fontWeight: '700',
  },
  metricLabel: {
    color: '#CFC2BC',
    fontSize: 13,
    lineHeight: 18,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 12,
  },
  sectionTitle: {
    color: '#FFF6F2',
    fontSize: 22,
    fontWeight: '700',
  },
  sectionHint: {
    color: '#B8AAA4',
    fontSize: 13,
  },
  activeRideCard: {
    borderRadius: 24,
    backgroundColor: '#171111',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 74, 0.18)',
    padding: 18,
    gap: 12,
  },
  routeBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 107, 74, 0.1)',
  },
  routeBadgeText: {
    color: '#FFD1C3',
    fontSize: 13,
    fontWeight: '600',
  },
  activeRideRoute: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
  },
  activeRideMeta: {
    color: '#D7CBC6',
    fontSize: 14,
  },
  activeRideNote: {
    color: '#B8AAA4',
    fontSize: 14,
    lineHeight: 20,
  },
  activeRideFooter: {
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  activeRidePriceLabel: {
    color: '#C6B7B0',
    fontSize: 12,
  },
  activeRidePrice: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
  },
  completeButton: {
    borderRadius: 16,
    backgroundColor: '#FF6B4A',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  emptyRideCard: {
    alignItems: 'center',
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 24,
    gap: 10,
  },
  emptyRideTitle: {
    color: '#FFF6F2',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyRideText: {
    color: '#B8AAA4',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  offerCard: {
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 18,
    gap: 12,
  },
  offerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  offerPassenger: {
    color: '#FFF6F2',
    fontSize: 18,
    fontWeight: '700',
  },
  offerRoute: {
    color: '#D7CBC6',
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
    maxWidth: 220,
  },
  offerFareChip: {
    alignSelf: 'flex-start',
    borderRadius: 16,
    backgroundColor: 'rgba(255, 107, 74, 0.14)',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  offerFareChipText: {
    color: '#FFD8CD',
    fontSize: 14,
    fontWeight: '700',
  },
  offerMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  metaChipText: {
    color: '#D8D2CF',
    fontSize: 13,
  },
  offerNote: {
    color: '#B8AAA4',
    fontSize: 14,
    lineHeight: 20,
  },
  offerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  skipButton: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    paddingVertical: 14,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#FFF6F2',
    fontSize: 15,
    fontWeight: '600',
  },
  acceptButton: {
    flex: 1.2,
    borderRadius: 16,
    backgroundColor: '#FF6B4A',
    paddingVertical: 14,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  queueDoneCard: {
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: 18,
    gap: 8,
  },
  queueDoneTitle: {
    color: '#FFF6F2',
    fontSize: 17,
    fontWeight: '700',
  },
  queueDoneText: {
    color: '#B8AAA4',
    fontSize: 14,
    lineHeight: 20,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 18,
    gap: 10,
  },
  quickActionTitle: {
    color: '#FFF6F2',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 21,
  },
});

export default DriverHome;

import React, { FC, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { usePassengerTheme } from '../../hooks/usePassengerTheme';
import { useUser } from '../../hooks/UserContext';
import {
  PassengerPalette,
  passengerSpacing,
} from '../../theme/passenger';
import { RootStackParamList } from '../../types/navigation';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const sanitizePhone = (value: string) => value.replace(/[^\d+]/g, '');
const normalizePhoneForUser = (value: string) => value.replace(/[^\d]/g, '');

const Login: FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { setUser } = useUser();
  const { palette, radius } = usePassengerTheme();
  const styles = useMemo(() => createStyles(palette, radius), [palette, radius]);
  const [step, setStep] = useState<'phone' | 'sms'>('phone');
  const [phone, setPhone] = useState('+380 ');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const phoneDigits = normalizePhoneForUser(phone);
  const maskedPhone = phone.trim();

  const handleRequestCode = () => {
    if (phoneDigits.length < 10) {
      setError('Введіть коректний номер телефону.');
      return;
    }

    setError('');
    setStep('sms');
  };

  const handleVerifyCode = async () => {
    if (code.trim().length < 4) {
      setError('SMS-код має містити щонайменше 4 цифри.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await AsyncStorage.setItem('authToken', `sms-${phoneDigits}`);
      setUser({
        id: phoneDigits,
        email: '',
        fullName: 'Пасажир',
        phoneNumber: maskedPhone,
        rating: 4.9,
        role: 'passenger',
      });
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch {
      setError('Не вдалося увійти. Перевірте інтернет і спробуйте ще раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.screen}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brandRow}>
            <View style={styles.logo}>
              <Ionicons color={palette.backgroundSecondary} name="navigate" size={28} />
            </View>
            <View>
              <Text style={styles.brand}>SwiftTaxi</Text>
              <Text style={styles.brandHint}>Швидке замовлення таксі</Text>
            </View>
          </View>

          <View style={styles.hero}>
            <Text style={styles.title}>
              {step === 'phone' ? 'Увійдіть за номером телефону' : 'Введіть SMS-код'}
            </Text>
            <Text style={styles.subtitle}>
              {step === 'phone'
                ? 'Потрібен лише номер. Маршрут і оплата будуть доступні одразу після входу.'
                : `Ми надіслали код на ${maskedPhone}. Для демо підійде будь-який код від 4 цифр.`}
            </Text>
          </View>

          <View style={styles.form}>
            {step === 'phone' ? (
              <Input
                autoFocus
                error={error}
                icon="call-outline"
                keyboardType="phone-pad"
                label="Номер телефону"
                onChangeText={(value) => {
                  setPhone(sanitizePhone(value));
                  setError('');
                }}
                placeholder="+380 00 000 00 00"
                textContentType="telephoneNumber"
                value={phone}
              />
            ) : (
              <Input
                autoFocus
                error={error}
                icon="keypad-outline"
                keyboardType="number-pad"
                label="SMS-код"
                maxLength={6}
                onChangeText={(value) => {
                  setCode(value.replace(/[^\d]/g, ''));
                  setError('');
                }}
                placeholder="0000"
                value={code}
              />
            )}

            <Button
              loading={loading}
              onPress={step === 'phone' ? handleRequestCode : handleVerifyCode}
              rightIcon={step === 'phone' ? 'arrow-forward' : 'checkmark'}
              subtitle={step === 'phone' ? '1 крок до замовлення' : 'Без пароля'}
              title={step === 'phone' ? 'Отримати SMS-код' : 'Увійти'}
            />

            {step === 'sms' ? (
              <TouchableOpacity activeOpacity={0.86} onPress={() => setStep('phone')} style={styles.textButton}>
                <Text style={styles.textButtonLabel}>Змінити номер</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={styles.secondaryActions}>
            <TouchableOpacity
              activeOpacity={0.86}
              onPress={() => navigation.navigate('RoleSelection')}
              style={styles.secondaryAction}
            >
              <Ionicons color={palette.text} name="person-add-outline" size={18} />
              <Text style={styles.secondaryActionText}>Зареєструватися</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.86}
              onPress={() => navigation.navigate('DriverHome')}
              style={styles.secondaryAction}
            >
              <Ionicons color={palette.text} name="car-sport-outline" size={18} />
              <Text style={styles.secondaryActionText}>Тестовий водій</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.stateCard}>
            <Ionicons color={palette.success} name="shield-checkmark-outline" size={18} />
            <Text style={styles.stateText}>
              Телефон використовується для підтвердження поїздки, контакту з водієм і підтримки.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = (
  palette: PassengerPalette,
  radius: typeof import('../../theme/passenger').passengerRadius
) =>
  StyleSheet.create({
    brand: {
      color: palette.text,
      fontSize: 22,
      fontWeight: '900',
    },
    brandHint: {
      color: palette.mutedText,
      fontSize: 13,
      fontWeight: '700',
      marginTop: 2,
    },
    brandRow: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: passengerSpacing.md,
    },
    content: {
      flexGrow: 1,
      gap: passengerSpacing.xxl,
      justifyContent: 'center',
      padding: passengerSpacing.xl,
    },
    form: {
      gap: passengerSpacing.lg,
    },
    hero: {
      gap: passengerSpacing.md,
    },
    logo: {
      alignItems: 'center',
      backgroundColor: palette.surfaceStrong,
      borderRadius: radius.lg,
      height: 58,
      justifyContent: 'center',
      width: 58,
    },
    safeArea: {
      backgroundColor: palette.backgroundSecondary,
      flex: 1,
    },
    screen: {
      flex: 1,
    },
    secondaryAction: {
      alignItems: 'center',
      backgroundColor: palette.surfaceMuted,
      borderRadius: radius.lg,
      flex: 1,
      flexDirection: 'row',
      gap: passengerSpacing.sm,
      justifyContent: 'center',
      minHeight: 50,
      paddingHorizontal: passengerSpacing.md,
    },
    secondaryActionText: {
      color: palette.text,
      fontSize: 13,
      fontWeight: '800',
    },
    secondaryActions: {
      flexDirection: 'row',
      gap: passengerSpacing.md,
    },
    stateCard: {
      alignItems: 'flex-start',
      backgroundColor: palette.successSoft,
      borderRadius: radius.lg,
      flexDirection: 'row',
      gap: passengerSpacing.sm,
      padding: passengerSpacing.lg,
    },
    stateText: {
      color: palette.text,
      flex: 1,
      fontSize: 13,
      fontWeight: '700',
      lineHeight: 19,
    },
    subtitle: {
      color: palette.mutedText,
      fontSize: 16,
      lineHeight: 23,
    },
    textButton: {
      alignItems: 'center',
      paddingVertical: passengerSpacing.sm,
    },
    textButtonLabel: {
      color: palette.text,
      fontSize: 14,
      fontWeight: '900',
    },
    title: {
      color: palette.text,
      fontSize: 32,
      fontWeight: '900',
      lineHeight: 38,
    },
  });

export default Login;

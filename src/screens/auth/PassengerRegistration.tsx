import React, { FC, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
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
import { registerPassenger } from '../../services/api/auth';
import {
  getEmailError,
  getPasswordError,
  getPhoneError,
  getFullNameError,
} from '../../utils/validation';

type PassengerRegistrationNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PassengerRegistration'>;

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

interface FormErrors {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

const PassengerRegistration: FC = () => {
  const navigation = useNavigation<PassengerRegistrationNavigationProp>();
  const { setUser } = useUser();
  const { palette, radius } = usePassengerTheme();
  const styles = useMemo(() => createStyles(palette, radius), [palette, radius]);

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  const [errors, setErrors] = useState<FormErrors>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const updateField = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (typeof value === 'string' && field in errors) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const fillWithTestData = () => {
    const timestamp = Date.now().toString().slice(-6);
    const phoneSuffix = timestamp.slice(0, 6).padEnd(6, '0');
    const testPassword = 'Hh123456789!';

    setFormData({
      fullName: 'Test Passenger',
      email: `passenger${timestamp}@test.dev`,
      phone: `2222${phoneSuffix}`,
      password: testPassword,
      confirmPassword: testPassword,
      acceptTerms: true,
    });

    setErrors({
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    });
  };

  const generatePassword = () => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    const getRandomChar = (str: string): string => {
      const index = Math.floor(Math.random() * str.length);
      return str[index] || str[0];
    };

    let password = '';
    password += getRandomChar(uppercase);
    password += getRandomChar(lowercase);
    password += getRandomChar(numbers);
    password += getRandomChar(symbols);

    const allChars = uppercase + lowercase + numbers + symbols;
    for (let i = password.length; i < 12; i++) {
      password += getRandomChar(allChars);
    }

    password = password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');

    setFormData((prev) => ({
      ...prev,
      password,
      confirmPassword: password,
    }));

    setErrors((prev) => ({
      ...prev,
      password: '',
      confirmPassword: '',
    }));
  };

  const validateAll = (): FormErrors => {
    return {
      fullName: getFullNameError(formData.fullName) || '',
      email: getEmailError(formData.email) || '',
      phone: getPhoneError(formData.phone) || '',
      password: getPasswordError(formData.password) || '',
      confirmPassword:
        formData.password !== formData.confirmPassword
          ? 'Паролі не співпадають'
          : '',
    };
  };

  const handleSubmit = async () => {
    if (!formData.acceptTerms) {
      Alert.alert('Помилка', 'Будь ласка, прийміть умови використання');
      return;
    }

    const newErrors = validateAll();
    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((e) => e !== '');
    if (hasErrors) return;

    try {
      setIsSubmitting(true);
      const { token, user } = await registerPassenger({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      await AsyncStorage.setItem('authToken', token);
      setUser(user);
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (error) {
      Alert.alert(
        'Помилка реєстрації',
        error instanceof Error ? error.message : 'Сталася помилка'
      );
    } finally {
      setIsSubmitting(false);
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
              <Ionicons color={palette.backgroundSecondary} name="person-add" size={28} />
            </View>
            <View>
              <Text style={styles.brand}>SwiftTaxi</Text>
              <Text style={styles.brandHint}>Реєстрація пасажира</Text>
            </View>
          </View>

          <View style={styles.hero}>
            <Text style={styles.title}>Створіть обліковий запис</Text>
            <Text style={styles.subtitle}>
              Заповніть форму для реєстрації. Після цього ви зможете одразу замовити таксі.
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              error={errors.fullName}
              icon="person-outline"
              label="Повне ім'я"
              onChangeText={(value) => updateField('fullName', value)}
              placeholder="Введіть ваше повне ім'я"
              autoCapitalize="words"
              value={formData.fullName}
            />

            <Input
              error={errors.email}
              icon="mail-outline"
              keyboardType="email-address"
              label="Email"
              onChangeText={(value) => updateField('email', value)}
              placeholder="Введіть ваш email"
              autoCapitalize="none"
              value={formData.email}
            />

            <Input
              error={errors.phone}
              icon="call-outline"
              keyboardType="phone-pad"
              label="Телефон"
              onChangeText={(value) => updateField('phone', value)}
              placeholder="Введіть номер телефону"
              value={formData.phone}
            />

            <Input
              error={errors.password}
              icon="lock-closed-outline"
              label="Пароль"
              onChangeText={(value) => updateField('password', value)}
              placeholder="Створіть пароль"
              secureTextEntry={!showPassword}
              value={formData.password}
              rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
              onRightIconPress={() => setShowPassword(!showPassword)}
            />

            <Input
              error={errors.confirmPassword}
              icon="shield-checkmark-outline"
              label="Підтвердження паролю"
              onChangeText={(value) => updateField('confirmPassword', value)}
              placeholder="Повторіть пароль"
              secureTextEntry={!showPassword}
              value={formData.confirmPassword}
            />

            <View style={styles.utilityRow}>
              <TouchableOpacity
                activeOpacity={0.86}
                onPress={fillWithTestData}
                style={styles.utilityButton}
              >
                <Ionicons color={palette.text} name="flask-outline" size={16} />
                <Text style={styles.utilityButtonText}>Тестові дані</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.86}
                onPress={generatePassword}
                style={styles.utilityButton}
              >
                <Ionicons color={palette.text} name="dice-outline" size={16} />
                <Text style={styles.utilityButtonText}>Згенерувати пароль</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={0.86}
              onPress={() => updateField('acceptTerms', !formData.acceptTerms)}
              style={styles.termsRow}
            >
              <Switch
                onValueChange={(value) => updateField('acceptTerms', value)}
                thumbColor="#FFFFFF"
                trackColor={{ false: palette.border, true: palette.accent }}
                value={formData.acceptTerms}
              />
              <Text style={styles.termsText}>
                Я погоджуюсь з умовами використання та політикою конфіденційності
              </Text>
            </TouchableOpacity>

            <Button
              disabled={!formData.acceptTerms}
              loading={isSubmitting}
              onPress={handleSubmit}
              rightIcon="arrow-forward"
              subtitle="Повний доступ одразу"
              title="Зареєструватися"
            />
          </View>

          <View style={styles.secondaryActions}>
            <TouchableOpacity
              activeOpacity={0.86}
              onPress={() => navigation.navigate('Login')}
              style={styles.secondaryAction}
            >
              <Ionicons color={palette.text} name="log-in-outline" size={18} />
              <Text style={styles.secondaryActionText}>Вже маєте акаунт? Увійти</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.stateCard}>
            <Ionicons color={palette.success} name="shield-checkmark-outline" size={18} />
            <Text style={styles.stateText}>
              Ваші дані захищені шифруванням. Ми не передаємо інформацію третім особам.
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
    termsRow: {
      alignItems: 'center',
      backgroundColor: palette.surfaceMuted,
      borderRadius: radius.lg,
      flexDirection: 'row',
      gap: passengerSpacing.md,
      padding: passengerSpacing.lg,
    },
    termsText: {
      color: palette.text,
      flex: 1,
      fontSize: 13,
      fontWeight: '700',
      lineHeight: 19,
    },
    title: {
      color: palette.text,
      fontSize: 32,
      fontWeight: '900',
      lineHeight: 38,
    },
    utilityButton: {
      alignItems: 'center',
      backgroundColor: palette.surfaceMuted,
      borderColor: palette.border,
      borderRadius: radius.lg,
      borderWidth: 1,
      flex: 1,
      flexDirection: 'row',
      gap: passengerSpacing.sm,
      justifyContent: 'center',
      minHeight: 44,
      paddingHorizontal: passengerSpacing.md,
    },
    utilityButtonText: {
      color: palette.text,
      fontSize: 13,
      fontWeight: '800',
    },
    utilityRow: {
      flexDirection: 'row',
      gap: passengerSpacing.md,
    },
  });

export default PassengerRegistration;

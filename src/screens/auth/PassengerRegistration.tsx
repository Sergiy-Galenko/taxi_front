import React, { FC, useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  Dimensions,
  ScrollView,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Button, Text, Switch } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { CustomInput } from '../../components/CustomInput';
import {
  getEmailError,
  getPasswordError,
  getPhoneError,
  getFullNameError,
} from '../../utils/validation';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Animatable from 'react-native-animatable';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerPassenger } from '../../services/api/auth';
import { useUser } from '../../hooks/UserContext';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const ACCENT = '#FF1744';
const BG_DARK = '#050509';

type PassengerRegistrationScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PassengerRegistration'
>;

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  countryCode: string;
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

interface FormTouched {
  fullName: boolean;
  email: boolean;
  phone: boolean;
  password: boolean;
  confirmPassword: boolean;
}

const initialFormData: FormData = {
  fullName: '',
  email: '',
  phone: '',
  countryCode: '+380',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
};

const initialErrors: FormErrors = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
};

const initialTouched: FormTouched = {
  fullName: false,
  email: false,
  phone: false,
  password: false,
  confirmPassword: false,
};

const countryCodes = [
  { code: '+380', name: 'Україна', flag: '🇺🇦' },
  { code: '+48', name: 'Польща', flag: '🇵🇱' },
  { code: '+1', name: 'США', flag: '🇺🇸' },
  { code: '+44', name: 'Велика Британія', flag: '🇬🇧' },
  { code: '+49', name: 'Німеччина', flag: '🇩🇪' },
];

const PassengerRegistration: FC = () => {
  const navigation = useNavigation<PassengerRegistrationScreenNavigationProp>();
  const { setUser } = useUser();

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>(initialErrors);
  const [touched, setTouched] = useState<FormTouched>(initialTouched);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const buttonScale = useRef(new Animated.Value(1)).current;
  const formYPosition = useRef(new Animated.Value(40)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(formYPosition, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, [formYPosition, headerOpacity]);

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateAll = (data: FormData): FormErrors => {
    return {
      fullName: getFullNameError(data.fullName) || '',
      email: getEmailError(data.email) || '',
      phone: getPhoneError(data.phone) || '',
      password: getPasswordError(data.password) || '',
      confirmPassword:
        data.password !== data.confirmPassword ? 'Паролі не співпадають' : '',
    };
  };

  const validateField = (field: keyof FormData, data: FormData = formData) => {
    const fieldErrors = validateAll(data);
    setErrors(prev => ({ ...prev, [field]: (fieldErrors as any)[field] || '' }));
  };

  const handleBlur = (field: keyof FormTouched) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field as keyof FormData);
  };

  const selectCountryCode = (code: string) => {
    setFormData(prev => ({ ...prev, countryCode: code }));
    setShowCountryPicker(false);
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

    password = password.split('').sort(() => Math.random() - 0.5).join('');

    const newData = {
      ...formData,
      password,
      confirmPassword: password,
    };

    setFormData(newData);
    const fieldErrors = validateAll(newData);
    setErrors(fieldErrors);
  };

  const animateButton = (scale: number) => {
    Animated.spring(buttonScale, {
      toValue: scale,
      useNativeDriver: true,
      tension: 40,
      friction: 6,
    }).start();
  };

  const handleSubmit = async () => {
    if (!formData.acceptTerms) {
      Alert.alert('Помилка', 'Будь ласка, прийміть умови використання');
      return;
    }

    const validationErrors = validateAll(formData);
    setErrors(validationErrors);
    setTouched({
      fullName: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
    });

    const hasErrors = Object.values(validationErrors).some(e => e !== '');
    if (hasErrors) return;

    try {
      setIsSubmitting(true);

      const { token, user } = await registerPassenger({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: `${formData.countryCode}${formData.phone.trim()}`,
        password: formData.password,
      });

      await AsyncStorage.setItem('authToken', token);
      setUser(user);
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (error) {
      Alert.alert(
        'Помилка реєстрації',
        error instanceof Error ? error.message : 'Сталася помилка. Спробуйте ще раз.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasAnyError =
    Object.values(errors).some(e => e) &&
    Object.values(touched).some(t => t === true);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient
          colors={['#050308', '#08010f', '#050308']}
          style={styles.gradient}
        >
          <View style={styles.circleTopRight} />
          <View style={styles.circleBottomLeft} />
          <View style={styles.circleMiddle} />
        </LinearGradient>

        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              style={[
                styles.header,
                {
                  opacity: headerOpacity,
                  transform: [{ translateY: formYPosition }],
                },
              ]}
            >
              <View style={styles.logoContainer}>
                <MaterialIcons name="local-taxi" size={56} color={ACCENT} />
              </View>
              <Text style={styles.title}>Реєстрація пасажира</Text>
              <Text style={styles.subtitle}>
                Створіть акаунт, щоб швидко замовляти поїздки та зберігати свої
                улюблені місця.
              </Text>
            </Animated.View>

            <Animatable.View animation="fadeInUp" delay={200} style={styles.formWrapper}>
              <BlurView intensity={40} tint="dark" style={styles.formContainer}>
                <View style={styles.formHeaderRow}>
                  <View>
                    <Text style={styles.formTitle}>Ваші дані</Text>
                    <Text style={styles.formSubtitle}>
                      Заповніть поля нижче, щоб продовжити
                    </Text>
                  </View>
                </View>

                <View style={styles.formBody}>
                  <CustomInput
                    label="Повне ім'я"
                    value={formData.fullName}
                    onChangeText={text => handleChange('fullName', text)}
                    onBlur={() => handleBlur('fullName')}
                    error={touched.fullName ? errors.fullName : ''}
                    icon="account"
                    autoCapitalize="words"
                    placeholder="Наприклад, Іван Петренко"
                  />

                  <CustomInput
                    label="Email"
                    value={formData.email}
                    onChangeText={text => handleChange('email', text)}
                    onBlur={() => handleBlur('email')}
                    error={touched.email ? errors.email : ''}
                    icon="email"
                    keyboardType="email-address"
                    placeholder="name@example.com"
                  />

                  {/* Телефон */}
                  <View style={styles.phoneBlock}>
                    <Text style={styles.phoneLabel}>Номер телефону</Text>
                    <View style={styles.phoneRow}>
                      <TouchableWithoutFeedback
                        onPress={() => setShowCountryPicker(prev => !prev)}
                      >
                        <View style={styles.countryCodeBox}>
                          <Text style={styles.countryCodeText}>
                            {formData.countryCode}
                          </Text>
                          <Ionicons
                            name={showCountryPicker ? 'chevron-up' : 'chevron-down'}
                            size={16}
                            color={ACCENT}
                          />
                        </View>
                      </TouchableWithoutFeedback>

                      <View style={styles.phoneInputWrapper}>
                        <CustomInput
                          label=""
                          value={formData.phone}
                          onChangeText={text => handleChange('phone', text)}
                          onBlur={() => handleBlur('phone')}
                          error={touched.phone ? errors.phone : ''}
                          containerStyle={styles.phoneInputContainer}
                          keyboardType="phone-pad"
                          placeholder="(___) ___ __ __"
                        />
                      </View>
                    </View>

                    {showCountryPicker && (
                      <Animatable.View
                        animation="fadeIn"
                        style={styles.countryPicker}
                      >
                        {countryCodes.map(country => (
                          <TouchableWithoutFeedback
                            key={country.code}
                            onPress={() => selectCountryCode(country.code)}
                          >
                            <View style={styles.countryItem}>
                              <Text style={styles.countryFlag}>{country.flag}</Text>
                              <View style={styles.countryTextBlock}>
                                <Text style={styles.countryName}>{country.name}</Text>
                                <Text style={styles.countryCodeSmall}>
                                  Код: {country.code}
                                </Text>
                              </View>
                            </View>
                          </TouchableWithoutFeedback>
                        ))}
                      </Animatable.View>
                    )}
                  </View>

                  <CustomInput
                    label="Пароль"
                    value={formData.password}
                    onChangeText={text => handleChange('password', text)}
                    onBlur={() => handleBlur('password')}
                    error={touched.password ? errors.password : ''}
                    secureTextEntry
                    icon="lock"
                    placeholder="Мінімум 8 символів, цифри та букви"
                  />

                  <CustomInput
                    label="Підтвердження паролю"
                    value={formData.confirmPassword}
                    onChangeText={text =>
                      handleChange('confirmPassword', text)
                    }
                    onBlur={() => handleBlur('confirmPassword')}
                    error={touched.confirmPassword ? errors.confirmPassword : ''}
                    secureTextEntry
                    icon="lock-check"
                    placeholder="Повторіть пароль"
                  />

                  <View style={styles.generateButtonContainer}>
                    <Button
                      mode="outlined"
                      onPress={generatePassword}
                      style={styles.generateButton}
                      icon="dice-multiple"
                      contentStyle={styles.generateButtonContent}
                      labelStyle={styles.generateButtonLabel}
                    >
                      Згенерувати надійний пароль
                    </Button>
                  </View>

                  <View style={styles.termsContainer}>
                    <Switch
                      value={formData.acceptTerms}
                      onValueChange={value => handleChange('acceptTerms', value)}
                      color={ACCENT}
                    />
                    <Text style={styles.termsText}>
                      Я погоджуюсь з{' '}
                      <Text style={styles.linkText}>умовами використання</Text> та{' '}
                      <Text style={styles.linkText}>
                        політикою конфіденційності
                      </Text>
                    </Text>
                  </View>

                  {hasAnyError && (
                    <View style={styles.errorSummary}>
                      <Ionicons name="warning" size={18} color={ACCENT} />
                      <Text style={styles.errorSummaryText}>
                        Перевірте, будь ласка, виділені поля — деякі дані заповнені
                        некоректно.
                      </Text>
                    </View>
                  )}

                  <Animatable.View animation="fadeIn" delay={150}>
                    <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                      <Button
                        mode="contained"
                        onPress={handleSubmit}
                        style={styles.primaryButton}
                        contentStyle={styles.primaryButtonContent}
                        labelStyle={styles.primaryButtonLabel}
                        disabled={isSubmitting || !formData.acceptTerms}
                        onPressIn={() => animateButton(0.97)}
                        onPressOut={() => animateButton(1)}
                        icon="account-plus"
                      >
                        {isSubmitting ? 'Реєстрація...' : 'Зареєструватися'}
                      </Button>
                    </Animated.View>
                  </Animatable.View>

                  <View style={styles.loginRow}>
                    <Text style={styles.loginText}>
                      Вже маєте обліковий запис?
                    </Text>
                    <Button
                      mode="text"
                      onPress={() => navigation.navigate('Login')}
                      textColor={ACCENT}
                      labelStyle={styles.loginButtonLabel}
                    >
                      Увійти
                    </Button>
                  </View>
                </View>
              </BlurView>
            </Animatable.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default PassengerRegistration;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG_DARK,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  keyboardAvoid: {
    flex: 1,
  },
  circleTopRight: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: (width * 0.8) / 2,
    backgroundColor: ACCENT,
    opacity: 0.12,
    top: -width * 0.3,
    right: -width * 0.2,
  },
  circleBottomLeft: {
    position: 'absolute',
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: (width * 0.7) / 2,
    backgroundColor: '#B71C1C',
    opacity: 0.12,
    bottom: -width * 0.25,
    left: -width * 0.25,
  },
  circleMiddle: {
    position: 'absolute',
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: (width * 0.5) / 2,
    backgroundColor: '#D32F2F',
    opacity: 0.08,
    top: height * 0.25,
    right: -width * 0.15,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 26,
  },
  logoContainer: {
    marginBottom: 16,
    backgroundColor: 'rgba(10, 10, 16, 0.95)',
    padding: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 23, 68, 0.65)',
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 12,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#F9FAFB',
    textAlign: 'center',
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#E5E7EB',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 320,
    opacity: 0.9,
  },
  formWrapper: {
    flex: 1,
  },
  formContainer: {
    borderRadius: 24,
    padding: 20,
    backgroundColor: 'rgba(5, 5, 12, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.35)',
    overflow: 'hidden',
  },
  formHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F3F4F6',
  },
  formSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
  },
  formBody: {
    marginTop: 4,
  },
  // Phone
  phoneBlock: {
    marginTop: 10,
    marginBottom: 6,
  },
  phoneLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#F3F4F6',
    marginBottom: 6,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryCodeBox: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 23, 68, 0.7)',
    backgroundColor: 'rgba(10, 10, 16, 0.98)',
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  countryCodeText: {
    color: ACCENT,
    fontWeight: '700',
    fontSize: 16,
    marginRight: 6,
  },
  phoneInputWrapper: {
    flex: 1,
  },
  phoneInputContainer: {
    marginTop: 0,
  },
  countryPicker: {
    marginTop: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(5, 5, 12, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.6)',
    paddingVertical: 4,
    maxHeight: 220,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  countryFlag: {
    fontSize: 22,
    marginRight: 10,
  },
  countryTextBlock: {
    flex: 1,
  },
  countryName: {
    color: '#F3F4F6',
    fontSize: 15,
    fontWeight: '600',
  },
  countryCodeSmall: {
    color: '#FCA5A5',
    fontSize: 13,
    marginTop: 1,
  },
  // Generate password
  generateButtonContainer: {
    marginTop: 14,
    marginBottom: 10,
  },
  generateButton: {
    height: 46,
    borderRadius: 16,
    borderColor: ACCENT,
    borderWidth: 1.3,
    backgroundColor: 'rgba(255, 23, 68, 0.1)',
  },
  generateButtonContent: {
    height: 46,
  },
  generateButtonLabel: {
    color: ACCENT,
    fontWeight: '600',
    fontSize: 14,
  },
  // Terms
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 14,
    marginBottom: 16,
    padding: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(10, 10, 16, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.45)',
  },
  termsText: {
    marginLeft: 10,
    color: '#F9FAFB',
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  linkText: {
    color: ACCENT,
    fontWeight: '600',
  },
  errorSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 113, 113, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.6)',
    marginBottom: 10,
  },
  errorSummaryText: {
    marginLeft: 8,
    color: '#FCA5A5',
    fontSize: 13,
    flex: 1,
  },
  primaryButton: {
    height: 52,
    borderRadius: 18,
    backgroundColor: ACCENT,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 12,
    marginTop: 4,
  },
  primaryButtonContent: {
    height: 52,
  },
  primaryButtonLabel: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.4)',
    paddingTop: 14,
  },
  loginText: {
    color: '#E5E7EB',
    fontSize: 14,
    marginRight: 6,
  },
  loginButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
});

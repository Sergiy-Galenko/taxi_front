import React, { FC, useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Button, Text } from 'react-native-paper';
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { CustomInput } from '../../components/CustomInput';
import { getEmailError, getPasswordError } from '../../utils/validation';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginPassenger } from '../../services/api/auth';
import { useUser } from '../../hooks/UserContext';

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Login'
>;

const { width, height } = Dimensions.get('window');

const ACCENT = '#FF1744';
const BG_DARK = '#050509';

const Login: FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { setUser } = useUser();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const buttonScale = useRef(new Animated.Value(1)).current;
  const formYPosition = useRef(new Animated.Value(40)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(1)).current;

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

    Animated.loop(
      Animated.sequence([
        Animated.timing(logoScale, {
          toValue: 1.06,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [formYPosition, headerOpacity, logoScale]);

  const animateButton = (scale: number) => {
    Animated.spring(buttonScale, {
      toValue: scale,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  };

  const handleBlur = (field: keyof typeof touched) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field as keyof typeof formData);
  };

  const validateField = (field: keyof typeof formData) => {
    let error = '';
    switch (field) {
      case 'email':
        error = getEmailError(formData.email) || '';
        break;
      case 'password':
        error = getPasswordError(formData.password) || '';
        break;
    }
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleLogin = async () => {
    const newErrors = {
      email: getEmailError(formData.email) || '',
      password: getPasswordError(formData.password) || '',
    };
    setErrors(newErrors);
    setTouched({ email: true, password: true });

    const hasErrors = Object.values(newErrors).some(error => error !== '');
    if (hasErrors) {
      return;
    }

    try {
      setIsSubmitting(true);

      const { token, user } = await loginPassenger({
        email: formData.email.trim(),
        password: formData.password,
      });

      await AsyncStorage.setItem('authToken', token);
      setUser(user);
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (error) {
      Alert.alert(
        'Помилка входу',
        error instanceof Error ? error.message : 'Сталася помилка'
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
                <Animated.View style={[styles.logoWrapper, { transform: [{ scale: logoScale }] }]}>
                  <MaterialIcons name="local-taxi" size={60} color={ACCENT} />
                </Animated.View>
                <Text style={styles.appName}>TAXI APP</Text>
                <Text style={styles.appSubtitle}>Швидко. Стильно. Безпечно.</Text>
              </Animated.View>

              <Animatable.View animation="fadeInUp" delay={200} style={styles.formWrapper}>
                <BlurView intensity={40} tint="dark" style={styles.blurContainer}>
                  <View style={styles.formContent}>
                    <View style={styles.formHeader}>
                      <Text style={styles.title}>Ласкаво просимо!</Text>
                      <Text style={styles.subtitle}>Увійдіть у свій акаунт</Text>
                    </View>

                    <View style={styles.form}>
                      <Animatable.View
                        animation="fadeInRight"
                        duration={600}
                        delay={150}
                      >
                        <CustomInput
                          label="Електронна пошта"
                          value={formData.email}
                          onChangeText={text =>
                            setFormData(prev => ({ ...prev, email: text }))
                          }
                          onBlur={() => handleBlur('email')}
                          error={touched.email ? errors.email : ''}
                          icon="email"
                          keyboardType="email-address"
                          placeholder="your@email.com"
                        />
                      </Animatable.View>

                      <Animatable.View
                        animation="fadeInRight"
                        duration={600}
                        delay={300}
                      >
                        <CustomInput
                          label="Пароль"
                          value={formData.password}
                          onChangeText={text =>
                            setFormData(prev => ({ ...prev, password: text }))
                          }
                          onBlur={() => handleBlur('password')}
                          error={touched.password ? errors.password : ''}
                          secureTextEntry
                          icon="lock"
                          placeholder="••••••••"
                        />
                      </Animatable.View>

                      {hasAnyError && (
                        <View style={styles.errorSummary}>
                          <Text style={styles.errorSummaryText}>
                            Перевірте, будь ласка, виділені поля — деякі дані
                            заповнені некоректно.
                          </Text>
                        </View>
                      )}

                      <Animatable.View
                        animation="fadeInUp"
                        duration={700}
                        delay={450}
                        style={styles.buttonContainer}
                      >
                        <Animated.View
                          style={{ transform: [{ scale: buttonScale }] }}
                        >
                          <Button
                            mode="contained"
                            onPress={handleLogin}
                            style={styles.loginButton}
                            contentStyle={styles.buttonContent}
                            labelStyle={styles.buttonLabel}
                            onPressIn={() => animateButton(0.95)}
                            onPressOut={() => animateButton(1)}
                            icon="login"
                            loading={isSubmitting}
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? 'Вхід...' : 'Увійти'}
                          </Button>
                        </Animated.View>
                      </Animatable.View>
                    </View>

                    <Animatable.View
                      animation="fadeIn"
                      duration={700}
                      delay={550}
                      style={styles.footer}
                    >
                      <Text style={styles.footerText}>Немає акаунту?</Text>
                      <Button
                        mode="text"
                        onPress={() => navigation.navigate('PassengerRegistration')}
                        textColor={ACCENT}
                        labelStyle={styles.footerButtonLabel}
                      >
                        Зареєструватися
                      </Button>
                    </Animatable.View>
                  </View>
                </BlurView>
              </Animatable.View>
            </ScrollView>
          </KeyboardAvoidingView>
        </LinearGradient>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default Login;

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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 60, // <-- ОПУСТИВ КОНТЕНТ НИЖЧЕ
    paddingBottom: 32,
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

  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoWrapper: {
    marginBottom: 14,
    backgroundColor: 'rgba(10,10,16,0.96)',
    padding: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,23,68,0.65)',
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 12,
  },
  appName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#F9FAFB',
    letterSpacing: 1.4,
    marginBottom: 4,
  },
  appSubtitle: {
    fontSize: 14,
    color: '#E5E7EB',
    opacity: 0.85,
  },

  formWrapper: {
    flex: 1,
  },
  blurContainer: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  formContent: {
    backgroundColor: 'rgba(5,5,12,0.96)',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.45)',
  },
  formHeader: {
    alignItems: 'center',
    marginBottom: 22,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#D1D5DB',
    opacity: 0.9,
  },
  form: {
    gap: 18,
  },

  errorSummary: {
    marginTop: 4,
    backgroundColor: 'rgba(248,113,113,0.08)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.6)',
  },
  errorSummaryText: {
    color: '#FCA5A5',
    fontSize: 13,
  },

  buttonContainer: {
    marginTop: 8,
  },
  loginButton: {
    height: 54,
    borderRadius: 18,
    backgroundColor: ACCENT,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 10,
  },
  buttonContent: {
    height: 54,
  },
  buttonLabel: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.4,
  },

  footer: {
    marginTop: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(148,163,184,0.4)',
    paddingTop: 12,
  },
  footerText: {
    fontSize: 14,
    color: '#E5E7EB',
    marginBottom: 6,
  },
  footerButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
});

import { useI18n } from '../../hooks/useI18n';
import { useReducedMotion } from '../../shared/hooks/useReducedMotion';
import AuthScreenFrame from '../../shared/components/AuthScreenFrame';
import React, { FC, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Button, Text } from 'react-native-paper';
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { CustomInput } from '../../components/CustomInput';
import { getEmailError } from '../../utils/validation';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useUser } from '../../hooks/UserContext';
import { loginUser } from '../../services/api/auth';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const Login: FC = () => {
  const { t } = useI18n();
  const reducedMotion = useReducedMotion();
  const navigation = useNavigation<LoginScreenNavigationProp>();
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

  const buttonScale = React.useRef(new Animated.Value(1)).current;
  const formYPosition = React.useRef(new Animated.Value(50)).current;
  const logoScale = React.useRef(new Animated.Value(1)).current;

  const { signIn, state } = useUser();
  const submitting = React.useRef(false);
  const request = React.useRef<AbortController | null>(null);
  React.useEffect(() => () => request.current?.abort(), []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (reducedMotion) { formYPosition.setValue(0); logoScale.setValue(1); return; }
    Animated.timing(formYPosition, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
      delay: 300,
    }).start();

    // Пульсація логотипу
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(logoScale, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => { pulse.stop(); formYPosition.stopAnimation(); };
  }, [formYPosition, logoScale, reducedMotion]);

  const animateButton = (scale: number) => {
    Animated.spring(buttonScale, {
      toValue: scale,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  };

  const handleBlur = (field: keyof typeof touched) => {
    setTouched({ ...touched, [field]: true });
    validateField(field);
  };

  const validateField = (field: keyof typeof formData) => {
    let error = '';
    switch (field) {
      case 'email': {
        const emailError = getEmailError(formData.email);
        error = emailError || '';
        break;
      }
      case 'password': {
        const passwordError = formData.password ? null : t("Введіть пароль");
        error = passwordError || '';
        break;
      }
    }
    setErrors({ ...errors, [field]: error });
  };

  const handleLogin = async () => {
    if (submitting.current) return;
    setTouched({ email: true, password: true });
    // Нова перевірка помилок
    const newErrors = {
      email: getEmailError(formData.email) || '',
      password: formData.password ? '' : t("Введіть пароль"),
    };
    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((error) => error !== '');
    if (hasErrors) {
      return;
    }

    submitting.current = true;
    setIsSubmitting(true);
    try {
      request.current = new AbortController();
      const { token, user } = await loginUser(formData, request.current.signal);
      if (request.current.signal.aborted) return;
      await signIn(token, user);
    } catch (error) {
      if (request.current?.signal.aborted) return;
      alert(error instanceof Error ? error.message : t("Помилка мережі або сервера"));
    } finally {
      submitting.current = false;
      if (!request.current?.signal.aborted) setIsSubmitting(false);
    }
  };

  return (
    <AuthScreenFrame>
    <LinearGradient
        colors={['#1a1a1a', '#000']}
        style={styles.container}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
      >
        {/* Декоративні елементи */}
        <View style={styles.decorativeCircle} />
        <View style={[styles.decorativeCircle, styles.circleTopRight]} />

        <View style={styles.logoContainer}>
          <Animated.View style={{ transform: [{ scale: logoScale }] }}>
            <MaterialIcons name="local-taxi" size={80} color="#FF3B30" />
          </Animated.View>
          <Text style={styles.appName}>TAXI APP</Text>
        </View>

        <Animated.View
          style={[
            styles.formContainer,
            { transform: [{ translateY: formYPosition }] }
          ]}
        >
          <BlurView intensity={30} tint="dark" pointerEvents="box-none" style={styles.blurContainer}>
            <View style={styles.formContent}>
              <Animatable.View
                animation={reducedMotion ? undefined : 'fadeIn'}
                duration={1000}
                style={styles.formHeader}
              >
                <Text style={styles.title}>{t("Ласкаво просимо!")}</Text>
                <Text style={styles.subtitle}>{t("Увійдіть у свій акаунт")}</Text>
              </Animatable.View>

              {state.status === 'expired' ? <Text accessibilityLiveRegion="polite" style={styles.subtitle}>{t('integration.sessionExpired')}</Text> : null}
              <View style={styles.form}>
                <Animatable.View animation={reducedMotion ? undefined : 'fadeInRight'} duration={600} delay={200}>
                  <CustomInput
                    label={t("Електронна пошта")}
                    value={formData.email}
                    onChangeText={(text) => setFormData({ ...formData, email: text })}
                    onBlur={() => handleBlur('email')}
                    error={touched.email ? errors.email : ''}
                    icon="email"
                    keyboardType="email-address"
                    placeholder="your@email.com"
                  />
                </Animatable.View>

                <Animatable.View animation={reducedMotion ? undefined : 'fadeInRight'} duration={600} delay={400}>
                  <CustomInput
                    label={t("Пароль")}
                    value={formData.password}
                    onChangeText={(text) => setFormData({ ...formData, password: text })}
                    onBlur={() => handleBlur('password')}
                    error={touched.password ? errors.password : ''}
                    secureTextEntry
                    icon="lock"
                    placeholder="••••••••"
                  />
                </Animatable.View>

                <Animatable.View
                  animation={reducedMotion ? undefined : 'fadeInUp'}
                  duration={800}
                  delay={600}
                  style={styles.buttonContainer}
                >
                  <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                    <Button
                      mode="contained"
                      onPress={handleLogin}
                      disabled={isSubmitting}
                      loading={isSubmitting}
                      style={styles.loginButton}
                      contentStyle={styles.buttonContent}
                      labelStyle={styles.buttonLabel}
                      onPressIn={() => animateButton(0.95)}
                      onPressOut={() => animateButton(1)}
                      icon="login"
                    >{t("Увійти")}</Button>
                  </Animated.View>
                </Animatable.View>
              </View>

              <Animatable.View
                animation={reducedMotion ? undefined : 'fadeIn'}
                duration={1000}
                delay={800}
                style={styles.footer}
              >
                <Text style={styles.footerText}>{t("Немає акаунту?")}</Text>

                <View style={styles.registrationButtons}>
                  <Button
                    mode="contained"
                    onPress={() => navigation.navigate('RoleSelection')}
                    style={styles.registrationButton}
                    contentStyle={styles.regButtonContent}
                    labelStyle={styles.regButtonLabel}
                    icon="account-plus"
                  >{t("Зареєструватися")}</Button>
                </View>
              </Animatable.View>
            </View>
          </BlurView>
        </Animated.View>
      </LinearGradient>

    </AuthScreenFrame>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 2,
    marginTop: 10,
    textShadowColor: 'rgba(255, 59, 48, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  formContainer: {
    flex: 1,
    marginTop: 20,
  },
  blurContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    padding: 1,
  },
  formContent: {
    backgroundColor: 'rgba(30, 30, 30, 0.7)',
    borderRadius: 24,
    padding: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.2)',
  },
  formHeader: {
    alignItems: 'center',
    marginBottom: 25,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
  },
  form: {
    gap: 20,
  },
  buttonContainer: {
    marginTop: 15,
  },
  testButtonContainer: {
    marginTop: 4,
  },
  driverTestButtonContainer: {
    marginTop: -6,
  },
  testButton: {
    borderRadius: 14,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  testButtonContent: {
    minHeight: 52,
  },
  testButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  driverTestButton: {
    borderRadius: 14,
    borderColor: 'rgba(255, 59, 48, 0.45)',
    backgroundColor: 'rgba(255, 59, 48, 0.08)',
  },
  driverTestButtonLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  loginButton: {
    minHeight: 56,
    borderRadius: 14,
    backgroundColor: '#FF3B30',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonContent: {
    minHeight: 56,
  },
  buttonLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    marginTop: 25,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 15,
  },
  registrationButtons: {
    width: '100%',
  },
  registrationButton: {
    minHeight: 56,
    borderRadius: 14,
    backgroundColor: '#FF3B30',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  regButtonContent: {
    minHeight: 56,
  },
  regButtonLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  decorativeCircle: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255, 59, 48, 0.08)',
    top: -150,
    left: -100,
  },
  circleTopRight: {
    top: -100,
    left: 'auto',
    right: -150,
  },
});

export default Login;

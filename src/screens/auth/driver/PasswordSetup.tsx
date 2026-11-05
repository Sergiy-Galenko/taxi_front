import { useI18n } from '../../../hooks/useI18n';
import { createPassword } from '../../../utils/password';
import { useReducedMotion } from '../../../shared/hooks/useReducedMotion';
import AuthScreenFrame from '../../../shared/components/AuthScreenFrame';
import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { TextInput, Button, Text, IconButton, HelperText, Switch } from 'react-native-paper';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NavigationProp, RootStackParamList } from '../../../types/navigation';
import { getPasswordError } from '../../../utils/validation';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../../hooks/useTheme';
import { registerDriver } from '../../../services/api/driver';
import { showMessage } from 'react-native-flash-message';

export default function DriverPasswordSetup() {
  const { t } = useI18n();
  const reducedMotion = useReducedMotion();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'DriverPasswordSetup'>>();
  const {
    fullName,
    email,
    phone,
    carModel,
    carColor,
    carNumber,
    yearsOfExperience,
    licenseNumber,
  } = route.params;

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState({
    password: '',
    confirmPassword: '',
  });
  const [touched, setTouched] = useState({
    password: false,
    confirmPassword: false,
  });
  const submitting = React.useRef(false);
  const request = React.useRef<AbortController | null>(null);
  React.useEffect(() => () => request.current?.abort(), []);
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useTheme();

  const validateForm = () => {
    setTouched({ password: true, confirmPassword: true });
    const passwordError = getPasswordError(formData.password);
    const confirmPasswordError = formData.password !== formData.confirmPassword
      ? t("Паролі не співпадають")
      : '';

    setErrors({
      password: passwordError || '',
      confirmPassword: confirmPasswordError,
    });

    return !passwordError && !confirmPasswordError;
  };

  const handleSubmit = async () => {
    if (submitting.current) return;
    if (!termsAccepted) {
      showMessage({
        message: 'Please accept the terms and conditions',
        type: 'warning',
      });
      return;
    }

    if (validateForm()) {
      submitting.current = true;
      try {
        setIsLoading(true);
        const registrationData = {
          fullName,
          email,
          phone,
          carModel,
          carColor,
          carNumber,
          yearsOfExperience: parseInt(yearsOfExperience, 10),
          licenseNumber,
          password: formData.password,
        };

        request.current = new AbortController();
        const response = await registerDriver(registrationData, request.current.signal);
        if (request.current.signal.aborted) return;

        if (response.success && response.data) {
          navigation.reset({ index: 0, routes: [{ name: 'Login' }, { name: 'DriverVerification' }] });
        } else {
          throw new Error('Registration was not confirmed by the server.');
        }
      } catch (error) {
        if (request.current?.signal.aborted) return;
        showMessage({
          message: error instanceof Error ? error.message : 'Registration failed',
          type: 'danger',
        });
      } finally {
        submitting.current = false;
        if (!request.current?.signal.aborted) setIsLoading(false);
      }
    }
  };

  const handleBlur = (field: 'password' | 'confirmPassword') => {
    setTouched(prev => ({ ...prev, [field]: true }));
    if (field === 'password') {
      setErrors(prev => ({ ...prev, password: getPasswordError(formData.password) || '' }));
    } else {
      setErrors(prev => ({
        ...prev,
        confirmPassword: formData.password !== formData.confirmPassword ? t("Паролі не співпадають") : '',
      }));
    }
  };

  const generatePassword = () => {
    const password = createPassword();
    setFormData({
      password,
      confirmPassword: password,
    });
    setShowPassword(true);
    setErrors({
      password: '',
      confirmPassword: '',
    });
  };

  return (
    <AuthScreenFrame>
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.container}>
          <LinearGradient
            colors={['#1A1A1A', '#2A2A2A']}
            style={styles.background}
          />

          {/* Decorative circles */}
          <View style={styles.circle1} />
          <View style={styles.circle2} />
          <View style={styles.circle3} />

          <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            iconColor="#FFFFFF"
          />

          <View style={styles.contentContainer}>
            <Animatable.View
              animation={reducedMotion ? undefined : 'fadeIn'}
              style={styles.header}
            >
              <Text style={styles.title}>{t("Створення паролю")}</Text>
              <Text style={styles.subtitle}>{t("Створіть надійний пароль для вашого облікового запису")}</Text>
            </Animatable.View>

            <Animatable.View
              animation={reducedMotion ? undefined : 'slideInUp'}
              delay={500}
              style={styles.form}
            >
              <BlurView intensity={20} pointerEvents="box-none" style={styles.inputContainer}>
                <TextInput
                  mode="outlined"
                  label={t("Пароль")}
                  value={formData.password}
                  onChangeText={(text) => setFormData({ ...formData, password: text })}
                  onBlur={() => handleBlur('password')}
                  secureTextEntry={!showPassword}
                  style={styles.input}
                  left={<TextInput.Icon icon="lock" color="#FF3B30" />}
                  right={
                    <View style={styles.inputRightContainer}>
                      <TextInput.Icon
                        icon="dice-multiple"
                        onPress={generatePassword}
                        color="#FF3B30"
                        style={styles.generateButton}
                      />
                      <TextInput.Icon
                        icon={showPassword ? 'eye-off' : 'eye'}
                        onPress={() => setShowPassword(!showPassword)}
                        color="#FF3B30"
                      />
                    </View>
                  }
                  error={touched.password && !!errors.password}
                  theme={{
                    colors: {
                      primary: '#FF3B30',
                      error: '#FF3B30',
                      text: '#FFFFFF',
                      placeholder: 'rgba(255, 255, 255, 0.7)',
                      background: 'transparent',
                      onSurfaceVariant: 'rgba(255, 255, 255, 0.7)',
                    },
                  }}
                  textColor="#FFFFFF"
                  outlineColor="transparent"
                  activeOutlineColor="transparent"
                  outlineStyle={{ borderRadius: 16 }}
                />
              </BlurView>
              <HelperText type="error" visible={touched.password && !!errors.password} style={styles.errorText}>
                {t(errors.password)}
              </HelperText>

              <BlurView intensity={20} pointerEvents="box-none" style={styles.inputContainer}>
                <TextInput
                  mode="outlined"
                  label={t("Підтвердження паролю")}
                  value={formData.confirmPassword}
                  onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                  onBlur={() => handleBlur('confirmPassword')}
                  secureTextEntry={!showPassword}
                  style={styles.input}
                  left={<TextInput.Icon icon="lock-check" color="#FF3B30" />}
                  error={touched.confirmPassword && !!errors.confirmPassword}
                  theme={{
                    colors: {
                      primary: '#FF3B30',
                      error: '#FF3B30',
                      text: '#FFFFFF',
                      placeholder: 'rgba(255, 255, 255, 0.7)',
                      background: 'transparent',
                      onSurfaceVariant: 'rgba(255, 255, 255, 0.7)',
                    },
                  }}
                  textColor="#FFFFFF"
                  outlineColor="transparent"
                  activeOutlineColor="transparent"
                  outlineStyle={{ borderRadius: 16 }}
                />
              </BlurView>
              <HelperText type="error" visible={touched.confirmPassword && !!errors.confirmPassword} style={styles.errorText}>
                {t(errors.confirmPassword)}
              </HelperText>

              <Animatable.View
                animation={reducedMotion ? undefined : 'fadeIn'}
                delay={600}
                style={styles.generateButtonContainer}
              >
                <BlurView intensity={20} pointerEvents="box-none" style={styles.generateButtonBlur}>
                  <Button
                    mode="outlined"
                    onPress={generatePassword}
                    style={styles.generateButton}
                    icon="dice-multiple"
                    contentStyle={styles.generateButtonContent}
                    labelStyle={styles.generateButtonLabel}
                  >{t("Згенерувати надійний пароль")}</Button>
                </BlurView>
              </Animatable.View>

              <BlurView intensity={20} pointerEvents="box-none" style={styles.switchContainer}>
                <Text style={styles.switchText}>{t("Я приймаю умови використання та політику конфіденційності")}</Text>
                <Switch
                  value={termsAccepted}
                  onValueChange={setTermsAccepted}
                  color="#FF3B30"
                />
              </BlurView>

              <Animatable.View
                animation={reducedMotion ? undefined : 'fadeIn'}
                delay={700}
                style={styles.buttonContainer}
              >
                <BlurView intensity={20} pointerEvents="box-none" style={styles.buttonBlur}>
                  <Button
                    mode="contained"
                    onPress={handleSubmit}
                    style={styles.button}
                    disabled={!termsAccepted || isLoading}
                    icon="check"
                    contentStyle={styles.buttonContent}
                    labelStyle={styles.buttonLabel}
                  >
                    {isLoading ? (
                      <ActivityIndicator color={theme.colors.background} />
                    ) : (
                      t("Завершити реєстрацію")
                    )}
                  </Button>
                </BlurView>
              </Animatable.View>
            </Animatable.View>
          </View>
        </View>
    </View>

    </AuthScreenFrame>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 1,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'transparent',
  },
  errorText: {
    color: '#FF3B30',
    marginLeft: 0,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  switchText: {
    flex: 1,
    marginRight: 10,
    fontSize: 14,
    color: '#FFFFFF',
  },
  buttonContainer: {
    marginTop: 20,
  },
  buttonBlur: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  button: {
    minHeight: 56,
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
  },
  buttonContent: {
    minHeight: 56,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  circle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    top: -50,
    right: -50,
  },
  circle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    bottom: 100,
    left: -50,
  },
  circle3: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    bottom: -30,
    right: 50,
  },
  inputRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  generateButtonContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  generateButtonBlur: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  generateButton: {
    minHeight: 48,
    justifyContent: 'center',
    borderRadius: 16,
    borderColor: '#FF3B30',
    backgroundColor: 'transparent',
  },
  generateButtonContent: {
    minHeight: 48,
  },
  generateButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF3B30',
  },
});

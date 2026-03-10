import React, { FC, useState } from 'react';
import { View, StyleSheet, Animated, Dimensions, ScrollView, Alert } from 'react-native';
import { Button, Text, Switch } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { CustomInput } from '../../components/CustomInput';
import { getEmailError, getPasswordError, getPhoneError, getFullNameError } from '../../utils/validation';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerPassenger } from '../../services/api/auth';
import { useUser } from '../../hooks/UserContext';

const { width, height } = Dimensions.get('window');

type PassengerRegistrationScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PassengerRegistration'>;

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

interface FormTouched {
  fullName: boolean;
  email: boolean;
  phone: boolean;
  password: boolean;
  confirmPassword: boolean;
}

const PassengerRegistration: FC = () => {
  const navigation = useNavigation<PassengerRegistrationScreenNavigationProp>();
  const { setUser } = useUser();
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  const [touched, setTouched] = useState<FormTouched>({
    fullName: false,
    email: false,
    phone: false,
    password: false,
    confirmPassword: false,
  });
  const [errors, setErrors] = useState<FormErrors>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const buttonScale = React.useRef(new Animated.Value(1)).current;

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

    setTouched({
      fullName: false,
      email: false,
      phone: false,
      password: false,
      confirmPassword: false,
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
    
    // Add more random characters to reach 12 characters
    const allChars = uppercase + lowercase + numbers + symbols;
    for (let i = password.length; i < 12; i++) {
      password += getRandomChar(allChars);
    }
    
    // Shuffle the password
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    
    setFormData(prev => ({
      ...prev,
      password,
      confirmPassword: password
    }));
    
    // Validate the new password
    validateField('password');
    validateField('confirmPassword');
  };

  const animateButton = (scale: number) => {
    Animated.spring(buttonScale, {
      toValue: scale,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  };

  const handleBlur = (field: keyof FormTouched) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const validateField = (field: keyof FormData) => {
    let error = '';
    switch (field) {
      case 'fullName':
        error = getFullNameError(formData.fullName) || '';
        break;
      case 'email':
        error = getEmailError(formData.email) || '';
        break;
      case 'phone':
        error = getPhoneError(formData.phone) || '';
        break;
      case 'password':
        error = getPasswordError(formData.password) || '';
        break;
      case 'confirmPassword':
        error = formData.password !== formData.confirmPassword ? 'Паролі не співпадають' : '';
        break;
    }
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleSubmit = async () => {
    if (!formData.acceptTerms) {
      Alert.alert('Помилка', 'Будь ласка, прийміть умови використання');
      return;
    }

    // Build fresh errors to avoid stale state
    const newErrors: FormErrors = {
      fullName: getFullNameError(formData.fullName) || '',
      email: getEmailError(formData.email) || '',
      phone: getPhoneError(formData.phone) || '',
      password: getPasswordError(formData.password) || '',
      confirmPassword: formData.password !== formData.confirmPassword ? 'Паролі не співпадають' : '',
    };
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

      // Persist token for authenticated requests
      await AsyncStorage.setItem('authToken', token);

      // Update user context
      setUser(user);

      // Navigate to main app
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (error) {
      Alert.alert('Помилка реєстрації', error instanceof Error ? error.message : 'Сталася помилка');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
        <LinearGradient
          colors={['#1A1A1A', '#2D2D2D']}
          style={styles.gradient}
        >
          <View style={styles.circle1} />
          <View style={styles.circle2} />
          <View style={styles.circle3} />
        </LinearGradient>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animatable.View 
            animation="fadeInUp" 
            duration={1000} 
            style={styles.content}
          >
            <Animatable.View animation="fadeIn" delay={300}>
              <Text style={styles.title}>Реєстрація пасажира</Text>
              <Text style={styles.subtitle}>Створіть свій обліковий запис</Text>
            </Animatable.View>

            <Animatable.View 
              animation="slideInUp" 
              delay={500} 
              style={styles.form}
            >
              <CustomInput
                label="Повне ім'я"
                value={formData.fullName}
                onChangeText={(text) => setFormData({ ...formData, fullName: text })}
                onBlur={() => handleBlur('fullName')}
                error={touched.fullName ? errors.fullName : ''}
                icon="account"
                autoCapitalize="words"
                placeholder="Введіть ваше повне ім'я"
              />

              <CustomInput
                label="Email"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                onBlur={() => handleBlur('email')}
                error={touched.email ? errors.email : ''}
                icon="email"
                keyboardType="email-address"
                placeholder="Введіть ваш email"
              />

              <CustomInput
                label="Телефон"
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                onBlur={() => handleBlur('phone')}
                error={touched.phone ? errors.phone : ''}
                icon="phone"
                keyboardType="phone-pad"
                placeholder="Введіть ваш номер телефону"
              />

              <CustomInput
                label="Пароль"
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                onBlur={() => handleBlur('password')}
                error={touched.password ? errors.password : ''}
                secureTextEntry
                icon="lock"
                placeholder="Створіть пароль"
              />

              <CustomInput
                label="Підтвердження паролю"
                value={formData.confirmPassword}
                onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                onBlur={() => handleBlur('confirmPassword')}
                error={touched.confirmPassword ? errors.confirmPassword : ''}
                secureTextEntry
                icon="lock-check"
                placeholder="Повторіть пароль"
              />

              <Animatable.View 
                animation="fadeIn" 
                delay={550} 
                style={styles.fillButtonContainer}
              >
                <Button
                  mode="outlined"
                  onPress={fillWithTestData}
                  style={styles.fillButton}
                  icon="flask-outline"
                  contentStyle={styles.fillButtonContent}
                >
                  Р—Р°РїРѕРІРЅРёС‚Рё С‚РµСЃС‚РѕРІРёРјРё РґР°РЅРёРјРё
                </Button>
              </Animatable.View>

              <Animatable.View 
                animation="fadeIn" 
                delay={600} 
                style={styles.generateButtonContainer}
              >
                <Button
                  mode="outlined"
                  onPress={generatePassword}
                  style={styles.generateButton}
                  icon="dice-multiple"
                  contentStyle={styles.generateButtonContent}
                >
                  Згенерувати надійний пароль
                </Button>
              </Animatable.View>

              <View style={styles.termsContainer}>
                <Switch
                  value={formData.acceptTerms}
                  onValueChange={(value) => setFormData({ ...formData, acceptTerms: value })}
                  color="#FF3B30"
                />
                <Text style={styles.termsText}>
                  Я погоджуюсь з умовами використання та політикою конфіденційності
                </Text>
              </View>

              <Animatable.View 
                animation="fadeIn" 
                delay={700} 
                style={styles.buttonContainer}
              >
                <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                  <Button
                    mode="contained"
                    onPress={handleSubmit}
                    style={styles.button}
                    icon="account-plus"
                    contentStyle={styles.buttonContent}
                    disabled={isSubmitting || !formData.acceptTerms}
                    onPressIn={() => animateButton(0.95)}
                    onPressOut={() => animateButton(1)}
                  >
                    Зареєструватися
                  </Button>
                </Animated.View>
              </Animatable.View>

              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Вже маєте обліковий запис?</Text>
                <Button
                  mode="text"
                  onPress={() => navigation.navigate('Login')}
                  textColor="#FF3B30"
                >
                  Увійти
                </Button>
              </View>
            </Animatable.View>
          </Animatable.View>
        </ScrollView>
      </View>
  );
};

export default PassengerRegistration;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  circle1: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: '#FF3B30',
    opacity: 0.1,
    top: -width * 0.2,
    right: -width * 0.2,
  },
  circle2: {
    position: 'absolute',
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: '#FF3B30',
    opacity: 0.1,
    bottom: -width * 0.1,
    left: -width * 0.1,
  },
  circle3: {
    position: 'absolute',
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: width * 0.2,
    backgroundColor: '#FF3B30',
    opacity: 0.1,
    top: height * 0.3,
    right: -width * 0.1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#FF3B30',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 17,
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  form: {
    gap: 15,
  },
  generateButtonContainer: {
    marginBottom: 10,
  },
  fillButtonContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  fillButton: {
    height: 48,
    justifyContent: 'center',
    borderRadius: 16,
    borderColor: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  fillButtonContent: {
    height: 48,
  },
  generateButton: {
    height: 48,
    justifyContent: 'center',
    borderRadius: 16,
    borderColor: '#FF3B30',
    backgroundColor: 'transparent',
  },
  generateButtonContent: {
    height: 48,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    padding: 15,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  termsText: {
    marginLeft: 10,
    color: '#FFFFFF',
    flex: 1,
  },
  buttonContainer: {
    marginTop: 15,
  },
  button: {
    height: 56,
    borderRadius: 16,
    backgroundColor: '#FF3B30',
  },
  buttonContent: {
    height: 56,
  },
  loginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#FFFFFF',
    marginRight: 5,
  },
}); 

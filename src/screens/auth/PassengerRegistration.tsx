import React, { FC, useState } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback, Keyboard, Animated, Dimensions, ScrollView, Alert } from 'react-native';
import { Button, Text, Switch } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { CustomInput } from '../../components/CustomInput';
import { getEmailError, getPasswordError, getPhoneError, getFullNameError } from '../../utils/validation';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Animatable from 'react-native-animatable';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerPassenger } from '../../services/api/auth';
import { useUser } from '../../hooks/UserContext';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

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
  const formYPosition = React.useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
    Animated.timing(formYPosition, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
      delay: 300,
    }).start();
  }, []);

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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <LinearGradient
          colors={['#1A1A1A', '#2D2D2D', '#000']}
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
        >
          <Animated.View 
            style={[
              styles.content,
              { transform: [{ translateY: formYPosition }] }
            ]}
          >
            <Animatable.View animation="fadeIn" delay={300} style={styles.header}>
              <View style={styles.logoContainer}>
                <MaterialIcons name="local-taxi" size={60} color="#E50914" />
              </View>
              <Text style={styles.title}>Реєстрація пасажира</Text>
              <Text style={styles.subtitle}>Створіть свій обліковий запис для замовлення таксі</Text>
            </Animatable.View>

            <Animatable.View 
              animation="slideInUp" 
              delay={500} 
              style={styles.form}
            >
              <BlurView intensity={30} tint="dark" style={styles.formContainer}>
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
                  delay={600} 
                  style={styles.generateButtonContainer}
                >
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
                </Animatable.View>

                <View style={styles.termsContainer}>
                  <Switch
                    value={formData.acceptTerms}
                    onValueChange={(value) => setFormData({ ...formData, acceptTerms: value })}
                    color="#E50914"
                  />
                  <Text style={styles.termsText}>
                    Я погоджуюсь з <Text style={styles.linkText}>умовами використання</Text> та <Text style={styles.linkText}>політикою конфіденційності</Text>
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
                      labelStyle={styles.buttonLabel}
                      disabled={isSubmitting || !formData.acceptTerms}
                      onPressIn={() => animateButton(0.95)}
                      onPressOut={() => animateButton(1)}
                    >
                      {isSubmitting ? 'Реєстрація...' : 'Зареєструватися'}
                    </Button>
                  </Animated.View>
                </Animatable.View>

                <View style={styles.loginContainer}>
                  <Text style={styles.loginText}>Вже маєте обліковий запис?</Text>
                  <Button
                    mode="text"
                    onPress={() => navigation.navigate('Login')}
                    textColor="#E50914"
                    labelStyle={styles.loginButtonLabel}
                  >
                    Увійти
                  </Button>
                </View>
              </BlurView>
            </Animatable.View>
          </Animated.View>
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
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
    backgroundColor: '#E50914',
    opacity: 0.1,
    top: -width * 0.2,
    right: -width * 0.2,
  },
  circle2: {
    position: 'absolute',
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: '#E50914',
    opacity: 0.1,
    bottom: -width * 0.1,
    left: -width * 0.1,
  },
  circle3: {
    position: 'absolute',
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: width * 0.2,
    backgroundColor: '#E50914',
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
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#E50914',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
    opacity: 0.8,
  },
  form: {
    flex: 1,
  },
  formContainer: {
    borderRadius: 20,
    padding: 20,
    backgroundColor: 'rgba(30, 30, 30, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.2)',
  },
  generateButtonContainer: {
    marginTop: 15,
    marginBottom: 15,
  },
  generateButton: {
    height: 48,
    justifyContent: 'center',
    borderRadius: 16,
    borderColor: '#E50914',
    backgroundColor: 'transparent',
  },
  generateButtonContent: {
    height: 48,
  },
  generateButtonLabel: {
    color: '#E50914',
    fontWeight: '600',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 15,
    marginBottom: 25,
    padding: 15,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  termsText: {
    marginLeft: 10,
    color: '#FFFFFF',
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  linkText: {
    color: '#E50914',
    fontWeight: '600',
  },
  buttonContainer: {
    marginTop: 15,
  },
  button: {
    height: 56,
    borderRadius: 16,
    backgroundColor: '#E50914',
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonContent: {
    height: 56,
  },
  buttonLabel: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  loginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  loginText: {
    color: '#FFFFFF',
    marginRight: 5,
    opacity: 0.8,
  },
  loginButtonLabel: {
    fontWeight: '600',
  },
}); 
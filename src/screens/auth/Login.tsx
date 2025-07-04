import React, { FC, useState } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback, Keyboard, Animated, ImageBackground } from 'react-native';
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
import { API_URL } from '../../config/api';
import { useUser } from '../../hooks/UserContext';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const Login: FC = () => {
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

  const { setUser } = useUser();

  React.useEffect(() => {
    Animated.timing(formYPosition, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
      delay: 300,
    }).start();

    // Пульсація логотипу
    Animated.loop(
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
    ).start();
  }, []);

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
      case 'email':
        const emailError = getEmailError(formData.email);
        error = emailError || '';
        break;
      case 'password':
        const passwordError = getPasswordError(formData.password);
        error = passwordError || '';
        break;
    }
    setErrors({ ...errors, [field]: error });
  };

  const handleLogin = async () => {
    // Нова перевірка помилок
    const newErrors = {
      email: getEmailError(formData.email) || '',
      password: getPasswordError(formData.password) || '',
    };
    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((error) => error !== '');
    if (hasErrors) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (!response.ok) {
        alert(result.message || 'Помилка входу');
        return;
      }
      // Зберегти токен, якщо потрібно: await AsyncStorage.setItem('authToken', result.token);
      setUser(result.user);
      if (result.user.role === 'driver') {
        navigation.reset({ index: 0, routes: [{ name: 'DriverHome' }] });
      } else {
        navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
      }
    } catch (error) {
      alert('Помилка мережі або сервера');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
          <BlurView intensity={30} tint="dark" style={styles.blurContainer}>
            <View style={styles.formContent}>
              <Animatable.View 
                animation="fadeIn" 
                duration={1000}
                style={styles.formHeader}
              >
                <Text style={styles.title}>Ласкаво просимо!</Text>
                <Text style={styles.subtitle}>Увійдіть у свій акаунт</Text>
              </Animatable.View>

              <View style={styles.form}>
                <Animatable.View animation="fadeInRight" duration={600} delay={200}>
                  <CustomInput
                    label="Електронна пошта"
                    value={formData.email}
                    onChangeText={(text) => setFormData({ ...formData, email: text })}
                    onBlur={() => handleBlur('email')}
                    error={touched.email ? errors.email : ''}
                    icon="email"
                    keyboardType="email-address"
                    placeholder="your@email.com"
                  />
                </Animatable.View>

                <Animatable.View animation="fadeInRight" duration={600} delay={400}>
                  <CustomInput
                    label="Пароль"
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
                  animation="fadeInUp" 
                  duration={800} 
                  delay={600}
                  style={styles.buttonContainer}
                >
                  <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                    <Button
                      mode="contained"
                      onPress={handleLogin}
                      style={styles.loginButton}
                      contentStyle={styles.buttonContent}
                      labelStyle={styles.buttonLabel}
                      onPressIn={() => animateButton(0.95)}
                      onPressOut={() => animateButton(1)}
                      icon="login"
                    >
                      Увійти
                    </Button>
                  </Animated.View>
                </Animatable.View>
              </View>

              <Animatable.View 
                animation="fadeIn" 
                duration={1000}
                delay={800}
                style={styles.footer}
              >
                <Text style={styles.footerText}>Немає акаунту?</Text>
                
                <View style={styles.registrationButtons}>
                  <Button
                    mode="contained"
                    onPress={() => navigation.navigate('RoleSelection')}
                    style={styles.registrationButton}
                    contentStyle={styles.regButtonContent}
                    labelStyle={styles.regButtonLabel}
                    icon="account-plus"
                  >
                    Зареєструватися
                  </Button>
                </View>
              </Animatable.View>
            </View>
          </BlurView>
        </Animated.View>
      </LinearGradient>
    </TouchableWithoutFeedback>
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
  loginButton: {
    height: 56,
    borderRadius: 14,
    backgroundColor: '#FF3B30',
    shadowColor: '#FF3B30',
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
    height: 56,
    borderRadius: 14,
    backgroundColor: '#FF3B30',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  regButtonContent: {
    height: 56,
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
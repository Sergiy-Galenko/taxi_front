import React, { useState } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { TextInput, Button, Text, IconButton, HelperText, Switch } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NavigationProp } from '../../../types/navigation';
import { getPasswordError } from '../../../utils/validation';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../hooks/useTheme';
import { useAuth } from '../../../hooks/useAuth';
import { registerDriver } from '../../../services/api/driver';
import { showMessage } from 'react-native-flash-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DriverPasswordSetup() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { 
    fullName, 
    email, 
    phone, 
    carModel, 
    carColor, 
    carNumber, 
    yearsOfExperience,
    licenseNumber,
  } = route.params as { 
    fullName: string;
    email: string;
    phone: string;
    carModel: string;
    carColor: string;
    carNumber: string;
    yearsOfExperience: string;
    licenseNumber: string;
  };

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
  const [isLoading, setIsLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { signIn } = useAuth();

  const validateForm = () => {
    const passwordError = getPasswordError(formData.password);
    const confirmPasswordError = formData.password !== formData.confirmPassword 
      ? 'Паролі не співпадають' 
      : '';

    setErrors({
      password: passwordError || '',
      confirmPassword: confirmPasswordError,
    });

    return !passwordError && !confirmPasswordError;
  };

  const handleSubmit = async () => {
    if (!termsAccepted) {
      showMessage({
        message: 'Please accept the terms and conditions',
        type: 'warning',
      });
      return;
    }

    if (validateForm()) {
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

        const response = await registerDriver(registrationData);
        
        if (response.success && response.data) {
          await AsyncStorage.setItem('driverId', response.data.driverId);
          
          await signIn(response.data.token);
          
          showMessage({
            message: 'Registration successful',
            type: 'success',
          });
          
          navigation.navigate('DriverVerification' as never);
        }
      } catch (error) {
        showMessage({
          message: error instanceof Error ? error.message : 'Registration failed',
          type: 'danger',
        });
      } finally {
        setIsLoading(false);
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
        confirmPassword: formData.password !== formData.confirmPassword ? 'Паролі не співпадають' : '',
      }));
    }
  };

  const generatePassword = () => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const allChars = uppercase + lowercase + numbers + symbols;
    let password = '';
    
    // Гарантуємо наявність хоча б одного символу кожного типу
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Додаємо випадкові символи до бажаної довжини (12 символів)
    for (let i = password.length; i < 12; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Перемішуємо символи
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    
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
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
              animation="fadeIn" 
              style={styles.header}
            >
              <Text style={styles.title}>Створення паролю</Text>
              <Text style={styles.subtitle}>Створіть надійний пароль для вашого облікового запису</Text>
            </Animatable.View>

            <Animatable.View 
              animation="slideInUp" 
              delay={500} 
              style={styles.form}
            >
              <BlurView intensity={20} style={styles.inputContainer}>
                <TextInput
                  mode="outlined"
                  label="Пароль"
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
                {errors.password}
              </HelperText>

              <BlurView intensity={20} style={styles.inputContainer}>
                <TextInput
                  mode="outlined"
                  label="Підтвердження паролю"
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
                {errors.confirmPassword}
              </HelperText>

              <Animatable.View 
                animation="fadeIn" 
                delay={600} 
                style={styles.generateButtonContainer}
              >
                <BlurView intensity={20} style={styles.generateButtonBlur}>
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
                </BlurView>
              </Animatable.View>

              <BlurView intensity={20} style={styles.switchContainer}>
                <Text style={styles.switchText}>Я приймаю умови використання та політику конфіденційності</Text>
                <Switch
                  value={termsAccepted}
                  onValueChange={setTermsAccepted}
                  color="#FF3B30"
                />
              </BlurView>

              <Animatable.View 
                animation="fadeIn" 
                delay={700} 
                style={styles.buttonContainer}
              >
                <BlurView intensity={20} style={styles.buttonBlur}>
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
                      'Завершити реєстрацію'
                    )}
                  </Button>
                </BlurView>
              </Animatable.View>
            </Animatable.View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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
    height: 56,
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
  },
  buttonContent: {
    height: 56,
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
    height: 48,
    justifyContent: 'center',
    borderRadius: 16,
    borderColor: '#FF3B30',
    backgroundColor: 'transparent',
  },
  generateButtonContent: {
    height: 48,
  },
  generateButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF3B30',
  },
}); 
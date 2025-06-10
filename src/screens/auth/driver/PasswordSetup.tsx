import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, IconButton, HelperText, Switch } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NavigationProp } from '../../../types/navigation';
import { getPasswordError } from '../../../utils/validation';
import * as Animatable from 'react-native-animatable';

export const DriverPasswordSetup = () => {
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

  const handleSubmit = () => {
    if (!termsAccepted) {
      return;
    }

    if (validateForm()) {
      // TODO: Implement registration logic
      console.log('Driver registration data:', {
        fullName,
        email,
        phone,
        carModel,
        carColor,
        carNumber,
        yearsOfExperience,
        licenseNumber,
        password: formData.password,
      });
      navigation.navigate('DriverVerification');
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

  return (
    <View style={styles.container}>
      <IconButton
        icon="arrow-left"
        size={24}
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      />

      <Animatable.View 
        animation="fadeInUp" 
        duration={1000} 
        style={styles.content}
      >
        <Animatable.View animation="fadeIn" delay={300}>
          <Text style={styles.title}>Створення паролю</Text>
          <Text style={styles.subtitle}>Створіть надійний пароль для вашого облікового запису</Text>
        </Animatable.View>

        <Animatable.View 
          animation="slideInUp" 
          delay={500} 
          style={styles.form}
        >
          <TextInput
            mode="outlined"
            label="Пароль"
            value={formData.password}
            onChangeText={(text) => setFormData({ ...formData, password: text })}
            onBlur={() => handleBlur('password')}
            secureTextEntry={!showPassword}
            style={styles.input}
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
            error={touched.password && !!errors.password}
          />
          <HelperText type="error" visible={touched.password && !!errors.password}>
            {errors.password}
          </HelperText>

          <TextInput
            mode="outlined"
            label="Підтвердження паролю"
            value={formData.confirmPassword}
            onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
            onBlur={() => handleBlur('confirmPassword')}
            secureTextEntry={!showPassword}
            style={styles.input}
            left={<TextInput.Icon icon="lock-check" />}
            error={touched.confirmPassword && !!errors.confirmPassword}
          />
          <HelperText type="error" visible={touched.confirmPassword && !!errors.confirmPassword}>
            {errors.confirmPassword}
          </HelperText>

          <View style={styles.switchContainer}>
            <Text style={styles.switchText}>Я приймаю умови використання та політику конфіденційності</Text>
            <Switch
              value={termsAccepted}
              onValueChange={setTermsAccepted}
              color="#007AFF"
            />
          </View>

          <Animatable.View 
            animation="fadeIn" 
            delay={700} 
            style={styles.buttonContainer}
          >
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.button}
              disabled={!termsAccepted}
              icon="check"
            >
              Завершити реєстрацію
            </Button>
          </Animatable.View>
        </Animatable.View>
      </Animatable.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  form: {
    gap: 15,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingVertical: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  switchText: {
    flex: 1,
    marginRight: 10,
    fontSize: 14,
    color: '#333',
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    height: 50,
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#007AFF',
  },
}); 
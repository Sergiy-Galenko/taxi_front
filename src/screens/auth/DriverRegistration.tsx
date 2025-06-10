import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text, Switch, IconButton, HelperText } from 'react-native-paper';
import { authStyles } from '../../components/auth/styles';
import {
  getEmailError,
  getPasswordError,
  getPhoneError,
  getFullNameError,
  getLicenseNumberError,
  getCarNumberError,
} from '../../utils/validation';

export const DriverRegistration = ({ navigation }: any) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    licenseNumber: '',
    carModel: '',
    carColor: '',
    carNumber: '',
    yearsOfExperience: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    licenseNumber: '',
    carModel: '',
    carColor: '',
    carNumber: '',
    yearsOfExperience: '',
  });
  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    phone: false,
    password: false,
    confirmPassword: false,
    licenseNumber: false,
    carModel: false,
    carColor: false,
    carNumber: false,
    yearsOfExperience: false,
  });

  const validateForm = () => {
    const fullNameError = getFullNameError(formData.fullName);
    const emailError = getEmailError(formData.email);
    const phoneError = getPhoneError(formData.phone);
    const passwordError = getPasswordError(formData.password);
    const confirmPasswordError = formData.password !== formData.confirmPassword 
      ? 'Паролі не співпадають' 
      : '';
    const licenseNumberError = getLicenseNumberError(formData.licenseNumber);
    const carNumberError = getCarNumberError(formData.carNumber);
    const carModelError = !formData.carModel ? 'Модель автомобіля обов\'язкова' : '';
    const carColorError = !formData.carColor ? 'Колір автомобіля обов\'язковий' : '';
    const yearsOfExperienceError = !formData.yearsOfExperience 
      ? 'Досвід водіння обов\'язковий' 
      : isNaN(Number(formData.yearsOfExperience)) || Number(formData.yearsOfExperience) < 0
        ? 'Введіть коректний досвід водіння'
        : '';

    setErrors({
      fullName: fullNameError || '',
      email: emailError || '',
      phone: phoneError || '',
      password: passwordError || '',
      confirmPassword: confirmPasswordError,
      licenseNumber: licenseNumberError || '',
      carModel: carModelError,
      carColor: carColorError,
      carNumber: carNumberError || '',
      yearsOfExperience: yearsOfExperienceError,
    });

    return !fullNameError && !emailError && !phoneError && !passwordError && 
           !confirmPasswordError && !licenseNumberError && !carModelError && 
           !carColorError && !carNumberError && !yearsOfExperienceError;
  };

  const handleSubmit = async () => {
    if (!termsAccepted) {
      Alert.alert('Помилка', 'Будь ласка, прийміть умови використання');
      return;
    }

    if (validateForm()) {
      try {
        // TODO: Implement actual registration logic
        console.log('Driver registration data:', formData);
        navigation.navigate('DriverVerification');
      } catch (error) {
        console.error('Registration error:', error);
        Alert.alert('Помилка', 'Не вдалося зареєструватися. Спробуйте ще раз.');
      }
    }
  };

  const handleBlur = (field: keyof typeof formData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    switch (field) {
      case 'fullName':
        setErrors(prev => ({ ...prev, fullName: getFullNameError(formData.fullName) || '' }));
        break;
      case 'email':
        setErrors(prev => ({ ...prev, email: getEmailError(formData.email) || '' }));
        break;
      case 'phone':
        setErrors(prev => ({ ...prev, phone: getPhoneError(formData.phone) || '' }));
        break;
      case 'password':
        setErrors(prev => ({ ...prev, password: getPasswordError(formData.password) || '' }));
        break;
      case 'confirmPassword':
        setErrors(prev => ({
          ...prev,
          confirmPassword: formData.password !== formData.confirmPassword ? 'Паролі не співпадають' : '',
        }));
        break;
      case 'licenseNumber':
        setErrors(prev => ({ ...prev, licenseNumber: getLicenseNumberError(formData.licenseNumber) || '' }));
        break;
      case 'carModel':
        setErrors(prev => ({ ...prev, carModel: !formData.carModel ? 'Модель автомобіля обов\'язкова' : '' }));
        break;
      case 'carColor':
        setErrors(prev => ({ ...prev, carColor: !formData.carColor ? 'Колір автомобіля обов\'язковий' : '' }));
        break;
      case 'carNumber':
        setErrors(prev => ({ ...prev, carNumber: getCarNumberError(formData.carNumber) || '' }));
        break;
      case 'yearsOfExperience':
        setErrors(prev => ({
          ...prev,
          yearsOfExperience: !formData.yearsOfExperience 
            ? 'Досвід водіння обов\'язковий' 
            : isNaN(Number(formData.yearsOfExperience)) || Number(formData.yearsOfExperience) < 0
              ? 'Введіть коректний досвід водіння'
              : '',
        }));
        break;
    }
  };

  return (
    <View style={styles.mainContainer}>
      <IconButton
        icon="arrow-left"
        size={24}
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      />
      <ScrollView style={[authStyles.container, styles.container]}>
        <View style={authStyles.header}>
          <Text style={authStyles.title}>Реєстрація водія</Text>
          <Text style={authStyles.subtitle}>Приєднуйтесь до нашої команди водіїв</Text>
        </View>

        <View style={authStyles.form}>
          <TextInput
            mode="outlined"
            label="Повне ім'я"
            value={formData.fullName}
            onChangeText={(text) => setFormData({ ...formData, fullName: text })}
            onBlur={() => handleBlur('fullName')}
            style={authStyles.input}
            left={<TextInput.Icon icon="account" />}
            error={touched.fullName && !!errors.fullName}
          />
          <HelperText type="error" visible={touched.fullName && !!errors.fullName}>
            {errors.fullName}
          </HelperText>

          <TextInput
            mode="outlined"
            label="Електронна пошта"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            onBlur={() => handleBlur('email')}
            keyboardType="email-address"
            autoCapitalize="none"
            style={authStyles.input}
            left={<TextInput.Icon icon="email" />}
            error={touched.email && !!errors.email}
          />
          <HelperText type="error" visible={touched.email && !!errors.email}>
            {errors.email}
          </HelperText>

          <TextInput
            mode="outlined"
            label="Номер телефону"
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            onBlur={() => handleBlur('phone')}
            keyboardType="phone-pad"
            style={authStyles.input}
            left={<TextInput.Icon icon="phone" />}
            error={touched.phone && !!errors.phone}
          />
          <HelperText type="error" visible={touched.phone && !!errors.phone}>
            {errors.phone}
          </HelperText>

          <TextInput
            mode="outlined"
            label="Номер водійського посвідчення"
            value={formData.licenseNumber}
            onChangeText={(text) => setFormData({ ...formData, licenseNumber: text })}
            onBlur={() => handleBlur('licenseNumber')}
            style={authStyles.input}
            left={<TextInput.Icon icon="card-account-details" />}
            error={touched.licenseNumber && !!errors.licenseNumber}
          />
          <HelperText type="error" visible={touched.licenseNumber && !!errors.licenseNumber}>
            {errors.licenseNumber}
          </HelperText>

          <TextInput
            mode="outlined"
            label="Модель автомобіля"
            value={formData.carModel}
            onChangeText={(text) => setFormData({ ...formData, carModel: text })}
            onBlur={() => handleBlur('carModel')}
            style={authStyles.input}
            left={<TextInput.Icon icon="car" />}
            error={touched.carModel && !!errors.carModel}
          />
          <HelperText type="error" visible={touched.carModel && !!errors.carModel}>
            {errors.carModel}
          </HelperText>

          <TextInput
            mode="outlined"
            label="Колір автомобіля"
            value={formData.carColor}
            onChangeText={(text) => setFormData({ ...formData, carColor: text })}
            onBlur={() => handleBlur('carColor')}
            style={authStyles.input}
            left={<TextInput.Icon icon="palette" />}
            error={touched.carColor && !!errors.carColor}
          />
          <HelperText type="error" visible={touched.carColor && !!errors.carColor}>
            {errors.carColor}
          </HelperText>

          <TextInput
            mode="outlined"
            label="Номерний знак"
            value={formData.carNumber}
            onChangeText={(text) => setFormData({ ...formData, carNumber: text })}
            onBlur={() => handleBlur('carNumber')}
            style={authStyles.input}
            left={<TextInput.Icon icon="car-info" />}
            error={touched.carNumber && !!errors.carNumber}
          />
          <HelperText type="error" visible={touched.carNumber && !!errors.carNumber}>
            {errors.carNumber}
          </HelperText>

          <TextInput
            mode="outlined"
            label="Досвід водіння (роки)"
            value={formData.yearsOfExperience}
            onChangeText={(text) => setFormData({ ...formData, yearsOfExperience: text })}
            onBlur={() => handleBlur('yearsOfExperience')}
            keyboardType="numeric"
            style={authStyles.input}
            left={<TextInput.Icon icon="clock" />}
            error={touched.yearsOfExperience && !!errors.yearsOfExperience}
          />
          <HelperText type="error" visible={touched.yearsOfExperience && !!errors.yearsOfExperience}>
            {errors.yearsOfExperience}
          </HelperText>

          <TextInput
            mode="outlined"
            label="Пароль"
            value={formData.password}
            onChangeText={(text) => setFormData({ ...formData, password: text })}
            onBlur={() => handleBlur('password')}
            secureTextEntry={!showPassword}
            style={authStyles.input}
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
            style={authStyles.input}
            left={<TextInput.Icon icon="lock-check" />}
            error={touched.confirmPassword && !!errors.confirmPassword}
          />
          <HelperText type="error" visible={touched.confirmPassword && !!errors.confirmPassword}>
            {errors.confirmPassword}
          </HelperText>

          <View style={authStyles.switchContainer}>
            <Text style={authStyles.switchText}>Я приймаю умови використання та політику конфіденційності</Text>
            <Switch
              value={termsAccepted}
              onValueChange={setTermsAccepted}
              color="#007AFF"
            />
          </View>

          <Button
            mode="contained"
            onPress={handleSubmit}
            style={[authStyles.button, styles.button]}
            disabled={!termsAccepted}
            icon="car-connected"
          >
            Зареєструватися як водій
          </Button>

          <Text
            style={authStyles.link}
            onPress={() => navigation.navigate('Login')}
          >
            Вже маєте обліковий запис? Увійти
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#007AFF',
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 1,
  },
}); 
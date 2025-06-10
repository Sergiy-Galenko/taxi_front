import React, { FC, useState } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback, Keyboard, Animated } from 'react-native';
import { Button, Text, Switch } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { CustomInput } from '../../components/CustomInput';
import { getEmailError, getPasswordError, getPhoneError, getFullNameError } from '../../utils/validation';

type PassengerRegistrationScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PassengerRegistration'>;

const PassengerRegistration: FC = () => {
  const navigation = useNavigation<PassengerRegistrationScreenNavigationProp>();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    phone: false,
    password: false,
    confirmPassword: false,
  });
  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const buttonScale = React.useRef(new Animated.Value(1)).current;

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
      case 'fullName':
        error = getFullNameError(formData.fullName);
        break;
      case 'email':
        error = getEmailError(formData.email);
        break;
      case 'phone':
        error = getPhoneError(formData.phone);
        break;
      case 'password':
        error = getPasswordError(formData.password);
        break;
      case 'confirmPassword':
        error = formData.password !== formData.confirmPassword ? 'Паролі не співпадають' : '';
        break;
    }
    setErrors({ ...errors, [field]: error });
  };

  const handleSubmit = () => {
    // Validate all fields
    Object.keys(formData).forEach((field) => {
      if (field !== 'acceptTerms') {
        validateField(field as keyof typeof formData);
      }
    });

    // Check if there are any errors
    const hasErrors = Object.values(errors).some((error) => error !== '');
    if (hasErrors) {
      return;
    }

    // TODO: Implement registration logic
    navigation.navigate('Home');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.content}>
          <View>
            <Text style={styles.title}>Реєстрація пасажира</Text>
            <Text style={styles.subtitle}>Створіть свій обліковий запис</Text>
          </View>

          <View style={styles.form}>
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

            <View style={styles.buttonContainer}>
              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  style={styles.button}
                  icon="account-plus"
                  contentStyle={styles.buttonContent}
                  textColor="#FFF"
                  disabled={!formData.acceptTerms}
                  onPressIn={() => animateButton(0.95)}
                  onPressOut={() => animateButton(1)}
                >
                  Зареєструватися
                </Button>
              </Animated.View>
            </View>

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
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default PassengerRegistration;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
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
    gap: 5,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
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
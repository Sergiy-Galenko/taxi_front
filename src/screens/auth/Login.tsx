import React, { FC, useState } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback, Keyboard, Animated } from 'react-native';
import { Button, Text } from 'react-native-paper';
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { CustomInput } from '../../components/CustomInput';
import { getEmailError, getPasswordError } from '../../utils/validation';

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

  const handleLogin = () => {
    // Validate all fields
    Object.keys(formData).forEach((field) => {
      validateField(field as keyof typeof formData);
    });

    // Check if there are any errors
    const hasErrors = Object.values(errors).some((error) => error !== '');
    if (hasErrors) {
      return;
    }

    // TODO: Implement login logic
    navigation.navigate('Home');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Animatable.View 
          animation="fadeInUp" 
          duration={1000} 
          style={styles.content}
        >
          <Animatable.View animation="fadeIn" delay={300}>
            <Text style={styles.title}>Вхід</Text>
            <Text style={styles.subtitle}>Увійдіть до свого облікового запису</Text>
          </Animatable.View>

          <Animatable.View 
            animation="slideInUp" 
            delay={500} 
            style={styles.form}
          >
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
              label="Пароль"
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              onBlur={() => handleBlur('password')}
              error={touched.password ? errors.password : ''}
              secureTextEntry
              icon="lock"
              placeholder="Введіть ваш пароль"
            />

            <Animatable.View 
              animation="fadeIn" 
              delay={700} 
              style={styles.buttonContainer}
            >
              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <Button
                  mode="contained"
                  onPress={handleLogin}
                  style={styles.button}
                  icon="login"
                  contentStyle={styles.buttonContent}
                  textColor="#FFF"
                  onPressIn={() => animateButton(0.95)}
                  onPressOut={() => animateButton(1)}
                >
                  Увійти
                </Button>
              </Animated.View>
            </Animatable.View>

            <Animatable.View 
              animation="fadeIn" 
              delay={900} 
              style={styles.registrationContainer}
            >
              <Text style={styles.registrationText}>Немає облікового запису?</Text>
              <View style={styles.registrationButtons}>
                <Animatable.View animation="fadeInLeft" delay={1000}>
                  <Button
                    mode="outlined"
                    onPress={() => navigation.navigate('PassengerRegistration')}
                    style={styles.registrationButton}
                    icon="account"
                    contentStyle={styles.buttonContent}
                    textColor="#FF3B30"
                    onPressIn={() => animateButton(0.95)}
                    onPressOut={() => animateButton(1)}
                  >
                    Реєстрація пасажира
                  </Button>
                </Animatable.View>
                <Animatable.View animation="fadeInRight" delay={1100}>
                  <Button
                    mode="outlined"
                    onPress={() => navigation.navigate('DriverRegistration')}
                    style={styles.registrationButton}
                    icon="car"
                    contentStyle={styles.buttonContent}
                    textColor="#FF3B30"
                    onPressIn={() => animateButton(0.95)}
                    onPressOut={() => animateButton(1)}
                  >
                    Реєстрація водія
                  </Button>
                </Animatable.View>
              </View>
            </Animatable.View>
          </Animatable.View>
        </Animatable.View>
      </View>
    </TouchableWithoutFeedback>
  );
};

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
  registrationContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  registrationText: {
    fontSize: 17,
    color: '#FFFFFF',
    marginBottom: 10,
  },
  registrationButtons: {
    width: '100%',
    gap: 5,
  },
  registrationButton: {
    height: 56,
    borderRadius: 16,
    borderColor: '#FF3B30',
  },
});

export default Login; 
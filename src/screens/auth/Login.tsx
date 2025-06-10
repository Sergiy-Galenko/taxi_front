import React, { useState, type FC } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, IconButton, HelperText } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '../../types/navigation';
import { getEmailError, getPasswordError } from '../../utils/validation';
import * as Animatable from 'react-native-animatable';

const Login: FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const validateForm = () => {
    const emailError = getEmailError(formData.email);
    const passwordError = getPasswordError(formData.password);

    setErrors({
      email: emailError || '',
      password: passwordError || '',
    });

    return !emailError && !passwordError;
  };

  const handleLogin = () => {
    if (validateForm()) {
      // TODO: Implement login logic
      console.log('Login data:', formData);
      navigation.navigate('Home');
    }
  };

  const handleBlur = (field: 'email' | 'password') => {
    setTouched(prev => ({ ...prev, [field]: true }));
    if (field === 'email') {
      setErrors(prev => ({ ...prev, email: getEmailError(formData.email) || '' }));
    } else {
      setErrors(prev => ({ ...prev, password: getPasswordError(formData.password) || '' }));
    }
  };

  return (
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
          <TextInput
            mode="outlined"
            label="Email"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            onBlur={() => handleBlur('email')}
            style={styles.input}
            left={<TextInput.Icon icon="email" />}
            error={touched.email && !!errors.email}
          />
          <HelperText type="error" visible={touched.email && !!errors.email}>
            {errors.email}
          </HelperText>

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

          <Animatable.View 
            animation="fadeIn" 
            delay={700} 
            style={styles.buttonContainer}
          >
            <Button
              mode="contained"
              onPress={handleLogin}
              style={styles.button}
              icon="login"
            >
              Увійти
            </Button>
          </Animatable.View>

          <Animatable.View 
            animation="fadeIn" 
            delay={900} 
            style={styles.registrationContainer}
          >
            <Text style={styles.registrationText}>Немає облікового запису?</Text>
            <View style={styles.registrationButtons}>
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('PassengerRegistration')}
                style={styles.registrationButton}
                icon="account"
              >
                Реєстрація пасажира
              </Button>
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('DriverRegistration')}
                style={styles.registrationButton}
                icon="car"
              >
                Реєстрація водія
              </Button>
            </View>
          </Animatable.View>
        </Animatable.View>
      </Animatable.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    height: 50,
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#007AFF',
  },
  registrationContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  registrationText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  registrationButtons: {
    width: '100%',
    gap: 10,
  },
  registrationButton: {
    height: 50,
    justifyContent: 'center',
    borderRadius: 10,
  },
});

export default Login; 
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, IconButton, HelperText } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NavigationProp } from '../../../types/navigation';
import { getEmailError, getPhoneError } from '../../../utils/validation';
import * as Animatable from 'react-native-animatable';

export const DriverContactInfo = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { fullName } = route.params as { fullName: string };

  const [formData, setFormData] = useState({
    email: '',
    phone: '',
  });
  const [errors, setErrors] = useState({
    email: '',
    phone: '',
  });
  const [touched, setTouched] = useState({
    email: false,
    phone: false,
  });

  const handleNext = () => {
    const emailError = getEmailError(formData.email);
    const phoneError = getPhoneError(formData.phone);

    if (emailError || phoneError) {
      setErrors({
        email: emailError || '',
        phone: phoneError || '',
      });
      return;
    }

    navigation.navigate('DriverCarInfo', {
      fullName,
      email: formData.email,
      phone: formData.phone,
    });
  };

  const handleBlur = (field: 'email' | 'phone') => {
    setTouched(prev => ({ ...prev, [field]: true }));
    if (field === 'email') {
      setErrors(prev => ({ ...prev, email: getEmailError(formData.email) || '' }));
    } else {
      setErrors(prev => ({ ...prev, phone: getPhoneError(formData.phone) || '' }));
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
          <Text style={styles.title}>Контактна інформація</Text>
          <Text style={styles.subtitle}>Вкажіть свою електронну пошту та номер телефону</Text>
        </Animatable.View>

        <Animatable.View 
          animation="slideInUp" 
          delay={500} 
          style={styles.form}
        >
          <TextInput
            mode="outlined"
            label="Електронна пошта"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            onBlur={() => handleBlur('email')}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
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
            style={styles.input}
            left={<TextInput.Icon icon="phone" />}
            error={touched.phone && !!errors.phone}
          />
          <HelperText type="error" visible={touched.phone && !!errors.phone}>
            {errors.phone}
          </HelperText>

          <Animatable.View 
            animation="fadeIn" 
            delay={700} 
            style={styles.buttonContainer}
          >
            <Button
              mode="contained"
              onPress={handleNext}
              style={styles.button}
              icon="arrow-right"
            >
              Далі
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
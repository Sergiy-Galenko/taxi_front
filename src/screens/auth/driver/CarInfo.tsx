import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, IconButton, HelperText } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NavigationProp } from '../../../types/navigation';
import { getCarNumberError } from '../../../utils/validation';
import * as Animatable from 'react-native-animatable';

export const DriverCarInfo = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { fullName, email, phone } = route.params as { 
    fullName: string;
    email: string;
    phone: string;
  };

  const [formData, setFormData] = useState({
    carModel: '',
    carColor: '',
    carNumber: '',
    yearsOfExperience: '',
  });
  const [errors, setErrors] = useState({
    carModel: '',
    carColor: '',
    carNumber: '',
    yearsOfExperience: '',
  });
  const [touched, setTouched] = useState({
    carModel: false,
    carColor: false,
    carNumber: false,
    yearsOfExperience: false,
  });

  const validateForm = () => {
    const carModelError = !formData.carModel ? 'Модель автомобіля обов\'язкова' : '';
    const carColorError = !formData.carColor ? 'Колір автомобіля обов\'язковий' : '';
    const carNumberError = getCarNumberError(formData.carNumber);
    const yearsOfExperienceError = !formData.yearsOfExperience 
      ? 'Досвід водіння обов\'язковий' 
      : isNaN(Number(formData.yearsOfExperience)) || Number(formData.yearsOfExperience) < 0
        ? 'Введіть коректний досвід водіння'
        : '';

    setErrors({
      carModel: carModelError,
      carColor: carColorError,
      carNumber: carNumberError || '',
      yearsOfExperience: yearsOfExperienceError,
    });

    return !carModelError && !carColorError && !carNumberError && !yearsOfExperienceError;
  };

  const handleNext = () => {
    if (validateForm()) {
      navigation.navigate('DriverLicenseInfo', {
        fullName,
        email,
        phone,
        ...formData,
      });
    }
  };

  const handleBlur = (field: keyof typeof formData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    switch (field) {
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
          <Text style={styles.title}>Інформація про автомобіль</Text>
          <Text style={styles.subtitle}>Вкажіть дані про ваш автомобіль та досвід водіння</Text>
        </Animatable.View>

        <Animatable.View 
          animation="slideInUp" 
          delay={500} 
          style={styles.form}
        >
          <TextInput
            mode="outlined"
            label="Модель автомобіля"
            value={formData.carModel}
            onChangeText={(text) => setFormData({ ...formData, carModel: text })}
            onBlur={() => handleBlur('carModel')}
            style={styles.input}
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
            style={styles.input}
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
            style={styles.input}
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
            style={styles.input}
            left={<TextInput.Icon icon="clock" />}
            error={touched.yearsOfExperience && !!errors.yearsOfExperience}
          />
          <HelperText type="error" visible={touched.yearsOfExperience && !!errors.yearsOfExperience}>
            {errors.yearsOfExperience}
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
import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, IconButton, HelperText } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NavigationProp } from '../../../types/navigation';
import { getLicenseNumberError } from '../../../utils/validation';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

export default function DriverLicenseInfo() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { 
    fullName, 
    email, 
    phone, 
    carModel, 
    carColor, 
    carNumber, 
    yearsOfExperience 
  } = route.params as { 
    fullName: string;
    email: string;
    phone: string;
    carModel: string;
    carColor: string;
    carNumber: string;
    yearsOfExperience: string;
  };

  const [licenseNumber, setLicenseNumber] = useState('');
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  const handleNext = () => {
    const licenseError = getLicenseNumberError(licenseNumber);
    if (licenseError) {
      setError(licenseError);
      return;
    }

    navigation.navigate('DriverPasswordSetup', {
      fullName,
      email,
      phone,
      carModel,
      carColor,
      carNumber,
      yearsOfExperience,
      licenseNumber,
    });
  };

  const handleLicenseNumberChange = (text: string) => {
    // Видаляємо всі пробіли та дефіси
    let cleaned = text.replace(/[\s-]/g, '');
    
    // Обмежуємо довжину
    if (cleaned.length > 8) {
      cleaned = cleaned.slice(0, 8);
    }

    // Форматуємо в залежності від формату
    let formatted = cleaned;
    if (cleaned.length > 0) {
      if (/^[А-ЯІЇЄҐ]/.test(cleaned)) {
        // Формат "АВ 123456"
        if (cleaned.length > 2) {
          formatted = cleaned.slice(0, 2) + ' ' + cleaned.slice(2);
        }
      } else {
        // Формат "1234-5678"
        if (cleaned.length > 4) {
          formatted = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
        }
      }
    }

    setLicenseNumber(formatted);
    setError(getLicenseNumberError(formatted) || '');
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
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
              <Text style={styles.title}>Водійське посвідчення</Text>
              <Text style={styles.subtitle}>Вкажіть номер вашого водійського посвідчення</Text>
            </Animatable.View>

            <Animatable.View 
              animation="slideInUp" 
              delay={500} 
              style={styles.form}
            >
              <BlurView intensity={20} pointerEvents="box-none" style={styles.inputContainer}>
                <TextInput
                  mode="outlined"
                  label="Номер водійського посвідчення"
                  value={licenseNumber}
                  onChangeText={handleLicenseNumberChange}
                  onBlur={() => {
                    setTouched(true);
                    setError(getLicenseNumberError(licenseNumber) || '');
                  }}
                  style={styles.input}
                  left={<TextInput.Icon icon="card-account-details" color="#FF3B30" />}
                  error={touched && !!error}
                  placeholder="АВ 123456 або 1234-5678"
                  maxLength={9}
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
              <HelperText type="error" visible={touched && !!error} style={styles.errorText}>
                {error}
              </HelperText>

              <Animatable.View 
                animation="fadeIn" 
                delay={700} 
                style={styles.buttonContainer}
              >
                <BlurView intensity={20} pointerEvents="box-none" style={styles.buttonBlur}>
                  <Button
                    mode="contained"
                    onPress={handleNext}
                    style={styles.button}
                    icon="arrow-right"
                    contentStyle={styles.buttonContent}
                    labelStyle={styles.buttonLabel}
                  >
                    Далі
                  </Button>
                </BlurView>
              </Animatable.View>
            </Animatable.View>
          </View>
        </View>
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
}); 

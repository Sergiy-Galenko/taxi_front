import React, { useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { TextInput, Button, Text, IconButton, HelperText } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NavigationProp } from '../../../types/navigation';
import { getEmailError, getPhoneError } from '../../../utils/validation';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

export default function DriverContactInfo() {
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
        <LinearGradient
          colors={['#1A1A1A', '#2D2D2D']}
          style={styles.background}
        />
        
        {/* Decorative elements */}
        <View style={styles.decorativeCircle} />
        <View style={[styles.decorativeCircle, styles.circle2]} />
        <View style={[styles.decorativeCircle, styles.circle3]} />

        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          iconColor="#FFFFFF"
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
            <BlurView intensity={20} pointerEvents="box-none" style={styles.inputContainer}>
              <TextInput
                mode="outlined"
                label="Електронна пошта"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                onBlur={() => handleBlur('email')}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                left={<TextInput.Icon icon="email" color="#FF3B30" />}
                error={touched.email && !!errors.email}
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
            <HelperText type="error" visible={touched.email && !!errors.email} style={styles.errorText}>
              {errors.email}
            </HelperText>

            <BlurView intensity={20} pointerEvents="box-none" style={styles.inputContainer}>
              <TextInput
                mode="outlined"
                label="Номер телефону"
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                onBlur={() => handleBlur('phone')}
                keyboardType="phone-pad"
                style={styles.input}
                left={<TextInput.Icon icon="phone" color="#FF3B30" />}
                error={touched.phone && !!errors.phone}
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
            <HelperText type="error" visible={touched.phone && !!errors.phone} style={styles.errorText}>
              {errors.phone}
            </HelperText>

            <Animatable.View 
              animation="fadeIn" 
              delay={700} 
              style={styles.buttonContainer}
            >
              <BlurView intensity={20} pointerEvents="box-none" style={styles.blurContainer}>
                <Button
                  mode="contained"
                  onPress={handleNext}
                  style={styles.button}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.buttonLabel}
                  icon="arrow-right"
                >
                  Далі
                </Button>
              </BlurView>
            </Animatable.View>
          </Animatable.View>
        </Animatable.View>
      </View>
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
  backButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    gap: 8,
  },
  inputContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  input: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    height: 56,
    fontSize: 16,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
  },
  buttonContainer: {
    marginTop: 24,
  },
  blurContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  button: {
    height: 56,
    borderRadius: 16,
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
  decorativeCircle: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: 'rgba(255, 59, 48, 0.05)',
    top: -width * 0.4,
    right: -width * 0.2,
  },
  circle2: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: 'rgba(255, 59, 48, 0.03)',
    top: height * 0.3,
    left: -width * 0.2,
  },
  circle3: {
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: width * 0.2,
    backgroundColor: 'rgba(255, 59, 48, 0.02)',
    bottom: -width * 0.1,
    right: -width * 0.1,
  },
}); 

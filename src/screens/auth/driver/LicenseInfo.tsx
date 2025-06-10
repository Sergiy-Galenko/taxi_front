import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, IconButton, HelperText } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NavigationProp } from '../../../types/navigation';
import { getLicenseNumberError } from '../../../utils/validation';
import * as Animatable from 'react-native-animatable';

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
          <Text style={styles.title}>Водійське посвідчення</Text>
          <Text style={styles.subtitle}>Вкажіть номер вашого водійського посвідчення</Text>
        </Animatable.View>

        <Animatable.View 
          animation="slideInUp" 
          delay={500} 
          style={styles.form}
        >
          <TextInput
            mode="outlined"
            label="Номер водійського посвідчення"
            value={licenseNumber}
            onChangeText={setLicenseNumber}
            onBlur={() => {
              setTouched(true);
              setError(getLicenseNumberError(licenseNumber) || '');
            }}
            style={styles.input}
            left={<TextInput.Icon icon="card-account-details" />}
            error={touched && !!error}
          />
          <HelperText type="error" visible={touched && !!error}>
            {error}
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
}

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
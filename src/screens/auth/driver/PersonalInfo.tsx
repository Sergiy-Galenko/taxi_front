import React, { useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { TextInput, Button, Text, IconButton, HelperText } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '../../../types/navigation';
import { getFullNameError } from '../../../utils/validation';
import * as Animatable from 'react-native-animatable';

export const DriverPersonalInfo = () => {
  const navigation = useNavigation<NavigationProp>();
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  const handleNext = () => {
    const nameError = getFullNameError(fullName);
    if (nameError) {
      setError(nameError);
      return;
    }
    navigation.navigate('DriverContactInfo', { fullName });
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
          <Text style={styles.title}>Ваші персональні дані</Text>
          <Text style={styles.subtitle}>Вкажіть своє повне ім'я для реєстрації</Text>
        </Animatable.View>

        <Animatable.View 
          animation="slideInUp" 
          delay={500} 
          style={styles.form}
        >
          <TextInput
            mode="outlined"
            label="Повне ім'я"
            value={fullName}
            onChangeText={setFullName}
            onBlur={() => {
              setTouched(true);
              setError(getFullNameError(fullName) || '');
            }}
            style={styles.input}
            left={<TextInput.Icon icon="account" />}
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
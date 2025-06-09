import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { TextInput, Button, Text, Switch, IconButton } from 'react-native-paper';
import { authStyles } from '../../components/auth/styles';

export const PassengerRegistration = ({ navigation }: any) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleSubmit = () => {
    // TODO: Implement registration logic
    console.log('Registration data:', formData);
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
          <Text style={authStyles.title}>Реєстрація пасажира</Text>
          <Text style={authStyles.subtitle}>Створіть обліковий запис для поїздок</Text>
        </View>

        <View style={authStyles.form}>
          <TextInput
            mode="outlined"
            label="Повне ім'я"
            value={formData.fullName}
            onChangeText={(text) => setFormData({ ...formData, fullName: text })}
            style={authStyles.input}
            left={<TextInput.Icon icon="account" />}
          />

          <TextInput
            mode="outlined"
            label="Електронна пошта"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
            style={authStyles.input}
            left={<TextInput.Icon icon="email" />}
          />

          <TextInput
            mode="outlined"
            label="Номер телефону"
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            keyboardType="phone-pad"
            style={authStyles.input}
            left={<TextInput.Icon icon="phone" />}
          />

          <TextInput
            mode="outlined"
            label="Пароль"
            value={formData.password}
            onChangeText={(text) => setFormData({ ...formData, password: text })}
            secureTextEntry={!showPassword}
            style={authStyles.input}
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
          />

          <TextInput
            mode="outlined"
            label="Підтвердження паролю"
            value={formData.confirmPassword}
            onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
            secureTextEntry={!showPassword}
            style={authStyles.input}
            left={<TextInput.Icon icon="lock-check" />}
          />

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
            icon="account-plus"
          >
            Зареєструватися
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
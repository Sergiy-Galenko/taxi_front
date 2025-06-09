import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { TextInput, Button, Text, IconButton } from 'react-native-paper';
import { authStyles } from '../../components/auth/styles';

export const Login = ({ navigation }: any) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    // TODO: Implement login logic
    console.log('Login data:', formData);
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
          <Text style={authStyles.title}>Вхід в обліковий запис</Text>
          <Text style={authStyles.subtitle}>Увійдіть, щоб продовжити</Text>
        </View>

        <View style={authStyles.form}>
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

          <Button
            mode="contained"
            onPress={handleLogin}
            style={[authStyles.button, styles.button]}
            icon="login"
          >
            Увійти
          </Button>

          <Text
            style={[authStyles.link, styles.forgotPassword]}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            Забули пароль?
          </Text>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>
              Немає облікового запису?{' '}
              <Text
                style={styles.registerLink}
                onPress={() => navigation.navigate('Welcome')}
              >
                Зареєструватися
              </Text>
            </Text>
          </View>
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
  forgotPassword: {
    marginTop: 10,
    textAlign: 'center',
  },
  registerContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  registerText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  },
  registerLink: {
    color: '#007AFF',
    fontWeight: '600',
  },
}); 
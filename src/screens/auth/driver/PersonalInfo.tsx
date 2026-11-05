import { useI18n } from '../../../hooks/useI18n';
import { useReducedMotion } from '../../../shared/hooks/useReducedMotion';
import AuthScreenFrame from '../../../shared/components/AuthScreenFrame';
import React, { useState } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { TextInput, Button, Text, IconButton, HelperText } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '../../../types/navigation';
import { getFullNameError } from '../../../utils/validation';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';


export default function DriverPersonalInfo() {
  const { t } = useI18n();
  const reducedMotion = useReducedMotion();
  const { width, height } = useWindowDimensions();
  const styles = React.useMemo(() => createStyles(width, height), [width, height]);
  const navigation = useNavigation<NavigationProp>();
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  const handleNext = () => {
    setTouched(true);
    const nameError = getFullNameError(fullName);
    if (nameError) {
      setError(nameError);
      return;
    }
    navigation.navigate('DriverContactInfo', { fullName });
  };

  return (
    <AuthScreenFrame>
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
          animation={reducedMotion ? undefined : 'fadeInUp'}
          duration={1000}
          style={styles.content}
        >
          <Animatable.View animation={reducedMotion ? undefined : 'fadeIn'} delay={300}>
            <Text style={styles.title}>{t("Ваші персональні дані")}</Text>
            <Text style={styles.subtitle}>{t("Вкажіть своє повне ім'я для реєстрації")}</Text>
          </Animatable.View>

          <Animatable.View
            animation={reducedMotion ? undefined : 'slideInUp'}
            delay={500}
            style={styles.form}
          >
            <BlurView intensity={20} pointerEvents="box-none" style={styles.inputContainer}>
              <TextInput
                mode="outlined"
                label={t("Повне ім'я")}
                value={fullName}
                onChangeText={setFullName}
                onBlur={() => {
                  setTouched(true);
                  setError(getFullNameError(fullName) || '');
                }}
                style={styles.input}
                left={<TextInput.Icon icon="account" color="#FF3B30" />}
                error={touched && !!error}
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
              {t(error)}
            </HelperText>

            <Animatable.View
              animation={reducedMotion ? undefined : 'fadeIn'}
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
                >{t("Далі")}</Button>
              </BlurView>
            </Animatable.View>
          </Animatable.View>
        </Animatable.View>
      </View>

    </AuthScreenFrame>
  );
}

const createStyles = (width: number, height: number) => StyleSheet.create({
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
    minHeight: 56,
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
    minHeight: 56,
    borderRadius: 16,
    backgroundColor: '#FF3B30',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonContent: {
    minHeight: 56,
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

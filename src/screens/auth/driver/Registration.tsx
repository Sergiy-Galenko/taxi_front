import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '../../../types/navigation';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function DriverRegistration() {
  const navigation = useNavigation<NavigationProp>();

  const handleStartRegistration = () => {
    navigation.navigate('DriverPersonalInfo');
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

      <Animatable.View 
        animation="fadeIn"
        duration={1000}
        style={styles.content}
      >
        <Animatable.View 
          animation="zoomIn"
          duration={800}
          style={styles.iconContainer}
        >
          <MaterialCommunityIcons 
            name="car" 
            size={80} 
            color="#FF3B30"
          />
        </Animatable.View>

        <Animatable.Text 
          animation="fadeInUp"
          duration={800}
          delay={200}
          style={styles.title}
        >
          Реєстрація водія
        </Animatable.Text>

        <Animatable.Text 
          animation="fadeInUp"
          duration={800}
          delay={400}
          style={styles.subtitle}
        >
          Заповніть форму реєстрації, щоб стати водієм
        </Animatable.Text>

        <Animatable.View 
          animation="fadeInUp"
          duration={800}
          delay={600}
          style={styles.buttonContainer}
        >
          <BlurView intensity={20} style={styles.blurContainer}>
            <Button
              mode="contained"
              onPress={handleStartRegistration}
              style={styles.button}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
              icon="arrow-right"
            >
              Почати реєстрацію
            </Button>
          </BlurView>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 400,
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
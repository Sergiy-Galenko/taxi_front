import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '../types/navigation';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Animatable from 'react-native-animatable';

const { width, height } = Dimensions.get('window');

export default function Home() {
  const navigation = useNavigation<NavigationProp>();

  const handleLogout = () => {
    navigation.navigate('Login' as never);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1A1A1A', '#2D2D2D']}
        style={styles.gradient}
      >
        <View style={styles.circle1} />
        <View style={styles.circle2} />
        <View style={styles.circle3} />
      </LinearGradient>

      <Animatable.View 
        animation="fadeInUp" 
        duration={1000} 
        style={styles.content}
      >
        <Animatable.View animation="fadeIn" delay={300}>
          <Text variant="headlineMedium" style={styles.title}>
            Ласкаво просимо до Taxi App
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Ваша поїздка в одному дотику
          </Text>
        </Animatable.View>

        <Animatable.View 
          animation="fadeIn" 
          delay={500} 
          style={styles.buttonContainer}
        >
          <BlurView intensity={20} style={styles.buttonBlur}>
            <Button
              mode="contained"
              onPress={handleLogout}
              style={styles.button}
              icon="logout"
            >
              Вийти
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
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  circle1: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: '#FF3B30',
    opacity: 0.1,
    top: -width * 0.2,
    right: -width * 0.2,
  },
  circle2: {
    position: 'absolute',
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: '#FF3B30',
    opacity: 0.1,
    bottom: -width * 0.1,
    left: -width * 0.1,
  },
  circle3: {
    position: 'absolute',
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: width * 0.2,
    backgroundColor: '#FF3B30',
    opacity: 0.1,
    top: height * 0.3,
    right: -width * 0.1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  subtitle: {
    marginBottom: 32,
    textAlign: 'center',
    color: '#CCCCCC',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
  buttonBlur: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  button: {
    height: 50,
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#FF3B30',
  },
}); 
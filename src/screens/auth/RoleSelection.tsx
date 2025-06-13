import React from 'react';
import { View, StyleSheet, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

type RoleSelectionScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RoleSelection'>;

const RoleSelection: React.FC = () => {
  const navigation = useNavigation<RoleSelectionScreenNavigationProp>();

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <LinearGradient
        colors={['#1a1a1a', '#000']}
        style={styles.container}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
      >
        {/* Декоративні елементи */}
        <View style={styles.decorativeCircle} />
        <View style={[styles.decorativeCircle, styles.circleTopRight]} />
        
        <View style={styles.content}>
          <Animatable.View 
            animation="fadeInDown" 
            duration={1000}
            style={styles.header}
          >
            <MaterialIcons name="local-taxi" size={80} color="#FF3B30" />
            <Text style={styles.title}>Оберіть свою роль</Text>
            <Text style={styles.subtitle}>Як ви хочете використовувати наш сервіс?</Text>
          </Animatable.View>

          <BlurView intensity={30} tint="dark" style={styles.blurContainer}>
            <View style={styles.buttonsContainer}>
              <Animatable.View 
                animation="fadeInLeft" 
                duration={800}
                delay={300}
                style={styles.buttonWrapper}
              >
                <Button
                  mode="contained"
                  onPress={() => navigation.navigate('PassengerRegistration')}
                  style={styles.button}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.buttonLabel}
                  icon="account"
                >
                  Я пасажир
                </Button>
                <Text style={styles.buttonDescription}>
                  Замовляйте поїздки та переміщуйтесь містом з комфортом
                </Text>
              </Animatable.View>

              <Animatable.View 
                animation="fadeInRight" 
                duration={800}
                delay={500}
                style={styles.buttonWrapper}
              >
                <Button
                  mode="contained"
                  onPress={() => navigation.navigate('DriverRegistration')}
                  style={[styles.button, styles.driverButton]}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.buttonLabel}
                  icon="car"
                >
                  Я водій
                </Button>
                <Text style={styles.buttonDescription}>
                  Заробляйте, перевозячи пасажирів на своєму автомобілі
                </Text>
              </Animatable.View>
            </View>
          </BlurView>

          <Animatable.View 
            animation="fadeInUp" 
            duration={800}
            delay={700}
            style={styles.footer}
          >
            <Button
              mode="text"
              onPress={() => navigation.goBack()}
              textColor="#FFFFFF"
              icon="arrow-left"
            >
              Повернутися назад
            </Button>
          </Animatable.View>
        </View>
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  blurContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    padding: 1,
  },
  buttonsContainer: {
    backgroundColor: 'rgba(30, 30, 30, 0.7)',
    borderRadius: 24,
    padding: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.2)',
    gap: 20,
  },
  buttonWrapper: {
    alignItems: 'center',
  },
  button: {
    width: '100%',
    height: 56,
    borderRadius: 14,
    backgroundColor: '#FF3B30',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  driverButton: {
    backgroundColor: '#007AFF',
    shadowColor: '#007AFF',
  },
  buttonContent: {
    height: 56,
  },
  buttonLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  buttonDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
  },
  decorativeCircle: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255, 59, 48, 0.08)',
    top: -150,
    left: -100,
  },
  circleTopRight: {
    top: -100,
    left: 'auto',
    right: -150,
  },
});

export default RoleSelection; 
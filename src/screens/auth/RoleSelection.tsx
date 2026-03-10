import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';

type RoleSelectionScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RoleSelection'>;

export default function RoleSelection() {
  const navigation = useNavigation<RoleSelectionScreenNavigationProp>();

  return (
    <LinearGradient
      colors={['#1A1A1A', '#000000']}
      end={{ x: 1, y: 1 }}
      start={{ x: 0, y: 0 }}
      style={styles.container}
    >
      <View pointerEvents="none" style={styles.decorativeCircle} />
      <View pointerEvents="none" style={[styles.decorativeCircle, styles.circleTopRight]} />

      <View style={styles.content}>
        <Animatable.View animation="fadeInDown" duration={700} style={styles.header}>
          <MaterialIcons color="#FF3B30" name="local-taxi" size={80} />
          <Text style={styles.title}>Оберіть свою роль</Text>
          <Text style={styles.subtitle}>Що ви хочете зробити зараз?</Text>
        </Animatable.View>

        <View style={styles.panel}>
          <Animatable.View animation="fadeInLeft" delay={150} duration={500}>
            <TouchableOpacity
              activeOpacity={0.92}
              onPress={() => navigation.replace('PassengerRegistration')}
              style={[styles.roleCard, styles.passengerCard]}
            >
              <View style={styles.roleIconWrap}>
                <MaterialIcons color="#FFFFFF" name="person" size={26} />
              </View>
              <View style={styles.roleText}>
                <Text style={styles.roleTitle}>Я пасажир</Text>
                <Text style={styles.roleDescription}>
                  Замовити поїздку, вказати адресу та швидко перейти до оформлення.
                </Text>
              </View>
              <MaterialIcons color="#FFFFFF" name="arrow-forward" size={24} />
            </TouchableOpacity>
          </Animatable.View>

          <Animatable.View animation="fadeInRight" delay={250} duration={500}>
            <TouchableOpacity
              activeOpacity={0.92}
              onPress={() => navigation.replace('DriverRegistration')}
              style={[styles.roleCard, styles.driverCard]}
            >
              <View style={styles.roleIconWrap}>
                <MaterialIcons color="#FFFFFF" name="directions-car" size={26} />
              </View>
              <View style={styles.roleText}>
                <Text style={styles.roleTitle}>Я водій</Text>
                <Text style={styles.roleDescription}>
                  Почати реєстрацію водія та перейти до заповнення даних.
                </Text>
              </View>
              <MaterialIcons color="#FFFFFF" name="arrow-forward" size={24} />
            </TouchableOpacity>
          </Animatable.View>
        </View>

        <Animatable.View animation="fadeInUp" delay={350} duration={500} style={styles.footer}>
          <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialIcons color="#FFFFFF" name="arrow-back" size={18} />
            <Text style={styles.backButtonText}>Повернутися назад</Text>
          </TouchableOpacity>
        </Animatable.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 36,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 18,
    textAlign: 'center',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 16,
    textAlign: 'center',
  },
  panel: {
    backgroundColor: 'rgba(30, 30, 30, 0.76)',
    borderColor: 'rgba(255, 59, 48, 0.16)',
    borderRadius: 24,
    borderWidth: 1,
    gap: 16,
    padding: 18,
  },
  roleCard: {
    alignItems: 'center',
    borderRadius: 20,
    flexDirection: 'row',
    gap: 14,
    minHeight: 92,
    paddingHorizontal: 16,
    paddingVertical: 18,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  passengerCard: {
    backgroundColor: '#FF3B30',
    shadowColor: '#FF3B30',
  },
  driverCard: {
    backgroundColor: '#007AFF',
    shadowColor: '#007AFF',
  },
  roleIconWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 18,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  roleText: {
    flex: 1,
    gap: 4,
  },
  roleTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  roleDescription: {
    color: 'rgba(255,255,255,0.84)',
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
  },
  backButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  decorativeCircle: {
    backgroundColor: 'rgba(255, 59, 48, 0.08)',
    borderRadius: 150,
    height: 300,
    left: -100,
    position: 'absolute',
    top: -150,
    width: 300,
  },
  circleTopRight: {
    left: 'auto',
    right: -150,
    top: -100,
  },
});

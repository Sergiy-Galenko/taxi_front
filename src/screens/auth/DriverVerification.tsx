import React, { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Button, Text, IconButton } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';

export const DriverVerification = ({ navigation }: any) => {
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  const takeSelfie = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      alert('Потрібен доступ до камери для верифікації');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setSelfieImage(result.assets[0].uri);
    }
  };

  const handleVerificationComplete = () => {
    // TODO: Implement actual verification logic
    console.log('Selfie verification completed');
    navigation.navigate('CarVerification');
  };

  const handleContinue = () => {
    if (step === 1 && selfieImage) {
      setStep(2);
    } else if (step === 2) {
      navigation.navigate('CarVerification');
    }
  };

  return (
    <View style={styles.container}>
      <IconButton
        icon="arrow-left"
        size={24}
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      />

      <View style={styles.content}>
        <Text style={styles.title}>
          {step === 1 ? 'Верифікація водія' : 'Верифікація успішна!'}
        </Text>
        
        {step === 1 ? (
          <>
            <Text style={styles.subtitle}>
              Будь ласка, зробіть селфі для верифікації
            </Text>
            
            <View style={styles.imageContainer}>
              {selfieImage ? (
                <Image source={{ uri: selfieImage }} style={styles.image} />
              ) : (
                <View style={styles.placeholder}>
                  <IconButton
                    icon="camera"
                    size={50}
                    iconColor="#666"
                  />
                  <Text style={styles.placeholderText}>
                    Натисніть, щоб зробити фото
                  </Text>
                </View>
              )}
            </View>

            <Button
              mode="contained"
              onPress={takeSelfie}
              style={styles.button}
              icon="camera"
            >
              {selfieImage ? 'Зробити нове фото' : 'Зробити селфі'}
            </Button>

            {selfieImage && (
              <Button
                mode="contained"
                onPress={handleVerificationComplete}
                style={[styles.button, styles.continueButton]}
                icon="check"
              >
                Продовжити
              </Button>
            )}
          </>
        ) : (
          <>
            <IconButton
              icon="check-circle"
              size={80}
              iconColor="#4CAF50"
              style={styles.successIcon}
            />
            <Text style={styles.successText}>
              Ваше селфі успішно верифіковано!
            </Text>
            <Button
              mode="contained"
              onPress={handleContinue}
              style={[styles.button, styles.continueButton]}
              icon="arrow-right"
            >
              Продовжити верифікацію
            </Button>
          </>
        )}
      </View>
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
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  imageContainer: {
    width: 250,
    height: 250,
    borderRadius: 125,
    overflow: 'hidden',
    marginBottom: 30,
    backgroundColor: '#f5f5f5',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#666',
    marginTop: 10,
  },
  button: {
    width: '100%',
    marginTop: 10,
    backgroundColor: '#007AFF',
  },
  continueButton: {
    backgroundColor: '#4CAF50',
  },
  successIcon: {
    marginBottom: 20,
  },
  successText: {
    fontSize: 18,
    color: '#4CAF50',
    marginBottom: 30,
    textAlign: 'center',
  },
}); 
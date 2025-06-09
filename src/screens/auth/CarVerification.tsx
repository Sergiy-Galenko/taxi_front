import React, { useState } from 'react';
import { View, StyleSheet, Image, ScrollView } from 'react-native';
import { Button, Text, IconButton } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';

export const CarVerification = ({ navigation }: any) => {
  const [images, setImages] = useState({
    car: null as string | null,
    licensePlate: null as string | null,
    driverLicense: null as string | null,
  });

  const [currentStep, setCurrentStep] = useState(1);

  const takePhoto = async (type: 'car' | 'licensePlate' | 'driverLicense') => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      alert('Потрібен доступ до камери для верифікації');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImages(prev => ({
        ...prev,
        [type]: result.assets[0].uri
      }));
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Фото автомобіля';
      case 2:
        return 'Номерний знак';
      case 3:
        return 'Водійське посвідчення';
      default:
        return '';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 1:
        return 'Зробіть фото вашого автомобіля збоку';
      case 2:
        return 'Зробіть чітке фото номерного знаку';
      case 3:
        return 'Зробіть фото вашого водійського посвідчення';
      default:
        return '';
    }
  };

  const handleContinue = () => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleVerificationComplete();
    }
  };

  const handleVerificationComplete = () => {
    // TODO: Implement actual verification logic
    console.log('Car verification completed');
    navigation.navigate('VerificationComplete');
  };

  const getCurrentImage = () => {
    switch (currentStep) {
      case 1:
        return images.car;
      case 2:
        return images.licensePlate;
      case 3:
        return images.driverLicense;
      default:
        return null;
    }
  };

  const isStepComplete = () => {
    switch (currentStep) {
      case 1:
        return !!images.car;
      case 2:
        return !!images.licensePlate;
      case 3:
        return !!images.driverLicense;
      default:
        return false;
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

      <ScrollView style={styles.content}>
        <Text style={styles.title}>{getStepTitle()}</Text>
        <Text style={styles.subtitle}>{getStepDescription()}</Text>

        <View style={styles.imageContainer}>
          {getCurrentImage() ? (
            <Image source={{ uri: getCurrentImage()! }} style={styles.image} />
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
          onPress={() => takePhoto(
            currentStep === 1 ? 'car' :
            currentStep === 2 ? 'licensePlate' : 'driverLicense'
          )}
          style={styles.button}
          icon="camera"
        >
          {getCurrentImage() ? 'Зробити нове фото' : 'Зробити фото'}
        </Button>

        {isStepComplete() && (
          <Button
            mode="contained"
            onPress={handleContinue}
            style={[styles.button, styles.continueButton]}
            icon={currentStep === 3 ? 'check' : 'arrow-right'}
          >
            {currentStep === 3 ? 'Завершити верифікацію' : 'Продовжити'}
          </Button>
        )}
      </ScrollView>
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
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  imageContainer: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 30,
    backgroundColor: '#f5f5f5',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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
}); 
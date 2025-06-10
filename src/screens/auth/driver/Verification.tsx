import React, { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Button, Text, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '../../../types/navigation';
import * as ImagePicker from 'expo-image-picker';
import * as Animatable from 'react-native-animatable';

export const DriverVerification = () => {
  const navigation = useNavigation<NavigationProp>();
  const [images, setImages] = useState({
    license: null as string | null,
    car: null as string | null,
    selfie: null as string | null,
  });

  const pickImage = async (type: keyof typeof images) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      alert('Потрібен доступ до галереї для завантаження фото');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImages(prev => ({
        ...prev,
        [type]: result.assets[0].uri,
      }));
    }
  };

  const handleSubmit = () => {
    if (images.license && images.car && images.selfie) {
      // TODO: Implement verification logic
      console.log('Verification images:', images);
      navigation.navigate('Home');
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

      <Animatable.View 
        animation="fadeInUp" 
        duration={1000} 
        style={styles.content}
      >
        <Animatable.View animation="fadeIn" delay={300}>
          <Text style={styles.title}>Верифікація водія</Text>
          <Text style={styles.subtitle}>Завантажте необхідні документи для верифікації</Text>
        </Animatable.View>

        <Animatable.View 
          animation="slideInUp" 
          delay={500} 
          style={styles.form}
        >
          <View style={styles.imageContainer}>
            <Text style={styles.imageLabel}>Фото водійського посвідчення</Text>
            {images.license ? (
              <Image source={{ uri: images.license }} style={styles.image} />
            ) : (
              <Button
                mode="outlined"
                onPress={() => pickImage('license')}
                style={styles.imageButton}
                icon="camera"
              >
                Завантажити фото
              </Button>
            )}
          </View>

          <View style={styles.imageContainer}>
            <Text style={styles.imageLabel}>Фото автомобіля</Text>
            {images.car ? (
              <Image source={{ uri: images.car }} style={styles.image} />
            ) : (
              <Button
                mode="outlined"
                onPress={() => pickImage('car')}
                style={styles.imageButton}
                icon="car"
              >
                Завантажити фото
              </Button>
            )}
          </View>

          <View style={styles.imageContainer}>
            <Text style={styles.imageLabel}>Селфі з водійським посвідченням</Text>
            {images.selfie ? (
              <Image source={{ uri: images.selfie }} style={styles.image} />
            ) : (
              <Button
                mode="outlined"
                onPress={() => pickImage('selfie')}
                style={styles.imageButton}
                icon="account"
              >
                Завантажити фото
              </Button>
            )}
          </View>

          <Animatable.View 
            animation="fadeIn" 
            delay={700} 
            style={styles.buttonContainer}
          >
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.button}
              disabled={!images.license || !images.car || !images.selfie}
              icon="check"
            >
              Завершити верифікацію
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
    gap: 20,
  },
  imageContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  imageLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  imageButton: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    borderRadius: 10,
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
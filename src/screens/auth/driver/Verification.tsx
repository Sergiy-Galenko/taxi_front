import React, { useState } from 'react';
import { View, StyleSheet, Image, Dimensions, ScrollView } from 'react-native';
import { Button, Text, IconButton, Portal, Modal } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '../../../types/navigation';
import * as ImagePicker from 'expo-image-picker';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

export default function DriverVerification() {
  const navigation = useNavigation<NavigationProp>();
  const [images, setImages] = useState({
    license: null as string | null,
    car: null as string | null,
    selfie: null as string | null,
  });
  const [showModerationModal, setShowModerationModal] = useState(false);

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
      setShowModerationModal(true);
    }
  };

  const handleModerationClose = () => {
    setShowModerationModal(false);
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

      <IconButton
        icon="arrow-left"
        size={24}
        onPress={() => navigation.goBack()}
        style={styles.backButton}
        iconColor="#FF3B30"
      />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Animatable.View 
          animation="fadeInUp" 
          duration={1000} 
          style={styles.content}
        >
          <Animatable.View animation="fadeIn" delay={300} style={styles.header}>
            <Text style={styles.title}>Верифікація водія</Text>
            <Text style={styles.subtitle}>Завантажте необхідні документи для верифікації</Text>
          </Animatable.View>

          <Animatable.View 
            animation="slideInUp" 
            delay={500} 
            style={styles.form}
          >
            <BlurView intensity={20} style={styles.imageContainer}>
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
            </BlurView>

            <BlurView intensity={20} style={styles.imageContainer}>
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
            </BlurView>

            <BlurView intensity={20} style={styles.imageContainer}>
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
            </BlurView>

            <Animatable.View 
              animation="fadeIn" 
              delay={700} 
              style={styles.buttonContainer}
            >
              <BlurView intensity={20} style={styles.buttonBlur}>
                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  style={styles.button}
                  disabled={!images.license || !images.car || !images.selfie}
                  icon="check"
                >
                  Завершити верифікацію
                </Button>
              </BlurView>
            </Animatable.View>
          </Animatable.View>
        </Animatable.View>
      </ScrollView>

      <Portal>
        <Modal
          visible={showModerationModal}
          onDismiss={handleModerationClose}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView intensity={20} style={styles.modalContent}>
            <Animatable.View animation="fadeIn" duration={500}>
              <Text style={styles.modalTitle}>Дані на модерації</Text>
              <Text style={styles.modalText}>
                Ваші документи відправлені на перевірку. Час модерації може займати від кількох хвилин до кількох годин.
              </Text>
              <Text style={styles.modalText}>
                Після успішної модерації ви зможете увійти в додаток та почати працювати.
              </Text>
              <Button
                mode="contained"
                onPress={handleModerationClose}
                style={styles.modalButton}
                icon="check"
              >
                Зрозуміло
              </Button>
            </Animatable.View>
          </BlurView>
        </Modal>
      </Portal>
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
  backButton: {
    position: 'absolute',
    top: 40,
    left: 10,
    zIndex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
    paddingTop: 80,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 20,
    textAlign: 'center',
  },
  form: {
    gap: 15,
  },
  imageContainer: {
    borderRadius: 16,
    padding: 15,
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  imageLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 10,
    fontWeight: '500',
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 12,
  },
  imageButton: {
    width: '100%',
    height: 180,
    justifyContent: 'center',
    borderRadius: 12,
    borderColor: '#FF3B30',
    backgroundColor: 'transparent',
  },
  buttonContainer: {
    marginTop: 10,
    marginBottom: 20,
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
  modalContainer: {
    padding: 20,
    margin: 20,
  },
  modalContent: {
    borderRadius: 16,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalButton: {
    marginTop: 20,
    height: 50,
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#FF3B30',
  },
}); 
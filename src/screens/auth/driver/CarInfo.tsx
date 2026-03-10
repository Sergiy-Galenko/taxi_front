import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Keyboard, ScrollView, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { TextInput, Button, Text, IconButton, HelperText, Searchbar, List } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NavigationProp } from '../../../types/navigation';
import { getCarNumberError } from '../../../utils/validation';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

type CarBrands = {
  [key: string]: string[];
};

// Структура даних для марок та моделей автомобілів
const CAR_BRANDS: CarBrands = {
  'Toyota': ['Camry', 'Corolla', 'RAV4', 'Land Cruiser', 'Highlander', 'Prado'],
  'Honda': ['Civic', 'Accord', 'CR-V', 'Pilot', 'Odyssey'],
  'Volkswagen': ['Golf', 'Passat', 'Tiguan', 'T-Roc', 'Touareg'],
  'BMW': ['3 Series', '5 Series', 'X5', 'X3', 'X7'],
  'Mercedes-Benz': ['C-Class', 'E-Class', 'GLC', 'GLE', 'S-Class'],
  'Audi': ['A4', 'A6', 'Q5', 'Q7', 'Q8'],
  'Hyundai': ['Sonata', 'Tucson', 'Santa Fe', 'Elantra', 'Palisade'],
  'Kia': ['Sportage', 'Optima', 'Sorento', 'Telluride', 'Stinger'],
  'Ford': ['Focus', 'Mondeo', 'Kuga', 'Explorer', 'Mustang'],
  'Nissan': ['Qashqai', 'X-Trail', 'Teana', 'Murano', 'Patrol'],
  'Skoda': ['Octavia', 'Kodiaq', 'Superb', 'Karoq', 'Kamiq'],
  'Mazda': ['6', 'CX-5', 'CX-9', '3', 'CX-30'],
  'Subaru': ['Forester', 'Outback', 'Impreza', 'Legacy', 'Crosstrek'],
  'Lexus': ['RX', 'ES', 'NX', 'GX', 'LX'],
  'Volvo': ['XC60', 'XC90', 'S90', 'V90', 'XC40'],
  'Renault': ['Duster', 'Megane', 'Kaptur', 'Arkana', 'Koleos'],
  'Peugeot': ['3008', '508', '5008', '208', '2008'],
  'Citroen': ['C5', 'C4', 'C3', 'Berlingo', 'C5 Aircross'],
  'Opel': ['Astra', 'Insignia', 'Mokka', 'Crossland', 'Grandland'],
  'Chevrolet': ['Cruze', 'Captiva', 'Trailblazer', 'Tahoe', 'Equinox'],
  'Suzuki': ['Vitara', 'SX4', 'Jimny', 'Swift', 'Across'],
};

export default function DriverCarInfo() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { fullName, email, phone } = route.params as { 
    fullName: string;
    email: string;
    phone: string;
  };

  const [formData, setFormData] = useState({
    carBrand: '',
    carModel: '',
    carColor: '',
    carNumber: '',
    yearsOfExperience: '',
  });
  const [errors, setErrors] = useState({
    carBrand: '',
    carModel: '',
    carColor: '',
    carNumber: '',
    yearsOfExperience: '',
  });
  const [touched, setTouched] = useState({
    carBrand: false,
    carModel: false,
    carColor: false,
    carNumber: false,
    yearsOfExperience: false,
  });

  // Стани для випадаючих списків
  const [showBrands, setShowBrands] = useState(false);
  const [showModels, setShowModels] = useState(false);
  const [brandSearchQuery, setBrandSearchQuery] = useState('');
  const [modelSearchQuery, setModelSearchQuery] = useState('');
  const [filteredBrands, setFilteredBrands] = useState(Object.keys(CAR_BRANDS).sort());
  const [filteredModels, setFilteredModels] = useState<string[]>([]);

  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        setIsKeyboardVisible(true);
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
        setIsKeyboardVisible(false);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const handleBrandSearch = (query: string) => {
    setBrandSearchQuery(query);
    const filtered = Object.keys(CAR_BRANDS)
      .filter(brand => brand.toLowerCase().includes(query.toLowerCase()))
      .sort();
    setFilteredBrands(filtered);
  };

  const handleModelSearch = (query: string) => {
    setModelSearchQuery(query);
    if (formData.carBrand) {
      const models = CAR_BRANDS[formData.carBrand] || [];
      const filtered = models.filter((model: string) => 
        model.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredModels(filtered);
    }
  };

  const handleSelectBrand = (brand: string) => {
    setFormData(prev => ({ 
      ...prev, 
      carBrand: brand,
      carModel: '' // Скидаємо модель при зміні марки
    }));
    setShowBrands(false);
    setBrandSearchQuery('');
    setFilteredBrands(Object.keys(CAR_BRANDS).sort());
    setFilteredModels(CAR_BRANDS[brand] || []);
  };

  const handleSelectModel = (model: string) => {
    setFormData(prev => ({ ...prev, carModel: model }));
    setShowModels(false);
    setModelSearchQuery('');
  };

  const handleCarNumberChange = (text: string) => {
    // Видаляємо всі пробіли
    const cleanedText = text.replace(/\s/g, '');
    
    // Перетворюємо на великі літери
    const upperText = cleanedText.toUpperCase();
    
    // Форматуємо номер з пробілами
    let formattedText = upperText;
    if (upperText.length > 2) {
      formattedText = upperText.slice(0, 2) + ' ' + upperText.slice(2);
    }
    if (upperText.length > 6) {
      formattedText = formattedText.slice(0, 7) + ' ' + formattedText.slice(7);
    }
    
    setFormData(prev => ({ ...prev, carNumber: formattedText }));
    
    // Перевіряємо номер при кожній зміні
    const error = getCarNumberError(formattedText);
    setErrors(prev => ({ ...prev, carNumber: error || '' }));
    setTouched(prev => ({ ...prev, carNumber: true }));
  };

  const validateForm = () => {
    const newErrors = {
      carBrand: !formData.carBrand ? 'Вкажіть марку автомобіля' : '',
      carModel: !formData.carModel ? 'Вкажіть модель автомобіля' : '',
      carColor: !formData.carColor ? 'Вкажіть колір автомобіля' : '',
      carNumber: getCarNumberError(formData.carNumber) || '',
      yearsOfExperience: !formData.yearsOfExperience 
        ? 'Вкажіть досвід водіння' 
        : isNaN(Number(formData.yearsOfExperience)) || Number(formData.yearsOfExperience) < 0
          ? 'Вкажіть коректний досвід водіння'
          : '',
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const handleNext = () => {
    if (validateForm()) {
      navigation.navigate('DriverLicenseInfo', {
        fullName,
        email,
        phone,
        carBrand: formData.carBrand,
        carModel: formData.carModel,
        carColor: formData.carColor,
        carNumber: formData.carNumber,
        yearsOfExperience: formData.yearsOfExperience,
      } as any);
    }
  };

  const handleBrandFocus = () => {
    Keyboard.dismiss();
    setShowBrands(true);
  };

  const handleModelFocus = () => {
    Keyboard.dismiss();
    if (formData.carBrand) {
      setShowModels(true);
    }
  };

  const handleBrandBlur = () => {
    // Нехай випадаючий список залишається відкритим
    setTouched(prev => ({ ...prev, carBrand: true }));
  };

  const handleModelBlur = () => {
    // Нехай випадаючий список залишається відкритим
    setTouched(prev => ({ ...prev, carModel: true }));
  };

  const handleBlur = (field: keyof typeof formData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    switch (field) {
      case 'carBrand':
        setErrors(prev => ({ ...prev, carBrand: !formData.carBrand ? 'Марка автомобіля обов\'язкова' : '' }));
        break;
      case 'carModel':
        setErrors(prev => ({ ...prev, carModel: !formData.carModel ? 'Модель автомобіля обов\'язкова' : '' }));
        break;
      case 'carColor':
        setErrors(prev => ({ ...prev, carColor: !formData.carColor ? 'Колір автомобіля обов\'язковий' : '' }));
        break;
      case 'carNumber':
        setErrors(prev => ({ ...prev, carNumber: getCarNumberError(formData.carNumber) || '' }));
        break;
      case 'yearsOfExperience':
        setErrors(prev => ({
          ...prev,
          yearsOfExperience: !formData.yearsOfExperience 
            ? 'Досвід водіння обов\'язковий' 
            : isNaN(Number(formData.yearsOfExperience)) || Number(formData.yearsOfExperience) < 0
              ? 'Введіть коректний досвід водіння'
              : '',
        }));
        break;
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={styles.container}>
          <LinearGradient
            colors={['#1A1A1A', '#2A2A2A']}
            style={styles.background}
          />
          
          {/* Decorative circles */}
          <View style={styles.circle1} />
          <View style={styles.circle2} />
          <View style={styles.circle3} />

          <Animatable.View 
            animation="fadeIn" 
            style={styles.header}
          >
            <Text style={styles.title}>Інформація про автомобіль</Text>
            <Text style={styles.subtitle}>Вкажіть дані вашого автомобіля</Text>
          </Animatable.View>

          <Animatable.View 
            animation="slideInUp" 
            delay={500} 
            style={[
              styles.form,
              isKeyboardVisible && { marginBottom: keyboardHeight }
            ]}
          >
            <BlurView intensity={20} pointerEvents="box-none" style={styles.inputContainer}>
              <TextInput
                mode="outlined"
                label="Марка автомобіля"
                value={formData.carBrand}
                onFocus={handleBrandFocus}
                onBlur={handleBrandBlur}
                style={styles.input}
                left={<TextInput.Icon icon="car" color="#FF3B30" />}
                right={<TextInput.Icon icon={showBrands ? "chevron-up" : "chevron-down"} color="#FF3B30" />}
                error={touched.carBrand && !!errors.carBrand}
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
            <HelperText type="error" visible={touched.carBrand && !!errors.carBrand} style={styles.errorText}>
              {errors.carBrand}
            </HelperText>

            {showBrands && (
              <Animatable.View 
                animation="fadeIn"
                style={styles.dropdownContainer}
              >
                <BlurView intensity={20} pointerEvents="box-none" style={styles.dropdown}>
                  <Searchbar
                    placeholder="Пошук марки"
                    onChangeText={handleBrandSearch}
                    value={brandSearchQuery}
                    style={styles.searchBar}
                    iconColor="#FF3B30"
                    inputStyle={{ color: '#FFFFFF' }}
                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                    theme={{
                      colors: {
                        primary: '#FF3B30',
                        text: '#FFFFFF',
                        placeholder: 'rgba(255, 255, 255, 0.7)',
                      },
                    }}
                  />
                  <ScrollView style={styles.modelList}>
                    {filteredBrands.map((brand, index) => (
                      <List.Item
                        key={index}
                        title={brand}
                        onPress={() => handleSelectBrand(brand)}
                        titleStyle={styles.modelItemText}
                        style={styles.modelItem}
                        theme={{
                          colors: {
                            text: '#FFFFFF',
                          },
                        }}
                      />
                    ))}
                  </ScrollView>
                </BlurView>
              </Animatable.View>
            )}

            <BlurView intensity={20} pointerEvents="box-none" style={styles.inputContainer}>
              <TextInput
                mode="outlined"
                label="Модель автомобіля"
                value={formData.carModel}
                onFocus={handleModelFocus}
                onBlur={handleModelBlur}
                style={styles.input}
                left={<TextInput.Icon icon="car-info" color="#FF3B30" />}
                right={<TextInput.Icon icon={showModels ? "chevron-up" : "chevron-down"} color="#FF3B30" />}
                error={touched.carModel && !!errors.carModel}
                disabled={!formData.carBrand}
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
            <HelperText type="error" visible={touched.carModel && !!errors.carModel} style={styles.errorText}>
              {errors.carModel}
            </HelperText>

            {showModels && formData.carBrand && (
              <Animatable.View 
                animation="fadeIn"
                style={styles.dropdownContainer}
              >
                <BlurView intensity={20} pointerEvents="box-none" style={styles.dropdown}>
                  <Searchbar
                    placeholder="Пошук моделі"
                    onChangeText={handleModelSearch}
                    value={modelSearchQuery}
                    style={styles.searchBar}
                    iconColor="#FF3B30"
                    inputStyle={{ color: '#FFFFFF' }}
                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                    theme={{
                      colors: {
                        primary: '#FF3B30',
                        text: '#FFFFFF',
                        placeholder: 'rgba(255, 255, 255, 0.7)',
                      },
                    }}
                  />
                  <ScrollView style={styles.modelList}>
                    {filteredModels.map((model, index) => (
                      <List.Item
                        key={index}
                        title={model}
                        onPress={() => handleSelectModel(model)}
                        titleStyle={styles.modelItemText}
                        style={styles.modelItem}
                        theme={{
                          colors: {
                            text: '#FFFFFF',
                          },
                        }}
                      />
                    ))}
                  </ScrollView>
                </BlurView>
              </Animatable.View>
            )}

            <BlurView intensity={20} pointerEvents="box-none" style={styles.inputContainer}>
              <TextInput
                mode="outlined"
                label="Колір автомобіля"
                value={formData.carColor}
                onChangeText={(text) => setFormData({ ...formData, carColor: text })}
                onBlur={() => handleBlur('carColor')}
                style={styles.input}
                left={<TextInput.Icon icon="palette" color="#FF3B30" />}
                error={touched.carColor && !!errors.carColor}
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
            <HelperText type="error" visible={touched.carColor && !!errors.carColor} style={styles.errorText}>
              {errors.carColor}
            </HelperText>

            <BlurView intensity={20} pointerEvents="box-none" style={styles.inputContainer}>
              <TextInput
                mode="outlined"
                label="Номер автомобіля"
                value={formData.carNumber}
                onChangeText={handleCarNumberChange}
                style={styles.input}
                left={<TextInput.Icon icon="car-info" color="#FF3B30" />}
                error={touched.carNumber && !!errors.carNumber}
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
                placeholder="AA 0000 AA"
                maxLength={10}
              />
            </BlurView>
            <HelperText type="error" visible={touched.carNumber && !!errors.carNumber} style={styles.errorText}>
              {errors.carNumber}
            </HelperText>

            <BlurView intensity={20} pointerEvents="box-none" style={styles.inputContainer}>
              <TextInput
                mode="outlined"
                label="Досвід водіння (роки)"
                value={formData.yearsOfExperience}
                onChangeText={(text) => setFormData({ ...formData, yearsOfExperience: text })}
                onBlur={() => handleBlur('yearsOfExperience')}
                keyboardType="numeric"
                style={styles.input}
                left={<TextInput.Icon icon="clock" color="#FF3B30" />}
                error={touched.yearsOfExperience && !!errors.yearsOfExperience}
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
            <HelperText type="error" visible={touched.yearsOfExperience && !!errors.yearsOfExperience} style={styles.errorText}>
              {errors.yearsOfExperience}
            </HelperText>

            <Animatable.View 
              animation="fadeIn" 
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
                >
                  Далі
                </Button>
              </BlurView>
            </Animatable.View>
          </Animatable.View>
        </View>
    </KeyboardAvoidingView>
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
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  form: {
    flex: 1,
    paddingHorizontal: 20,
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
    height: 56,
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
  circle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    top: -50,
    right: -50,
  },
  circle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    bottom: 100,
    left: -50,
  },
  circle3: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    bottom: -30,
    right: 50,
  },
  dropdownContainer: {
    position: 'absolute',
    top: 120,
    left: 24,
    right: 24,
    zIndex: 1000,
    maxHeight: 300,
  },
  dropdown: {
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  searchBar: {
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 0,
  },
  modelList: {
    maxHeight: 250,
  },
  modelItem: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modelItemText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
}); 

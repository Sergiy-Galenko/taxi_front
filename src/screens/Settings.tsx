import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { Text, Switch, Button, Divider, Menu } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '../types/navigation';

const MOCK_ROLE: 'passenger' | 'driver' | 'admin' = 'passenger';

export default function NetflixStyleSettingsScreen() {
  const { theme, mode, setThemeMode } = useTheme();
  const { signOut } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [online, setOnline] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('Карта');
  const [address, setAddress] = useState('');
  const [language, setLanguage] = useState('Українська');
  const [languageMenuVisible, setLanguageMenuVisible] = useState(false);
  const [paymentMenuVisible, setPaymentMenuVisible] = useState(false);

  const languages = ['Українська', 'English', 'Polski', 'Deutsch'];
  const paymentMethods = ['Карта', 'Готівка', 'Google Pay', 'Apple Pay'];

  useEffect(() => {
    AsyncStorage.getItem('themeMode').then(val => {
      if (val === 'light' || val === 'dark' || val === 'auto') setThemeMode(val);
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('themeMode', mode);
  }, [mode]);

  const handleLogout = async () => {
    await signOut();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <LinearGradient
      colors={['#141414', '#1a1a1a', '#000']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Налаштування</Text>
          <Ionicons name="settings-outline" size={28} color="#E50914" style={styles.icon} />
        </View>
        
        {/* Профіль користувача */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <FontAwesome5 name="user-circle" size={48} color="#E50914" />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>Олександр Петренко</Text>
              <Text style={styles.profileRole}>
                {MOCK_ROLE === 'passenger' ? 'Пасажир' : 
                 MOCK_ROLE === 'driver' ? 'Водій' : 'Адміністратор'}
              </Text>
            </View>
          </View>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={20} color="#FFD700" />
            <Text style={styles.ratingText}>4.8</Text>
            <Text style={styles.ratingLabel}>Рейтинг</Text>
          </View>
        </View>
        
        {/* Секції налаштувань */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Особисті налаштування</Text>
          
          <View style={styles.settingItem}>
            <MaterialIcons name="language" size={24} color="#888" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Мова</Text>
              <Menu
                visible={languageMenuVisible}
                onDismiss={() => setLanguageMenuVisible(false)}
                anchor={
                  <TouchableOpacity 
                    style={styles.menuButton}
                    onPress={() => setLanguageMenuVisible(true)}
                  >
                    <Text style={styles.menuButtonText}>{language}</Text>
                    <Ionicons name="chevron-down" size={16} color="#888" />
                  </TouchableOpacity>
                }
                contentStyle={styles.menuContent}
              >
                {languages.map((lang) => (
                  <Menu.Item
                    key={lang}
                    onPress={() => {
                      setLanguage(lang);
                      setLanguageMenuVisible(false);
                    }}
                    title={lang}
                    titleStyle={{ color: language === lang ? '#E50914' : '#FFF' }}
                  />
                ))}
              </Menu>
            </View>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.settingItem}>
            <Ionicons name="notifications-outline" size={24} color="#888" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Сповіщення</Text>
              <Switch 
                value={pushEnabled} 
                onValueChange={setPushEnabled} 
                color="#E50914"
                thumbColor="#FFF"
              />
            </View>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.settingItem}>
            <MaterialIcons name="dark-mode" size={24} color="#888" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Темна тема</Text>
              <Switch 
                value={mode === 'dark'} 
                onValueChange={(value) => setThemeMode(value ? 'dark' : 'auto')} 
                color="#E50914"
                thumbColor="#FFF"
              />
            </View>
          </View>
        </View>
        
        {/* Роль-специфічні налаштування */}
        {MOCK_ROLE === 'passenger' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Налаштування поїздок</Text>
            
            <View style={styles.settingItem}>
              <FontAwesome5 name="money-bill-wave" size={20} color="#888" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Спосіб оплати</Text>
                <Menu
                  visible={paymentMenuVisible}
                  onDismiss={() => setPaymentMenuVisible(false)}
                  anchor={
                    <TouchableOpacity 
                      style={styles.menuButton}
                      onPress={() => setPaymentMenuVisible(true)}
                    >
                      <Text style={styles.menuButtonText}>{paymentMethod}</Text>
                      <Ionicons name="chevron-down" size={16} color="#888" />
                    </TouchableOpacity>
                  }
                  contentStyle={styles.menuContent}
                >
                  {paymentMethods.map((method) => (
                    <Menu.Item
                      key={method}
                      onPress={() => {
                        setPaymentMethod(method);
                        setPaymentMenuVisible(false);
                      }}
                      title={method}
                      titleStyle={{ color: paymentMethod === method ? '#E50914' : '#FFF' }}
                    />
                  ))}
                </Menu>
              </View>
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.settingItem}>
              <Ionicons name="location-outline" size={24} color="#888" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Улюблені адреси</Text>
                <Button 
                  mode="text" 
                  onPress={() => {}} 
                  textColor="#E50914"
                  icon="plus"
                >
                  Додати
                </Button>
              </View>
            </View>
          </View>
        )}
        
        {MOCK_ROLE === 'driver' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Налаштування водія</Text>
            
            <View style={styles.settingItem}>
              <Ionicons name="car-sport-outline" size={24} color="#888" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Статус</Text>
                <View style={styles.statusContainer}>
                  <Text style={styles.statusText}>
                    {online ? 'Онлайн' : 'Офлайн'}
                  </Text>
                  <Switch 
                    value={online} 
                    onValueChange={setOnline} 
                    color="#E50914"
                    thumbColor="#FFF"
                  />
                </View>
              </View>
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.settingItem}>
              <Ionicons name="car-outline" size={24} color="#888" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Дані авто</Text>
                <Button 
                  mode="text" 
                  onPress={() => {}} 
                  textColor="#E50914"
                  icon="pencil"
                >
                  Редагувати
                </Button>
              </View>
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.settingItem}>
              <MaterialIcons name="description" size={24} color="#888" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Документи</Text>
                <Button 
                  mode="text" 
                  onPress={() => {}} 
                  textColor="#E50914"
                  icon="eye"
                >
                  Переглянути
                </Button>
              </View>
            </View>
          </View>
        )}
        
        {MOCK_ROLE === 'admin' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Адміністрування</Text>
            
            <Button 
              mode="contained" 
              style={styles.adminButton}
              buttonColor="#E50914"
              textColor="#FFF"
              icon="account-group"
            >
              Керування користувачами
            </Button>
            
            <Button 
              mode="contained" 
              style={styles.adminButton}
              buttonColor="#E50914"
              textColor="#FFF"
              icon="chart-bar"
            >
              Аналітика та звіти
            </Button>
            
            <Button 
              mode="contained" 
              style={styles.adminButton}
              buttonColor="#E50914"
              textColor="#FFF"
              icon="cash"
            >
              Налаштування тарифів
            </Button>
          </View>
        )}
        
        {/* Кнопка виходу */}
        <Button 
          mode="outlined" 
          style={styles.logoutButton}
          textColor="#E50914"
          icon="logout"
          onPress={handleLogout}
        >
          Вийти з акаунту
        </Button>
        
        <Text style={styles.versionText}>Версія додатку 1.2.0</Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#E50914',
    letterSpacing: -0.5,
  },
  icon: {
    backgroundColor: 'rgba(229, 9, 20, 0.1)',
    padding: 10,
    borderRadius: 20,
  },
  profileCard: {
    backgroundColor: 'rgba(30,30,30,0.7)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: 'rgba(80,80,80,0.5)',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  profileInfo: {
    marginLeft: 15,
  },
  profileName: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  profileRole: {
    color: '#E50914',
    fontSize: 14,
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,215,0,0.1)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  ratingText: {
    color: '#FFD700',
    fontWeight: '700',
    marginLeft: 5,
    marginRight: 8,
  },
  ratingLabel: {
    color: '#AAA',
    fontSize: 14,
  },
  section: {
    backgroundColor: 'rgba(30,30,30,0.7)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(80,80,80,0.5)',
  },
  sectionTitle: {
    color: '#E50914',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingText: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 15,
  },
  settingLabel: {
    color: '#FFF',
    fontSize: 16,
  },
  divider: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    height: 1,
    marginVertical: 5,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(50,50,50,0.6)',
    borderRadius: 12,
    minWidth: 120,
  },
  menuButtonText: {
    color: '#FFF',
    marginRight: 5,
  },
  menuContent: {
    backgroundColor: '#1f1f1f',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    color: '#FFF',
    marginRight: 10,
  },
  adminButton: {
    marginBottom: 15,
    borderRadius: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  logoutButton: {
    marginTop: 10,
    borderColor: '#E50914',
    borderRadius: 12,
    paddingVertical: 8,
    borderWidth: 2,
  },
  versionText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 25,
    marginBottom: 10,
  },
});
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { MaterialIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../types/navigation';
import { View, Text, StyleSheet } from 'react-native';
import { Text as PaperText } from 'react-native-paper';

// Auth Screens
import Login from '../screens/auth/Login';
import RoleSelection from '../screens/auth/RoleSelection';
import PassengerRegistration from '../screens/auth/PassengerRegistration';
import DriverRegistration from '../screens/auth/driver/Registration';

// Driver Registration Screens
import DriverPersonalInfo from '../screens/auth/driver/PersonalInfo';
import DriverContactInfo from '../screens/auth/driver/ContactInfo';
import DriverCarInfo from '../screens/auth/driver/CarInfo';
import DriverLicenseInfo from '../screens/auth/driver/LicenseInfo';
import DriverPasswordSetup from '../screens/auth/driver/PasswordSetup';
import DriverVerification from '../screens/auth/driver/Verification';

// Main Screens
import Home from '../screens/Home';
import SettingsScreen from '../screens/Settings';

const Stack = createStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator();

function CustomDrawerContent(props: any) {
  // TODO: замінити на реальні дані користувача
  const user = {
    name: 'Іван Користувач',
    rating: 4.8,
    avatar: undefined, // можна додати url
  };
  return (
    <DrawerContentScrollView {...props} contentContainerStyle={drawerStyles.container}>
      <View style={drawerStyles.userBlock}>
        <View style={drawerStyles.avatar}>
          <MaterialIcons name="account-circle" size={60} color="#fff" />
        </View>
        <View style={drawerStyles.userInfo}>
          <Text style={drawerStyles.userName}>{user.name}</Text>
          <View style={drawerStyles.ratingRow}>
            <MaterialIcons name="star" size={18} color="#FF3B30" />
            <Text style={drawerStyles.ratingText}>{user.rating}</Text>
          </View>
        </View>
      </View>
      <DrawerItemList {...props} />
      <DrawerItem
        label="Налаштування"
        icon={({ color, size }) => (
          <MaterialIcons name="settings" size={size} color={color} />
        )}
        onPress={() => props.navigation.navigate('Settings')}
        labelStyle={drawerStyles.drawerLabel}
        style={drawerStyles.drawerItem}
      />
      <DrawerItem
        label="Вийти"
        icon={({ color, size }) => (
          <MaterialIcons name="logout" size={size} color={color} />
        )}
        onPress={() => props.navigation.navigate('Login')}
        labelStyle={drawerStyles.drawerLabel}
        style={drawerStyles.drawerItem}
      />
    </DrawerContentScrollView>
  );
}

const drawerStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    paddingTop: 0,
  },
  userBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    paddingVertical: 24,
    paddingHorizontal: 18,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 12,
  },
  avatar: {
    backgroundColor: '#B71C1C',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 4,
  },
  drawerLabel: {
    color: '#FF3B30',
    fontWeight: '600',
    fontSize: 16,
  },
  drawerItem: {
    borderRadius: 12,
    marginHorizontal: 8,
    marginVertical: 2,
  },
});

function MainDrawer() {
  // TODO: отримати роль користувача з контексту/стейту
  const userRole: 'passenger' | 'driver' | 'admin' = 'passenger';
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#1A1A1A' },
        headerTintColor: '#fff',
        drawerActiveTintColor: '#FF3B30',
        drawerInactiveTintColor: '#222',
        drawerStyle: { backgroundColor: '#fff', width: 260 },
      }}
    >
      <Drawer.Screen
        name="Home"
        component={Home}
        options={{
          title: 'Головна',
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Settings"
        children={() => <SettingsScreen userRole={userRole} />}
        options={{
          title: 'Налаштування',
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: 'white' },
        }}
      >
        {/* Auth Stack */}
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="RoleSelection" component={RoleSelection} />
        <Stack.Screen name="PassengerRegistration" component={PassengerRegistration} />
        <Stack.Screen name="DriverRegistration" component={DriverRegistration} />

        {/* Driver Registration Stack */}
        <Stack.Screen name="DriverPersonalInfo" component={DriverPersonalInfo} />
        <Stack.Screen name="DriverContactInfo" component={DriverContactInfo} />
        <Stack.Screen name="DriverCarInfo" component={DriverCarInfo} />
        <Stack.Screen name="DriverLicenseInfo" component={DriverLicenseInfo} />
        <Stack.Screen name="DriverPasswordSetup" component={DriverPasswordSetup} />
        <Stack.Screen name="DriverVerification" component={DriverVerification} />

        {/* Main Drawer as Main App */}
        <Stack.Screen name="Main" component={MainDrawer} />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';

// Auth Screens
import { Login } from '../screens/auth/Login';
import { PassengerRegistration } from '../screens/auth/PassengerRegistration';
import { DriverRegistration } from '../screens/auth/DriverRegistration';

// Driver Registration Screens
import { DriverPersonalInfo } from '../screens/auth/driver/PersonalInfo';
import { DriverContactInfo } from '../screens/auth/driver/ContactInfo';
import { DriverCarInfo } from '../screens/auth/driver/CarInfo';
import { DriverLicenseInfo } from '../screens/auth/driver/LicenseInfo';
import { DriverPasswordSetup } from '../screens/auth/driver/PasswordSetup';
import { DriverVerification } from '../screens/auth/driver/Verification';

// Main Screens
import Home from '../screens/Home';

const Stack = createStackNavigator<RootStackParamList>();

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
        <Stack.Screen name="PassengerRegistration" component={PassengerRegistration} />
        <Stack.Screen name="DriverRegistration" component={DriverRegistration} />

        {/* Driver Registration Stack */}
        <Stack.Screen name="DriverPersonalInfo" component={DriverPersonalInfo} />
        <Stack.Screen name="DriverContactInfo" component={DriverContactInfo} />
        <Stack.Screen name="DriverCarInfo" component={DriverCarInfo} />
        <Stack.Screen name="DriverLicenseInfo" component={DriverLicenseInfo} />
        <Stack.Screen name="DriverPasswordSetup" component={DriverPasswordSetup} />
        <Stack.Screen name="DriverVerification" component={DriverVerification} />

        {/* Main Stack */}
        <Stack.Screen name="Home" component={Home} />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 
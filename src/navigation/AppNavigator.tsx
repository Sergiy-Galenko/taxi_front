import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

import Login from '../screens/auth/Login';
import RoleSelection from '../screens/auth/RoleSelection';
import PassengerRegistration from '../screens/auth/PassengerRegistration';
import DriverRegistration from '../screens/auth/driver/Registration';

import DriverPersonalInfo from '../screens/auth/driver/PersonalInfo';
import DriverContactInfo from '../screens/auth/driver/ContactInfo';
import DriverCarInfo from '../screens/auth/driver/CarInfo';
import DriverLicenseInfo from '../screens/auth/driver/LicenseInfo';
import DriverPasswordSetup from '../screens/auth/driver/PasswordSetup';
import DriverVerification from '../screens/auth/driver/Verification';

import Home from '../screens/Home';
import SettingsScreen from '../screens/Settings';
import TripHistoryScreen from '../screens/TripHistoryScreen';
import PreorderScreen from '../screens/PreorderScreen';
import DriverHomeScreen from '../screens/driver/Home';
import VehicleSelectionScreen from '../screens/passenger/VehicleSelection';
import DriverSearchScreen from '../screens/passenger/DriverSearch';
import ActiveRideScreen from '../screens/passenger/ActiveRide';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="RoleSelection" component={RoleSelection} />
        <Stack.Screen name="PassengerRegistration" component={PassengerRegistration} />
        <Stack.Screen name="DriverRegistration" component={DriverRegistration} />

        <Stack.Screen
          name="DriverPersonalInfo"
          component={DriverPersonalInfo}
          options={stackHeaderOptions('Personal info')}
        />
        <Stack.Screen
          name="DriverContactInfo"
          component={DriverContactInfo}
          options={stackHeaderOptions('Contact info')}
        />
        <Stack.Screen
          name="DriverCarInfo"
          component={DriverCarInfo}
          options={stackHeaderOptions('Vehicle details')}
        />
        <Stack.Screen
          name="DriverLicenseInfo"
          component={DriverLicenseInfo}
          options={stackHeaderOptions('License details')}
        />
        <Stack.Screen
          name="DriverPasswordSetup"
          component={DriverPasswordSetup}
          options={stackHeaderOptions('Create password')}
        />
        <Stack.Screen
          name="DriverVerification"
          component={DriverVerification}
          options={stackHeaderOptions('Verification')}
        />

        <Stack.Screen name="Main" component={Home} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="VehicleSelection" component={VehicleSelectionScreen} />
        <Stack.Screen name="DriverSearch" component={DriverSearchScreen} />
        <Stack.Screen name="ActiveRide" component={ActiveRideScreen} />
        <Stack.Screen name="Preorder" component={PreorderScreen} />
        <Stack.Screen name="TripHistory" component={TripHistoryScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="DriverHome" component={DriverHomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const stackHeaderOptions = (title: string) => ({
  headerShown: true,
  title,
  headerStyle: {
    backgroundColor: '#15202B',
  },
  headerTintColor: '#FFFFFF',
  headerTitleStyle: {
    color: '#FFFFFF',
    fontWeight: '700' as const,
  },
});

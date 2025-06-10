import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { DriverPersonalInfo } from '../screens/auth/driver/PersonalInfo';
import { DriverContactInfo } from '../screens/auth/driver/ContactInfo';
import { DriverCarInfo } from '../screens/auth/driver/CarInfo';
import { DriverLicenseInfo } from '../screens/auth/driver/LicenseInfo';
import { DriverPasswordSetup } from '../screens/auth/driver/PasswordSetup';
import { DriverVerification } from '../screens/auth/driver/Verification';

const Stack = createStackNavigator();

export const DriverRegistrationStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#fff' },
      }}
    >
      <Stack.Screen name="DriverPersonalInfo" component={DriverPersonalInfo} />
      <Stack.Screen name="DriverContactInfo" component={DriverContactInfo} />
      <Stack.Screen name="DriverCarInfo" component={DriverCarInfo} />
      <Stack.Screen name="DriverLicenseInfo" component={DriverLicenseInfo} />
      <Stack.Screen name="DriverPasswordSetup" component={DriverPasswordSetup} />
      <Stack.Screen name="DriverVerification" component={DriverVerification} />
    </Stack.Navigator>
  );
}; 
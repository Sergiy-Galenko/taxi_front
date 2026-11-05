import { darkColors, lightColors } from '../design-system/tokens';
import { DriverDraftProvider } from '../features/auth/DriverDraft';
import React, { useMemo } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { sessionArea } from './access';
import { useUser } from '../hooks/UserContext';
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../hooks/useTheme';
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
  const { isDark, theme } = useTheme();
  const navigationTheme = useMemo(() => {
    const baseTheme = isDark ? NavigationDarkTheme : NavigationDefaultTheme;

    return {
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        background: theme.colors.background,
        card: theme.colors.surface,
        text: theme.colors.onSurface,
        border: (isDark ? darkColors : lightColors).border,
        primary: theme.colors.primary,
        notification: theme.colors.error,
      },
    };
  }, [isDark, theme.colors.background, theme.colors.error, theme.colors.onSurface, theme.colors.primary, theme.colors.surface]);

  const { state } = useUser();
  const area = sessionArea(state);
  if (area === 'initializing') {
    return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator accessibilityLabel="Restoring session" /></View>;
  }
  return (
    <NavigationContainer theme={navigationTheme}>
      {area === 'passenger' ? <PassengerNavigator /> : area === 'driver' ? <DriverNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

export function AuthNavigator() {
  return (
    <DriverDraftProvider><Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="RoleSelection" component={RoleSelection} />
      <Stack.Screen name="PassengerRegistration" component={PassengerRegistration} />
      <Stack.Screen name="DriverRegistration" component={DriverRegistration} />
      <Stack.Screen name="DriverPersonalInfo" component={DriverPersonalInfo} />
      <Stack.Screen name="DriverContactInfo" component={DriverContactInfo} />
      <Stack.Screen name="DriverCarInfo" component={DriverCarInfo} />
      <Stack.Screen name="DriverLicenseInfo" component={DriverLicenseInfo} />
      <Stack.Screen name="DriverPasswordSetup" component={DriverPasswordSetup} />
      <Stack.Screen name="DriverVerification" component={DriverVerification} />
    </Stack.Navigator></DriverDraftProvider>
  );
}
export function PassengerNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="VehicleSelection" component={VehicleSelectionScreen} />
      <Stack.Screen name="DriverSearch" component={DriverSearchScreen} />
      <Stack.Screen name="ActiveRide" component={ActiveRideScreen} />
      <Stack.Screen name="Preorder" component={PreorderScreen} />
      <Stack.Screen name="TripHistory" component={TripHistoryScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
export function DriverNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DriverHome" component={DriverHomeScreen} />
    </Stack.Navigator>
  );
}

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Welcome } from './src/screens/auth/Welcome';
import { PassengerRegistration } from './src/screens/auth/PassengerRegistration';
import { DriverRegistration } from './src/screens/auth/DriverRegistration';
import { Login } from './src/screens/auth/Login';
import { DriverVerification } from './src/screens/auth/DriverVerification';
import { CarVerification } from './src/screens/auth/CarVerification';
import { VerificationComplete } from './src/screens/auth/VerificationComplete';
import { DriverHome } from './src/screens/driver/Home';
import { RootStackParamList } from './src/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Welcome" component={Welcome} />
        <Stack.Screen name="PassengerRegistration" component={PassengerRegistration} />
        <Stack.Screen name="DriverRegistration" component={DriverRegistration} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="DriverVerification" component={DriverVerification} />
        <Stack.Screen name="CarVerification" component={CarVerification} />
        <Stack.Screen name="VerificationComplete" component={VerificationComplete} />
        <Stack.Screen name="Home" component={DriverHome} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

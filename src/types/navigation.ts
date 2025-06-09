import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Welcome: undefined;
  PassengerRegistration: undefined;
  DriverRegistration: undefined;
  Login: undefined;
  DriverVerification: undefined;
  CarVerification: undefined;
  VerificationComplete: undefined;
  Home: undefined;
};

export type NavigationProp = NativeStackNavigationProp<RootStackParamList>; 
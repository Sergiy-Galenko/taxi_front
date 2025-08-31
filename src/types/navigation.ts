import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Login: undefined;
  PassengerRegistration: undefined;
  Home: undefined;
  Main: undefined;
  TripHistory: undefined;
  Preorder: undefined;
};

export type NavigationProp = NativeStackNavigationProp<RootStackParamList>; 
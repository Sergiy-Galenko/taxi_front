import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Login: undefined;
  PassengerRegistration: undefined;
  DriverRegistration: undefined;
  DriverPersonalInfo: undefined;
  DriverContactInfo: undefined;
  DriverCarInfo: undefined;
  DriverLicenseInfo: undefined;
  DriverPasswordSetup: undefined;
  DriverVerification: undefined;
  Home: undefined;
};

export type NavigationProp = {
  navigate: (screen: keyof RootStackParamList, params?: any) => void;
  goBack: () => void;
}; 
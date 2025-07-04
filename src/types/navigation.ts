import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Login: undefined;
  RoleSelection: undefined;
  PassengerRegistration: undefined;
  DriverRegistration: undefined;
  DriverPersonalInfo: undefined;
  DriverContactInfo: {
    fullName: string;
  };
  DriverCarInfo: {
    fullName: string;
    email: string;
    phone: string;
  };
  DriverLicenseInfo: {
    fullName: string;
    email: string;
    phone: string;
    carModel: string;
    carColor: string;
    carNumber: string;
    yearsOfExperience: string;
  };
  DriverPasswordSetup: {
    fullName: string;
    email: string;
    phone: string;
    carModel: string;
    carColor: string;
    carNumber: string;
    yearsOfExperience: string;
    licenseNumber: string;
  };
  DriverVerification: {
    fullName: string;
    email: string;
    phone: string;
    carModel: string;
    carColor: string;
    carNumber: string;
    yearsOfExperience: string;
    licenseNumber: string;
    password: string;
  };
  Home: undefined;
  Main: undefined;
  TripHistory: undefined;
  Preorder: undefined;
  DriverHome: undefined;
};

export type NavigationProp = NativeStackNavigationProp<RootStackParamList>; 
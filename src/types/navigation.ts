import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Coordinates, RideOptionKey } from './passenger';

type BookingRouteParams = {
  from: string;
  to: string;
  pickupCoords?: Coordinates | null;
  destinationCoords?: Coordinates | null;
  rideType?: RideOptionKey;
};

type ConfirmedRideParams = BookingRouteParams & {
  rideType: RideOptionKey;
  paymentMethod: string;
  price: number;
  pickupEtaMin: number;
  durationMin: number;
  distanceKm: number;
};

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
  Home:
    | {
        from?: string;
        to?: string;
        rideType?: RideOptionKey;
      }
    | undefined;
  Main: undefined;
  VehicleSelection: BookingRouteParams;
  DriverSearch: ConfirmedRideParams;
  ActiveRide: ConfirmedRideParams & {
    driverName: string;
    driverCar: string;
    driverPlate: string;
    driverRating: string;
    driverEtaMin: number;
  };
  TripHistory: undefined;
  Preorder:
    | {
        pickup?: string;
        destination?: string;
        rideType?: RideOptionKey;
      }
    | undefined;
  Settings: undefined;
  DriverHome: undefined;
};

export type NavigationProp = NativeStackNavigationProp<RootStackParamList>; 

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Coordinates, PaymentMethodKey, RideOptionKey } from './passenger';

type BookingRouteParams = {
  from: string;
  to: string;
  pickupCoords?: Coordinates | null;
  destinationCoords?: Coordinates | null;
  routeDistanceKm?: number;
  routeDurationMin?: number;
  rideType?: RideOptionKey;
};

type ConfirmedRideParams = BookingRouteParams & {
  rideType: RideOptionKey;
  paymentMethod: PaymentMethodKey;
  price: number;
  pickupEtaMin: number;
  durationMin: number;
  distanceKm: number;
  driverComment?: string;
};

export type RootStackParamList = {
  Splash: undefined;
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
  OrderConfirm: ConfirmedRideParams;
  DriverSearch: ConfirmedRideParams;
  ActiveRide: ConfirmedRideParams & {
    driverName: string;
    driverCar: string;
    driverPlate: string;
    driverRating: string;
    driverEtaMin: number;
  };
  RideComplete: ConfirmedRideParams & {
    driverName: string;
    driverCar: string;
    driverPlate: string;
    driverRating: string;
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

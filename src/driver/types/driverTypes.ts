export interface DriverProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  carModel: string;
  carColor: string;
  carNumber: string;
  yearsOfExperience: number;
  licenseNumber: string;
}

export interface Ride {
  id: string;
  from: string;
  to: string;
  time: string;
  price: number;
}

export interface RideFilters {
  time?: string;
  priceRange?: [number, number];
  distance?: number;
} 
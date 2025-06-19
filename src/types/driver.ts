export interface DriverRegistrationData {
  fullName: string;
  email: string;
  phone: string;
  carModel: string;
  carColor: string;
  carNumber: string;
  yearsOfExperience: number;
  licenseNumber: string;
  password: string;
}

export interface DriverRegistrationResponse {
  success: boolean;
  message: string;
  data?: {
    driverId: string;
    token: string;
    driver: {
      id: string;
      fullName: string;
      email: string;
      phone: string;
      carModel: string;
      carColor: string;
      carNumber: string;
      yearsOfExperience: number;
      licenseNumber: string;
      status: 'pending' | 'active' | 'blocked';
      createdAt: string;
      updatedAt: string;
    };
  };
}

export interface DriverVerificationResponse {
  success: boolean;
  message: string;
  data?: {
    driverId: string;
    status: 'pending' | 'active' | 'blocked';
  };
}

export interface DriverProfileResponse {
  success: boolean;
  message: string;
  data?: {
    driver: {
      id: string;
      fullName: string;
      email: string;
      phone: string;
      carModel: string;
      carColor: string;
      carNumber: string;
      yearsOfExperience: number;
      licenseNumber: string;
      status: 'pending' | 'active' | 'blocked';
      createdAt: string;
      updatedAt: string;
    };
  };
} 
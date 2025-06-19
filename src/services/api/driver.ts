import { API_URL } from '../../config/api';
import { 
  DriverRegistrationData, 
  DriverRegistrationResponse,
  DriverVerificationResponse,
  DriverProfileResponse
} from '../../types/driver';

export const registerDriver = async (data: DriverRegistrationData): Promise<DriverRegistrationResponse> => {
  try {
    const response = await fetch(`${API_URL}/api/drivers/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to register driver');
    }

    return result;
  } catch (error) {
    console.error('Driver registration error:', error);
    throw error;
  }
};

export const verifyDriver = async (driverId: string): Promise<DriverVerificationResponse> => {
  try {
    const response = await fetch(`${API_URL}/api/drivers/${driverId}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to verify driver');
    }

    return result;
  } catch (error) {
    console.error('Driver verification error:', error);
    throw error;
  }
};

export const getDriverProfile = async (driverId: string): Promise<DriverProfileResponse> => {
  try {
    const response = await fetch(`${API_URL}/api/drivers/${driverId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to get driver profile');
    }

    return result;
  } catch (error) {
    console.error('Get driver profile error:', error);
    throw error;
  }
}; 
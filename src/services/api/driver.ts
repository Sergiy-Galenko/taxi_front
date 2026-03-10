import { API_URL } from '../../config/api';
import { 
  DriverRegistrationData, 
  DriverRegistrationResponse,
  DriverVerificationResponse,
  DriverProfileResponse
} from '../../types/driver';
import { requestJson } from './http';

export const registerDriver = async (data: DriverRegistrationData): Promise<DriverRegistrationResponse> => {
  try {
    return await requestJson<DriverRegistrationResponse>(`${API_URL}/api/drivers/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error('Driver registration error:', error);
    throw error;
  }
};

export const verifyDriver = async (driverId: string): Promise<DriverVerificationResponse> => {
  try {
    return await requestJson<DriverVerificationResponse>(`${API_URL}/api/drivers/${driverId}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Driver verification error:', error);
    throw error;
  }
};

export const getDriverProfile = async (driverId: string): Promise<DriverProfileResponse> => {
  try {
    return await requestJson<DriverProfileResponse>(`${API_URL}/api/drivers/${driverId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Get driver profile error:', error);
    throw error;
  }
}; 

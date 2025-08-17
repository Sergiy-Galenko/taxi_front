import { API_URL } from '../../config/api';
import { User } from '../../hooks/UserContext';

export interface PassengerRegistrationPayload {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export interface AuthRegisterResponse {
  message: string;
  token: string;
  user: any;
}

export const registerPassenger = async (
  payload: PassengerRegistrationPayload
): Promise<{ token: string; user: User }> => {
  const body = {
    email: payload.email,
    password: payload.password,
    fullName: payload.fullName,
    phoneNumber: payload.phone,
    role: 'passenger',
  };

  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const result: AuthRegisterResponse = await response.json();

  if (!response.ok) {
    const message = (result as any)?.message || 'Registration failed';
    throw new Error(message);
  }

  // Normalize backend snake_case to camelCase for consistency
  const normalizedUser: User = {
    id: String(result.user.id),
    email: result.user.email,
    fullName: (result.user.fullName || result.user.full_name) as string,
    role: result.user.role,
    phoneNumber: (result.user.phoneNumber || result.user.phone_number) as string | undefined,
  };

  return { token: result.token, user: normalizedUser };
};



import { API_URL } from '../../config/api';
import { User } from '../../hooks/UserContext';
import { requestJson } from './http';

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

export interface LoginPayload {
  email: string;
  password: string;
}

const normalizeUser = (user: any): User => {
  return {
    ...user,
    id: String(user.id),
    email: user.email,
    fullName: (user.fullName || user.full_name) as string,
    role: user.role,
    phoneNumber: (user.phoneNumber || user.phone_number) as string | undefined,
  };
};

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

  const result = await requestJson<AuthRegisterResponse>(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  return { token: result.token, user: normalizeUser(result.user) };
};

export const loginUser = async (
  payload: LoginPayload
): Promise<{ token: string; user: User }> => {
  const result = await requestJson<AuthRegisterResponse>(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return { token: result.token, user: normalizeUser(result.user) };
};


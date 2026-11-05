import { apiEndpoint } from '../../config/api';
import { User, parseSession } from '../../core/auth/session';
import { requestJson } from './http';

export interface PassengerRegistrationPayload {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginPayload { email: string; password: string }

export const registerPassenger = async (
  payload: PassengerRegistrationPayload, signal?: AbortSignal
): Promise<{ token: string; user: User }> => {
  const body = {
    email: payload.email,
    password: payload.password,
    fullName: payload.fullName,
    phoneNumber: payload.phone,
    role: 'passenger',
  };

  const result = await requestJson(apiEndpoint('/api/auth/register'), {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const session = parseSession(result);
  if (session.user.role !== 'passenger') throw new Error('Invalid passenger registration response');
  return session;
};

export const loginUser = async (
  payload: LoginPayload, signal?: AbortSignal
): Promise<{ token: string; user: User }> => {
  const result = await requestJson(apiEndpoint('/api/auth/login'), {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return parseSession(result);
};


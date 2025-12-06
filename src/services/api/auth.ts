import { API_URL } from '../../config/api';
import { User } from '../../hooks/UserContext';

export interface PassengerRegistrationPayload {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export interface PassengerLoginPayload {
  email: string;
  password: string;
}

export interface AuthRegisterResponse {
  message: string;
  token: string;
  user: any;
}

export interface AuthLoginResponse {
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

  console.log('🚀 Реєстрація пасажира:', { url: `${API_URL}/api/auth/register`, body });

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 секунд таймаут

    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log('📡 Відповідь сервера:', { status: response.status, ok: response.ok });

    const result: AuthRegisterResponse = await response.json();

    if (!response.ok) {
      const message = (result as any)?.message || 'Registration failed';
      console.error('❌ Помилка реєстрації:', message);
      throw new Error(message);
    }

    console.log('✅ Реєстрація успішна:', result);

    // Normalize backend snake_case to camelCase for consistency
    const normalizedUser: User = {
      id: String(result.user.id),
      email: result.user.email,
      fullName: (result.user.fullName || result.user.full_name) as string,
      role: result.user.role,
      phoneNumber: (result.user.phoneNumber || result.user.phone_number) as string | undefined,
    };

    return { token: result.token, user: normalizedUser };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Network request failed';

    if (message === 'User already exists') {
      console.error('⚠️ Користувач вже існує:', error);
      throw new Error('Користувач з таким email вже існує. Спробуйте увійти або використайте інший email.');
    }

    if (message === 'Network request failed') {
      console.error('❌ Помилка мережі:', error);
      throw new Error('Не вдалося зʼєднатися з сервером. Перевірте інтернет або запустіть бекенд.');
    }

    console.error('❌ Помилка реєстрації:', error);
    throw new Error(message || 'Сталася невідома помилка');
  }
};

export const loginPassenger = async (
  payload: PassengerLoginPayload
): Promise<{ token: string; user: User }> => {
  console.log('🚀 Логін пасажира:', { url: `${API_URL}/api/auth/login`, email: payload.email });

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 секунд таймаут

    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log('📡 Відповідь сервера:', { status: response.status, ok: response.ok });

    const result: AuthLoginResponse = await response.json();

    if (!response.ok) {
      const message = (result as any)?.message || 'Login failed';
      console.error('❌ Помилка логіну:', message);
      throw new Error(message);
    }

    console.log('✅ Логін успішний:', result);

    // Normalize backend snake_case to camelCase for consistency
    const normalizedUser: User = {
      id: String(result.user.id),
      email: result.user.email,
      fullName: (result.user.fullName || result.user.full_name) as string,
      role: result.user.role,
      phoneNumber: (result.user.phoneNumber || result.user.phone_number) as string | undefined,
    };

    return { token: result.token, user: normalizedUser };
  } catch (error) {
    console.error('❌ Помилка мережі:', error);
    throw error;
  }
};


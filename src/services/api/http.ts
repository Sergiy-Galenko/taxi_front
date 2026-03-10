import { API_URL } from '../../config/api';

type ApiErrorItem = {
  msg?: string;
  message?: string;
};

type ApiErrorPayload = {
  message?: string;
  errors?: ApiErrorItem[];
};

const parseJson = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const extractErrorMessage = (payload: unknown, fallback: string): string => {
  if (!payload || typeof payload !== 'object') {
    return fallback;
  }

  const errorPayload = payload as ApiErrorPayload;

  if (typeof errorPayload.message === 'string' && errorPayload.message.trim()) {
    return errorPayload.message;
  }

  if (Array.isArray(errorPayload.errors)) {
    const firstError = errorPayload.errors.find((item) => {
      return typeof item?.msg === 'string' || typeof item?.message === 'string';
    });

    if (firstError?.msg) {
      return firstError.msg;
    }

    if (firstError?.message) {
      return firstError.message;
    }
  }

  return fallback;
};

export const requestJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  let response: Response;

  try {
    response = await fetch(url, init);
  } catch (error) {
    const details = error instanceof Error ? error.message : 'Network request failed';
    throw new Error(`Не вдалося з'єднатися з сервером ${API_URL}. ${details}`);
  }

  const text = await response.text();
  const payload = text ? parseJson(text) : null;

  if (!response.ok) {
    throw new Error(extractErrorMessage(payload, `Запит завершився з помилкою (${response.status})`));
  }

  return payload as T;
};

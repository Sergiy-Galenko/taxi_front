import { Role } from '../../core/auth/session';
import { API_URL } from '../../config/api';
export class ApiError extends Error {
  constructor(message: string, public readonly code: 'network' | 'timeout' | 'cancelled' | 'http' | 'invalid_response' | 'unauthorized' | 'forbidden', public readonly status?: number) {
    super(message); this.name = 'ApiError';
  }
}
interface HttpAuth {
  getToken(): string | null;
  getRole?(): Role | null;
  expire(token: string): Promise<void>;
}
let auth: HttpAuth | null = null;
export function configureHttpAuth(value: HttpAuth): () => void {
  auth = value;
  return () => { if (auth === value) auth = null; };
}
export interface RequestOptions extends RequestInit { authenticated?: boolean; requiredRole?: Role; timeoutMs?: number }
export async function requestJson(url: string, options: RequestOptions = {}): Promise<unknown> {
  const { authenticated = false, requiredRole, timeoutMs = 15000, signal, ...init } = options;
  const token = authenticated || requiredRole ? auth?.getToken() : null;
  if ((authenticated || requiredRole) && !token) throw new ApiError('Please sign in again.', 'unauthorized', 401);
  if (requiredRole && auth?.getRole?.() !== requiredRole) throw new ApiError('This action is unavailable for your account.', 'forbidden', 403);
  const headers = new Headers(init.headers);
  if (token) {
    if (!API_URL || !(url === API_URL || url.startsWith(`${API_URL}/`))) throw new ApiError('Invalid API destination.', 'invalid_response');
    headers.set('Authorization', `Bearer ${token}`);
  }
  const controller = new AbortController();
  let timedOut = false;
  const abort = () => controller.abort();
  signal?.addEventListener('abort', abort, { once: true });
  if (signal?.aborted) controller.abort();
  const timer = setTimeout(() => { timedOut = true; controller.abort(); }, timeoutMs);
  try {
    const response = await fetch(url, { ...init, headers, signal: controller.signal });
    if (response.status === 401 && token) {
      await auth?.expire(token).catch(() => undefined);
      throw new ApiError('Session expired. Please sign in again.', 'unauthorized', 401);
    }
    // Never expose arbitrary server payloads (which may include personal data) to the UI/logs.
    if (!response.ok) throw new ApiError(`Request failed (${response.status}). Please try again.`, 'http', response.status);
    const text = await response.text();
    if (!text) throw new ApiError('The server returned an empty response.', 'invalid_response');
    try { const parsed: unknown = JSON.parse(text); return parsed; }
    catch { throw new ApiError('The server returned an invalid response.', 'invalid_response'); }
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (timedOut) throw new ApiError('Request timed out. Please try again.', 'timeout');
    if (controller.signal.aborted) throw new ApiError('Request cancelled.', 'cancelled');
    throw new ApiError('Unable to connect. Check your connection and try again.', 'network');
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', abort);
  }
}

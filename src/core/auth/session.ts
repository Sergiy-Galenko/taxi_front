export type Role = 'passenger' | 'driver';
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  phoneNumber?: string;
  rating?: number | string | null;
}
export interface Session { token: string; user: User }
export type AuthState =
  | { status: 'initializing' | 'guest' | 'expired'; session: null }
  | { status: 'authenticated'; session: Session };
export interface SessionStorage {
  read(): Promise<string | null>;
  write(value: string): Promise<void>;
  clear(): Promise<void>;
}
export const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

export function parseUser(value: unknown): User {
  if (!isRecord(value) || (typeof value.id !== 'string' && typeof value.id !== 'number') ||
      !String(value.id).trim() || (typeof value.id === 'number' && !Number.isFinite(value.id)) || typeof value.email !== 'string' || !value.email.trim() ||
      (value.role !== 'passenger' && value.role !== 'driver')) {
    throw new Error('Invalid account response');
  }
  const fullName = value.fullName ?? value.full_name;
  const phone = value.phoneNumber ?? value.phone_number;
  if (typeof fullName !== 'string' || !fullName.trim()) throw new Error('Invalid account response');
  return {
    id: String(value.id), email: value.email, fullName, role: value.role,
    ...(typeof phone === 'string' ? { phoneNumber: phone } : {}),
    ...(typeof value.rating === 'number' || typeof value.rating === 'string' || value.rating === null
      ? { rating: value.rating } : {}),
  };
}
export function parseSession(value: unknown): Session {
  if (!isRecord(value) || typeof value.token !== 'string' || !value.token.trim() || /\s/.test(value.token)) {
    throw new Error('Invalid session response');
  }
  return { token: value.token, user: parseUser(value.user) };
}
// This only detects expiration; signature verification and authorization belong to the server.
export function tokenExpiresAt(token: string): number | null {
  if (token.split('.').length !== 3) return null; // Existing API may return opaque tokens.
  try {
    const part = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload: unknown = JSON.parse(atob(part.padEnd(Math.ceil(part.length / 4) * 4, '=')));
    if (!isRecord(payload) || payload.exp === undefined) return null;
    return typeof payload.exp === 'number' && Number.isFinite(payload.exp) ? payload.exp * 1000 : 0;
  } catch { return 0; }
}
export const isExpired = (token: string, now = Date.now()): boolean => {
  const expiresAt = tokenExpiresAt(token);
  return expiresAt !== null && expiresAt <= now;
};

/** Serializes disk mutations and invalidates stale restoration/login/401 results. */
export class SessionManager {
  private state: AuthState = { status: 'initializing', session: null };
  private listeners = new Set<() => void>();
  private revision = 0;
  private writes: Promise<void> = Promise.resolve();
  constructor(private storage: SessionStorage) {}
  getSnapshot = (): AuthState => this.state;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  };
  private publish(state: AuthState) {
    this.state = state;
    this.listeners.forEach((listener) => listener());
  }
  private persist(operation: () => Promise<void>): Promise<void> {
    const result = this.writes.then(operation, operation);
    this.writes = result.catch(() => undefined);
    return result;
  }
  restore = async () => {
    const revision = this.revision;
    try {
      const stored = await this.storage.read();
      if (revision !== this.revision) return;
      if (!stored) { this.publish({ status: 'guest', session: null }); return; }
      const session = parseSession(JSON.parse(stored));
      if (isExpired(session.token)) { await this.signOut('expired'); return; }
      this.publish({ status: 'authenticated', session });
    } catch {
      if (revision === this.revision) await this.signOut('guest');
    }
  };
  signIn = async (token: string, user: User) => {
    const session = parseSession({ token, user });
    if (isExpired(token)) throw new Error('Session expired. Please sign in again.');
    const revision = ++this.revision;
    await this.persist(() => this.storage.write(JSON.stringify(session)));
    if (revision === this.revision) this.publish({ status: 'authenticated', session });
  };
  signOut = async (status: 'guest' | 'expired' = 'guest') => {
    ++this.revision;
    this.publish({ status, session: null });
    await this.persist(() => this.storage.clear());
  };
  expire = (token: string) => {
    if (this.state.session?.token === token) return this.signOut('expired');
    return Promise.resolve();
  };
  checkExpiry = () => {
    const token = this.state.session?.token;
    if (token && isExpired(token)) return this.expire(token);
    return Promise.resolve();
  };
}

import React, { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { AppState } from 'react-native';
import { isExpired, SessionManager, tokenExpiresAt } from '../core/auth/session';
import { sessionStorage } from '../core/storage/sessionStorage';
import { configureHttpAuth } from '../services/api/http';
export type { User } from '../core/auth/session';

function useSessionProvider() {
  const [manager] = useState(() => new SessionManager(sessionStorage));
  const state = useSyncExternalStore(manager.subscribe, manager.getSnapshot);
  useEffect(() => {
    const cleanup = configureHttpAuth({
      getToken: () => {
        const token = manager.getSnapshot().session?.token;
        if (token && isExpired(token)) { void manager.expire(token).catch(() => undefined); return null; }
        return token ?? null;
      },
      getRole: () => manager.getSnapshot().session?.user.role ?? null,
      expire: (token) => manager.expire(token),
    });
    void manager.restore().catch(() => undefined); // Fail closed if storage is unavailable.
    const listener = AppState.addEventListener('change', (status) => {
      if (status === 'active') void manager.checkExpiry().catch(() => undefined);
    });
    return () => { cleanup(); listener.remove(); };
  }, [manager]);
  useEffect(() => {
    const expiresAt = state.session ? tokenExpiresAt(state.session.token) : null;
    if (expiresAt === null) return;
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(() => {
        void manager.checkExpiry().catch(() => undefined);
        if (expiresAt > Date.now()) schedule();
      }, Math.min(Math.max(expiresAt - Date.now(), 0), 2_147_483_647));
    };
    schedule();
    return () => clearTimeout(timer);

  }, [manager, state]);
  return useMemo(() => ({
    state, user: state.session?.user ?? null,
    isAuthenticated: state.status === 'authenticated',
    signIn: manager.signIn,
    signOut: () => manager.signOut(),
  }), [manager, state]);
}
const UserContext = createContext<ReturnType<typeof useSessionProvider> | undefined>(undefined);
export function UserProvider({ children }: { children: React.ReactNode }) {
  const value = useSessionProvider();
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
export function useUser() {
  const value = useContext(UserContext);
  if (!value) throw new Error('useUser must be used within a UserProvider');
  return value;
}

import { SessionManager, SessionStorage, User, parseSession, isExpired } from '../src/core/auth/session';
import { canAccessRoute } from '../src/navigation/access';
const passenger: User = { id: 'p1', email: 'p@example.test', fullName: 'Passenger One', role: 'passenger' };
const driver: User = { ...passenger, id: 'd1', role: 'driver' };
function storage(initial: string | null = null) {
  let value = initial;
  const port: SessionStorage = {
    read: jest.fn(async () => value), write: jest.fn(async (next) => { value = next; }), clear: jest.fn(async () => { value = null; }),
  };
  return port;
}
const jwt = (exp: number) => `e30.${btoa(JSON.stringify({ exp }))}.signature`;

test('guest and initializing sessions cannot access protected routes', async () => {
  const manager = new SessionManager(storage());
  expect(canAccessRoute(manager.getSnapshot(), 'Home')).toBe(false);
  await manager.restore();
  expect(canAccessRoute(manager.getSnapshot(), 'Login')).toBe(true);
  expect(canAccessRoute(manager.getSnapshot(), 'DriverHome')).toBe(false);
});
test.each([passenger, driver])('restores $role and isolates role routes across restart', async (user) => {
  const disk = storage(); const first = new SessionManager(disk);
  await first.signIn('opaque-token', user);
  const restarted = new SessionManager(disk); await restarted.restore();
  expect(restarted.getSnapshot()).toEqual({ status: 'authenticated', session: { token: 'opaque-token', user } });
  expect(canAccessRoute(restarted.getSnapshot(), 'DriverHome')).toBe(user.role === 'driver');
  expect(canAccessRoute(restarted.getSnapshot(), 'Home')).toBe(user.role === 'passenger');
  expect(canAccessRoute(restarted.getSnapshot(), 'Login')).toBe(false);
});
test('expired persisted session clears storage and denies protected navigation', async () => {
  const disk = storage(JSON.stringify({ token: jwt(1), user: driver }));
  const manager = new SessionManager(disk); await manager.restore();
  expect(manager.getSnapshot().status).toBe('expired');
  expect(disk.clear).toHaveBeenCalled();
  expect(canAccessRoute(manager.getSnapshot(), 'DriverHome')).toBe(false);
});
test('foreground expiry check revokes an active session', async () => {
  const manager = new SessionManager(storage());
  const exp = Math.floor(Date.now() / 1000) + 60;
  await manager.signIn(jwt(exp), passenger);
  jest.spyOn(Date, 'now').mockReturnValue((exp + 1) * 1000);
  await manager.checkExpiry();
  expect(manager.getSnapshot().status).toBe('expired');
  jest.restoreAllMocks();
});
test('malformed stored identity fails closed and is deleted', async () => {
  const disk = storage('{"token":"opaque","user":{"role":"admin"}}');
  const manager = new SessionManager(disk); await manager.restore();
  expect(manager.getSnapshot().status).toBe('guest'); expect(disk.clear).toHaveBeenCalled();
});
test('logout clears identity and persistent session', async () => {
  const disk = storage(); const manager = new SessionManager(disk);
  await manager.signIn('opaque', passenger); await manager.signOut();
  expect(manager.getSnapshot()).toEqual({ status: 'guest', session: null });
  const restarted = new SessionManager(disk); await restarted.restore();
  expect(restarted.getSnapshot().status).toBe('guest');
});
test('late restoration cannot undo logout', async () => {
  let finish: (value: string) => void = () => undefined;
  const disk = storage(); disk.read = () => new Promise((resolve) => { finish = resolve; });
  const manager = new SessionManager(disk); const restoring = manager.restore();
  await manager.signOut(); finish(JSON.stringify({ token: 'old', user: driver })); await restoring;
  expect(manager.getSnapshot().status).toBe('guest');
});
test('late login write cannot undo logout or persist its session', async () => {
  const disk = storage(); const manager = new SessionManager(disk);
  const login = manager.signIn('old', driver); const logout = manager.signOut();
  await Promise.all([login, logout]);
  const restarted = new SessionManager(disk); await restarted.restore();
  expect(manager.getSnapshot().status).toBe('guest'); expect(restarted.getSnapshot().status).toBe('guest');
});
test('401 from an older session cannot expire a newer login', async () => {
  const manager = new SessionManager(storage());
  await manager.signIn('old', passenger); await manager.signIn('new', driver); await manager.expire('old');
  expect(manager.getSnapshot().session?.token).toBe('new');
});
test('failed secure write does not authenticate', async () => {
  const disk = storage(); disk.write = async () => { throw new Error('disk'); };
  const manager = new SessionManager(disk); await manager.restore();
  await expect(manager.signIn('token', passenger)).rejects.toThrow('disk');
  expect(manager.getSnapshot().status).toBe('guest');
});
test('response validation retains only documented identity fields', () => {
  expect(parseSession({ token: 'opaque', user: { ...passenger, password: 'discard', documents: ['discard'] } }).user).toEqual(passenger);
  expect(() => parseSession({ token: 'bad token', user: passenger })).toThrow();
  expect(isExpired('e30.invalid.signature')).toBe(true);
  expect(isExpired(jwt(1))).toBe(true);
});

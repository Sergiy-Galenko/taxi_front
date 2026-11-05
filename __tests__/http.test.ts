jest.mock('../src/config/api', () => ({ API_URL: 'https://api.example.test' }));
import { requestJson, configureHttpAuth } from '../src/services/api/http';
const endpoint = 'https://api.example.test/api/test';
let fetchMock: jest.SpyInstance;
afterEach(() => { jest.restoreAllMocks(); jest.useRealTimers(); });
beforeEach(() => { fetchMock = jest.spyOn(globalThis, 'fetch'); });
test('attaches credentials only to authenticated API requests', async () => {
  const cleanup = configureHttpAuth({ getToken: () => 'secret', expire: jest.fn() });
  fetchMock.mockResolvedValue(new Response('{"ok":true}'));
  await requestJson(endpoint, { authenticated: true });
  const init: RequestInit = fetchMock.mock.calls[0][1];
  expect(new Headers(init.headers).get('Authorization')).toBe('Bearer secret');
  await expect(requestJson('https://other.test', { authenticated: true })).rejects.toMatchObject({ code: 'invalid_response' });
  expect(fetchMock).toHaveBeenCalledTimes(1); cleanup();
});
test('unauthorized responses expire the matching session', async () => {
  const expire = jest.fn(async () => undefined);
  const cleanup = configureHttpAuth({ getToken: () => 'old', expire });
  fetchMock.mockResolvedValue(new Response('{"password":"do not expose"}', { status: 401 }));
  await expect(requestJson(endpoint, { authenticated: true })).rejects.toMatchObject({ code: 'unauthorized' });
  expect(expire).toHaveBeenCalledWith('old'); cleanup();
});
test('guest protected requests never reach the network', async () => {
  await expect(requestJson(endpoint, { authenticated: true })).rejects.toMatchObject({ status: 401 });
  expect(fetchMock).not.toHaveBeenCalled();
});
test('non-idempotent failures are not retried and response details are not exposed', async () => {
  fetchMock.mockResolvedValue(new Response('{"message":"private personal information"}', { status: 500 }));
  await expect(requestJson(endpoint, { method: 'POST' })).rejects.toThrow('Request failed (500)');
  expect(fetchMock).toHaveBeenCalledTimes(1);
});
test.each(['', 'not json'])('rejects malformed successful response %s', async (body) => {
  fetchMock.mockResolvedValue(new Response(body));
  await expect(requestJson(endpoint)).rejects.toMatchObject({ code: 'invalid_response' });
});
test('caller cancellation is distinguished from network failure', async () => {
  fetchMock.mockImplementation((_url, init: RequestInit) => new Promise((_resolve, reject) => {
    init.signal?.addEventListener('abort', () => reject(new Error('abort')));
  }));
  const controller = new AbortController(); const result = requestJson(endpoint, { signal: controller.signal });
  controller.abort(); await expect(result).rejects.toMatchObject({ code: 'cancelled' });
});
test('request timeout aborts the request without retry', async () => {
  jest.useFakeTimers();
  fetchMock.mockImplementation((_url, init: RequestInit) => new Promise((_resolve, reject) => {
    init.signal?.addEventListener('abort', () => reject(new Error('abort')));
  }));
  const result = requestJson(endpoint, { timeoutMs: 30 });
  const check = expect(result).rejects.toMatchObject({ code: 'timeout' });
  jest.advanceTimersByTime(31); await check; expect(fetchMock).toHaveBeenCalledTimes(1);
});

test('driver operations deny passenger credentials before making a request', async () => {
  const cleanup = configureHttpAuth({ getToken: () => 'passenger-token', getRole: () => 'passenger', expire: jest.fn() });
  await expect(requestJson(endpoint, { requiredRole: 'driver' })).rejects.toMatchObject({ code: 'forbidden', status: 403 });
  expect(fetchMock).not.toHaveBeenCalled(); cleanup();
});

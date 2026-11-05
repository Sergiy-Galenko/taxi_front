import { resolveApiUrl } from '../src/core/config/apiUrl';
test.each([undefined, '', 'http://api.example.com', 'https://localhost', 'https://10.0.2.2:3001', 'https://192.168.1.1', 'https://[::1]', 'https://user:secret@example.com', 'https://api.example.com?token=secret', 'not a url', 'ftp://example.com'])('rejects unsafe release API value %s', (url) => {
  expect(resolveApiUrl(url, false, 'http://localhost:3001')).toBeNull();
});
test('release requires explicit HTTPS, development can use simulator fallback', () => {
  expect(resolveApiUrl('https://fctaxi.example.com', false, '')).toBe('https://fctaxi.example.com');
  expect(resolveApiUrl('https://api.example.com///', false, '')).toBe('https://api.example.com');
  expect(resolveApiUrl(undefined, true, 'http://10.0.2.2:3001')).toBe('http://10.0.2.2:3001');
  expect(resolveApiUrl('https://staging.example.com', true, 'http://localhost:3001')).toBe('https://staging.example.com');
});

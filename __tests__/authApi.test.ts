jest.mock('../src/config/api', () => ({ apiEndpoint: (path: string) => `https://api.example.test${path}` }));
jest.mock('../src/services/api/http', () => ({ requestJson: jest.fn() }));
import { requestJson } from '../src/services/api/http';
import { loginUser, registerPassenger } from '../src/services/api/auth';
const request = jest.mocked(requestJson);
const user = { id: 12, email: 'user@example.test', full_name: 'User Name', role: 'passenger', phone_number: '+380501234567' };
test('login retains existing endpoint and normalizes verified response shape', async () => {
  request.mockResolvedValue({ token: 'opaque', user });
  expect(await loginUser({ email: user.email, password: 'existing password' })).toEqual({ token: 'opaque', user: { id: '12', email: user.email, fullName: 'User Name', role: 'passenger', phoneNumber: user.phone_number } });
  expect(request).toHaveBeenCalledWith('https://api.example.test/api/auth/login', expect.objectContaining({ method: 'POST', body: JSON.stringify({ email: user.email, password: 'existing password' }) }));
});
test('passenger registration retains server payload keys', async () => {
  request.mockResolvedValue({ token: 'opaque', user });
  await registerPassenger({ fullName: 'User Name', email: user.email, phone: user.phone_number, password: 'Password1!' });
  expect(request).toHaveBeenCalledWith('https://api.example.test/api/auth/register', expect.objectContaining({ method: 'POST', body: JSON.stringify({ email: user.email, password: 'Password1!', fullName: 'User Name', phoneNumber: user.phone_number, role: 'passenger' }) }));
});
test.each([null, {}, { token: 'opaque', user: { ...user, role: 'admin' } }])('rejects invalid authentication data', async (value) => {
  request.mockResolvedValue(value); await expect(loginUser({ email: user.email, password: 'password' })).rejects.toThrow();
});
test('registration cannot silently create a driver session', async () => {
  request.mockResolvedValue({ token: 'opaque', user: { ...user, role: 'driver' } });
  await expect(registerPassenger({ fullName: 'User Name', email: user.email, phone: user.phone_number, password: 'Password1!' })).rejects.toThrow('Invalid passenger');
});

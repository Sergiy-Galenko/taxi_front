jest.mock('../src/config/api', () => ({ apiEndpoint: (path: string) => `https://api.example.test${path}` }));
jest.mock('../src/services/api/http', () => ({
  requestJson: jest.fn(),
  ApiError: class extends Error {},
}));
import { requestJson } from '../src/services/api/http';
import { getDriverProfile, registerDriver } from '../src/services/api/driver';
const request = jest.mocked(requestJson);
const driver = { id: 'driver-1', fullName: 'Driver Name', email: 'driver@example.test', phone: '+380501234567', carModel: 'Toyota Corolla', carColor: 'White', carNumber: 'AA 0000 AA', yearsOfExperience: 5, licenseNumber: 'AB 123456', status: 'pending', createdAt: '2026-01-01', updatedAt: '2026-01-01' };
test('profile requests require driver role, encode ID and forward cancellation', async () => {
  request.mockResolvedValue({ success: true, message: 'ok', data: { driver } });
  const signal = new AbortController().signal;
  expect((await getDriverProfile('driver/1', signal)).data?.driver.status).toBe('pending');
  expect(request).toHaveBeenCalledWith('https://api.example.test/api/drivers/driver%2F1', { authenticated: true, requiredRole: 'driver', signal });
});
test('registration preserves payload contract and does not approve pending driver locally', async () => {
  request.mockResolvedValue({ success: true, message: 'ok', data: { driverId: 'driver-1', token: 'opaque', driver } });
  const payload = { fullName: driver.fullName, email: driver.email, phone: driver.phone, carModel: driver.carModel, carColor: driver.carColor, carNumber: driver.carNumber, yearsOfExperience: driver.yearsOfExperience, licenseNumber: driver.licenseNumber, password: 'Password1!' };
  expect((await registerDriver(payload)).data?.driver.status).toBe('pending');
  expect(request).toHaveBeenCalledWith('https://api.example.test/api/drivers/register', expect.objectContaining({ method: 'POST', body: JSON.stringify(payload) }));
});
test('invalid driver status cannot be used in account UI', async () => {
  request.mockResolvedValue({ success: true, message: 'ok', data: { driver: { ...driver, status: 'administrator' } } });
  await expect(getDriverProfile('driver-1')).rejects.toThrow('invalid driver response');
});

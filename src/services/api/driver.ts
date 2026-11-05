import { apiEndpoint } from '../../config/api';
import { isRecord } from '../../core/auth/session';
import { DriverRegistrationData, DriverRegistrationResponse, DriverVerificationResponse, DriverProfileResponse } from '../../types/driver';
import { ApiError, requestJson } from './http';

type Driver = NonNullable<DriverProfileResponse['data']>['driver'];
const invalid = () => new ApiError('The server returned an invalid driver response.', 'invalid_response');
function parseEnvelope(value: unknown): { success: boolean; message: string; data: unknown } {
  if (!isRecord(value) || typeof value.success !== 'boolean' || typeof value.message !== 'string') throw invalid();
  return { success: value.success, message: value.message, data: value.data };
}
function parseStatus(value: unknown): Driver['status'] {
  if (value !== 'pending' && value !== 'active' && value !== 'blocked') throw invalid();
  return value;
}
function parseDriver(value: unknown): Driver {
  if (!isRecord(value) || (typeof value.id !== 'string' && typeof value.id !== 'number') || !String(value.id).trim() ||
      typeof value.yearsOfExperience !== 'number' || !Number.isFinite(value.yearsOfExperience)) throw invalid();
  const text = (key: string): string => {
    const field = value[key]; if (typeof field !== 'string') throw invalid(); return field;
  };
  return {
    id: String(value.id), fullName: text('fullName'), email: text('email'), phone: text('phone'),
    carModel: text('carModel'), carColor: text('carColor'), carNumber: text('carNumber'),
    yearsOfExperience: value.yearsOfExperience, licenseNumber: text('licenseNumber'),
    status: parseStatus(value.status), createdAt: text('createdAt'), updatedAt: text('updatedAt'),
  };
}
export async function registerDriver(data: DriverRegistrationData, signal?: AbortSignal): Promise<DriverRegistrationResponse> {
  const result = parseEnvelope(await requestJson(apiEndpoint('/api/drivers/register'), {
    method: 'POST', signal, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
  }));
  if (!result.success) return { success: false, message: result.message };
  if (!isRecord(result.data) || typeof result.data.driverId !== 'string' || !result.data.driverId ||
      typeof result.data.token !== 'string' || !result.data.token) throw invalid();
  return { success: true, message: result.message, data: {
    driverId: result.data.driverId, token: result.data.token, driver: parseDriver(result.data.driver),
  } };
}
// Preserved existing endpoint; deliberately not exposed as a client-side self-approval action.
export async function verifyDriver(driverId: string): Promise<DriverVerificationResponse> {
  const result = parseEnvelope(await requestJson(apiEndpoint(`/api/drivers/${encodeURIComponent(driverId)}/verify`), { method: 'POST', authenticated: true, requiredRole: 'driver' }));
  if (!result.success) return { success: false, message: result.message };
  if (!isRecord(result.data) || typeof result.data.driverId !== 'string') throw invalid();
  return { success: true, message: result.message, data: { driverId: result.data.driverId, status: parseStatus(result.data.status) } };
}
export async function getDriverProfile(driverId: string, signal?: AbortSignal): Promise<DriverProfileResponse> {
  const result = parseEnvelope(await requestJson(apiEndpoint(`/api/drivers/${encodeURIComponent(driverId)}`), { authenticated: true, requiredRole: 'driver', signal }));
  if (!result.success) return { success: false, message: result.message };
  if (!isRecord(result.data)) throw invalid();
  return { success: true, message: result.message, data: { driver: parseDriver(result.data.driver) } };
}

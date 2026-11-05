import { isRecord } from '../auth/session';
import { AppSettingsState } from '../../types/settings';
export const defaultSettings: AppSettingsState = {
  defaultPaymentMethod: 'cash', notificationsEnabled: true, rideUpdatesEnabled: true,
  driverAlertsEnabled: true, paymentUpdatesEnabled: true, shareRideEnabled: false, priceAlertsEnabled: false,
};
export function parseSettings(value: unknown): AppSettingsState {
  if (!isRecord(value)) return { ...defaultSettings };
  return {
    defaultPaymentMethod: value.defaultPaymentMethod === 'visa' || value.defaultPaymentMethod === 'apple_pay' || value.defaultPaymentMethod === 'cash' ? value.defaultPaymentMethod : defaultSettings.defaultPaymentMethod,
    notificationsEnabled: typeof value.notificationsEnabled === 'boolean' ? value.notificationsEnabled : defaultSettings.notificationsEnabled,
    rideUpdatesEnabled: typeof value.rideUpdatesEnabled === 'boolean' ? value.rideUpdatesEnabled : defaultSettings.rideUpdatesEnabled,
    driverAlertsEnabled: typeof value.driverAlertsEnabled === 'boolean' ? value.driverAlertsEnabled : defaultSettings.driverAlertsEnabled,
    paymentUpdatesEnabled: typeof value.paymentUpdatesEnabled === 'boolean' ? value.paymentUpdatesEnabled : defaultSettings.paymentUpdatesEnabled,
    shareRideEnabled: typeof value.shareRideEnabled === 'boolean' ? value.shareRideEnabled : defaultSettings.shareRideEnabled,
    priceAlertsEnabled: typeof value.priceAlertsEnabled === 'boolean' ? value.priceAlertsEnabled : defaultSettings.priceAlertsEnabled,
  };
}

import type { PaymentMethodKey } from './passenger';

export type AppLanguage = 'en' | 'uk';
export type { PaymentMethodKey } from './passenger';

export interface NotificationPreferences {
  notificationsEnabled: boolean;
  rideUpdatesEnabled: boolean;
  driverAlertsEnabled: boolean;
  paymentUpdatesEnabled: boolean;
}

export interface AppSettingsState extends NotificationPreferences {
  defaultPaymentMethod: PaymentMethodKey;
  shareRideEnabled: boolean;
  priceAlertsEnabled: boolean;
}

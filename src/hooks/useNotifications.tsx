import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { useI18n } from './useI18n';
import { useSettings } from './useSettings';
import { PaymentMethodKey } from '../types/settings';

type NotificationsModule = typeof import('expo-notifications');

type RideNotificationEvent =
  | 'search_started'
  | 'driver_found'
  | 'driver_delayed'
  | 'driver_arriving_soon'
  | 'driver_arrived'
  | 'trip_started'
  | 'trip_completed'
  | 'payment_update'
  | 'ride_status';

interface RideNotificationPayload {
  driver?: string;
  car?: string;
  destination?: string;
  count?: number;
  amount?: string;
  paymentMethod?: string;
  message?: string;
}

interface NotificationsContextValue {
  notificationsSupported: boolean;
  notificationsGranted: boolean;
  requestPermissions: () => Promise<boolean>;
  notifyRideEvent: (event: RideNotificationEvent, payload?: RideNotificationPayload) => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);
const notificationsSupported = Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;
let notificationsModulePromise: Promise<NotificationsModule | null> | null = null;
let notificationHandlerConfigured = false;

const loadNotificationsModule = async (): Promise<NotificationsModule | null> => {
  if (!notificationsSupported) {
    return null;
  }

  if (!notificationsModulePromise) {
    notificationsModulePromise = import('expo-notifications').then((module) => {
      if (!notificationHandlerConfigured) {
        module.setNotificationHandler({
          handleNotification: async () => ({
            shouldPlaySound: false,
            shouldSetBadge: false,
            shouldShowBanner: true,
            shouldShowList: true,
          }),
        });
        notificationHandlerConfigured = true;
      }

      return module;
    });
  }

  return notificationsModulePromise;
};

const isEventEnabled = (
  event: RideNotificationEvent,
  settings: ReturnType<typeof useSettings>
): boolean => {
  if (!settings.notificationsEnabled) {
    return false;
  }

  if (event === 'payment_update') {
    return settings.paymentUpdatesEnabled;
  }

  if (event === 'driver_delayed' || event === 'driver_arriving_soon' || event === 'driver_arrived') {
    return settings.driverAlertsEnabled && settings.rideUpdatesEnabled;
  }

  return settings.rideUpdatesEnabled;
};

const getEventMessage = (
  event: RideNotificationEvent,
  payload: RideNotificationPayload,
  t: ReturnType<typeof useI18n>['t']
) => {
  switch (event) {
    case 'search_started':
      return {
        title: t('notifications.searchStarted.title'),
        body: t('notifications.searchStarted.body'),
      };
    case 'driver_found':
      return {
        title: t('notifications.driverFound.title'),
        body: t('notifications.driverFound.body', {
          driver: payload.driver || t('notifications.fallbackDriver'),
          car: payload.car || t('notifications.fallbackCar'),
        }),
      };
    case 'driver_delayed':
      return {
        title: t('notifications.driverDelayed.title'),
        body: t('notifications.driverDelayed.body', { count: payload.count || 0 }),
      };
    case 'driver_arriving_soon':
      return {
        title: t('notifications.driverArrivingSoon.title'),
        body: t('notifications.driverArrivingSoon.body', {
          driver: payload.driver || t('notifications.fallbackDriver'),
        }),
      };
    case 'driver_arrived':
      return {
        title: t('notifications.driverArrived.title'),
        body: t('notifications.driverArrived.body', {
          driver: payload.driver || t('notifications.fallbackDriver'),
        }),
      };
    case 'trip_started':
      return {
        title: t('notifications.tripStarted.title'),
        body: t('notifications.tripStarted.body', {
          destination: payload.destination || t('notifications.fallbackDestination'),
        }),
      };
    case 'trip_completed':
      return {
        title: t('notifications.tripCompleted.title'),
        body: t('notifications.tripCompleted.body', {
          destination: payload.destination || t('notifications.fallbackDestination'),
        }),
      };
    case 'payment_update':
      return {
        title: t('notifications.paymentUpdate.title'),
        body: t('notifications.paymentUpdate.body', {
          amount: payload.amount || '0',
          paymentMethod: payload.paymentMethod || t('notifications.fallbackPaymentMethod'),
        }),
      };
    case 'ride_status':
    default:
      return {
        title: t('notifications.genericRide.title'),
        body: t('notifications.genericRide.body', { message: payload.message || '' }),
      };
  }
};

export const getPaymentMethodTranslationKey = (paymentMethod: PaymentMethodKey): string => {
  return `payments.${paymentMethod}`;
};

export const NotificationsProvider = ({ children }: { children: React.ReactNode }) => {
  const { t } = useI18n();
  const settings = useSettings();
  const [notificationsGranted, setNotificationsGranted] = useState(false);

  const requestPermissions = async () => {
    const notifications = await loadNotificationsModule();

    if (!notifications) {
      return false;
    }

    const currentPermissions = await notifications.getPermissionsAsync();

    if (
      currentPermissions.granted ||
      currentPermissions.ios?.status === notifications.IosAuthorizationStatus.PROVISIONAL
    ) {
      setNotificationsGranted(true);
      return true;
    }

    const requested = await notifications.requestPermissionsAsync();
    const granted =
      requested.granted ||
      requested.ios?.status === notifications.IosAuthorizationStatus.PROVISIONAL;
    setNotificationsGranted(granted);
    return granted;
  };

  useEffect(() => {
    void (async () => {
      if (!notificationsSupported) {
        setNotificationsGranted(false);
        return;
      }

      const notifications = await loadNotificationsModule();

      if (!notifications) {
        setNotificationsGranted(false);
        return;
      }

      if (Platform.OS === 'android') {
        await notifications.setNotificationChannelAsync('rides', {
          name: t('notifications.channelName'),
          importance: notifications.AndroidImportance.HIGH,
        });
      }

      const currentPermissions = await notifications.getPermissionsAsync();
      setNotificationsGranted(
        currentPermissions.granted ||
          currentPermissions.ios?.status === notifications.IosAuthorizationStatus.PROVISIONAL
      );
    })();
  }, [t]);

  const notifyRideEvent = async (event: RideNotificationEvent, payload: RideNotificationPayload = {}) => {
    if (!notificationsSupported) {
      return;
    }

    if (!isEventEnabled(event, settings)) {
      return;
    }

    const granted = notificationsGranted || (await requestPermissions());

    if (!granted) {
      return;
    }

    const { title, body } = getEventMessage(event, payload, t);
    const notifications = await loadNotificationsModule();

    if (!notifications) {
      return;
    }

    await notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: false,
        data: {
          event,
        },
      },
      trigger: null,
    });
  };

  const value = useMemo(
    () => ({
      notificationsSupported,
      notificationsGranted,
      requestPermissions,
      notifyRideEvent,
    }),
    [notificationsGranted, t, settings]
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);

  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }

  return context;
};

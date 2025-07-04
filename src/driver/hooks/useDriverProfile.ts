import { useState } from 'react';
import { DriverProfile } from '../types/driverTypes';

export const useDriverProfile = () => {
  const [profile, setProfile] = useState<DriverProfile | null>(null);
  // Додати логіку отримання профілю з API
  return { profile, setProfile };
}; 
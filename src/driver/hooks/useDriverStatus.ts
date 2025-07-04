import { useState } from 'react';

export const useDriverStatus = () => {
  const [status, setStatus] = useState<'online' | 'offline'>('offline');
  // Додати логіку зміни статусу
  return { status, setStatus };
}; 
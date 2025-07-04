import { useState } from 'react';

export const useRideSearch = () => {
  const [rides, setRides] = useState([]);
  // Додати логіку пошуку поїздок через API
  return { rides, setRides };
}; 
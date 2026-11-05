import React from 'react';
import { Ride } from '../types/driverTypes';
import { View, Text } from 'react-native';

const RideOfferCard = ({ ride }: { ride: Ride }) => (
  <View>
    <Text>Пропозиція поїздки: {ride?.from} → {ride?.to}</Text>
    {/* Додати деталі поїздки, ціну, час, кнопку "Взяти" */}
  </View>
);

export default RideOfferCard;

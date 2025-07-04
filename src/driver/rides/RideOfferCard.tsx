import React from 'react';
import { View, Text } from 'react-native';

const RideOfferCard = ({ ride }: { ride: any }) => (
  <View>
    <Text>Пропозиція поїздки: {ride?.from} → {ride?.to}</Text>
    {/* Додати деталі поїздки, ціну, час, кнопку "Взяти" */}
  </View>
);

export default RideOfferCard; 
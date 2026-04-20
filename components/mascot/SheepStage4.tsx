import React from 'react';
import { Image } from 'expo-image';

export const SheepStage4 = ({ size = 80 }: { size?: number }) => (
  <Image
    source={require('../../assets/images/mascot-growth/level-4.png')}
    style={{ width: size, height: size }}
    contentFit="contain"
  />
);


import React from 'react';
import { Image } from 'expo-image';

export const SheepStage3 = ({ size = 80 }: { size?: number }) => (
  <Image
    source={require('../../assets/images/mascot-growth/level-3.png')}
    style={{ width: size, height: size }}
    contentFit="contain"
  />
);


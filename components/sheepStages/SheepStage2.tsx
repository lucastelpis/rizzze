import React from 'react';
import { Image } from 'expo-image';

export const SheepStage2 = ({ size = 80 }: { size?: number }) => (
  <Image
    source={require('../../assets/images/mascot-growth/level-2.png')}
    style={{ width: size, height: size }}
    contentFit="contain"
  />
);


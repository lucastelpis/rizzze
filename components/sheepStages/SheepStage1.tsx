import React from 'react';
import { Image } from 'expo-image';

export const SheepStage1 = ({ size = 80 }: { size?: number }) => (
  <Image
    source={require('../../assets/images/mascot-growth/level-1.png')}
    style={{ width: size, height: size }}
    contentFit="contain"
  />
);


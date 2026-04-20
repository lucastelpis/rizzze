import React from 'react';
import { View } from 'react-native';
import { useSheepGrowth } from '@/context/SheepGrowthContext';
import { getSheepComponent } from '@/components/mascot';

// Early stages have smaller pixel art, so we scale them up to fill the header button
const HEADER_SCALE_FACTORS = [1.0, 1.0, 1.0, 1.0, 1.0, 1.0];

/**
 * Renders the current sheep evolution stage at the given size.
 * Automatically scales up early stages so they fill the header button.
 */
export const HeaderSheep = ({ size = 34 }: { size?: number }) => {
  const { currentStageIndex } = useSheepGrowth();
  const SheepComponent = getSheepComponent(currentStageIndex);
  const scale = HEADER_SCALE_FACTORS[currentStageIndex] ?? 1.0;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <SheepComponent size={Math.round(size * scale)} />
    </View>
  );
};

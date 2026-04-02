import React from 'react';
import { SheepStage1 } from './SheepStage1';
import { SheepStage2 } from './SheepStage2';
import { SheepStage3 } from './SheepStage3';
import { SheepStage4 } from './SheepStage4';
import { SheepStage5 } from './SheepStage5';
import { SheepStage6 } from './SheepStage6';

export { SheepStage1, SheepStage2, SheepStage3, SheepStage4, SheepStage5, SheepStage6 };

const STAGE_COMPONENTS = [SheepStage1, SheepStage2, SheepStage3, SheepStage4, SheepStage5, SheepStage6];

/**
 * Returns the correct sheep component for the given stage index (0-based).
 * Falls back to the last stage if index is out of bounds.
 */
export function getSheepComponent(stageIndex: number): React.ComponentType<{ size?: number }> {
  const clamped = Math.max(0, Math.min(stageIndex, STAGE_COMPONENTS.length - 1));
  return STAGE_COMPONENTS[clamped];
}

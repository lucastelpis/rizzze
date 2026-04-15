import React from 'react';
import { View } from 'react-native';

export interface TargetRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TourStepConfig {
  index: number;
  label: string;
  title: string;
  body: string;
  tooltipPlacement: 'below' | 'above';
  isLast?: boolean;
  /** Border radius of the spotlit element. Defaults to tokens.radii.md (14) if omitted. */
  borderRadius?: number;
}

export interface TourOverlayProps {
  isVisible: boolean;
  currentStep: number;
  reduceMotion: boolean;
  sleepWidgetRef: React.RefObject<View | null>;
  sheepButtonRef: React.RefObject<View | null>;
  streakRef: React.RefObject<View | null>;
  categoryGridRef: React.RefObject<View | null>;
  bottomNavRef: React.RefObject<View | null>;
  onNext: () => void;
  onBack: () => void;
  onDismiss: () => void;
  onBeforeStep: (step: number) => void;
}

export interface TooltipProps {
  config: TourStepConfig;
  targetRect: TargetRect;
  screenWidth: number;
  screenHeight: number;
  reduceMotion: boolean;
  safeAreaTop: number;
  safeAreaBottom: number;
  onNext: () => void;
  onBack: () => void;
  onDismiss: () => void;
}

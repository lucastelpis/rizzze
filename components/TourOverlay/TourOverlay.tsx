import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, Mask, Rect } from 'react-native-svg';
import { useColors } from '@/hooks/useColors';
import { tokens } from '@/constants/theme';
import { Tooltip } from './Tooltip';
import { STEP_CONFIGS } from './stepConfigs';
import { TourOverlayProps, TargetRect } from './types';

const OVERLAY_COLOR = 'rgba(45, 43, 61, 0.82)';
const RING_PADDING = 6;

export function TourOverlay({
  isVisible,
  currentStep,
  reduceMotion,
  sleepWidgetRef,
  sheepButtonRef,
  streakRef,
  categoryGridRef,
  bottomNavRef,
  onNext,
  onBack,
  onDismiss,
  onBeforeStep,
}: TourOverlayProps) {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  const refsByStep = [
    sleepWidgetRef,
    sheepButtonRef,
    streakRef,
    categoryGridRef,
    bottomNavRef,
  ];

  // Generation counter: incremented each time we start a fresh measurement cycle.
  // Any in-flight retry that sees a stale generation simply discards its result.
  const measureGenRef = useRef(0);

  const measureCurrentTarget = useCallback(() => {
    const gen = ++measureGenRef.current;
    const ref = refsByStep[currentStep];

    const attempt = (n: number) => {
      if (measureGenRef.current !== gen) return; // measurement was superseded
      if (!ref?.current) {
        // Ref not yet attached — retry
        if (n < 5) setTimeout(() => attempt(n + 1), 120);
        return;
      }
      ref.current.measureInWindow((x: number, y: number, w: number, h: number) => {
        if (measureGenRef.current !== gen) return; // superseded while waiting
        if (w === 0 && h === 0) {
          // Element not yet laid out — retry up to 5 times at 120 ms intervals
          if (n < 5) setTimeout(() => attempt(n + 1), 120);
          return;
        }
        setTargetRect({ x, y, width: w, height: h });
      });
    };

    attempt(0);
  }, [currentStep, sleepWidgetRef, sheepButtonRef, streakRef, categoryGridRef, bottomNavRef]);

  useEffect(() => {
    if (!isVisible) return;
    // Clear stale rect immediately so old spotlight doesn't linger while new one loads
    setTargetRect(null);
    onBeforeStep(currentStep);
    // Initial delay: 120 ms gives the scroll and entrance animations time to settle
    const t = setTimeout(measureCurrentTarget, 120);
    return () => clearTimeout(t);
  }, [isVisible, currentStep, measureCurrentTarget, onBeforeStep]);

  if (!isVisible && !targetRect) return null;

  // Spotlight rect with padding
  const hx = targetRect ? targetRect.x - RING_PADDING : 0;
  const hy = targetRect ? targetRect.y - RING_PADDING : 0;
  const hw = targetRect ? targetRect.width + RING_PADDING * 2 : 0;
  const hh = targetRect ? targetRect.height + RING_PADDING * 2 : 0;

  const config = STEP_CONFIGS[currentStep] ?? STEP_CONFIGS[0];

  return (
    <Animated.View
      style={[StyleSheet.absoluteFillObject, styles.container]}
      entering={reduceMotion ? undefined : FadeIn.duration(300)}
      exiting={reduceMotion ? undefined : FadeOut.duration(300)}
    >
      {/* Full-screen tap-to-dismiss layer (behind spotlight) */}
      <TouchableOpacity
        style={StyleSheet.absoluteFillObject}
        onPress={onDismiss}
        activeOpacity={1}
        accessibilityLabel="Dismiss tour"
        accessibilityRole="button"
      />

      {/* Spotlight: SVG mask revealing the target element with rounded corners */}
      {targetRect && (
        <Animated.View 
          style={StyleSheet.absoluteFillObject}
          entering={reduceMotion ? undefined : FadeIn.duration(200)}
          pointerEvents="none"
        >
          <Svg height={screenHeight} width={screenWidth} style={StyleSheet.absoluteFill}>
            <Defs>
              <Mask id="spotlightMask" x="0" y="0" height="100%" width="100%">
                <Rect height="100%" width="100%" fill="white" />
                <Rect
                  x={hx}
                  y={hy}
                  width={hw}
                  height={hh}
                  rx={(config.borderRadius ?? tokens.radii.md) + RING_PADDING}
                  ry={(config.borderRadius ?? tokens.radii.md) + RING_PADDING}
                  fill="black"
                />
              </Mask>
            </Defs>
            <Rect
              height="100%"
              width="100%"
              fill={OVERLAY_COLOR}
              mask="url(#spotlightMask)"
            />
          </Svg>

          {/* Accent ring around target — border-radius matches the spotlit hole */}
          <View
            style={[
              styles.ring,
              {
                top: hy,
                left: hx,
                width: hw,
                height: hh,
                borderColor: C.accent,
                borderRadius: (config.borderRadius ?? tokens.radii.md) + RING_PADDING,
              },
            ]}
          />
        </Animated.View>
      )}

      {/* Tooltip */}
      {targetRect && (
        <Tooltip
          config={config}
          targetRect={targetRect}
          screenWidth={screenWidth}
          screenHeight={screenHeight}
          reduceMotion={reduceMotion}
          safeAreaTop={insets.top}
          safeAreaBottom={insets.bottom}
          onNext={onNext}
          onBack={onBack}
          onDismiss={onDismiss}
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 9998,
  },
  ring: {
    position: 'absolute',
    borderWidth: 2,
    borderRadius: tokens.radii.md,
  },
});

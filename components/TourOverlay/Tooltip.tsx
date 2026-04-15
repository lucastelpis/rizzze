import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useColors } from '@/hooks/useColors';
import { tokens } from '@/constants/theme';
import { TooltipProps } from './types';

const ARROW_SIZE = 10;
const TOOLTIP_MARGIN = 12;
const EDGE_MARGIN = 16;
const PROGRESS_STEPS = 5;

export function Tooltip({
  config,
  targetRect,
  screenWidth,
  screenHeight,
  reduceMotion,
  safeAreaTop,
  safeAreaBottom,
  onNext,
  onBack,
  onDismiss,
}: TooltipProps) {
  const C = useColors();
  // tooltipHeight starts at 0 — unknown until onLayout fires.
  // The component renders off-screen (top: -9999) until height is measured,
  // then snaps to the correct position and fades in. No useEffect involved,
  // so there is no race between JS effects and the native onLayout callback.
  const [tooltipHeight, setTooltipHeight] = useState(0);
  const opacity = useSharedValue(0);

  const tooltipWidth = Math.min(screenWidth * 0.85, 320);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  // Horizontal positioning: center on target, clamp within screen
  const targetCenterX = targetRect.x + targetRect.width / 2;
  const idealLeft = targetCenterX - tooltipWidth / 2;
  const left = Math.min(
    Math.max(idealLeft, EDGE_MARGIN),
    screenWidth - tooltipWidth - EDGE_MARGIN
  );

  // Vertical positioning: above or below target, clamped to safe area.
  // Until onLayout fires and we know the actual height, render off-screen
  // so the invisible tooltip doesn't obscure content on the first frame.
  let top: number;
  if (tooltipHeight === 0) {
    top = -9999;
  } else if (config.tooltipPlacement === 'below') {
    const idealTop = targetRect.y + targetRect.height + TOOLTIP_MARGIN;
    const maxTop = screenHeight - safeAreaBottom - tooltipHeight - EDGE_MARGIN;
    top = Math.min(idealTop, maxTop);
  } else {
    const idealTop = targetRect.y - tooltipHeight - TOOLTIP_MARGIN;
    const minTop = safeAreaTop + EDGE_MARGIN;
    top = Math.max(idealTop, minTop);
  }

  // Arrow horizontal position: point at target center, clamped inside tooltip
  const arrowIdealLeft = targetCenterX - left - ARROW_SIZE;
  const arrowLeft = Math.min(
    Math.max(arrowIdealLeft, ARROW_SIZE * 2),
    tooltipWidth - ARROW_SIZE * 4
  );

  return (
    <Animated.View
      style={[
        styles.container,
        {
          left,
          top,
          width: tooltipWidth,
          backgroundColor: C.bgCard,
          borderTopColor: C.accent,
          ...tokens.shadows.elevated,
        },
        animatedStyle,
      ]}
      onLayout={(e) => {
        const h = e.nativeEvent.layout.height;
        // Only trigger once — when we first learn the real height.
        // We animate opacity here directly (not via useEffect) so there is
        // no risk of a competing effect resetting the value after we set it.
        if (h > 0 && tooltipHeight === 0) {
          setTooltipHeight(h);
          opacity.value = withTiming(1, { duration: reduceMotion ? 0 : 200 });
        }
      }}
    >
      {/* Arrow */}
      {config.tooltipPlacement === 'below' ? (
        <View
          style={[
            styles.arrowUp,
            { left: arrowLeft, borderBottomColor: C.accent },
          ]}
          pointerEvents="none"
        />
      ) : (
        <View
          style={[
            styles.arrowDown,
            { left: arrowLeft, borderTopColor: C.bgCard },
          ]}
          pointerEvents="none"
        />
      )}

      {/* Top row: step badge + label */}
      <View style={styles.topRow}>
        <View style={[styles.stepBadge, { backgroundColor: C.accentLight }]}>
          <Text style={[styles.stepBadgeText, { color: C.accent }]}>
            {config.index + 1}
          </Text>
        </View>
        <Text style={[styles.label, { color: C.textMuted }]}>{config.label}</Text>
      </View>

      {/* Title */}
      <Text style={[styles.title, { color: C.textPrimary }]}>{config.title}</Text>

      {/* Body */}
      <Text style={[styles.body, { color: C.textSecondary }]}>{config.body}</Text>

      {/* Bottom row: progress dots + actions */}
      <View style={styles.bottomRow}>
        {/* Progress dots */}
        <View style={styles.dotsRow}>
          {Array.from({ length: PROGRESS_STEPS }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === config.index
                  ? { width: 20, backgroundColor: C.accent }
                  : { width: 8, backgroundColor: C.border },
              ]}
            />
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {config.index > 0 && (
            <TouchableOpacity
              onPress={onBack}
              style={styles.backButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Text style={[styles.backText, { color: C.textSecondary }]}>Back</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={onDismiss}
            style={styles.skipButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Skip tour"
          >
            <Text style={[styles.skipText, { color: C.textSecondary }]}>Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={config.isLast ? onDismiss : onNext}
            style={[styles.nextButton, { backgroundColor: C.accent }]}
            accessibilityRole="button"
            accessibilityLabel={config.isLast ? 'Got it' : 'Next'}
          >
            <Text style={styles.nextText}>{config.isLast ? 'Got it' : 'Next'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    borderTopWidth: 2,
    borderRadius: tokens.radii.lg,
    padding: tokens.spacing.md,
    gap: tokens.spacing.sm,
  },

  // Arrow up: tooltip is below target, arrow points up toward target
  arrowUp: {
    position: 'absolute',
    top: -(ARROW_SIZE * 1.4),
    width: 0,
    height: 0,
    borderLeftWidth: ARROW_SIZE,
    borderRightWidth: ARROW_SIZE,
    borderBottomWidth: ARROW_SIZE * 1.4,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },

  // Arrow down: tooltip is above target, arrow points down toward target
  arrowDown: {
    position: 'absolute',
    bottom: -(ARROW_SIZE * 1.4),
    width: 0,
    height: 0,
    borderLeftWidth: ARROW_SIZE,
    borderRightWidth: ARROW_SIZE,
    borderTopWidth: ARROW_SIZE * 1.4,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.sm,
  },
  stepBadge: {
    width: 20,
    height: 20,
    borderRadius: tokens.radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeText: {
    fontFamily: tokens.fonts.caption,
    fontSize: 11,
    fontWeight: '800',
  },
  label: {
    fontFamily: tokens.fonts.caption,
    fontSize: 11,
    letterSpacing: 1.1,
  },

  title: {
    fontFamily: tokens.fonts.caption,
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.3,
  },

  body: {
    fontFamily: tokens.fonts.body,
    fontSize: 14,
    lineHeight: 20,
  },

  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: tokens.spacing.xs,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    height: 8,
    borderRadius: tokens.radii.full,
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.sm,
  },
  skipButton: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.xs,
  },
  skipText: {
    fontFamily: tokens.fonts.body,
    fontSize: 14,
  },
  backButton: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.xs,
  },
  backText: {
    fontFamily: tokens.fonts.body,
    fontSize: 14,
  },
  nextButton: {
    height: 44,
    paddingHorizontal: tokens.spacing.md,
    borderRadius: tokens.radii.full,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 72,
  },
  nextText: {
    fontFamily: tokens.fonts.caption,
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

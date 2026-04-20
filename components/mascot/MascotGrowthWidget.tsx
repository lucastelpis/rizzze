import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { getSheepComponent } from './index';
import { POINT_COLORS } from '@/constants/sheepGrowth';
import { useSheepGrowth } from '@/context/SheepGrowthContext';
import { useTheme } from '@/context/ThemeContext';
import { useColors } from '@/hooks/useColors';

const HeartIcon = ({ size = 24, color = '#D4928A', showFill = true }: { size?: number; color?: string; showFill?: boolean }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={showFill ? color : 'none'} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
  </Svg>
);

export const MascotGrowthWidget = () => {
  const C = useColors();
  const { isDark } = useTheme();
  const {
    currentStageIndex,
    currentStageName,
    progressToNextStage,
    pointsInCurrentStage,
    pointsForNextStage,
    isMaxStage,
    totalPoints,
  } = useSheepGrowth();

  const SheepComponent = getSheepComponent(currentStageIndex);

  // Slightly smaller again to increase perceived padding
  const STAGE_RENDER_SIZES = [56, 72, 82, 82, 82, 82];
  const sheepRenderSize = STAGE_RENDER_SIZES[currentStageIndex] ?? 90;

  // Heart Animation setup
  const heartScale = useSharedValue(0);
  const heartOpacity = useSharedValue(0);
  const heartTranslateY = useSharedValue(0);

  const triggerHeartPop = () => {
    // Reset values immediately
    heartScale.value = 0;
    heartTranslateY.value = 0;
    heartOpacity.value = 1;

    // Execute with a slight sequence for smoothness
    heartScale.value = withSequence(
      withTiming(1.2, { duration: 250, easing: Easing.out(Easing.back(1.5)) }),
      withTiming(1, { duration: 150 })
    );

    heartTranslateY.value = withTiming(-15, {
      duration: 1000,
      easing: Easing.out(Easing.quad),
    });

    heartOpacity.value = withSequence(
      withDelay(600, withTiming(0, { duration: 600 }))
    );
  };

  const heartAnimatedStyle = useAnimatedStyle(() => ({
    opacity: heartOpacity.value,
    transform: [
      { scale: heartScale.value },
      { translateY: heartTranslateY.value }
    ],
    position: 'absolute',
    top: 20,
    zIndex: 100,
  }));

  return (
    <View style={styles.gamificationContainer}>
      {/* Sheep mascot container */}
      <View style={styles.sheepMainWrapper}>
        <Pressable 
          onPress={triggerHeartPop}
          style={({ pressed }) => [
            styles.avatarCircle, 
            { backgroundColor: C.accentLight, transform: [{ scale: pressed ? 0.96 : 1 }] }
          ]}
        >
          <View style={{ transform: [{ scaleX: -1 }], overflow: 'hidden' }}>
            <SheepComponent size={sheepRenderSize} />
          </View>
          <Animated.View pointerEvents="none" style={heartAnimatedStyle}>
            <HeartIcon size={18} />
          </Animated.View>
        </Pressable>
      </View>

      {/* Stage label */}
      <Text style={[styles.stageName, { color: C.textPrimary }]}>{currentStageName}</Text>

      {/* Progress Label — ABOVE the bar */}
      <Text style={[styles.progressLabelTop, { color: C.textMuted }]}>
        {isMaxStage ? `${totalPoints} pts` : `${pointsInCurrentStage} of ${pointsForNextStage} check-ins to next stage`}
      </Text>

      {/* Centered Status Bar */}
      <View style={styles.progressAreaCentered}>
        <View style={styles.progressBarTrackMini}>
          <View style={[styles.progressBarTrackBase, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : C.bgMuted }]}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.min(progressToNextStage * 100, 100)}%`,
                  backgroundColor: POINT_COLORS.daily,
                }
              ]}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  gamificationContainer: {
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  sheepMainWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageName: {
    fontSize: 22,
    fontFamily: 'Nunito_800ExtraBold',
    marginBottom: 4,
  },
  progressLabelTop: {
    fontSize: 13,
    fontFamily: 'Nunito_600SemiBold',
    marginBottom: 8,
  },
  progressAreaCentered: {
    width: '100%',
    alignItems: 'center',
  },
  progressBarTrackMini: {
    width: '60%',
    height: 8,
  },
  progressBarTrackBase: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
});

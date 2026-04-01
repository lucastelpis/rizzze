import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  Easing,
  FadeIn,
  FadeOut
} from 'react-native-reanimated';
import Svg, { Circle, G } from 'react-native-svg';
import { useColors } from '@/hooks/useColors';

const { width, height } = Dimensions.get('window');

interface ScreenLoaderProps {
  isVisible: boolean;
}

export function ScreenLoader({ isVisible }: ScreenLoaderProps) {
  const C = useColors();
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (isVisible) {
      rotation.value = withRepeat(
        withTiming(360, {
          duration: 1000,
          easing: Easing.linear,
        }),
        -1,
        false
      );
    } else {
      rotation.value = 0;
    }
  }, [isVisible]);

  const animatedLoaderStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  if (!isVisible) return null;

  return (
    <Animated.View 
      exiting={FadeOut.duration(500)}
      style={[styles.container, { backgroundColor: C.bgPrimary }]}
    >
      <Animated.View style={animatedLoaderStyle}>
        <Svg width="48" height="48" viewBox="0 0 48 48">
          <G x="24" y="24">
            {/* Background Track */}
            <Circle 
              cx="0" 
              cy="0" 
              r="20" 
              stroke={C.accentSoft} 
              strokeWidth="4" 
              fill="none" 
              opacity={0.2} 
            />
            {/* Spinning Indicator */}
            <Circle 
              cx="0" 
              cy="0" 
              r="20" 
              stroke={C.accent} 
              strokeWidth="4" 
              strokeLinecap="round" 
              fill="none" 
              strokeDasharray="100" 
              strokeDashoffset="70" 
            />
          </G>
        </Svg>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay, 
  withSequence,
  runOnJS,
  Easing
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const HeartIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill={color}>
    <Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </Svg>
);

const FloatingHeart = ({ onComplete }: { onComplete: () => void }) => {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  const randomX = (Math.random() - 0.5) * 60;
  const randomDelay = Math.random() * 1000;

  useEffect(() => {
    translateX.value = randomX;
    
    scale.value = withDelay(randomDelay, withTiming(1, { duration: 400 }));
    opacity.value = withDelay(randomDelay, withSequence(
      withTiming(1, { duration: 400 }),
      withDelay(400, withTiming(0, { duration: 600 }))
    ));
    
    translateY.value = withDelay(randomDelay, withTiming(-45, { 
      duration: 1400,
      easing: Easing.out(Easing.quad)
    }, (finished) => {
      if (finished) {
        runOnJS(onComplete)();
      }
    }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { scale: scale.value }
    ],
    opacity: opacity.value,
    position: 'absolute',
  }));

  return (
    <Animated.View style={animatedStyle}>
      <HeartIcon color="#FFD1DC" />
    </Animated.View>
  );
};

export const HeartAnimation = () => {
  const [hearts, setHearts] = useState<number[]>([]);
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setHearts(prev => [...prev, counter]);
      setCounter(c => c + 1);
    }, 600);
    return () => clearInterval(interval);
  }, [counter]);

  const removeHeart = (id: number) => {
    setHearts(prev => prev.filter(h => h !== id));
  };

  return (
    <View style={styles.container}>
      {hearts.map(id => (
        <FloatingHeart key={id} onComplete={() => removeHeart(id)} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
});

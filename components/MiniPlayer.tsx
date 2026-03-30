import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useAudio } from '@/context/AudioContext';
import { useRouter } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import Svg, { Path, Rect, Circle, Line } from 'react-native-svg';
import * as SoundGraphics from '@/components/SoundGraphics';
import { useTheme } from '@/context/ThemeContext';

// ── Icons ─────────
const PauseIcon = () => (
  <Svg width={12} height={14} viewBox="0 0 14 16" fill="none">
    <Rect x={0} y={0} width={4} height={16} rx={1} fill="#FFFFFF" />
    <Rect x={10} y={0} width={4} height={16} rx={1} fill="#FFFFFF" />
  </Svg>
);

const PlayIcon = () => (
  <Svg width={14} height={16} viewBox="0 0 16 18" fill="none">
    <Path d="M2 1.5 L14 9 L2 16.5 Z" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth={2} strokeLinejoin="round" />
  </Svg>
);

const CloseIcon = () => (
  <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
    <Line x1={4} y1={4} x2={20} y2={20} stroke="#A9A3B5" strokeWidth={2.5} strokeLinecap="round" />
    <Line x1={20} y1={4} x2={4} y2={20} stroke="#A9A3B5" strokeWidth={2.5} strokeLinecap="round" />
  </Svg>
);

const LoopIcon = ({ active }: { active: boolean }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M17 2l4 4-4 4M7 22l-4-4 4-4" 
      stroke={active ? "#FFFFFF" : "#A9A3B5"} 
      strokeWidth={2} 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    <Path 
      d="M21 6v3a6 6 0 0 1-6 6H3M3 18v-3a6 6 0 0 1 6-6h12" 
      stroke={active ? "#FFFFFF" : "#A9A3B5"} 
      strokeWidth={2} 
      strokeLinecap="round" 
    />
  </Svg>
);

const SheepFallbackIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 40 40" fill="none">
    <Circle cx={20} cy={22} r={11} fill="#FFFFFF" />
    <Circle cx={20} cy={12} r={7} fill="#FFFFFF" />
    <Circle cx={17.5} cy={13} r={1.2} fill="#2D2B3D" />
    <Circle cx={22.5} cy={13} r={1.2} fill="#2D2B3D" />
    <Circle cx={13} cy={11} r={2.5} fill="#E8DFF0" />
    <Circle cx={27} cy={11} r={2.5} fill="#E8DFF0" />
  </Svg>
);

export function MiniPlayer({ bottomOffset = 78 }: { bottomOffset?: number }) {
  const { activeSound, isPlaying, isLooping, toggleLoop, visualProgress, visualDuration, togglePlayPause, stopSound } = useAudio();
  const { isDark } = useTheme();
  const router = useRouter();
  const translateY = useSharedValue(100);

  useEffect(() => {
    if (activeSound) {
      translateY.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.ease) });
    } else {
      translateY.value = withTiming(100, { duration: 200, easing: Easing.in(Easing.ease) });
    }
  }, [activeSound]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const progressPercent = visualDuration > 0 ? Math.min(100, (visualProgress / visualDuration) * 100) : 0;

  let GraphicComponent = null;
  if (activeSound?.graphicId) {
    GraphicComponent = (SoundGraphics as any)[activeSound.graphicId];
  }

  // Handle open full player
  const handlePress = () => {
    if (!activeSound) return;
    router.push({
      pathname: '/player',
      params: { 
        title: activeSound.title, 
        subtitle: activeSound.subtitle, 
        soundFile: activeSound.soundFile, 
        graphicId: activeSound.graphicId 
      }
    });
  };

  return (
    <Animated.View 
      style={[
        styles.wrapper, 
        { bottom: bottomOffset }, 
        animatedStyle
      ]} 
      pointerEvents={activeSound ? 'auto' : 'none'}
    >
      {activeSound && (
        <TouchableOpacity 
          style={[
            styles.container,
            isDark && { borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }
          ]} 
          activeOpacity={0.9} 
          onPress={handlePress}
        >
          {/* 1. Thumbnail */}
          <View style={styles.thumb}>
            {GraphicComponent ? (
              <GraphicComponent w={42} h={42} />
            ) : (
              <View style={styles.thumbFallback}><SheepFallbackIcon /></View>
            )}
            <View style={styles.thumbOverlay} />
          </View>

          {/* 2. Track Info */}
          <View style={styles.trackInfo}>
            <Text style={styles.title} numberOfLines={1}>{activeSound.title}</Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
            </View>
          </View>

          {/* 3. Loop Button */}
          <TouchableOpacity 
            style={[styles.loopBtn, isLooping && styles.loopBtnActive]} 
            onPress={toggleLoop} 
            hitSlop={{top: 10, bottom: 10, left: 5, right: 5}}
          >
            <LoopIcon active={isLooping} />
          </TouchableOpacity>

          {/* 4. Play/Pause Button */}
          <TouchableOpacity style={styles.playBtn} onPress={togglePlayPause} hitSlop={{top: 10, bottom: 10, left: 5, right: 5}}>
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </TouchableOpacity>

          {/* 5. Close Button */}
          <TouchableOpacity style={styles.closeBtn} onPress={stopSound} hitSlop={{top: 10, bottom: 10, left: 5, right: 10}}>
            <CloseIcon />
          </TouchableOpacity>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    // bottom is passed as prop
    left: 12,
    right: 12,
    height: 62,
    zIndex: 100,
  },
  container: {
    flex: 1,
    backgroundColor: '#2D2B3D',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#2D2B3D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  thumb: {
    width: 42,
    height: 42,
    borderRadius: 10,
    overflow: 'hidden',
  },
  thumbFallback: {
    flex: 1,
    backgroundColor: '#3D3A52',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  trackInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: '#F5F0E8',
    marginBottom: 6,
  },
  progressBarBg: {
    height: 3,
    backgroundColor: '#3D3A52',
    borderRadius: 9999,
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#C4AED8',
    borderRadius: 9999,
  },
  loopBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3D3A52',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  loopBtnActive: {
    backgroundColor: '#8B6DAE',
  },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#8B6DAE',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  closeBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
});

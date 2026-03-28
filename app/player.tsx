import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, useWindowDimensions, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { useAudio } from '@/context/AudioContext';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing } from 'react-native-reanimated';
import { Ionicons, Feather } from '@expo/vector-icons';
import * as SoundGraphics from '@/components/SoundGraphics';

// ─── UTILS & DATA ─────────────────────────────────────────────────────────────
const formatTime = (millis: number) => {
  if (isNaN(millis) || !isFinite(millis)) return '00:00';
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// ─── COMPONENTS ───────────────────────────────────────────────────────────────
const Sparkle = ({ cx, cy, size, color, opacity }: any) => {
  const s = size / 2;
  const d = `M ${cx} ${cy - s} L ${cx + s * 0.3} ${cy} L ${cx} ${cy + s} L ${cx - s * 0.3} ${cy} Z`;
  return <Path d={d} fill={color} opacity={opacity} />;
};

const PauseIcon = () => (
  <Svg width={14} height={16} viewBox="0 0 14 16" fill="none">
    <Rect x={0} y={0} width={4} height={16} rx={1} fill="#FFFFFF" />
    <Rect x={10} y={0} width={4} height={16} rx={1} fill="#FFFFFF" />
  </Svg>
);

const PlayIcon = () => (
  <Svg width={16} height={18} viewBox="0 0 16 18" fill="none">
    <Path d="M2 1.5 L14 9 L2 16.5 Z" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth={2} strokeLinejoin="round" />
  </Svg>
);

const LoopIcon = ({ active }: { active: boolean }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
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

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
export default function PlayerScreen() {
  const router = useRouter();
  const { title, subtitle, soundFile, graphicId } = useLocalSearchParams<{title: string; subtitle: string; soundFile: string; graphicId: string}>();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const {
    activeSound,
    isPlaying,
    isLooping,
    toggleLoop,
    visualDuration,
    displayPosition,
    playSelectedSound,
    togglePlayPause,
    scrubTo,
    setIsScrubbing
  } = useAudio();

  useEffect(() => {
    if (soundFile) {
      playSelectedSound({ title, subtitle, soundFile, graphicId });
    }
  }, [soundFile]);

  // Bobbing animation for sheep
  const translateY = useSharedValue(0);
  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
        withTiming(8, { duration: 1500, easing: Easing.inOut(Easing.sin) })
      ),
      -1, // Infinite
      true // Reverse
    );
  }, []);

  const animatedSheepStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const displayDuration = visualDuration;

  const handleScrubMove = (e: any) => {
    const padding = 28; // horizontal padding
    const barWidth = width - (padding * 2) - 8;
    const constrainedX = Math.max(0, Math.min(e.nativeEvent.locationX, barWidth));
    const newPercent = constrainedX / barWidth;
    const newPosition = visualDuration * newPercent;
    scrubTo(newPosition);
  };

  const handleScrubStart = (e: any) => {
    setIsScrubbing(true);
    handleScrubMove(e);
  };

  const handleScrubEnd = () => {
    setIsScrubbing(false);
  };

  const progressPercent = Math.min(100, Math.max(0, (displayPosition / displayDuration) * 100));
  const GraphicComponent = (SoundGraphics as any)[graphicId || 'ForestNightBg'];

  return (
    <View style={styles.container}>
      {/* Explicitly using light status bar to ensure icons are light on the dark background */}
      <StatusBar style="light" />
      <View style={[styles.safeArea, { paddingTop: Math.max(insets.top, 20) + 16, paddingBottom: Math.max(insets.bottom, 20) }]}>
        
        {/* TOP NAV BAR - Fixed at top */}
        <View style={styles.topNav}>
          <View style={{ width: 24 }} />
          <Text style={styles.nowPlayingText}>NOW PLAYING</Text>
          <TouchableOpacity activeOpacity={0.7} style={{ padding: 4 }}>
            <Feather name="more-vertical" size={20} color="#C4AED8" />
          </TouchableOpacity>
        </View>

        {/* MAIN CONTENT - Vertically Centered */}
        <View style={styles.mainContent}>
          {/* ALBUM ART */}
        <View style={styles.albumArtWrapper}>
          <View style={styles.albumContainer}>
            {GraphicComponent && <GraphicComponent w={220} h={220} />}
            <View style={StyleSheet.absoluteFill}>
              <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
                {/* 4-5 Sparkles */}
                <Sparkle cx={40} cy={40} size={8} color="#C4AED8" opacity={0.6} />
                <Sparkle cx={180} cy={60} size={6} color="#E8DFF0" opacity={0.8} />
                <Sparkle cx={170} cy={160} size={10} color="#C4AED8" opacity={0.5} />
                <Sparkle cx={50} cy={180} size={8} color="#E8DFF0" opacity={0.7} />
              </Svg>
            </View>
            <Animated.View style={[styles.mascotContainer, animatedSheepStyle]}>
              <Image source={require('@/assets/images/mascot_welcome.png')} style={styles.mascot} contentFit="contain" />
            </Animated.View>
          </View>
        </View>

        {/* TRACK INFO */}
        <View style={styles.trackInfo}>
          <Text style={styles.title}>{title || 'Unknown Sound'}</Text>
          <Text style={styles.subtitle}>{subtitle || 'Collection'}</Text>
        </View>

          {/* PROGRESS BAR */}
          <View style={styles.progressContainer}>
            <View 
              style={styles.progressTouchable}
              onStartShouldSetResponder={() => true}
              onResponderGrant={handleScrubStart}
              onResponderMove={handleScrubMove}
              onResponderRelease={handleScrubEnd}
              onResponderTerminate={handleScrubEnd}
            >
              <View style={styles.progressTrack} pointerEvents="none">
                <View style={[styles.progressFilled, { width: `${progressPercent}%` }]} />
                <View style={[styles.scrubberDot, { left: `${progressPercent}%`, transform: [{ translateX: -6 }] }]} />
              </View>
            </View>
            <View style={styles.timeRow}>
              <Text style={styles.timeText}>{formatTime(displayPosition)}</Text>
              <Text style={styles.timeText}>{formatTime(displayDuration)}</Text>
            </View>
          </View>

          {/* PLAYBACK CONTROLS */}
          <View style={styles.controlsRow}>
            <View style={styles.buttonCol}>
              <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
                <Feather name="arrow-left" size={22} color="#C4AED8" />
              </TouchableOpacity>
              <Text style={styles.buttonLabel}>Back</Text>
            </View>

            <TouchableOpacity style={styles.playPauseButton} onPress={togglePlayPause} activeOpacity={0.8}>
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </TouchableOpacity>

            <View style={styles.buttonCol}>
              <TouchableOpacity style={[styles.loopButton, isLooping ? { backgroundColor: '#8B6DAE' } : null]} onPress={toggleLoop} activeOpacity={0.7}>
                <LoopIcon active={isLooping} />
              </TouchableOpacity>
              <Text style={[styles.loopLabel, isLooping ? { color: '#8B6DAE' } : null]}>{isLooping ? 'On' : 'Loop'}</Text>
            </View>
          </View>

          {/* SLEEP TIMER PILL */}
          <View style={styles.pillContainer}>
            <View style={styles.timerPill}>
              <Feather name="clock" size={14} color="#C4AED8" strokeWidth={1.5} />
              <Text style={styles.timerText}>Sleep timer · 45 min</Text>
            </View>
          </View>
        </View>

      </View>
    </View>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2D2B3D',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 28,
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    // marginBottom removed to allow mainContent to take remaining space
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 40, // Visual balance
  },
  nowPlayingText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 11,
    color: '#C4AED8',
    letterSpacing: 1.1, // 0.1em approx
    textTransform: 'uppercase',
  },
  albumArtWrapper: {
    alignItems: 'center',
    marginBottom: 28,
  },
  albumContainer: {
    width: 220,
    height: 220,
    borderRadius: 28,
    backgroundColor: '#3D3A52',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotContainer: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascot: {
    width: '100%',
    height: '100%',
  },
  trackInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 22,
    color: '#F5F0E8',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 14,
    color: '#C4AED8',
    textAlign: 'center',
  },
  progressContainer: {
    paddingHorizontal: 4, 
    marginBottom: 36,
  },
  progressTouchable: {
    paddingVertical: 10, // Wider touch target for scrubbing
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#3D3A52',
    borderRadius: 9999,
    position: 'relative',
    justifyContent: 'center',
  },
  progressFilled: {
    height: '100%',
    backgroundColor: '#C4AED8',
    borderRadius: 9999,
  },
  scrubberDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F5F0E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeText: {
    fontFamily: Platform.select({ ios: 'Menlo-Regular', android: 'monospace' }),
    fontSize: 12,
    color: '#A9A3B5',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  buttonCol: {
    alignItems: 'center',
    gap: 6,
    width: 44,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3D3A52',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 10,
    fontWeight: '600',
    color: '#A9A3B5',
    textAlign: 'center',
  },
  playPauseButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#8B6DAE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loopButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3D3A52',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loopLabel: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 10,
    fontWeight: '600',
    color: '#A9A3B5',
    textAlign: 'center',
  },
  pillContainer: {
    alignItems: 'center',
    marginTop: 28,
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3D3A52',
    borderRadius: 9999,
    paddingVertical: 10,
    paddingHorizontal: 20,
    gap: 8,
  },
  timerText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    fontWeight: '700',
    color: '#C4AED8',
  },
});

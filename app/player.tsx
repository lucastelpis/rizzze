import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, useWindowDimensions, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing } from 'react-native-reanimated';
import { Ionicons, Feather } from '@expo/vector-icons';
import * as SoundGraphics from '@/components/SoundGraphics';

// Configure App-Wide Audio Session for Silent Mode
setAudioModeAsync({
  playsInSilentMode: true,
  interruptionMode: 'doNotMix',
  allowsRecording: false,
  shouldPlayInBackground: true,
  shouldRouteThroughEarpiece: false,
}).catch(console.error);

// ─── UTILS & DATA ─────────────────────────────────────────────────────────────
const formatTime = (millis: number) => {
  if (isNaN(millis) || !isFinite(millis)) return '00:00';
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const SOUND_ASSETS: Record<string, any> = {
  'forest.m4a': require('@/assets/sounds/forest.m4a'),
  'beach.m4a': require('@/assets/sounds/beach.m4a'),
  'city_rain.m4a': require('@/assets/sounds/city_rain.m4a'),
  'fireplace.m4a': require('@/assets/sounds/fireplace.m4a'),
  'coffeeshop.m4a': require('@/assets/sounds/coffeeshop.m4a'),
  'simple_rain.m4a': require('@/assets/sounds/simple_rain.m4a'),
  'simple_fan.m4a': require('@/assets/sounds/simple_fan.m4a'),
  'simple_static.m4a': require('@/assets/sounds/simple_static.m4a'),
  'simple_ac.m4a': require('@/assets/sounds/simple_ac.m4a'),
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

  const [isLooping, setIsLooping] = useState(true); // Default to ON
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubPosition, setScrubPosition] = useState(0);
  const [visualProgress, setVisualProgress] = useState(0);
  const scrubPositionRef = useRef(0);
  const wasPlayingRef = useRef(false);
  const lastTimeRef = useRef(Date.now());

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

  // Modern Ping-Pong Dual Audio Setup
  const asset = SOUND_ASSETS[soundFile || 'forest.m4a'];
  // Instantiate two players to crossfade slightly at loop points
  const player1 = useAudioPlayer(asset, { updateInterval: 30 });
  const player2 = useAudioPlayer(asset, { updateInterval: 30 });
  const status1 = useAudioPlayerStatus(player1);
  const status2 = useAudioPlayerStatus(player2);

  const [activePlayerIdx, setActivePlayerIdx] = useState(0);
  const activeStatus = activePlayerIdx === 0 ? status1 : status2;

  useEffect(() => {
    // Both players must NOT native-loop; we trigger them manually
    player1.loop = false;
    player2.loop = false;
    player1.play();
  }, [player1, player2]);

  useEffect(() => {
    if (!activeStatus.duration) return;

    const isAnyPlaying = status1.playing || status2.playing;

    // Ping-pong Overlap Logic
    if (isLooping && isAnyPlaying) {
      const remainingTime = activeStatus.duration - activeStatus.currentTime;
      // Increase overlap to 1.2 seconds to fully mask gaps and load times
      const OVERLAP = 1.2; 

      if (remainingTime <= OVERLAP && remainingTime > 0) {
        const nextIdx = activePlayerIdx === 0 ? 1 : 0;
        const nextPlayer = nextIdx === 0 ? player1 : player2;
        const nextStatus = nextIdx === 0 ? status1 : status2;
        
        // Start the other player if it hasn't already started
        if (!nextStatus.playing) {
          nextPlayer.play();
        }
      }
    }

    // Switch UI control to the new player naturally just as current reaches its very end
    if (activeStatus.currentTime >= activeStatus.duration - 0.05 && activeStatus.duration > 0) {
      if (isLooping) {
        const nextIdx = activePlayerIdx === 0 ? 1 : 0;
        const finishedPlayer = activePlayerIdx === 0 ? player1 : player2;
        
        // Rewind the player that just finished for the NEXT loop
        setTimeout(() => {
          finishedPlayer.seekTo(0);
        }, 300);

        setActivePlayerIdx(nextIdx);
      }
    }
  }, [activeStatus.currentTime, activeStatus.duration, activePlayerIdx, isLooping, status1.playing, status2.playing, player1, player2]);

  // Derived state spanning both players
  const isPlaying = status1.playing || status2.playing;
  const isSimpleSound = subtitle && subtitle.includes('Simple');
  const visualDuration = isSimpleSound ? 60 * 1000 : 5 * 60 * 1000; // 1 min vs 5 mins

  // Custom UI timer decoupled from short native audio duration
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying && !isScrubbing) {
      lastTimeRef.current = Date.now();
      interval = setInterval(() => {
        const now = Date.now();
        const delta = now - lastTimeRef.current;
        lastTimeRef.current = now;

        setVisualProgress((prev) => {
          const next = prev + delta;
          if (next >= visualDuration) {
            if (isLooping) {
              return next % visualDuration;
            } else {
              player1.pause();
              player2.pause();
              return visualDuration;
            }
          }
          return next;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isScrubbing, isLooping, visualDuration]);

  const displayDuration = visualDuration;
  const displayPosition = isScrubbing ? scrubPosition : visualProgress;

  // Controls
  const togglePlayPause = () => {
    if (isPlaying) {
      player1.pause();
      player2.pause();
    } else {
      const activePlayer = activePlayerIdx === 0 ? player1 : player2;
      if (visualProgress >= visualDuration && !isLooping) {
        setVisualProgress(0);
        activePlayer.seekTo(0);
      }
      activePlayer.play();
    }
  };

  const toggleLoop = () => {
    setIsLooping(!isLooping);
  };

  const handleScrubMove = (e: any) => {
    const padding = 28; // horizontal padding
    const barWidth = width - (padding * 2) - 8;
    const constrainedX = Math.max(0, Math.min(e.nativeEvent.locationX, barWidth));
    const newPercent = constrainedX / barWidth;
    
    const newPosition = visualDuration * newPercent;
    scrubPositionRef.current = newPosition;
    setScrubPosition(newPosition);
    setVisualProgress(newPosition);
  };

  const handleScrubStart = (e: any) => {
    setIsScrubbing(true);
    wasPlayingRef.current = isPlaying;
    player1.pause();
    player2.pause();
    handleScrubMove(e);
  };

  const handleScrubEnd = () => {
    setIsScrubbing(false);
    
    // Stop the inactive player to prevent ghost playback
    const inactivePlayer = activePlayerIdx === 0 ? player2 : player1;
    inactivePlayer.pause();
    inactivePlayer.seekTo(0);

    // Seek the active player loosely based on visual percentage
    const activePlayer = activePlayerIdx === 0 ? player1 : player2;
    if (activeStatus.duration) {
      const nativeSeek = (scrubPositionRef.current / 1000) % activeStatus.duration;
      activePlayer.seekTo(nativeSeek);
    }
    
    if (wasPlayingRef.current) {
      activePlayer.play();
    }
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

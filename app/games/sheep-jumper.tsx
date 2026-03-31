import { AwakeSheepNoBorder } from '@/components/AwakeSheepNoBorder';
import { AwakeSheepWalking } from '@/components/AwakeSheepWalking';
import { SleepingSheep } from '@/components/SleepingSheep';
import { useAudio } from '@/context/AudioContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// GAME CONSTANTS
const GROUND_HEIGHT = 240;
const SHEEP_X = 80;
const SHEEP_SIZE = 80;
const SHEEP_FEET_OFFSET = (54 / 64) * SHEEP_SIZE; // Sheep feet are at y=54 from top in a 64x64 grid
const SHEEP_FEET_TO_BOTTOM = SHEEP_SIZE - SHEEP_FEET_OFFSET; // Space below feet
const FENCE_WIDTH = 48;
const FENCE_HEIGHT = 56;
const JUMP_VELOCITY = 12.5; // Positive is UP
const GRAVITY = -0.42; // Negative is DOWN

const HIGHSCORE_KEY = 'rizzze_highscore_sheepjumper';

// Hitbox shrinkage for "generosity"
const HITBOX_PADDING = 8;

interface Fence {
  id: number;
  x: number;
  passed: boolean;
}

interface GrassTuft {
  id: number;
  x: number;
  height: number;
}

interface Cloud {
  id: number;
  x: number;
  y: number;
  radius: number;
  opacity: number;
  speed: number;
}

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
}

export default function SheepJumper() {
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const router = useRouter();

  // Game state
  const [gameState, setGameState] = useState<'playing' | 'gameOver'>('playing');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isNewBest, setIsNewBest] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [instructionOpacity] = useState(new Animated.Value(0.7));
  const scoreRef = useRef(0);
  const highScoreRef = useRef(0);
  const jumpCount = useRef(0);

  // Refs for high-performance animation
  const sheepFeetY = useRef(GROUND_HEIGHT); // Y position of feet from bottom
  const sheepVelocity = useRef(0);
  const isJumping = useRef(false);
  const fences = useRef<Fence[]>([]);
  const clouds = useRef<Cloud[]>([
    { id: 1, x: SCREEN_WIDTH * 0.2, y: SCREEN_HEIGHT * 0.15, radius: 24, opacity: 0.2, speed: 3 / 60 },
    { id: 2, x: SCREEN_WIDTH * 0.6, y: SCREEN_HEIGHT * 0.25, radius: 18, opacity: 0.15, speed: 2.5 / 60 },
    { id: 3, x: SCREEN_WIDTH * 0.8, y: SCREEN_HEIGHT * 0.1, radius: 20, opacity: 0.25, speed: 3.5 / 60 },
  ]);
  const stars = useRef<Star[]>([]);
  const grassTufts = useRef<GrassTuft[]>([]);
  const gameSpeed = useRef(180 / 60); // 180px per second initially (scaled up)
  const fenceCounter = useRef(0);
  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | undefined>(undefined);

  // For rendering
  const [renderCounter, setRenderCounter] = useState(0);
  const [isWalkFrame, setIsWalkFrame] = useState(false);
  const walkAnimTimer = useRef(0);

  // Audio setup
  const { stopSound } = useAudio();
  const themePlayer = useAudioPlayer(require('@/assets/audio/game-tracks/sheep-jumper-track.mp3'));

  // Initialize fences and auto-stop background sounds
  useEffect(() => {
    // 1. Stop any currently playing sleep sounds
    stopSound();

    // 2. Setup theme player
    themePlayer.loop = true;
    themePlayer.play();

    const initialTufts: GrassTuft[] = [];
    for (let i = 0; i < 10; i++) {
      initialTufts.push({
        id: Math.random(),
        x: (SCREEN_WIDTH / 10) * i + Math.random() * 50,
        height: 8 + Math.random() * 6
      });
    }
    grassTufts.current = initialTufts;

    // Initialize Stars
    const initialStars: Star[] = [];
    for (let i = 0; i < 40; i++) {
      initialStars.push({
        id: i,
        x: Math.random() * SCREEN_WIDTH,
        y: Math.random() * (SCREEN_HEIGHT * 0.7),
        size: 1 + Math.random() * 2,
        opacity: 0.2 + Math.random() * 0.5,
        speed: (0.1 + Math.random() * 0.3) / 60 * 60, // Slow drift
      });
    }
    stars.current = initialStars;

    fences.current = [
      { id: Date.now(), x: SCREEN_WIDTH + 800, passed: false }
    ];

    // Load High Score
    const loadHighScore = async () => {
      try {
        const val = await AsyncStorage.getItem(HIGHSCORE_KEY);
        if (val) {
          const parsed = parseInt(val, 10);
          setHighScore(parsed);
          highScoreRef.current = parsed;
        }
      } catch (e) {
        console.error('Failed to load high score', e);
      }
    };
    loadHighScore();

    return () => {
      try {
        themePlayer.pause();
      } catch (e) {
        console.warn('Theme player cleanup failed:', e);
      }
    };
  }, []);

  // Update theme music playing state
  useEffect(() => {
    try {
      if (isMuted) {
        themePlayer.pause();
      } else {
        themePlayer.play();
      }
    } catch (e) {
      console.warn('Audio toggle failed:', e);
    }
  }, [isMuted, themePlayer]);

  const jump = useCallback(() => {
    if (gameState !== 'playing' || isJumping.current) return;

    isJumping.current = true;
    sheepVelocity.current = JUMP_VELOCITY;
    jumpCount.current += 1;

    // Add haptic feedback
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {
      // Ignore if not supported
    }

    if (jumpCount.current === 3) {
      Animated.timing(instructionOpacity, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }
  }, [gameState, instructionOpacity]);

  const resetGame = () => {
    setGameState('playing');
    setScore(0);
    scoreRef.current = 0;
    setIsNewBest(false);
    sheepFeetY.current = GROUND_HEIGHT;
    sheepVelocity.current = 0;
    isJumping.current = false;
    fences.current = [{ id: Date.now(), x: SCREEN_WIDTH + 800, passed: false }];
    gameSpeed.current = 180 / 60;
    fenceCounter.current = 0;
    lastTimeRef.current = undefined;
  };

  const update = (time: number) => {
    if (gameState !== 'playing') return;

    if (lastTimeRef.current !== undefined) {
      // Update sheep
      if (isJumping.current) {
        sheepVelocity.current += GRAVITY;
        sheepFeetY.current += sheepVelocity.current;

        if (sheepFeetY.current <= GROUND_HEIGHT) {
          sheepFeetY.current = GROUND_HEIGHT;
          sheepVelocity.current = 0;
          isJumping.current = false;
        }
      }

      // Update clouds
      clouds.current.forEach(cloud => {
        cloud.x -= cloud.speed;
        if (cloud.x + cloud.radius < 0) {
          cloud.x = SCREEN_WIDTH + cloud.radius;
        }
      });

      // Update stars (parallax)
      stars.current.forEach(star => {
        star.x -= star.speed;
        if (star.x < -star.size) {
          star.x = SCREEN_WIDTH + star.size;
          star.y = Math.random() * (SCREEN_HEIGHT * 0.7); // Variety while recycling
        }
      });

      // Update fences & grass
      fences.current.forEach(fence => {
        fence.x -= gameSpeed.current;
      });
      grassTufts.current.forEach(tuft => {
        tuft.x -= gameSpeed.current;
        if (tuft.x < -10) {
          tuft.x = SCREEN_WIDTH + Math.random() * 50;
        }
      });

      // Remove old fences and add new ones
      if (fences.current.length > 0 && fences.current[0].x < -50) {
        fences.current.shift();
      }

      const lastFence = fences.current[fences.current.length - 1];
      if (!lastFence || lastFence.x < SCREEN_WIDTH - (Math.random() * 200 + 250)) {
        fences.current.push({
          id: Date.now(),
          x: SCREEN_WIDTH + 80, // Spawn just off-screen
          passed: false
        });
      }

      // Scoring and Collision
      fences.current.forEach(fence => {
        // Score
        if (!fence.passed && fence.x < SHEEP_X) {
          fence.passed = true;
          setScore(s => {
            const newScore = s + 1;
            scoreRef.current = newScore;
            if (newScore % 10 === 0) {
              gameSpeed.current = Math.min(320 / 60, gameSpeed.current + 8 / 60);
            }
            return newScore;
          });
        }

        // Collision (Bottom-up coordinate system)
        const sheepHitbox = {
          left: SHEEP_X + HITBOX_PADDING,
          right: SHEEP_X + SHEEP_SIZE - HITBOX_PADDING,
          bottom: sheepFeetY.current, // Feet level
          top: sheepFeetY.current + SHEEP_FEET_OFFSET - HITBOX_PADDING, // Visible head level
        };

        const fenceHitbox = {
          left: fence.x + (FENCE_WIDTH * 0.1),
          right: fence.x + (FENCE_WIDTH * 0.9),
          bottom: GROUND_HEIGHT,
          top: GROUND_HEIGHT + FENCE_HEIGHT,
        };

        if (
          sheepHitbox.right > fenceHitbox.left &&
          sheepHitbox.left < fenceHitbox.right &&
          sheepHitbox.top > fenceHitbox.bottom &&
          sheepHitbox.bottom < fenceHitbox.top
        ) {
          endGame();
        }
      });
    }

    // Update walk animation
    if (!isJumping.current && gameState === 'playing') {
      walkAnimTimer.current += 1;
      if (walkAnimTimer.current >= 6) { // Toggle every 6 frames (~0.1s)
        setIsWalkFrame(v => !v);
        walkAnimTimer.current = 0;
      }
    } else if (isJumping.current) {
      // Keep legs in "jump" position (static frame works best for jump)
      setIsWalkFrame(false);
    }

    lastTimeRef.current = time;
    setRenderCounter(c => c + 1); // Trigger re-render
    requestRef.current = requestAnimationFrame(update);
  };

  const endGame = async () => {
    if (gameState !== 'playing') return;
    setGameState('gameOver');

    const finalScore = scoreRef.current;
    if (finalScore > highScoreRef.current) {
      setHighScore(finalScore);
      highScoreRef.current = finalScore;
      setIsNewBest(true);
      try {
        await AsyncStorage.setItem(HIGHSCORE_KEY, finalScore.toString());
      } catch (e) {
        console.error('Failed to save high score', e);
      }
    }
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => {
      if (requestRef.current !== null) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState]);

  return (
    <View style={[styles.container, { width: SCREEN_WIDTH, height: SCREEN_HEIGHT, overflow: 'hidden' }]}>
      {/* 2. SKY */}
      <View style={[styles.sky, { backgroundColor: '#1A2338' }]}>
        {/* Moon */}
        <View style={styles.moon} />

        {/* Animated Stars */}
        {stars.current.map(star => (
          <View
            key={`star-${star.id}`}
            style={[
              styles.star,
              {
                left: star.x,
                top: star.y,
                width: star.size,
                height: star.size,
                opacity: star.opacity,
              },
            ]}
          />
        ))}
      </View>

      {/* GROUND */}
      <View style={styles.groundContainer}>
        {/* Back hill */}
        <Svg width="100%" height="100%" viewBox={`0 0 ${SCREEN_WIDTH} ${SCREEN_HEIGHT * 0.25}`} style={styles.hills}>
          <Path
            d={`M0 ${SCREEN_HEIGHT * 0.1} Q${SCREEN_WIDTH * 0.25} ${SCREEN_HEIGHT * 0.05} ${SCREEN_WIDTH * 0.5} ${SCREEN_HEIGHT * 0.1} T${SCREEN_WIDTH} ${SCREEN_HEIGHT * 0.1} V${SCREEN_HEIGHT * 0.25} H0 Z`}
            fill="#1E2B1E"
          />
        </Svg>

        {/* Front ground */}
        <View style={[styles.frontGround, { backgroundColor: '#2D3D2D' }]}>
          {/* Ground line */}
          <Svg width="100%" height="20" style={styles.groundLine}>
            <Path
              d={`M0 10 Q${SCREEN_WIDTH * 0.25} 5 ${SCREEN_WIDTH * 0.5} 10 T${SCREEN_WIDTH} 10`}
              fill="none"
              stroke="#243324"
              strokeWidth={3}
            />
          </Svg>

          {/* Grass tufts - we'll just render a few that move with the fences roughly */}
          {/* For simplicity in this first draft, I'll use static tufts or move them in the loop */}
        </View>
      </View>

      {/* FENCES */}
      {fences.current.map(fence => (
        <View key={fence.id} style={[styles.fenceContainer, { left: fence.x, bottom: GROUND_HEIGHT }]}>
          <Svg width={FENCE_WIDTH} height={FENCE_HEIGHT} viewBox="0 0 30 35">
            {/* Posts */}
            <Rect x="0" y="0" width="6" height="35" fill="#8B7050" />
            <Rect x="24" y="0" width="6" height="35" fill="#8B7050" />
            {/* Rails */}
            <Rect x="3" y="8" width="24" height="8" fill="#C8B888" />
            <Rect x="3" y="19" width="24" height="8" fill="#C8B888" />
          </Svg>
        </View>
      ))}

      {/* GRASS TUFTS */}
      {grassTufts.current.map(tuft => (
        <View key={tuft.id} style={[styles.grassTuft, { left: tuft.x, bottom: GROUND_HEIGHT, height: tuft.height }]} />
      ))}

      {/* SHEEP */}
      <View style={[styles.sheepContainer, { left: SHEEP_X, bottom: sheepFeetY.current - SHEEP_FEET_TO_BOTTOM }]}>
        {isWalkFrame ? (
          <AwakeSheepWalking size={SHEEP_SIZE} />
        ) : (
          <AwakeSheepNoBorder size={SHEEP_SIZE} />
        )}
      </View>

      {/* TOUCH SURFACE (COVERS WORLD BUT NOT HUD) */}
      <View
        style={StyleSheet.absoluteFill}
        onTouchStart={jump}
        pointerEvents="auto"
      />

      {/* 🚀 ABSOLUTE HUD OVERLAY (Standardized) */}
      <SafeAreaView style={styles.hudOverlay} edges={['top']} pointerEvents="box-none">
        <View style={styles.headerContainer}>
          <View style={styles.backButtonWrap}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace('/(tabs)/games');
                }
              }}
              activeOpacity={0.7}
            >
              <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <Path d="M15 18L9 12L15 6" stroke="#E8F0E0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>
          </View>

          <View style={styles.titleContainer}>
            <Text style={styles.title}>SHEEP JUMPER</Text>
          </View>

          <View style={styles.statsWrap}>
            <View style={styles.topRightHub}>
              <Text style={styles.miniBestTitle}>BEST:</Text>
              <Text style={styles.miniBestValue}>{highScore}</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>

      {/* CENTERED SCORE */}
      <View style={styles.centeredScoreContainer} pointerEvents="none">
        <Text style={styles.largeScoreText}>{score}</Text>
        <Text style={styles.fencesLabel}>FENCES</Text>
      </View>

      {/* INSTRUCTION */}
      <Animated.View style={[styles.instruction, { opacity: instructionOpacity }]} pointerEvents="none">
        <Text style={styles.instructionText}>Tap anywhere to jump</Text>
      </Animated.View>

      {/* MUSIC TOGGLE (BOTTOM RIGHT) */}
      <TouchableOpacity
        style={[styles.musicToggleButton, isMuted && styles.musicToggleButtonMuted]}
        onPress={() => setIsMuted(!isMuted)}
        activeOpacity={0.7}
      >
        <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <Path
            d="M9 18V5L21 3V16"
            stroke="#E8F0E0"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={isMuted ? 0.4 : 1}
          />
          <Circle
            cx="6" cy="18" r="3"
            stroke="#E8F0E0"
            strokeWidth="2"
            opacity={isMuted ? 0.4 : 1}
          />
          <Circle
            cx="18" cy="16" r="3"
            stroke="#E8F0E0"
            strokeWidth="2"
            opacity={isMuted ? 0.4 : 1}
          />
          {isMuted && (
            <Path d="M3 21L21 3" stroke="#E8F0E0" strokeWidth="2.5" strokeLinecap="round" />
          )}
        </Svg>
      </TouchableOpacity>

      {/* GAME OVER OVERLAY */}
      {gameState === 'gameOver' && (
        <View style={[styles.overlay, { width: SCREEN_WIDTH, height: SCREEN_HEIGHT }]}>
          <View style={styles.gameOverCard}>
            {isNewBest && (
              <View style={styles.newBestBanner}>
                <Text style={styles.newBestLabel}>NEW BEST!</Text>
              </View>
            )}
            <SleepingSheep size={80} />
            <View style={{ height: 16 }} />
            <Text style={styles.gameOverTitle}>Sweet dreams</Text>
            <Text style={styles.gameOverSubtitle}>You cleared {score} fences</Text>
            <View style={{ height: 20 }} />

            <TouchableOpacity style={styles.primaryButton} onPress={resetGame}>
              <Text style={styles.primaryButtonText}>Play again</Text>
            </TouchableOpacity>

            <View style={{ height: 10 }} />

            <TouchableOpacity style={styles.secondaryButton} onPress={() => router.back()}>
              <Text style={styles.secondaryButtonText}>Back to games</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#D8E8D0',
    position: 'relative',
  },
  sky: {
    ...StyleSheet.absoluteFillObject,
  },
  moon: {
    position: 'absolute',
    top: 150, // Moved down to avoid header
    right: 40,
    width: 40, // Smaller moon
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F0E8',
    opacity: 1, // Solid moon as requested
    shadowColor: '#F5F0E8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
  groundContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: GROUND_HEIGHT,
  },
  hills: {
    position: 'absolute',
    top: -40, // Consistent hill height
    width: '100%',
  },
  frontGround: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  groundLine: {
    position: 'absolute',
    top: -5,
  },
  sheepContainer: {
    position: 'absolute',
  },
  fenceContainer: {
    position: 'absolute',
    width: FENCE_WIDTH,
    height: FENCE_HEIGHT,
  },
  grassTuft: {
    position: 'absolute',
    width: 3,
    backgroundColor: '#7A9A50',
    opacity: 0.3,
  },
  hudOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonWrap: {
    width: 80,
    alignItems: 'flex-start',
  },
  statsWrap: {
    width: 80,
    alignItems: 'flex-end',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    color: '#E8F0E0',
    letterSpacing: 0.65, // 0.05em
  },
  musicToggleButton: {
    position: 'absolute',
    bottom: 40,
    right: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  musicToggleButtonMuted: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    opacity: 0.8,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#4A6040',
  },
  centeredScoreContainer: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  largeScoreText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#E8F0E0',
    opacity: 0.8,
  },
  fencesLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#E8F0E0',
    letterSpacing: 2,
    opacity: 0.4,
    marginTop: -4,
  },
  topRightHub: {
    alignItems: 'flex-end',
    width: 80,
  },
  miniBestTitle: {
    fontSize: 9,
    fontWeight: '900',
    color: '#E8F0E0',
    letterSpacing: 1,
    opacity: 0.5,
  },
  miniBestValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#E8F0E0',
    marginTop: -2,
  },
  newBestBanner: {
    backgroundColor: '#8B6DAE',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  newBestLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  instruction: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F5F0E8',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'rgba(45,43,61,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    zIndex: 100,
  },
  gameOverCard: {
    width: 280,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    shadowColor: 'rgba(45,43,61,0.15)',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 40,
    elevation: 10,
  },
  gameOverTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#2D2B3D',
  },
  gameOverSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7A7589',
    marginTop: 4,
  },
  primaryButton: {
    width: '100%',
    height: 44,
    backgroundColor: '#8B6DAE',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryButton: {
    width: '100%',
    height: 44,
    backgroundColor: '#F0EBE3',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7A7589',
  },
});

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
  Platform,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import Reanimated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAudioPlayer } from 'expo-audio';
import { useAudio } from '@/context/AudioContext';
import * as Haptics from 'expo-haptics';
import Svg, { Path, Circle, Rect, G, Ellipse } from 'react-native-svg';
import { AwakeSheep } from '@/components/AwakeSheep';
import { AwakeSheepNoBorder } from '@/components/AwakeSheepNoBorder';
import { PickaxeIcon, AxeIcon, TrimmerIcon } from '@/components/ToolIcons';

// GRID BASE CONSTANTS
const GRID_MARGIN = 20;
const GRID_GAP = 4;
const MAX_GRID_WIDTH = 400; // Limit grid width on large screens

// COLORS
const COLORS = {
  bg: '#5A7A6A',
  tileLight: '#8AAA80',
  tileDark: '#7A9A70',
  tileBorder: '#6A8A60',
  tileFlash: '#A8C8A0',
  particle: '#A8C8A0',
  stone1: '#9A9080',
  stone2: '#8A8070',
  grass1: '#6A7A50',
  grass2: '#8AAA60',
  trunk: '#4A3B2C',
  leaves: '#4A6040',
  hudText: '#E8F0E0',
  hudButtonBg: 'rgba(255,255,255,0.15)',
  progressTrack: 'rgba(255,255,255,0.15)',
  progressFill: '#A8C5A0',
  overlay: 'rgba(45,43,61,0.3)',
  card: '#FFFFFF',
  primaryBtn: '#8B6DAE',
  secondaryBtn: '#F0EBE3',
  btnText: '#7A7589',
};

const HIGHSCORE_KEY = 'rizzze_highscore_cozyfarm';

// TYPES
type ObstacleType = 
  | 'stone' | 'large_stone' | 'very_large_stone' 
  | 'grass' | 'large_grass' | 'very_large_grass' 
  | 'tree' | 'large_tree' | 'very_large_tree' 
  | null;
type ToolType = 'pick' | 'axe' | 'trimmer';

interface GridCell {
  id: string;
  row: number;
  col: number;
  obstacle: ObstacleType;
  tapsRemaining: number;
  isClearing: boolean;
}

// ─── OBSTACLE ASSET COMPONENTS ───────────────────────────────────────────────

const Stone1 = () => (
    <G transform="scale(0.8) translate(4.8, 4.8)">
        <Ellipse cx="24" cy="24" rx="14" ry="12" fill="#9A9080"/>
        <Ellipse cx="21" cy="21" rx="11" ry="9" fill="#A8A090"/>
        <Rect x="15" y="18" width="10" height="3" fill="#B8B0A0" opacity="0.4"/>
    </G>
);

const Stone2 = () => (
    <G transform="scale(0.8) translate(4.8, 4.8)">
        <Ellipse cx="18" cy="28" rx="16" ry="14" fill="#8A8070"/>
        <Ellipse cx="15" cy="25" rx="14" ry="12" fill="#9A9080"/>
        <Ellipse cx="36" cy="22" rx="10" ry="9" fill="#908878"/>
        <Ellipse cx="34" cy="20" rx="8" ry="7" fill="#A09888"/>
    </G>
);

const Stone3 = () => (
    <G transform="scale(0.75) translate(6, 6)">
        <Ellipse cx="24" cy="24" rx="22" ry="18" fill="#787068"/>
        <Ellipse cx="21" cy="21" rx="20" ry="16" fill="#8A8078"/>
        <Ellipse cx="12" cy="14" rx="10" ry="9" fill="#908878"/>
        <Ellipse cx="38" cy="18" rx="10" ry="9" fill="#888070"/>
        <Ellipse cx="28" cy="10" rx="9" ry="8" fill="#9A9284"/>
    </G>
);

const Grass1 = () => (
    <G transform="scale(0.8) translate(4.8, 4.8)">
        <Rect x="22" y="10" width="4" height="34" rx="1" fill="#6A8A50"/>
        <Rect x="15" y="16" width="4" height="28" rx="1" fill="#5A7A40" transform="rotate(-10,16,44)"/>
        <Rect x="29" y="14" width="4" height="30" rx="1" fill="#5A7A40" transform="rotate(8,30,44)"/>
    </G>
);

const Grass2 = () => (
    <G transform="scale(0.8) translate(4.8, 4.8)">
        <Rect x="8" y="14" width="4" height="32" rx="1" fill="#4A6A30" transform="rotate(-15,9,46)"/>
        <Rect x="36" y="12" width="4" height="34" rx="1" fill="#4A6A30" transform="rotate(12,37,46)"/>
        <Rect x="16" y="8" width="4" height="38" rx="1" fill="#5A7A40" transform="rotate(-6,17,46)"/>
        <Rect x="28" y="6" width="4" height="40" rx="1" fill="#5A7A40" transform="rotate(5,29,46)"/>
        <Rect x="22" y="4" width="5" height="42" rx="1" fill="#6A8A50"/>
    </G>
);

const Grass3 = () => (
    <G transform="scale(0.75) translate(6, 6)">
        <Rect x="4" y="12" width="4" height="36" rx="1" fill="#3A5A20" transform="rotate(-18,5,48)"/>
        <Rect x="40" y="8" width="4" height="40" rx="1" fill="#3A5A20" transform="rotate(15,41,48)"/>
        <Rect x="12" y="6" width="4" height="42" rx="1" fill="#4A6A30" transform="rotate(-12,13,48)"/>
        <Rect x="32" y="4" width="4" height="44" rx="1" fill="#4A6A30" transform="rotate(10,33,48)"/>
        <Rect x="18" y="2" width="4" height="46" rx="1" fill="#5A7A40" transform="rotate(-6,19,48)"/>
        <Rect x="27" y="1" width="4" height="47" rx="1" fill="#5A7A40" transform="rotate(5,28,48)"/>
        <Rect x="22" y="0" width="5" height="48" rx="1" fill="#6A8A50"/>
    </G>
);

const Tree1 = () => (
    <G transform="scale(0.8) translate(4.8, 4.8)">
        <Rect x="21" y="20" width="6" height="26" rx="1" fill="#8B7050"/>
        <Ellipse cx="24" cy="16" rx="16" ry="18" fill="#6A9A50"/>
        <Ellipse cx="21" cy="13" rx="12" ry="15" fill="#7AAA60"/>
    </G>
);

const Tree2 = () => (
    <G transform="scale(0.8) translate(4.8, 4.8)">
        <Rect x="19" y="18" width="10" height="28" rx="2" fill="#7A6040"/>
        <Ellipse cx="24" cy="14" rx="20" ry="20" fill="#5A8A40"/>
        <Ellipse cx="21" cy="12" rx="18" ry="18" fill="#6A9A50"/>
        <Ellipse cx="38" cy="20" rx="8" ry="8" fill="#5A8A40"/>
    </G>
);

const Tree3 = () => (
    <G transform="scale(0.75) translate(6, 6)">
        <Rect x="18" y="14" width="12" height="34" rx="2" fill="#6A5030"/>
        <Ellipse cx="24" cy="14" rx="24" ry="22" fill="#4A7A30"/>
        <Ellipse cx="21" cy="12" rx="22" ry="18" fill="#5A8A40"/>
        <Ellipse cx="4" cy="20" rx="10" ry="9" fill="#4A7A30"/>
        <Ellipse cx="44" cy="18" rx="10" ry="9" fill="#4A7A30"/>
    </G>
);

// ─── GAME SCREEN ─────────────────────────────────────────────────────────────

export default function CozyFarmGame() {
  const router = useRouter();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  // Dynamic Layout Calculations
  const { actualGridWidth, cellSize, obstacleSize } = useMemo(() => {
    const width = Math.min(windowWidth - (GRID_MARGIN * 2), MAX_GRID_WIDTH);
    const cell = Math.floor((width - (4 * GRID_GAP)) / 5);
    const obstacle = Math.floor(cell * 0.82);
    return { actualGridWidth: width, cellSize: cell, obstacleSize: obstacle };
  }, [windowWidth]);
  
  // States
  const [level, setLevel] = useState(1);
  const [grid, setGrid] = useState<GridCell[]>([]);
  const [selectedTool, setSelectedTool] = useState<ToolType>('pick');
  const [clearedCount, setClearedCount] = useState(0);
  const [totalObstacles, setTotalObstacles] = useState(0);
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [highScore, setHighScore] = useState(0);
  const [isNewBest, setIsNewBest] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [playableAreaSize, setPlayableAreaSize] = useState({ width: 0, height: 0 });
  const [toolsAreaSize, setToolsAreaSize] = useState({ width: 0, height: 0 });
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const feedbackOpacity = useRef(new Animated.Value(0)).current;
  const feedbackTimeout = useRef<any>(null);

  // Natural Grid Height (5 or 6 rows)
  const gridRows = level <= 2 ? 5 : 6;
  const naturalGridHeight = useMemo(() => {
    return (gridRows * cellSize) + ((gridRows - 1) * GRID_GAP);
  }, [gridRows, cellSize]);

  // Scaling logic to fit available space
  const gridScale = useMemo(() => {
    if (playableAreaSize.height === 0) return 1;
    const verticalScale = Math.min(1, (playableAreaSize.height - 10) / naturalGridHeight);
    const horizontalScale = Math.min(1, (playableAreaSize.width - 10) / actualGridWidth);
    return Math.min(verticalScale, horizontalScale);
  }, [playableAreaSize, naturalGridHeight, actualGridWidth]);

  const toolsScale = useMemo(() => {
    if (toolsAreaSize.height === 0) return 1;
    // Natural height for tools is roughly 100px (60 button + padding + label)
    const verticalScale = Math.min(1, (toolsAreaSize.height - 10) / 90);
    const horizontalScale = Math.min(1, (toolsAreaSize.width - 20) / 280);
    return Math.min(verticalScale, horizontalScale);
  }, [toolsAreaSize]);

  const toolDynamicSize = Math.max(36, 60 * toolsScale);

  // Background Animation Values
  const wanderTopAnim = useRef(new Animated.Value(-100)).current;
  const wanderBottomAnim = useRef(new Animated.Value(windowWidth + 100)).current;
  const pollenAnims = useRef(Array(5).fill(0).map(() => new Animated.Value(0))).current;
  
  const hintOpacity = useRef(new Animated.Value(0.6)).current;

  // Audio setup
  const { stopSound } = useAudio();
  const themePlayer = useAudioPlayer(require('@/assets/audio/game-tracks/cozy-farm-track.mp3'));

  // Level Setup
  const setupLevel = useCallback((lvl: number) => {
    const cols = 5;
    const rows = lvl <= 2 ? 5 : 6;
    const totalCells = rows * cols;
    
    let obstacleCount = 8;
    if (lvl === 2) obstacleCount = 10;
    else if (lvl === 3) obstacleCount = 12;
    else if (lvl === 4) obstacleCount = 15;
    else if (lvl >= 5) obstacleCount = 16;

    const newGrid: GridCell[] = [];
    const obstaclePositions: number[] = [];
    const positionsSet = new Set<number>();
    
    // 1. Deciding obstacle positions
    // Ensure center area has an obstacle
    const centerIdx = Math.floor(totalCells / 2);
    positionsSet.add(centerIdx);
    obstaclePositions.push(centerIdx);

    while (positionsSet.size < obstacleCount) {
      const pos = Math.floor(Math.random() * totalCells);
      if (!positionsSet.has(pos)) {
        positionsSet.add(pos);
        obstaclePositions.push(pos);
      }
    }

    // 2. Assigning obstacle types
    const obstacleMap = new Map<number, { type: ObstacleType; taps: number }>();
    
    // Guarantee variety: first 3 get stone, grass, tree
    const baseTypes: ObstacleType[] = ['stone', 'grass', 'tree'];
    for (let i = 0; i < 3; i++) {
        obstacleMap.set(obstaclePositions[i], { type: baseTypes[i], taps: 1 });
    }

    // Randomize the rest
    for (let i = 3; i < obstaclePositions.length; i++) {
        let type: ObstacleType;
        let taps = 1;
        const rand = Math.random();

        if (lvl < 5) {
            // Only 1-tap obstacles for levels 1-4
            type = baseTypes[Math.floor(Math.random() * baseTypes.length)];
        } else if (lvl < 8) {
            // Levels 5-7: 1-tap and 2-tap obstacles
            if (rand < 0.6) {
                type = baseTypes[Math.floor(Math.random() * baseTypes.length)];
            } else {
                const largeTypes: ObstacleType[] = ['large_stone', 'large_grass', 'large_tree'];
                type = largeTypes[Math.floor(Math.random() * largeTypes.length)];
                taps = 2;
            }
        } else {
            // Level 8+: All tiers (1, 2, and 3 taps)
            if (rand < 0.45) {
                type = baseTypes[Math.floor(Math.random() * baseTypes.length)];
                taps = 1;
            } else if (rand < 0.75) {
                const largeTypes: ObstacleType[] = ['large_stone', 'large_grass', 'large_tree'];
                type = largeTypes[Math.floor(Math.random() * largeTypes.length)];
                taps = 2;
            } else {
                const veryLargeTypes: ObstacleType[] = ['very_large_stone', 'very_large_grass', 'very_large_tree'];
                type = veryLargeTypes[Math.floor(Math.random() * veryLargeTypes.length)];
                taps = 3;
            }
        }
        obstacleMap.set(obstaclePositions[i], { type, taps });
    }
    
    for (let i = 0; i < totalCells; i++) {
        const row = Math.floor(i / cols);
        const col = i % cols;
        const obstacleData = obstacleMap.get(i);

        newGrid.push({
            id: `cell-${i}`,
            row,
            col,
            obstacle: obstacleData ? obstacleData.type : null,
            tapsRemaining: obstacleData ? obstacleData.taps : 1,
            isClearing: false,
        });
    }

    setGrid(newGrid);
    setTotalObstacles(obstacleCount);
    setClearedCount(0);
    setIsLevelComplete(false);
  }, []);

  useEffect(() => {
    // 1. Stop background sounds
    stopSound();
    
    // 2. Setup theme player
    themePlayer.loop = true;
    if (!showOnboarding) {
        themePlayer.play();
    }
    
    setupLevel(1);

    // Start background animations
    const startWanderTop = () => {
      wanderTopAnim.setValue(-100);
      Animated.timing(wanderTopAnim, {
        toValue: windowWidth + 100,
        duration: 32000,
        useNativeDriver: true,
      }).start(() => startWanderTop());
    };

    const startWanderBottom = () => {
      wanderBottomAnim.setValue(windowWidth + 100);
      Animated.timing(wanderBottomAnim, {
        toValue: -100,
        duration: 28000,
        useNativeDriver: true,
      }).start(() => startWanderBottom());
    };

    startWanderTop();
    startWanderBottom();
 
    // Pulses for sparkles - REMOVED

    pollenAnims.forEach((anim, i) => {
      const startDrift = () => {
        anim.setValue(0);
        Animated.timing(anim, {
          toValue: 1,
          duration: 15000 + i * 5000,
          useNativeDriver: true,
        }).start(() => startDrift());
      };
      startDrift();
    });

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
            if (isMuted || showOnboarding) {
                themePlayer.pause();
            } else {
                themePlayer.play();
            }
        } catch (e) {
            console.warn('Theme player update failed:', e);
        }
    }, [isMuted, showOnboarding]);

    // Load High Score
    useEffect(() => {
      const loadHighScore = async () => {
        try {
          const val = await AsyncStorage.getItem(HIGHSCORE_KEY);
          if (val) {
            setHighScore(parseInt(val, 10));
          }
        } catch (e) {
          console.error('Failed to load high score', e);
        }
      };
      loadHighScore();
    }, []);

  const handleCellTap = (cellIdx: number) => {
    const cell = grid[cellIdx];
    if (!cell.obstacle || cell.isClearing || isLevelComplete || showOnboarding) return;

    // Check tool match
    const toolMatch = 
        (selectedTool === 'pick' && (cell.obstacle === 'stone' || cell.obstacle === 'large_stone' || cell.obstacle === 'very_large_stone')) ||
        (selectedTool === 'trimmer' && (cell.obstacle === 'grass' || cell.obstacle === 'large_grass' || cell.obstacle === 'very_large_grass')) ||
        (selectedTool === 'axe' && (cell.obstacle === 'tree' || cell.obstacle === 'large_tree' || cell.obstacle === 'very_large_tree'));

    if (!toolMatch) {
        // Haptic feedback for mistake
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        
        // Determine correct tool for feedback
        let correctTool = "";
        if (cell.obstacle?.includes('stone')) correctTool = "PICK";
        else if (cell.obstacle?.includes('tree')) correctTool = "AXE";
        else if (cell.obstacle?.includes('grass')) correctTool = "TRIMMER";
        
        setFeedbackMessage(correctTool ? `Use ${correctTool} for this!` : "Wrong tool!");
        
        // Animation: Swap hint and feedback
        if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
        
        // Parallel animation to fade hint out and feedback in
        Animated.parallel([
            Animated.timing(hintOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
            Animated.timing(feedbackOpacity, { toValue: 1, duration: 200, useNativeDriver: true })
        ]).start();

        // After a delay, fade feedback out and restore hint
        feedbackTimeout.current = setTimeout(() => {
            Animated.parallel([
                Animated.timing(feedbackOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
                Animated.timing(hintOpacity, { toValue: 0.6, duration: 300, useNativeDriver: true })
            ]).start(() => {
                setFeedbackMessage('');
            });
        }, 2000);

        return;
    }

    // Haptic
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setGrid(prev => {
      const currentCell = prev[cellIdx];
      
      // Safety check inside updater
      if (!currentCell.obstacle || currentCell.isClearing) return prev;

      const newGrid = [...prev];
      const target = { ...currentCell };

      if (target.tapsRemaining > 1) {
        newGrid[cellIdx] = { ...target, tapsRemaining: target.tapsRemaining - 1 };
        return newGrid;
      } else {
        // Start clearing animation
        newGrid[cellIdx] = { ...target, isClearing: true };
        
        // Wait for animation then finalize
        setTimeout(() => {
          setGrid(finalizePrev => {
            const finalGrid = [...finalizePrev];
            finalGrid[cellIdx] = { ...finalGrid[cellIdx], obstacle: null, isClearing: false };
            return finalGrid;
          });
          
          setClearedCount(countPrev => {
            const newCleared = countPrev + 1;
            if (newCleared === totalObstacles) {
              setTimeout(() => {
                setIsLevelComplete(true);
                if (level > highScore) setIsNewBest(true);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }, 500);
            }
            return newCleared;
          });
        }, 300);
        
        return newGrid;
      }
    });

    // Update tap count for hint
    setTapCount(prev => {
      const newCount = prev + 1;
      if (newCount === 3) {
        Animated.timing(hintOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => setShowHint(false));
      }
      return newCount;
    });
  };

  const nextLevel = async () => {
    const nextLvl = level + 1;
    
    // Check for high score
    if (level > highScore) {
      setHighScore(level);
      try {
        await AsyncStorage.setItem(HIGHSCORE_KEY, level.toString());
      } catch (e) {
        console.error('Failed to save high score', e);
      }
    }
    
    setIsLevelComplete(false);
    setIsNewBest(false);
    setLevel(nextLvl);
    setupLevel(nextLvl);
  };

  // ─── RENDERING ──────────────────────────────────────────────────────────────

  const renderCell = (cell: GridCell, index: number) => {
    const isAlt = (cell.row + cell.col) % 2 === 1;
    const cellColor = isAlt ? COLORS.tileLight : COLORS.tileDark;
    
    // Map obstacle type to correct component
    const renderObstacle = () => {
      switch (cell.obstacle) {
        case 'stone': return <Stone1 />;
        case 'large_stone': return <Stone2 />;
        case 'very_large_stone': return <Stone3 />;
        case 'grass': return <Grass1 />;
        case 'large_grass': return <Grass2 />;
        case 'very_large_grass': return <Grass3 />;
        case 'tree': return <Tree1 />;
        case 'large_tree': return <Tree2 />;
        case 'very_large_tree': return <Tree3 />;
        default: return null;
      }
    };
    
    return (
      <View key={cell.id} style={[styles.cellWrapper, { width: cellSize }]}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => handleCellTap(index)}
          style={[
            styles.cell,
            { backgroundColor: cellColor, borderColor: COLORS.tileBorder }
          ]}
        >
          {cell.obstacle && !cell.isClearing && (
            <View style={styles.obstacleContainer}>
              <Svg width={obstacleSize} height={obstacleSize} viewBox="0 0 48 48">
                {renderObstacle()}
              </Svg>
              {cell.tapsRemaining > 1 && (
                <View style={styles.tapBadge}>
                  <Text style={styles.tapBadgeText}>{cell.tapsRemaining}</Text>
                </View>
              )}
            </View>
          )}
          
          {cell.isClearing && (
            <ClearingAnimation />
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/games');
    }
  };

  return (
    <View style={styles.container}>
      <MeadowBackground 
        windowWidth={windowWidth}
        pollenAnims={pollenAnims}
      />
      
      {/* 🚀 ABSOLUTE HUD OVERLAY (Standardized) */}
      <SafeAreaView style={styles.hudOverlay} edges={['top']} pointerEvents="box-none">
        <View style={styles.headerContainer}>
          <View style={styles.headerItemWrap}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={handleBack}
              activeOpacity={0.7}
            >
              <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <Path d="M15 18L9 12L15 6" stroke={COLORS.hudText} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>
          </View>
          
          <View style={styles.headerTitleWrapper}>
            <Text style={styles.title}>COZY FARM</Text>
          </View>
          
          <View style={styles.topRightHub}>
            <Text style={styles.miniBestTitle}>BEST LEVEL:</Text>
            <Text style={styles.miniBestValue}>{highScore}</Text>
          </View>
        </View>
      </SafeAreaView>

      <SafeAreaView style={styles.gameContent} edges={['bottom']}>
        {/* Container 1: Header Spacer */}
        <View style={styles.headerSpacer} />

        {/* Container 2: Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.largeStatNumber}>{clearedCount}/{totalObstacles}</Text>
            <Text style={styles.statSubLabel}>CLEARED</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.largeStatNumber}>{level}</Text>
            <Text style={styles.statSubLabel}>LEVEL</Text>
          </View>
        </View>

        {/* Container 3: Sheep Area (Adaptable) */}
        <View style={styles.sheepArea}>
          <SheepField
            wanderTop={wanderTopAnim}
            wanderBottom={wanderBottomAnim}
          />
        </View>

        {/* Container 4: Playable Area (Adaptable) */}
        <View 
          style={styles.playableArea} 
          onLayout={(e) => setPlayableAreaSize({
            width: e.nativeEvent.layout.width,
            height: e.nativeEvent.layout.height
          })}
        >
          <View style={{ transform: [{ scale: gridScale }], alignItems: 'center', justifyContent: 'center' }}>
            <View style={[styles.grid, { width: actualGridWidth, gap: GRID_GAP }]}>
              {grid.map((cell, index) => renderCell(cell, index))}
            </View>
          </View>
        </View>

        {/* Container 5: Tools (Adaptable) */}
        <View 
          style={styles.toolsArea}
          onLayout={(e) => setToolsAreaSize(e.nativeEvent.layout)}
        >
          <View style={styles.toolSelector}>
            <View style={styles.toolButtonWrapper}>
              <ToolButton 
                type="pick" 
                selected={selectedTool === 'pick'} 
                onPress={() => setSelectedTool('pick')}
                Icon={PickaxeIcon}
                size={toolDynamicSize}
              />
              <Text style={[
                styles.toolLabel, 
                { fontSize: Math.max(7, 9 * toolsScale) },
                selectedTool === 'pick' && styles.toolLabelSelected
              ]}>PICK</Text>
            </View>

            <View style={styles.toolButtonWrapper}>
              <ToolButton 
                  type="axe" 
                  selected={selectedTool === 'axe'} 
                  onPress={() => setSelectedTool('axe')} 
                  Icon={AxeIcon}
                  size={toolDynamicSize}
              />
              <Text style={[
                styles.toolLabel, 
                { fontSize: Math.max(7, 9 * toolsScale) },
                selectedTool === 'axe' && styles.toolLabelSelected
              ]}>AXE</Text>
            </View>

            <View style={styles.toolButtonWrapper}>
              <ToolButton 
                  type="trimmer" 
                  selected={selectedTool === 'trimmer'} 
                  onPress={() => setSelectedTool('trimmer')} 
                  Icon={TrimmerIcon}
                  size={toolDynamicSize}
              />
              <Text style={[
                styles.toolLabel, 
                { fontSize: Math.max(7, 9 * toolsScale) },
                selectedTool === 'trimmer' && styles.toolLabelSelected
              ]}>TRIMMER</Text>
            </View>
          </View>
        </View>

        {/* Container 6: Instructions */}
        <View style={styles.instructionsArea}>
           {/* Primary Level Hint */}
           {showHint && (
              <Animated.View style={{ opacity: hintOpacity, position: 'absolute', alignItems: 'center' }} pointerEvents="none">
                <Text style={styles.hintText}>Choose the right tool and tap a cell</Text>
              </Animated.View>
           )}

           {/* Tool Mismatch Feedback */}
           <Animated.View style={{ opacity: feedbackOpacity, position: 'absolute', alignItems: 'center' }} pointerEvents="none">
             <Text style={[styles.hintText, { color: '#FFD700', fontWeight: '900' }]}>{feedbackMessage}</Text>
           </Animated.View>
        </View>

        {/* Container 7: Footer */}
        <View style={styles.footerArea}>
          {/* Tutorial / Help Button (Left) */}
          <TouchableOpacity 
              style={styles.footerButton} 
              onPress={() => setShowOnboarding(true)}
              activeOpacity={0.8}
          >
              <Text style={styles.helpText}>?</Text>
          </TouchableOpacity>

          {/* Sound Toggle Button (Right) */}
          <TouchableOpacity 
              style={styles.footerButton} 
              onPress={() => setIsMuted(!isMuted)}
              activeOpacity={0.8}
          >
              <MusicIcon muted={isMuted} size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* ONBOARDING TUTORIAL */}
      {showOnboarding && (
        <View style={styles.overlay}>
          <Reanimated.View 
            entering={FadeInDown} 
            style={[styles.modalCard, { width: Math.min(windowWidth * 0.9, 310) }]}
          >
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContent}
            >
              <View style={styles.onboardingIconContainer}>
                <AwakeSheep size={64} />
              </View>
              <Text style={styles.modalTitleSmall}>Welcome to</Text>
              <Text style={styles.modalTitleProminent}>Cozy Farm!</Text>
              
              <View style={{ height: 12 }} />
              <Text style={styles.modalSubtitle}>How to play:</Text>
              
              <View style={styles.tutorialContainer}>
                <View style={[styles.tutorialRow, { width: 232 }]}>
                  <View style={styles.tutorialIcon}>
                    <Ionicons name="hammer" size={22} color="#5A7A6A" />
                  </View>
                  <Text style={styles.tutorialText}>
                    <Text style={styles.tutorialLabel}>AXE:</Text>{"\n"}Clears Trees
                  </Text>
                </View>
                
                <View style={[styles.tutorialRow, { width: 232 }]}>
                  <View style={styles.tutorialIcon}>
                    <Ionicons name="construct" size={22} color="#5A7A6A" />
                  </View>
                  <Text style={styles.tutorialText}>
                    <Text style={styles.tutorialLabel}>PICK:</Text>{"\n"}Clears Rocks
                  </Text>
                </View>
                
                <View style={[styles.tutorialRow, { width: 232 }]}>
                  <View style={styles.tutorialIcon}>
                    <Ionicons name="cut" size={22} color="#5A7A6A" />
                  </View>
                  <Text style={styles.tutorialText}>
                    <Text style={styles.tutorialLabel}>TRIMMER:</Text>{"\n"}Clears Grass
                  </Text>
                </View>
              </View>

              <View style={{ height: 24 }} />

              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={() => {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  setShowOnboarding(false);
                }}
              >
                <Text style={styles.primaryButtonText}>START HARVESTING</Text>
              </TouchableOpacity>
            </ScrollView>
          </Reanimated.View>
        </View>
      )}

      {/* LEVEL COMPLETE OVERLAY */}
      {isLevelComplete && (
        <View style={styles.overlay}>
          <View style={[styles.modalCard, { width: Math.min(windowWidth * 0.9, 310) }]}>
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContent}
            >
              {/* Fixed-height wrapper for the badge to prevent layout jumps */}
                <View style={{ height: 40, justifyContent: 'center', marginBottom: 12 }}>
                  {isNewBest && (
                    <View style={styles.newBestBanner}>
                      <Text style={styles.newBestLabel}>NEW BEST!</Text>
                    </View>
                  )}
                </View>

                <AwakeSheep size={80} />
                <View style={{ height: 16 }} />
                <Text style={styles.modalTitle}>Garden cleared!</Text>
                <Text style={styles.modalSubtitle}>Level {level} complete</Text>
                <View style={{ height: 20 }} />
                
                <TouchableOpacity style={styles.primaryButton} onPress={nextLevel}>
                  <Text style={styles.primaryButtonText}>Next level</Text>
                </TouchableOpacity>
                
                <View style={{ height: 10 }} />
                
                <TouchableOpacity style={styles.secondaryButton} onPress={handleBack}>
                  <Text style={styles.secondaryButtonText}>Back to games</Text>
                </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
}

// ─── HELPER COMPONENTS ────────────────────────────────────────────────────────

const MusicIcon = ({ muted, size, color }: any) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M9 18V5L21 3V16" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      opacity={muted ? 0.4 : 1}
    />
    <Circle 
      cx="6" cy="18" r="3" 
      stroke={color} 
      strokeWidth="2" 
      opacity={muted ? 0.4 : 1}
    />
    <Circle 
      cx="18" cy="16" r="3" 
      stroke={color} 
      strokeWidth="2" 
      opacity={muted ? 0.4 : 1}
    />
    {muted && (
      <Path d="M3 21L21 3" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    )}
  </Svg>
);

const ToolButton = ({ type, selected, onPress, Icon, size = 60 }: any) => (
  <TouchableOpacity 
    style={[
      styles.toolButton, 
      { width: size, height: size, borderRadius: size / 2 },
      selected && styles.toolButtonSelected,
    ]} 
    onPress={onPress}
    activeOpacity={0.8}
  >
    <Icon size={Math.round(size * 0.42)} color={selected ? "#FFFFFF" : "rgba(232, 240, 224, 0.6)"} />
  </TouchableOpacity>
);

// ─── ATMOSPHERIC DECOR COMPONENTS ───────────────────────────────────────────

const GrassTuft = ({ x, y, scale = 1, opacity = 0.3 }: any) => (
  <View style={[styles.decorItem, { left: x, top: y, transform: [{ scale }] }]}>
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <Path d="M12 20C12 20 8 12 4 10" stroke="#4A6040" strokeWidth="2" strokeLinecap="round" opacity={opacity} />
      <Path d="M12 20C12 20 12 8 12 4" stroke="#4A6040" strokeWidth="2" strokeLinecap="round" opacity={opacity} />
      <Path d="M12 20C12 20 16 12 20 10" stroke="#4A6040" strokeWidth="2" strokeLinecap="round" opacity={opacity} />
    </Svg>
  </View>
);

const Flower = ({ x, y, scale = 0.8, color = "#F0E868" }: any) => (
  <View style={[styles.decorItem, { left: x, top: y, transform: [{ scale }] }]}>
    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="4" fill={color} opacity={0.6} />
      <Circle cx="12" cy="7" r="3" fill={color} opacity={0.4} />
      <Circle cx="12" cy="17" r="3" fill={color} opacity={0.4} />
      <Circle cx="7" cy="12" r="3" fill={color} opacity={0.4} />
      <Circle cx="17" cy="12" r="3" fill={color} opacity={0.4} />
    </Svg>
  </View>
);


const Pollen = ({ anim, index, windowWidth }: any) => {
  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [windowWidth * (index / 5), windowWidth * ((index + 1) / 5)],
  });
  const translateY = anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [index * 150, index * 150 - 30, index * 150],
  });
  const opacity = anim.interpolate({
    inputRange: [0, 0.2, 0.8, 1],
    outputRange: [0, 0.6, 0.6, 0],
  });

  return (
    <Animated.View style={[styles.pollen, { transform: [{ translateX }, { translateY }], opacity }]}>
      <View style={styles.pollenDot} />
    </Animated.View>
  );
};

const MeadowBackground = React.memo(({ windowWidth, pollenAnims }: any) => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    {/* DECORATIONS */}
    <GrassTuft x="5%" y="22%" scale={0.7} />
    <Flower x="12%" y="25%" color="#F5B7B1" />
    <GrassTuft x="88%" y="26%" scale={0.9} />
    <Flower x="75%" y="20%" color="#F9E79F" />
    
    <GrassTuft x="12%" y="82%" scale={1.2} />
    <Flower x="8%" y="78%" color="#AED6F1" />
    <GrassTuft x="82%" y="88%" scale={1.1} />
    <Flower x="90%" y="82%" color="#D2B4DE" />
 
    {/* POLLEN PARTICLES */}
    {pollenAnims.map((anim: any, i: number) => (
      <Pollen key={i} anim={anim} index={i} windowWidth={windowWidth} />
    ))}
  </View>
));

const SheepField = ({ wanderTop, wanderBottom }: any) => {
  const [height, setHeight] = useState(0);
  
  // Calculate dynamic scale based on available height.
  // Base scale is 0.6 for height ~140.
  const scale = useMemo(() => {
    if (height === 0) return 0.6;
    return Math.max(0.3, Math.min(0.6, height / 200));
  }, [height]);

  const onLayout = (event: any) => {
    const layoutHeight = event.nativeEvent.layout.height;
    if (layoutHeight > 0) setHeight(layoutHeight);
  };

  return (
    <View style={styles.sheepField} onLayout={onLayout}>
      {height > 0 && (
        <>
          <Animated.View style={{ position: 'absolute', top: '15%', transform: [{ translateX: wanderTop }, { scale }], zIndex: 1 }}>
            <AwakeSheepNoBorder size={40} />
          </Animated.View>
          <Animated.View style={{ position: 'absolute', top: '45%', transform: [{ translateX: wanderBottom }, { scale }, { scaleX: -1 }], zIndex: 1 }}>
            <AwakeSheepNoBorder size={40} />
          </Animated.View>
        </>
      )}
    </View>
  );
};



const ClearingAnimation = () => {
    const fade = useRef(new Animated.Value(1)).current;
    const flash = useRef(new Animated.Value(0)).current;
    const particlePos = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fade, { toValue: 0, duration: 300, useNativeDriver: true }),
            Animated.sequence([
                Animated.timing(flash, { toValue: 1, duration: 150, useNativeDriver: false }),
                Animated.timing(flash, { toValue: 0, duration: 300, useNativeDriver: false }),
            ]),
            Animated.timing(particlePos, { toValue: 20, duration: 400, useNativeDriver: true }),
        ]).start();
    }, []);

    const flashColor = flash.interpolate({
        inputRange: [0, 1],
        outputRange: ['transparent', COLORS.tileFlash],
    });

    return (
        <View style={StyleSheet.absoluteFill}>
            <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: flashColor }]} />
            <Animated.View style={{ opacity: fade, transform: [{ scale: fade }] }}>
                {/* Visual obstacle representation usually goes here, but since parent fades too, we just need the burst */}
            </Animated.View>
            
            {/* Particles */}
            {[
                { x: -1, y: -1 },
                { x: 1, y: -1 },
                { x: -1, y: 1 },
                { x: 1, y: 1 },
            ].map((dir, i) => (
                <Animated.View
                    key={i}
                    style={[
                        styles.particle,
                        {
                            transform: [
                                { translateX: Animated.multiply(particlePos, dir.x) },
                                { translateY: Animated.multiply(particlePos, dir.y) },
                            ],
                            opacity: particlePos.interpolate({
                                inputRange: [0, 20],
                                outputRange: [0.8, 0],
                            }),
                        },
                    ]}
                />
            ))}
        </View>
    );
};

// ─── STYLES ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  hudOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    zIndex: 1000,
  },
  gameContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  headerSpacer: {
    height: 80,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 70, 
  },
  headerItemWrap: {
    width: 80, // Increased width for longer label
    alignItems: 'flex-start',
  },
  topRightHub: {
    width: 80, // Increased width for longer label
    alignItems: 'flex-end',
  },
  miniBestTitle: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.hudText,
    letterSpacing: 1,
    opacity: 0.5,
  },
  miniBestValue: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.hudText,
    marginTop: -2,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.hudText,
    letterSpacing: 0.65,
  },
  statsContainer: {
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 60,
    height: 100, // Slightly more height for air
  },
  statItem: {
    alignItems: 'center',
    gap: 4, // Added gap for deliberate padding
  },
  largeStatNumber: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.hudText,
    opacity: 0.8,
  },
  statSubLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.hudText,
    letterSpacing: 2,
    opacity: 0.4,
    marginTop: 2, // Positive margin to add air
  },
  sheepArea: {
    flex: 0.4, // Significantly less space for sheep to reduce the center gap
    minHeight: 40,
    justifyContent: 'center',
    marginVertical: 2,
  },
  sheepField: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playableArea: {
    flex: 4, // More space for the grid
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  toolsArea: {
    flex: 1.5, // More space for tools to avoid clipping
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8, // Added padding for circles and labels
  },
  toolSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24, // Tighter gap for better fit
  },
  toolButtonWrapper: {
    alignItems: 'center',
    gap: 6,
  },
  toolButton: {
    width: 56, // Slightly smaller buttons
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  toolButtonSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  toolLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#E8F0E0',
    opacity: 0.6,
    letterSpacing: 1,
  },
  toolLabelSelected: {
    opacity: 1,
    color: '#E8F0E0',
  },
  instructionsArea: {
    paddingVertical: 8,
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
  },
  hintText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F5F0E8',
    textAlign: 'center',
    maxWidth: 240,
    lineHeight: 18,
    opacity: 0.8,
  },
  footerArea: {
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 70,
  },
  footerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  helpText: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.hudText,
    opacity: 0.8,
  },

  cellWrapper: {
    aspectRatio: 1,
  },
  cell: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  obstacleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  decorItem: {
    position: 'absolute',
  },
  pollen: {
    position: 'absolute',
    width: 4,
    height: 4,
  },
  pollenDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#F0E868',
    opacity: 0.4,
  },
  particle: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.particle,
    marginLeft: -2,
    marginTop: -2,
  },
  tapBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tapBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24, // Slightly more rounded for premium feel
    alignItems: 'center',
    shadowColor: 'rgba(45,43,61,0.15)',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 40,
    elevation: 10,
    maxHeight: '90%',
    overflow: 'hidden', // Ensure content doesn't bleed out
  },
  modalScrollContent: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  modalTitleSmall: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7A7589',
  },
  modalTitleProminent: {
    fontSize: 28,
    fontFamily: 'Nunito_900Black',
    fontWeight: '900',
    color: '#8AAA80',
    marginTop: -2,
  },
  modalTitle: {
    fontSize: 24, // Sligthly larger
    fontWeight: '900',
    color: '#2D2B3D',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#7A7589',
    marginTop: 4,
  },
  onboardingIconContainer: {
    marginBottom: 16,
    backgroundColor: 'rgba(138, 109, 174, 0.12)', // Soft version of primary purple
    padding: 18,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: 'rgba(138, 109, 174, 0.25)',
  },
  tutorialContainer: {
    width: '100%',
    gap: 12,
    marginTop: 24, // More spaced from title
  },
  tutorialRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(138, 170, 128, 0.08)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
  },
  tutorialIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E8F0E0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D8E0D0',
  },
  tutorialText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    color: '#4A4754',
  },
  tutorialLabel: {
    fontWeight: '900',
    color: '#5A7A6A',
  },
  primaryButton: {
    width: '100%',
    height: 44,
    backgroundColor: COLORS.primaryBtn,
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
    backgroundColor: COLORS.secondaryBtn,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.btnText,
  },
  newBestBanner: {
    backgroundColor: COLORS.primaryBtn,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  newBestLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
});

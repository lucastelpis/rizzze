import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle, Rect, G, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { tokens } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';
import { useTheme } from '@/context/ThemeContext';
import { BottomNav } from '@/components/BottomNav';
import { AwakeSheep } from '@/components/AwakeSheep';
import { HeaderSheep } from '@/components/HeaderSheep';
import { posthog } from '@/config/posthog';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── SHEEP JUMPER BACKGROUND ──────────────────────────────────────────────────
const SheepJumperBG = () => (
  <View style={StyleSheet.absoluteFill}>
    <Svg width="100%" height="100%" viewBox="0 0 327 220" preserveAspectRatio="xMidYMid slice">
      {/* Sky */}
      <Rect width="327" height="220" fill="#1A2338" />
      
      {/* Stars */}
      {[...Array(20)].map((_, i) => (
        <Circle 
          key={i} 
          cx={(i * 79) % 327} 
          cy={(i * 131) % 150} // Extended further down towards the ground
          r={0.8 + (i % 3) * 0.4} 
          fill="#FFFFFF" 
          opacity={0.2 + (i % 6) * 0.12} 
        />
      ))}
      
      {/* Moon */}
      <Circle cx="280" cy="80" r="14" fill="#F5F0E8" opacity={0.9} />
      
      {/* Ground (bottom 30% is roughly 66px) */}
      <Path 
        d="M0 154 Q80 145 160 154 T327 154 V220 H0 Z" 
        fill="#2D3D2D" 
      />
      <Path 
        d="M0 154 Q80 145 160 154 T327 154" 
        fill="none" 
        stroke="#243324" 
        strokeWidth={3} 
      />
      
      {/* Grass tufts */}
      {[...Array(12)].map((_, i) => (
        <Rect 
          key={i} 
          x={20 + i * 25 + (i % 3) * 5} 
          y={170 + (i % 4) * 8} 
          width={2} 
          height={6} 
          fill="#243324" 
          opacity={0.3} 
        />
      ))}

      {/* Fences */}
      {/* Fence 1 */}
      <G transform="translate(140, 140)">
        <Rect x={0} y={0} width={6} height={30} fill="#8B7050" />
        <Rect x={22} y={0} width={6} height={30} fill="#8B7050" />
        <Rect x={4} y={6} width={20} height={8} fill="#C8B888" />
        <Rect x={4} y={18} width={20} height={8} fill="#C8B888" />
      </G>
      {/* Fence 2 */}
      <G transform="translate(240, 145)">
        <Rect x={0} y={0} width={6} height={30} fill="#8B7050" />
        <Rect x={22} y={0} width={6} height={30} fill="#8B7050" />
        <Rect x={4} y={6} width={20} height={8} fill="#C8B888" />
        <Rect x={4} y={18} width={20} height={8} fill="#C8B888" />
      </G>

      {/* Sheep Mascot */}
      <G transform="translate(30, 140) scale(1.1)">
        <AwakeSheep size={50} />
      </G>
    </Svg>
  </View>
);

// ─── COZY FARM BACKGROUND ─────────────────────────────────────────────────────
const CozyFarmBG = () => {
  const tiles = [];
  const obstacles = [];
  const rows = 5;
  const cols = 5;
  const cardWidth = 327;
  const cardHeight = 220;
  const tileSize = 38;
  const gap = 4;
  const startX = (cardWidth - (cols * tileSize + (cols - 1) * gap)) / 2;
  const startY = (cardHeight - (rows * tileSize + (rows - 1) * gap)) / 2 - 10;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const isAlt = (r + c) % 2 === 1;
      const x = startX + c * (tileSize + gap);
      const y = startY + r * (tileSize + gap);
      tiles.push(
        <Rect 
          key={`t-${r}-${c}`}
          x={x} y={y} width={tileSize} height={tileSize} 
          rx={4} 
          fill={isAlt ? "#8AAA80" : "#7A9A70"} 
          stroke="#6A8A60" 
          strokeWidth={1} 
        />
      );

      // Obstacles on 40% of tiles
      if (Math.random() < 0.4) {
        const type = Math.random() > 0.5 ? 'stone' : 'grass';
        if (type === 'stone') {
          obstacles.push(
            <G key={`o-${r}-${c}`} transform={`translate(${x + tileSize/2}, ${y + tileSize/2})`}>
              <Circle cx={-4} cy={2} r={8} fill="#9A9080" opacity={0.7} />
              <Circle cx={4} cy={-2} r={6} fill="#8A8070" opacity={0.6} />
            </G>
          );
        } else {
          obstacles.push(
            <G key={`o-${r}-${c}`} transform={`translate(${x + tileSize/2}, ${y + tileSize/2})`}>
              <Rect x={-1.5} y={-8} width={3} height={16} fill="#6A7A50" />
              <Rect x={-7} y={-14} width={14} height={12} rx={2} fill="#8AAA60" opacity={0.7} />
              {Math.random() > 0.5 && (
                 <G transform="translate(6, 2) scale(0.6)">
                    <Rect x={-1.5} y={-8} width={3} height={16} fill="#6A7A50" />
                    <Rect x={-7} y={-14} width={14} height={12} rx={2} fill="#8AAA60" opacity={0.7} />
                 </G>
              )}
            </G>
          );
        }
      }
    }
  }

  return (
    <View style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%" viewBox="0 0 327 220" preserveAspectRatio="xMidYMid slice">
        <Rect width="327" height="220" fill="#5A7A6A" />
        {tiles}
        {obstacles}
      </Svg>
    </View>
  );
};

// ─── GAME HUB SCREEN ──────────────────────────────────────────────────────────
export default function GamesScreen() {
  const { isDark } = useTheme();
  const C = useColors();
  const router = useRouter();
  const [sheepHighScore, setSheepHighScore] = React.useState(0);
  const [cozyFarmHighScore, setCozyFarmHighScore] = React.useState(0);

  useFocusEffect(
    React.useCallback(() => {
      const loadHighScores = async () => {
        try {
          const sheepVal = await AsyncStorage.getItem('rizzze_highscore_sheepjumper');
          if (sheepVal) setSheepHighScore(parseInt(sheepVal, 10));

          const farmVal = await AsyncStorage.getItem('rizzze_highscore_cozyfarm');
          if (farmVal) setCozyFarmHighScore(parseInt(farmVal, 10));
        } catch (e) {
          console.error('Failed to load high scores in hub', e);
        }
      };
      loadHighScores();
    }, [])
  );

  return (
    <View style={[styles.root, { backgroundColor: C.bgPrimary }]}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.headerTitle, { color: C.textPrimary }]}>Games</Text>
            <Text style={[styles.headerSubtitle, { color: C.textSecondary }]}>Wind down with gentle play</Text>
          </View>
          <TouchableOpacity 
            style={[styles.sheepButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : C.accentLight }]}
            onPress={() => router.push('/profile')}
            activeOpacity={0.8}
          >
            <HeaderSheep size={34} />
          </TouchableOpacity>
        </View>
        <View style={[styles.headerDivider, { backgroundColor: C.border }]} />

        <ScrollView 
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Card 1: Sheep Jumper */}
          <TouchableOpacity 
            style={styles.gameCard}
            activeOpacity={0.9}
            onPress={() => {
              posthog.capture('game_started', { game: 'sheep-jumper' });
              router.push('/games/sheep-jumper');
            }}
          >
            <SheepJumperBG />
            <LinearGradient
              colors={['transparent', 'rgba(26,35,56,0.92)']}
              style={styles.cardOverlay}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 0, y: 1 }}
            >
              <View style={styles.pillWrap}>
                <View style={styles.badgePill}>
                  <Text style={styles.badgeText}>Endless</Text>
                </View>
                {sheepHighScore > 0 && (
                  <View style={[styles.badgePill, { backgroundColor: 'rgba(232, 216, 192, 0.45)', marginLeft: 8, borderColor: 'rgba(232, 216, 192, 0.3)', borderWidth: 1 }]}>
                    <Text style={[styles.badgeText, { color: '#FFFFFF' }]}>Best: {sheepHighScore}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.cardTitle}>Sheep jumper</Text>
              <Text style={styles.cardSubtitle}>Tap to jump over fences. How far can you go?</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Card 2: Cozy Farm */}
          <TouchableOpacity 
            style={styles.gameCard}
            activeOpacity={0.9}
            onPress={() => {
              posthog.capture('game_started', { game: 'cozy-farm' });
              router.push('/games/cozy-farm');
            }}
          >
            <CozyFarmBG />
            <LinearGradient
              colors={['transparent', 'rgba(60,80,65,0.92)']}
              style={styles.cardOverlay}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 0, y: 1 }}
            >
              <View style={styles.pillWrap}>
                <View style={styles.badgePill}>
                  <Text style={styles.badgeText}>Puzzle</Text>
                </View>
                {cozyFarmHighScore > 0 && (
                  <View style={[styles.badgePill, { backgroundColor: 'rgba(232, 216, 192, 0.45)', marginLeft: 8, borderColor: 'rgba(232, 216, 192, 0.3)', borderWidth: 1 }]}>
                    <Text style={[styles.badgeText, { color: '#FFFFFF' }]}>Best: {cozyFarmHighScore}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.cardTitle}>Cozy farm</Text>
              <Text style={styles.cardSubtitle}>Clear stones and weeds to restore a peaceful garden</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>

        <BottomNav active="games" />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    marginTop: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: tokens.fonts.heading,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 15,
    fontWeight: '600',
    marginTop: -2,
  },
  sheepButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 20,
    gap: 24,
  },
  headerDivider: {
    height: 1,
    width: '100%',
  },
  gameCard: {
    height: 220,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#CCC',
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 20,
  },
  pillWrap: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  badgePill: {
    height: 22,
    paddingHorizontal: 10,
    borderRadius: 9999,
    backgroundColor: 'rgba(245,240,232,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(245,240,232,0.2)',
  },
  badgeText: {
    fontFamily: tokens.fonts.caption,
    fontSize: 10,
    fontWeight: '700',
    color: '#F5F0E8',
  },
  cardTitle: {
    fontFamily: tokens.fonts.heading,
    fontSize: 20,
    fontWeight: '900',
    color: '#F5F0E8',
  },
  cardSubtitle: {
    fontFamily: tokens.fonts.body,
    fontSize: 13,
    fontWeight: '500',
    color: '#E8F0E0',
    marginTop: 3,
  },
});

import React, { useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';
import { tokens } from '../../constants/theme';
import { useColors } from '@/hooks/useColors';
import { useAudio } from '@/context/AudioContext';
import { useStreak } from '@/context/StreakContext';
import * as SoundGraphics from '@/components/SoundGraphics';
import { BottomNav } from '@/components/BottomNav';
import { useTheme } from '@/context/ThemeContext';
import { SleepingSheep } from '@/components/SleepingSheep';

// ─── GREETING ─────────────────────────────────────────────────────────────────
function getGreeting(): { greeting: string; subtitle: string } {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return { greeting: 'Good morning', subtitle: 'Ready to start your day?' };
  if (hour >= 12 && hour < 18) return { greeting: 'Good afternoon', subtitle: 'Time for a little break?' };
  return { greeting: 'Good evening', subtitle: 'Ready to wind down?' };
}

const SCENES = [
  { title: "Forest night", tag: "Crickets, wind, owls", soundFile: "forest.m4a", graphicId: "ForestNightBg" },
  { title: "Ocean shore", tag: "Waves, seagulls, breeze", soundFile: "beach.m4a", graphicId: "OceanShoreBg" },
  { title: "City rain", tag: "Rain, traffic hum, puddles", soundFile: "city_rain.m4a", graphicId: "CityRainBg" },
  { title: "Fireplace", tag: "Crackling wood, warmth", soundFile: "fireplace.m4a", graphicId: "FireplaceBg" },
  { title: "Birdsong fields", tag: "Birdsong, soft breeze, grass", soundFile: "birds.m4a", graphicId: "BirdsongFieldsBg" },
  { title: "Cozy café", tag: "Coffee, chatter, soft jazz", soundFile: "coffeeshop.m4a", graphicId: "CozyCafeBg" },
];

// ─── SVG ICONS ────────────────────────────────────────────────────────────────

// Sleep: crescent moon
const MoonIcon = ({ size = 24, color }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
      fill={color}
    />
  </Svg>
);

// Sounds: cloud with rain
const CloudRainIcon = ({ size = 24, color }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M8 19v1M8 22v1M12 18v1M12 21v1M16 19v1M16 22v1"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

// Stories: book / lines icon
const StoriesIcon = ({ size = 24, color }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x={3} y={3} width={18} height={18} rx={3} fill={color} opacity={0.15} />
    <Rect x={7} y={8} width={10} height={2} rx={1} fill={color} />
    <Rect x={7} y={12} width={8} height={2} rx={1} fill={color} />
    <Rect x={7} y={16} width={5} height={2} rx={1} fill={color} />
  </Svg>
);

// Games: 2x2 grid
const GamesIcon = ({ size = 24, color }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x={4} y={4} width={7} height={7} rx={2} fill={color} />
    <Rect x={13} y={4} width={7} height={7} rx={2} fill={color} />
    <Rect x={4} y={13} width={7} height={7} rx={2} fill={color} />
    <Rect x={13} y={13} width={7} height={7} rx={2} fill={color} />
  </Svg>
);

// Mascot sheep (simple geometric path for avatar + thumbnail)
// SheepIcon removed in favor of SleepingSheep component

// Play triangle
const PlayIcon = ({ size = 16 }: { size?: number }) => {
  const C = useColors();
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path d="M4 2.5L13 8L4 13.5V2.5Z" fill={C.white} />
    </Svg>
  );
};

const StreakSection = () => {
  const { streakCount, lastSevenDays, todayIndex } = useStreak();
  const C = useColors();
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <View style={styles.streakSection}>
      {/* Label row */}
      <View style={styles.streakHeader}>
        <Text style={[styles.overline, { color: C.textMuted }]}>YOUR STREAK</Text>
        <Text style={[styles.streakCount, { color: C.accent }]}>{streakCount} day{streakCount !== 1 ? 's' : ''}</Text>
      </View>
      {/* Bars */}
      <View style={styles.barsRow}>
        {days.map((_, i) => (
          <View
            key={i}
            style={[
              styles.streakBar,
              { backgroundColor: lastSevenDays[i] ? C.accent : C.border },
            ]}
          />
        ))}
      </View>
      {/* Day labels */}
      <View style={styles.daysRow}>
        {days.map((d, i) => (
          <Text
            key={i}
            style={[
              styles.dayLabel,
              { color: C.textMuted },
              i === todayIndex && { color: C.accent, fontFamily: 'Nunito_800ExtraBold' },
            ]}
          >
            {d}
          </Text>
        ))}
      </View>
    </View>
  );
};

// ─── CATEGORY CARD ────────────────────────────────────────────────────────────
type CategoryCardProps = {
  title: string;
  subtitle: string;
  bg: string;
  Icon: React.ComponentType<any>;
  iconColor: string;
  border?: boolean;
  onPress?: () => void;
};

const CategoryCard = ({ title, subtitle, bg, Icon, iconColor, border, onPress }: CategoryCardProps) => {
  const C = useColors();
  return (
    <TouchableOpacity
      style={[
        styles.categoryCard,
        { backgroundColor: bg },
        border && { borderColor: C.border, borderWidth: 1 },
      ]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <View style={styles.categoryIconWrap}>
        <Icon size={28} color={iconColor} />
      </View>
      <View style={styles.categoryTextWrap}>
        <Text style={[styles.categoryTitle, { color: C.textPrimary }]}>{title}</Text>
        <Text style={[styles.categorySubtitle, { color: C.textSecondary }]}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
};

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const { isDark } = useTheme();
  const C = useColors();
  const { greeting, subtitle } = useMemo(() => getGreeting(), []);
  const router = useRouter();
  const { activeSound } = useAudio();
  const randomScene = useMemo(() => SCENES[Math.floor(Math.random() * SCENES.length)], []);
  const PickGraphic = randomScene?.graphicId ? (SoundGraphics as any)[randomScene.graphicId] : null;

  return (
    <View style={[styles.root, { backgroundColor: C.bgPrimary }]}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
          {/* ── HEADER ── */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.headerTitle, { color: C.textPrimary }]}>{greeting}</Text>
              <Text style={[styles.headerSubtitle, { color: C.textSecondary }]}>{subtitle}</Text>
            </View>
            <TouchableOpacity 
              style={[styles.sheepButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : C.accentLight, borderColor: 'rgba(139, 107, 174, 0.15)' }]}
              onPress={() => router.push('/profile')}
              activeOpacity={0.8}
            >
              <SleepingSheep size={34} />
            </TouchableOpacity>
          </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, activeSound && { paddingBottom: 92 }]}
          showsVerticalScrollIndicator={false}
        >

          {/* ── TONIGHT'S PICK ── */}
          <TouchableOpacity 
            style={[styles.pickCard, { backgroundColor: C.bgCard, borderTopColor: C.accent, shadowColor: C.textPrimary }]}
            activeOpacity={0.85}
            onPress={() => router.push({
              pathname: '/player',
              params: {
                title: randomScene.title,
                subtitle: 'Scenes collection',
                soundFile: randomScene.soundFile,
                graphicId: randomScene.graphicId
              }
            })}
          >
            {/* Scene thumbnail */}
            <View style={[styles.pickThumb, { backgroundColor: C.accentLight }]}>
              {PickGraphic ? <PickGraphic w={52} h={52} /> : <SleepingSheep size={42} />}
            </View>
            {/* Content */}
            <View style={styles.pickContent}>
              <Text style={[styles.pickOverline, { color: C.accent }]}>TONIGHT'S PICK</Text>
              <Text style={[styles.pickTitle, { color: C.textPrimary }]}>{randomScene.title}</Text>
              <Text style={[styles.pickSubtitle, { color: C.textSecondary }]}>{randomScene.tag}</Text>
            </View>
            {/* Play button */}
            <View style={[styles.playButton, { backgroundColor: C.accent }]}>
              <PlayIcon size={16} />
            </View>
          </TouchableOpacity>

          {/* ── STREAK ── */}
          <StreakSection />

          {/* ── EXPLORE GRID ── */}
          <View style={styles.exploreSection}>
            <Text style={[styles.overline, { color: C.textMuted }]}>EXPLORE</Text>
            <View style={styles.categoryGrid}>
              <CategoryCard
                title="Sleep"
                subtitle="Track and improve"
                bg={C.sleepBg}
                Icon={MoonIcon}
                iconColor={C.sleepIcon}
                onPress={() => router.push('/(tabs)/sleep')}
              />
              <CategoryCard
                title="Sounds"
                subtitle="Calming soundscapes"
                bg={C.soundsBg}
                Icon={CloudRainIcon}
                iconColor={C.soundsIcon}
                onPress={() => router.push('/(tabs)/sounds')}
              />
              <CategoryCard
                title="Stories"
                subtitle="Bedtime tales"
                bg={C.storiesBg}
                Icon={StoriesIcon}
                iconColor={C.storiesIcon}
                onPress={() => router.push('/(tabs)/stories')}
              />
              <CategoryCard
                title="Games"
                subtitle="Focus and unwind"
                bg={C.gamesBg}
                Icon={GamesIcon}
                iconColor={C.gamesIcon}
                border
              />
            </View>
          </View>
        </ScrollView>

        {/* ── BOTTOM NAV ── */}
        <BottomNav active="home" />
      </SafeAreaView>
    </View>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 24,
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
    borderWidth: 1,
  },

  // Tonight's Pick Card
  pickCard: {
    borderRadius: 20,
    borderTopWidth: 3,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.10,
    shadowRadius: 40,
    elevation: 8,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  pickThumb: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickContent: {
    flex: 1,
    gap: 2,
  },
  pickOverline: {
    fontFamily: tokens.fonts.caption,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  pickTitle: {
    fontFamily: tokens.fonts.caption,
    fontSize: 15,
    fontWeight: '800',
  },
  pickSubtitle: {
    fontFamily: tokens.fonts.body,
    fontSize: 12,
    fontWeight: '500',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Streak
  streakSection: {
    gap: 10,
  },
  streakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  streakCount: {
    fontFamily: tokens.fonts.caption,
    fontSize: 13,
    fontWeight: '800',
  },
  barsRow: {
    flexDirection: 'row',
    gap: 5,
  },
  streakBar: {
    flex: 1,
    height: 6,
    borderRadius: 999,
  },
  daysRow: {
    flexDirection: 'row',
    gap: 5,
  },
  dayLabel: {
    flex: 1,
    textAlign: 'center',
    fontFamily: tokens.fonts.body,
    fontSize: 10,
    fontWeight: '500',
  },

  // Overline shared
  overline: {
    fontFamily: tokens.fonts.caption,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },

  // Category Grid
  exploreSection: {
    gap: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '47.5%',
    minHeight: 120,
    borderRadius: 20,
    padding: 18,
    justifyContent: 'space-between',
  },
  categoryIconWrap: {
    alignSelf: 'flex-end',
  },
  categoryTextWrap: {
    gap: 2,
  },
  categoryTitle: {
    fontFamily: tokens.fonts.caption,
    fontSize: 16,
    fontWeight: '800',
  },
  categorySubtitle: {
    fontFamily: tokens.fonts.body,
    fontSize: 11,
    fontWeight: '500',
  },

  // End of styles
});

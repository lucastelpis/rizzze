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
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';
import { tokens } from '../../constants/theme';
import { useAudio } from '@/context/AudioContext';

// ─── COLORS ───────────────────────────────────────────────────────────────────
const C = {
  bg: '#F8F4EE',
  accent: '#8B6DAE',
  accentLight: '#EDE5F5',
  lavender: '#E8DFF0',
  textPrimary: '#2D2B3D',
  textSecondary: '#7A7589',
  textMuted: '#A9A3B5',
  border: '#E8E2D8',
  white: '#FFFFFF',
  // Category cards
  sleepBg: '#E8DFF0',
  sleepIcon: '#6B5A8E',
  soundsBg: '#C8DEF0',
  soundsIcon: '#2B5A80',
  storiesBg: '#F0D8D0',
  storiesIcon: '#8B4A40',
  gamesBg: '#F5F0E8',
  gamesIcon: '#6B6560',
};

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
const MoonIcon = ({ size = 24, color = C.sleepIcon }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
      fill={color}
    />
  </Svg>
);

// Sounds: cloud with rain
const CloudRainIcon = ({ size = 24, color = C.soundsIcon }: { size?: number; color?: string }) => (
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
const StoriesIcon = ({ size = 24, color = C.storiesIcon }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x={3} y={3} width={18} height={18} rx={3} fill={color} opacity={0.15} />
    <Rect x={7} y={8} width={10} height={2} rx={1} fill={color} />
    <Rect x={7} y={12} width={8} height={2} rx={1} fill={color} />
    <Rect x={7} y={16} width={5} height={2} rx={1} fill={color} />
  </Svg>
);

// Games: 2x2 grid
const GamesIcon = ({ size = 24, color = C.gamesIcon }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x={4} y={4} width={7} height={7} rx={2} fill={color} />
    <Rect x={13} y={4} width={7} height={7} rx={2} fill={color} />
    <Rect x={4} y={13} width={7} height={7} rx={2} fill={color} />
    <Rect x={13} y={13} width={7} height={7} rx={2} fill={color} />
  </Svg>
);

// Mascot sheep (simple geometric path for avatar + thumbnail)
const SheepIcon = ({ size = 28 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    {/* Body */}
    <Circle cx={20} cy={22} r={11} fill={C.white} />
    {/* Head */}
    <Circle cx={20} cy={12} r={7} fill={C.white} />
    {/* Face */}
    <Circle cx={17.5} cy={13} r={1.2} fill={C.textPrimary} />
    <Circle cx={22.5} cy={13} r={1.2} fill={C.textPrimary} />
    {/* Ears */}
    <Circle cx={13} cy={11} r={2.5} fill={C.lavender} />
    <Circle cx={27} cy={11} r={2.5} fill={C.lavender} />
    {/* Legs */}
    <Rect x={14} y={31} width={3} height={5} rx={1.5} fill={C.textMuted} />
    <Rect x={23} y={31} width={3} height={5} rx={1.5} fill={C.textMuted} />
  </Svg>
);

// Play triangle
const PlayIcon = ({ size = 16 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <Path d="M4 2.5L13 8L4 13.5V2.5Z" fill={C.white} />
  </Svg>
);

// ─── NAV ICONS ────────────────────────────────────────────────────────────────
const HomeNavIcon = ({ active }: { active: boolean }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z"
      fill={active ? C.accent : 'none'}
      stroke={active ? C.accent : C.textSecondary}
      strokeWidth={2}
      strokeLinejoin="round"
    />
  </Svg>
);

const SleepNavIcon = ({ active }: { active: boolean }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
      fill={active ? C.accent : 'none'}
      stroke={active ? C.accent : C.textSecondary}
      strokeWidth={2}
      strokeLinejoin="round"
    />
  </Svg>
);

const SoundsNavIcon = ({ active }: { active: boolean }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 18V5l12-2v13"
      stroke={active ? C.accent : C.textSecondary}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx={6} cy={18} r={3} stroke={active ? C.accent : C.textSecondary} strokeWidth={2} />
    <Circle cx={18} cy={16} r={3} stroke={active ? C.accent : C.textSecondary} strokeWidth={2} />
  </Svg>
);

const ProfileNavIcon = ({ active }: { active: boolean }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={8} r={4} stroke={active ? C.accent : C.textSecondary} strokeWidth={2} />
    <Path
      d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
      stroke={active ? C.accent : C.textSecondary}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

// ─── STREAK BARS ──────────────────────────────────────────────────────────────
const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const todayIndex = 6; // Sunday = current highlighted day (7-night streak means all filled)

const StreakSection = () => (
  <View style={styles.streakSection}>
    {/* Label row */}
    <View style={styles.streakHeader}>
      <Text style={styles.overline}>YOUR STREAK</Text>
      <Text style={styles.streakCount}>7 nights</Text>
    </View>
    {/* Bars */}
    <View style={styles.barsRow}>
      {days.map((_, i) => (
        <View
          key={i}
          style={[
            styles.streakBar,
            { backgroundColor: i <= todayIndex ? C.accent : C.border },
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
            i === todayIndex && styles.dayLabelActive,
          ]}
        >
          {d}
        </Text>
      ))}
    </View>
  </View>
);

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

const CategoryCard = ({ title, subtitle, bg, Icon, iconColor, border, onPress }: CategoryCardProps) => (
  <TouchableOpacity
    style={[
      styles.categoryCard,
      { backgroundColor: bg },
      border && styles.categoryCardBorder,
    ]}
    activeOpacity={0.85}
    onPress={onPress}
  >
    <View style={styles.categoryIconWrap}>
      <Icon size={28} color={iconColor} />
    </View>
    <View style={styles.categoryTextWrap}>
      <Text style={styles.categoryTitle}>{title}</Text>
      <Text style={styles.categorySubtitle}>{subtitle}</Text>
    </View>
  </TouchableOpacity>
);

// ─── BOTTOM NAV ───────────────────────────────────────────────────────────────
const tabs = [
  { key: 'home', label: 'Home', Icon: HomeNavIcon, route: '/(tabs)' },
  { key: 'sleep', label: 'Sleep', Icon: SleepNavIcon, route: '/(tabs)/sleep' },
  { key: 'sounds', label: 'Sounds', Icon: SoundsNavIcon, route: '/(tabs)/sounds' },
  { key: 'profile', label: 'Profile', Icon: ProfileNavIcon, route: '/(tabs)/profile' },
];

const BottomNav = ({ active }: { active: string }) => {
  const router = useRouter();
  return (
    <View style={styles.bottomNav}>
      {tabs.map(({ key, label, Icon, route }) => {
        const isActive = active === key;
        return (
          <TouchableOpacity
            key={key}
            style={[styles.navTab, !isActive && { opacity: 0.4 }]}
            onPress={() => {
              if (!isActive) router.push(route as any);
            }}
            activeOpacity={0.7}
          >
            <Icon active={isActive} />
            <Text style={[styles.navLabel, isActive && styles.navLabelActive, !isActive && styles.navLabelInactive]}>
              {label}
            </Text>
            {isActive && <View style={styles.navDot} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const { greeting, subtitle } = useMemo(() => getGreeting(), []);
  const router = useRouter();
  const { activeSound } = useAudio();
  const randomScene = useMemo(() => SCENES[Math.floor(Math.random() * SCENES.length)], []);

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, activeSound && { paddingBottom: 92 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* ── HEADER ── */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.greeting}>{greeting}</Text>
              <Text style={styles.greetingSubtitle}>{subtitle}</Text>
            </View>
            <View style={styles.avatarCircle}>
              <SheepIcon size={30} />
            </View>
          </View>

          {/* ── TONIGHT'S PICK ── */}
          <TouchableOpacity 
            style={styles.pickCard}
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
            {/* Sheep thumbnail */}
            <View style={styles.pickThumb}>
              <SheepIcon size={36} />
            </View>
            {/* Content */}
            <View style={styles.pickContent}>
              <Text style={styles.pickOverline}>TONIGHT'S PICK</Text>
              <Text style={styles.pickTitle}>{randomScene.title}</Text>
              <Text style={styles.pickSubtitle}>{randomScene.tag}</Text>
            </View>
            {/* Play button */}
            <View style={styles.playButton}>
              <PlayIcon size={16} />
            </View>
          </TouchableOpacity>

          {/* ── STREAK ── */}
          <StreakSection />

          {/* ── EXPLORE GRID ── */}
          <View style={styles.exploreSection}>
            <Text style={styles.overline}>EXPLORE</Text>
            <View style={styles.categoryGrid}>
              <CategoryCard
                title="Sleep"
                subtitle="8 sessions"
                bg={C.sleepBg}
                Icon={MoonIcon}
                iconColor={C.sleepIcon}
                onPress={() => router.push('/(tabs)/sleep')}
              />
              <CategoryCard
                title="Sounds"
                subtitle="12 sounds"
                bg={C.soundsBg}
                Icon={CloudRainIcon}
                iconColor={C.soundsIcon}
                onPress={() => router.push('/(tabs)/sounds')}
              />
              <CategoryCard
                title="Stories"
                subtitle="6 tales"
                bg={C.storiesBg}
                Icon={StoriesIcon}
                iconColor={C.storiesIcon}
              />
              <CategoryCard
                title="Games"
                subtitle="4 games"
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
    backgroundColor: C.bg,
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

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
    gap: 2,
  },
  greeting: {
    fontFamily: 'Nunito_900Black',
    fontSize: 22,
    fontWeight: '900',
    color: C.textPrimary,
    letterSpacing: -0.3,
  },
  greetingSubtitle: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 13,
    fontWeight: '500',
    color: C.textSecondary,
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: C.lavender,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Tonight's Pick Card
  pickCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    borderTopWidth: 3,
    borderTopColor: C.accent,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderColor: C.accent,
    shadowColor: C.textPrimary,
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
    backgroundColor: C.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickContent: {
    flex: 1,
    gap: 2,
  },
  pickOverline: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 11,
    fontWeight: '800',
    color: C.accent,
    letterSpacing: 1.2,
  },
  pickTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 15,
    fontWeight: '800',
    color: C.textPrimary,
  },
  pickSubtitle: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 12,
    fontWeight: '500',
    color: C.textSecondary,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.accent,
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
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 13,
    fontWeight: '800',
    color: C.accent,
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
    fontFamily: 'Nunito_500Medium',
    fontSize: 10,
    fontWeight: '500',
    color: C.textMuted,
  },
  dayLabelActive: {
    fontFamily: 'Nunito_800ExtraBold',
    fontWeight: '800',
    color: C.accent,
  },

  // Overline shared
  overline: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 11,
    fontWeight: '800',
    color: C.textMuted,
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
  categoryCardBorder: {
    borderWidth: 1,
    borderColor: C.border,
  },
  categoryIconWrap: {
    alignSelf: 'flex-end',
  },
  categoryTextWrap: {
    gap: 2,
  },
  categoryTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 16,
    fontWeight: '800',
    color: C.textPrimary,
  },
  categorySubtitle: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 11,
    fontWeight: '500',
    color: C.textSecondary,
  },

  // Bottom Nav
  bottomNav: {
    height: 68,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: C.border,
    backgroundColor: C.bg,
    paddingBottom: 8,
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingTop: 8,
  },
  navLabel: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 10,
    fontWeight: '800',
  },
  navLabelActive: {
    color: C.accent,
  },
  navLabelInactive: {
    color: C.textSecondary,
    opacity: 0.4,
  },
  navDot: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.accent,
  },
});

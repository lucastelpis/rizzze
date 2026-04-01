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
import { useAudio, useAudioPlayback, useAudioStatus } from '@/context/AudioContext';
import { useStreak } from '@/context/StreakContext';
import * as SoundGraphics from '@/components/SoundGraphics';
import { BottomNav } from '@/components/BottomNav';
import { useTheme } from '@/context/ThemeContext';
import { AwakeSheep } from '@/components/AwakeSheep';
import * as StoryGraphics from '@/components/StoryGraphics';
import { STORIES } from '@/constants/stories';
import { SCENES_DATA } from '@/constants/sounds';
import { getDailyPick } from '@/utils/dailyPicks';

// ─── GREETING ─────────────────────────────────────────────────────────────────
function getGreeting(): { greeting: string; subtitle: string } {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return { greeting: 'Good morning', subtitle: 'Ready to start your day?' };
  if (hour >= 12 && hour < 18) return { greeting: 'Good afternoon', subtitle: 'Time for a little break?' };
  return { greeting: 'Good evening', subtitle: 'Ready to wind down?' };
}

// SCENES_DATA is now imported from @/constants/sounds

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
  const { playSelectedSound } = useAudioPlayback();
  const { activeSound } = useAudioStatus();
  const randomScene = useMemo(() => getDailyPick(SCENES_DATA), []);
  const PickGraphic = randomScene?.graphicId ? (SoundGraphics as any)[randomScene.graphicId] : null;

  const randomStory = useMemo(() => getDailyPick(STORIES), []);
  // Helper to get story thumb component
  const StoryThumb = (StoryGraphics as any)[randomStory.id.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('') + 'Thumb'];

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
              style={[styles.sheepButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : C.accentLight }]}
              onPress={() => router.push('/profile')}
              activeOpacity={0.8}
            >
              <AwakeSheep size={34} />
            </TouchableOpacity>
          </View>
          <View style={[styles.headerDivider, { backgroundColor: C.border }]} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, activeSound && { paddingBottom: 100 }]}
          showsVerticalScrollIndicator={false}
        >

          <View style={{ gap: 12 }}>
            {/* ── TONIGHT'S PICK: SOUND ── */}
            <TouchableOpacity 
              style={[styles.pickCard, { backgroundColor: C.bgCard, borderTopColor: C.accent, shadowColor: C.textPrimary }]}
              activeOpacity={0.85}
              onPress={() => {
                const soundParams = {
                  title: randomScene.title,
                  subtitle: 'Scenes collection',
                  soundFile: randomScene.soundFile,
                  graphicId: randomScene.graphicId
                };
                playSelectedSound(soundParams);
                router.push({
                  pathname: '/player',
                  params: soundParams
                });
              }}
            >
              <View style={[styles.pickThumb, { backgroundColor: C.accentLight }]}>
                {PickGraphic ? <PickGraphic w={52} h={52} /> : <AwakeSheep size={42} />}
              </View>
              <View style={styles.pickContent}>
                <Text style={[styles.pickOverline, { color: C.accent }]}>TONIGHT'S SOUND</Text>
                <Text style={[styles.pickTitle, { color: C.textPrimary }]}>{randomScene.title}</Text>
                <Text style={[styles.pickSubtitle, { color: C.textSecondary }]}>{randomScene.tag}</Text>
              </View>
              <View style={[styles.playButton, { backgroundColor: C.accent }]}>
                <PlayIcon size={16} />
              </View>
            </TouchableOpacity>

            {/* ── TONIGHT'S PICK: STORY ── */}
            <TouchableOpacity 
              style={[styles.pickCard, { backgroundColor: C.bgCard, borderTopColor: '#C8A29A', shadowColor: C.textPrimary }]}
              activeOpacity={0.85}
              onPress={() => router.push(`/reader/${randomStory.id}`)}
            >
              <View style={[styles.pickThumb, { backgroundColor: 'rgba(240, 216, 208, 0.15)' }]}>
                {StoryThumb ? <StoryThumb size={52} /> : <AwakeSheep size={42} />}
              </View>
              <View style={styles.pickContent}>
                <Text style={[styles.pickOverline, { color: '#8B4A40' }]}>TONIGHT'S READ</Text>
                <Text style={[styles.pickTitle, { color: C.textPrimary }]}>{randomStory.title}</Text>
                <Text style={[styles.pickSubtitle, { color: '#9E7E78' }]} numberOfLines={1}>
                  {randomStory.subtitle}
                </Text>
              </View>
              <View style={[styles.playButton, { backgroundColor: '#8B4A40' }]}>
                <PlayIcon size={16} />
              </View>
            </TouchableOpacity>
          </View>

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
                onPress={() => router.push('/(tabs)/games')}
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
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
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
  },
  headerDivider: {
    height: 1,
    width: '100%',
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
    letterSpacing: 1.1,
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

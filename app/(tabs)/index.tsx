import React, { useMemo, useRef, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle, Rect, G, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { tokens } from '../../constants/theme';
import { useColors } from '@/hooks/useColors';
import { useAudio, useAudioPlayback, useAudioStatus } from '@/context/AudioContext';
import { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  withSequence
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useStreak } from '@/context/StreakContext';
import * as SoundGraphics from '@/components/SoundGraphics';
import { BottomNav } from '@/components/BottomNav';
import { useTheme } from '@/context/ThemeContext';
import { AwakeSheep } from '@/components/AwakeSheep';
import { HeaderSheep } from '@/components/HeaderSheep';
import * as StoryGraphics from '@/components/StoryGraphics';
import { SleepRatingWidget } from '@/components/SleepRatingWidget';
import { useSleep } from '@/context/SleepContext';
import { useSheepGrowth } from '@/context/SheepGrowthContext';
import { EvolutionToast } from '@/components/EvolutionToast';
import { TourOverlay } from '@/components/TourOverlay';
import { useTourContext } from '@/context/TourContext';

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

const StreakSection = ({ onTodayPress }: { onTodayPress?: () => void }) => {
  const { streakCount, lastSevenDays, todayIndex } = useStreak();
  const C = useColors();
  const { isDark } = useTheme();
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <View style={styles.streakSection}>
      {/* Label row */}
      <View style={styles.streakHeader}>
        <Text style={[styles.overline, { color: C.textMuted }]}>YOUR DAILY STREAK</Text>
        <Text style={[styles.streakCount, { color: C.accent }]}>{streakCount} day{streakCount !== 1 ? 's' : ''}</Text>
      </View>
      {/* Bars & Labels Group */}
      <View style={{ gap: 6 }}>
        {/* Bars */}
        <View style={styles.barsRow}>
          {days.map((_, i) => {
            const isToday = i === todayIndex;
            const barStyle = [
              styles.streakBar,
              { backgroundColor: lastSevenDays[i] ? C.accent : C.border },
              isToday && { backgroundColor: lastSevenDays[i] ? C.accent : (isDark ? 'rgba(196, 174, 216, 0.35)' : 'rgba(0, 0, 0, 0.12)') }
            ];

            if (isToday && onTodayPress) {
              return (
                <TouchableOpacity 
                  key={i} 
                  onPress={onTodayPress} 
                  style={{ flex: 1, height: 32, justifyContent: 'center' }} // Centered touch area
                  activeOpacity={0.6}
                >
                  <View style={[barStyle, { height: 12, flex: 0, width: '100%' }]} />
                </TouchableOpacity>
              );
            }
            return <View key={i} style={barStyle} />;
          })}
        </View>
        {/* Day labels */}
        <View style={styles.daysRow}>
          {days.map((d, i) => {
            const isToday = i === todayIndex;
            if (isToday && onTodayPress) {
              return (
                <TouchableOpacity 
                  key={i} 
                  onPress={onTodayPress} 
                  style={{ flex: 1, alignItems: 'center' }} 
                  activeOpacity={0.6}
                >
                  <Text
                    style={[
                      styles.dayLabel,
                      { color: C.accent, fontFamily: 'Nunito_800ExtraBold' },
                    ]}
                  >
                    {d}
                  </Text>
                </TouchableOpacity>
              );
            }
            return (
              <Text
                key={i}
                style={[
                  styles.dayLabel,
                  { color: C.textMuted },
                ]}
              >
                {d}
              </Text>
            );
          })}
        </View>
      </View>
    </View>
  );
};

// ─── DECORATIVE PATTERNS ──────────────────────────────────────────────────────

// ─── CATEGORY CARD ────────────────────────────────────────────────────────────
type CategoryCardProps = {
  title: string;
  subtitle: string;
  gradient: string[];
  Icon: React.ComponentType<any>;
  iconColor: string;
  accentColor: string;
  onPress?: () => void;
};

const CategoryCard = ({ title, subtitle, gradient, Icon, iconColor, accentColor, onPress }: CategoryCardProps) => {
  const C = useColors();
  const { isDark } = useTheme();
  const scale = useSharedValue(1);

  const colors = gradient as [string, string];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.categoryCardWrapper,
        { shadowColor: accentColor }
      ]}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={{ flex: 1 }}
      >
        <Animated.View style={[styles.categoryCard, animatedStyle]}>
          <View style={styles.categoryIconWrap}>
            <View style={[styles.iconBlurCircle, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.2)' }]}>
              <Icon size={24} color={iconColor} />
            </View>
          </View>

          <View style={styles.categoryTextWrap}>
            <Text style={[styles.categoryTitle, { color: C.textPrimary }]}>{title}</Text>
            <Text style={[styles.categorySubtitle, { color: C.textSecondary }]}>{subtitle}</Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </LinearGradient>
  );
};

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const { isDark } = useTheme();
  const C = useColors();
  const { hasRatedToday } = useSleep();
  const { evolutionReward, clearEvolutionReward } = useSheepGrowth();
  const { greeting, subtitle } = useMemo(() => getGreeting(), []);
  const router = useRouter();
  const { activeSound } = useAudioStatus();
  const scrollRef = useRef<ScrollView>(null);

  // ── TOUR ──
  const sleepWidgetRef = useRef<View>(null);
  const sheepButtonRef = useRef<View>(null);
  const streakRef = useRef<View>(null);
  const categoryGridRef = useRef<View>(null);
  const bottomNavRef = useRef<View>(null);
  const { 
    isVisible: tourVisible, 
    displaying: tourDisplaying, 
    currentStep, 
    reduceMotion, 
    goToNext, 
    goToBack,
    dismiss: dismissTour 
  } = useTourContext();

  // Scroll to show the current tour target before measuring
  const handleBeforeStep = useCallback((step: number) => {
    if (step <= 2) {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    } else if (step >= 3) {
      scrollRef.current?.scrollToEnd({ animated: false });
    }
  }, []);

  // Ensure check-in card is visible when tour opens
  useEffect(() => {
    if (tourVisible) {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }
  }, [tourVisible]);

  const handleTodayPress = async () => {
    if (hasRatedToday) {
      // Celebratory "already done" haptic
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      // Guide back to the rating widget
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: C.bgPrimary }]}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
          {/* ── HEADER ── */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.headerTitle, { color: C.textPrimary }]}>{greeting}</Text>
              <Text style={[styles.headerSubtitle, { color: C.textSecondary }]}>{subtitle}</Text>
            </View>
            <View ref={sheepButtonRef} collapsable={false}>
              <TouchableOpacity
                style={[styles.sheepButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : C.accentLight }]}
                onPress={() => router.push('/profile')}
                activeOpacity={0.8}
              >
                <HeaderSheep size={34} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={[styles.headerDivider, { backgroundColor: C.border }]} />

        <Animated.View 
          entering={FadeIn.duration(400)}
          style={{ flex: 1 }}
        >
            <ScrollView
              ref={scrollRef}
              style={styles.scroll}
              contentContainerStyle={[styles.scrollContent, activeSound && { paddingBottom: 100 }]}
              showsVerticalScrollIndicator={false}
            >
              <Animated.View ref={sleepWidgetRef} collapsable={false} entering={FadeIn.duration(600)}>
                <SleepRatingWidget />
              </Animated.View>

          {/* ── STREAK ── */}
          <View ref={streakRef} collapsable={false}>
            <StreakSection onTodayPress={handleTodayPress} />
          </View>

          {/* ── EXPLORE GRID ── */}
          <View style={styles.exploreSection}>
            <View style={styles.exploreHeader}>
              <Text style={[styles.overline, { color: C.textMuted }]}>EXPLORE</Text>
              <View style={[styles.overlineDot, { backgroundColor: C.accentSoft }]} />
            </View>
            
            <View ref={categoryGridRef} collapsable={false} style={styles.categoryGrid}>
              <CategoryCard
                title="Sleep"
                subtitle="Track and improve"
                gradient={isDark ? ['#3D344B', '#2D2B3D'] : ['#F0E5F5', '#E0D0F0']}
                accentColor={C.accent}
                Icon={MoonIcon}
                iconColor={C.sleepIcon}
                onPress={() => router.push('/(tabs)/sleep')}
              />
              <CategoryCard
                title="Sounds"
                subtitle="Calming soundscapes"
                gradient={isDark ? ['#2D3B4A', '#2D2B3D'] : ['#DCEBF5', '#BAD2E8']}
                accentColor="#5391C8"
                Icon={CloudRainIcon}
                iconColor={C.soundsIcon}
                onPress={() => router.push('/(tabs)/sounds')}
              />
              <CategoryCard
                title="Stories"
                subtitle="Bedtime tales"
                gradient={isDark ? ['#423232', '#2D2B3D'] : ['#F7E6DF', '#E8C6B8']}
                accentColor="#C88E84"
                Icon={StoriesIcon}
                iconColor={C.storiesIcon}
                onPress={() => router.push('/(tabs)/stories')}
              />
              <CategoryCard
                title="Games"
                subtitle="Focus and unwind"
                gradient={isDark ? ['#3D3D3D', '#2D2B3D'] : ['#FBF6EF', '#E3D7CC']}
                accentColor="#8A8A8A"
                Icon={GamesIcon}
                iconColor={C.gamesIcon}
                onPress={() => router.push('/(tabs)/games')}
              />
            </View>
          </View>
        </ScrollView>
      </Animated.View>

      <View ref={bottomNavRef} collapsable={false}>
        <BottomNav active="home" />
      </View>

      {evolutionReward && (
        <EvolutionToast
          stageName={evolutionReward}
          onDismiss={clearEvolutionReward}
        />
      )}
      </SafeAreaView>

      {/* Tour overlay — outside SafeAreaView so its coords match measureInWindow */}
      {tourDisplaying && (
        <TourOverlay
          isVisible={tourVisible}
          currentStep={currentStep}
          reduceMotion={reduceMotion}
          sleepWidgetRef={sleepWidgetRef}
          sheepButtonRef={sheepButtonRef}
          streakRef={streakRef}
          categoryGridRef={categoryGridRef}
          bottomNavRef={bottomNavRef}
          onNext={goToNext}
          onBack={goToBack}
          onDismiss={dismissTour}
          onBeforeStep={handleBeforeStep}
        />
      )}
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

  // Streak
  streakSection: {
    gap: 16,
  },
  streakHeader: {
    paddingBottom: 2,
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
    alignItems: 'center',
    height: 32,
  },
  streakBar: {
    flex: 1,
    height: 6,
    borderRadius: 999,
  },
  daysRow: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
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

  // Explore Grid
  exploreSection: {
    gap: 16,
  },
  exploreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  overlineDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCardWrapper: {
    width: '47.5%',
    minHeight: 130,
    borderRadius: 24,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  categoryCard: {
    flex: 1,
    padding: 18,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  categoryIconWrap: {
    alignSelf: 'flex-start',
  },
  iconBlurCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTextWrap: {
    gap: 1,
  },
  categoryTitle: {
    fontFamily: tokens.fonts.caption,
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  categorySubtitle: {
    fontFamily: tokens.fonts.body,
    fontSize: 11.5,
    fontWeight: '600',
    opacity: 0.8,
  },

  // End of styles
});

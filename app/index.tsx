import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  FadeInRight,
  FadeOutLeft
} from 'react-native-reanimated';
import { tokens } from '../constants/theme';
import { Sparkle } from '../components/SheepMascot';
import { useColors } from '@/hooks/useColors';
import { useTheme } from '@/context/ThemeContext';
import { CloudIcon, StoriesIcon, GamesIcon } from '../components/BedtimeIcons';

// ─── COMPONENTS ───

const Mascot = ({ variant, size = 200 }: { variant: 'welcome' | 'features' | 'teaching' | 'reading' | 'age' | 'goal', size?: number }) => {
  const C = useColors();
  const bob = useSharedValue(0);

  useEffect(() => {
    if (variant === 'welcome') {
      bob.value = withRepeat(
        withSequence(
          withTiming(-10, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );
    }
  }, [variant]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bob.value }],
  }));

  const images = {
    welcome: require('../assets/images/mascot_welcome.png'),
    features: require('../assets/images/mascot_features.png'),
    teaching: require('../assets/images/mascot_teaching.png'),
    reading: require('../assets/images/mascot_reading.png'),
    age: require('../assets/images/mascot_age.png'),
    goal: require('../assets/images/mascot_goal.png'),
  };

  return (
    <View style={styles.mascotContainer}>
      <View style={[styles.mascotBgBox, { backgroundColor: C.sleepBg }]}>
        <Animated.View style={animatedStyle}>
          <Image
            source={images[variant]}
            style={styles.mascotImage}
            resizeMode="contain"
          />
        </Animated.View>
      </View>
      {variant === 'welcome' && (
        <>
          <View style={styles.sparkle1}><Sparkle size={24} color={C.accentSoft} /></View>
          <View style={styles.sparkle2}><Sparkle size={32} color={C.accentSoft} /></View>
        </>
      )}
    </View>
  );
};

const FeatureItem = ({ title, description, color, Icon, isLast }: any) => {
  const C = useColors();
  return (
    <View>
      <View style={styles.featureContent}>
        <View style={[styles.iconCircle, { backgroundColor: color }]}>
          <Icon size={24} color={C.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.4)'} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.featureTitle, { color: C.textPrimary }]}>{title}</Text>
          <Text style={[styles.featureDescription, { color: C.textSecondary }]}>{description}</Text>
        </View>
      </View>
      {!isLast && <View style={[styles.featureDivider, { backgroundColor: C.border }]} />}
    </View>
  );
};

const GoalCard = ({ title, selected, onPress }: any) => {
  const C = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.goalCard,
        { backgroundColor: C.bgCard, shadowColor: C.accentSoft },
        selected && [styles.goalCardSelected, { borderColor: C.accent, backgroundColor: C.mode === 'dark' ? 'rgba(139, 107, 174, 0.15)' : '#F8F6FB' }]
      ]}
    >
      <Text style={[
        styles.goalText,
        { color: C.textPrimary },
        selected && { color: C.accent, fontWeight: '800' }
      ]}>
        {title}
      </Text>
      {selected && (
        <View style={[styles.goalCheck, { backgroundColor: C.accent }]}>
          <Text style={{ color: '#FFF', fontSize: 10 }}>✓</Text>
        </View>
      )}
    </Pressable>
  );
};

// ─── PAGES ───

const Page1 = () => {
  const { height } = useWindowDimensions();
  const C = useColors();
  return (
    <Animated.View exiting={FadeOutLeft} style={[styles.page, { paddingHorizontal: 0 }]}>
      <Mascot variant="welcome" />
      <View style={[styles.pageContent, { paddingHorizontal: 32, marginTop: height * 0.045 }]}>
        <Text style={[styles.heroTitle, { color: C.textPrimary }]}>
          Welcome to <Text style={{ color: C.accent }}>Rizzze</Text>!
        </Text>
        <Text style={[styles.heroSubtitle, { color: C.textSecondary }]}>
          Settle in for a cozy night with sleep-inducing sounds, soft-read stories, and peaceful puzzles
        </Text>
      </View>
    </Animated.View>
  );
};

const Page2 = () => {
  const C = useColors();
  return (
    <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.page}>
      <Mascot variant="teaching" />
      <View style={styles.pageContent}>
        <Text style={[styles.sectionLabel, { color: C.accent }]}>HOW WE HELP</Text>
        <Text style={[styles.sectionTitle, { color: C.textPrimary }]}>Designed for deep rest</Text>
        <View style={styles.featureList}>
          <FeatureItem
            title="White noise"
            description="High-fidelity environment sounds"
            color={C.soundsBg}
            Icon={CloudIcon}
          />
          <FeatureItem
            title="Bedtime stories"
            description="Gentle stories and guided sessions"
            color={C.sleepBg}
            Icon={StoriesIcon}
          />
          <FeatureItem
            title="Relaxing games"
            description="Mini-games to lower heart rate"
            color={C.storiesBg}
            Icon={GamesIcon}
            isLast
          />
        </View>
      </View>
    </Animated.View>
  );
};

const Page3 = ({ age, setAge }: any) => {
  const ages = ['18-24', '25-34', '35-44', '45+'];
  const C = useColors();
  return (
    <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.page}>
      <Mascot variant="reading" />
      <View style={styles.pageContent}>
        <Text style={[styles.sectionLabel, { color: C.accent }]}>TELL ME A LITTLE MORE ABOUT YOU</Text>
        <Text style={[styles.sectionTitle, { color: C.textPrimary }]}>How old are you?</Text>
        <View style={styles.selectionGrid}>
          {ages.map(a => (
            <GoalCard key={a} title={a} selected={age === a} onPress={() => setAge(a)} />
          ))}
        </View>
      </View>
    </Animated.View>
  );
};

const Page4 = ({ goal, setGoal }: any) => {
  const goals = [
    'Get to sleep easier',
    'Reduce anxiety',
    'Relax after a hard day',
    "I don't really know yet"
  ];
  const C = useColors();
  return (
    <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.page}>
      <Mascot variant="reading" />
      <View style={styles.pageContent}>
        <Text style={[styles.sectionLabel, { color: C.accent }]}>TELL ME A LITTLE MORE ABOUT YOU</Text>
        <Text style={[styles.sectionTitle, { color: C.textPrimary }]}>What is your goal?</Text>
        <View style={styles.selectionGrid}>
          {goals.map(g => (
            <GoalCard key={g} title={g} selected={goal === g} onPress={() => setGoal(g)} />
          ))}
        </View>
      </View>
    </Animated.View>
  );
};

// ─── MAIN ───

export default function Onboarding() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);
  const [age, setAge] = useState('');
  const [goal, setGoal] = useState('');
  const { height } = useWindowDimensions();
  const C = useColors();
  const { isDark } = useTheme();

  const next = () => {
    if (currentPage < 3) {
      setCurrentPage(currentPage + 1);
    } else {
      router.replace('/(tabs)');
    }
  };

  const back = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  return (
    <View style={[styles.container, { backgroundColor: C.bgPrimary }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <SafeAreaView style={styles.safeArea}>
        {/* Progress Dots */}
        <View style={styles.progressContainer}>
          {[0, 1, 2, 3].map(i => (
            <View
              key={i}
              style={[
                styles.progressDot,
                { backgroundColor: C.accentLight },
                i === currentPage && [styles.progressDotActive, { backgroundColor: C.accent }],
                i < currentPage && [styles.progressDotCompleted, { backgroundColor: C.accentSoft }],
              ]}
            />
          ))}
        </View>

        {/* Page Container */}
        <View style={styles.viewPager}>
          {currentPage === 0 && <Page1 key="p1" />}
          {currentPage === 1 && <Page2 key="p2" />}
          {currentPage === 2 && <Page3 key="p3" age={age} setAge={setAge} />}
          {currentPage === 3 && <Page4 key="p4" goal={goal} setGoal={setGoal} />}
        </View>

        {/* Navigation */}
        <View style={[styles.navigation, { paddingBottom: Math.max(24, height * 0.04) }]}>
          {currentPage > 0 && (
            <TouchableOpacity onPress={back} style={styles.backButton}>
              <Text style={[styles.backButtonText, { color: C.textSecondary }]}>Back</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={next}
            style={[
              styles.nextButton,
              { backgroundColor: C.accent },
              currentPage === 0 && { width: '100%' },
              (currentPage === 2 && !age || currentPage === 3 && !goal) && [styles.nextButtonDisabled, { backgroundColor: C.accentSoft }]
            ]}
            disabled={(currentPage === 2 && !age) || (currentPage === 3 && !goal)}
          >
            <Text style={styles.nextButtonText}>
              {(currentPage === 2 && !age) || (currentPage === 3 && !goal)
                ? "Pick an option"
                : currentPage === 3 ? "Let's Start" : "Next"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  progressDot: {
    width: 20,
    height: 4,
    borderRadius: 2,
  },
  progressDotActive: {
    width: 32,
  },
  progressDotCompleted: {
  },
  viewPager: {
    flex: 1,
    overflow: 'hidden',
  },
  page: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: tokens.spacing.xl,
  },
  pageContent: {
    alignItems: 'center',
    marginTop: tokens.spacing.lg,
    width: '100%',
  },

  mascotBgBox: {
    width: 130,
    height: 130,
    borderRadius: 28,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotImage: {
    width: 100,
    height: 100,
  },
  mascotContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkle1: { position: 'absolute', top: -10, right: -10 },
  sparkle2: { position: 'absolute', bottom: 20, left: -20 },
  overtitle: {
    fontFamily: tokens.fonts.caption,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 8,
  },
  heroTitle: {
    fontFamily: tokens.fonts.heading,
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.64,
  },
  heroSubtitle: {
    fontFamily: tokens.fonts.body,
    fontSize: 18,
    textAlign: 'center',
    paddingHorizontal: 50,
    marginTop: 16,
    lineHeight: 24,
    opacity: 0.8,
  },
  sectionLabel: {
    fontFamily: tokens.fonts.caption,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: tokens.fonts.heading,
    fontSize: 24,
    fontWeight: '900',
    marginBottom: tokens.spacing.lg,
  },
  featureList: {
    width: '100%',
  },
  featureContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 16,
  },
  featureDivider: {
    height: 1,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureTitle: {
    fontFamily: tokens.fonts.heading,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  featureDescription: {
    fontFamily: tokens.fonts.body,
    fontSize: 13,
  },
  selectionGrid: {
    width: '100%',
    gap: 16,
  },
  goalCard: {
    borderRadius: 16,
    borderWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    // Top shadow effect
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  goalCardSelected: {
    borderWidth: 2,
    shadowOpacity: 0.2,
  },
  goalText: {
    fontFamily: tokens.fonts.body,
    fontSize: 16,
  },
  goalCheck: {
    position: 'absolute',
    right: 20,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navigation: {
    flexDirection: 'row',
    padding: tokens.spacing.xl,
    gap: 12,
  },
  nextButton: {
    flex: 2,
    height: 56,
    borderRadius: tokens.radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.shadows.elevated,
  },
  nextButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
    opacity: 0.6,
  },
  nextButtonText: {
    fontFamily: tokens.fonts.body,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  backButton: {
    flex: 1,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontFamily: tokens.fonts.body,
    fontSize: 16,
    fontWeight: '700',
  },
});

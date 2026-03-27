import React, { useState, useCallback } from 'react';
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
import { useEffect } from 'react';
import { tokens } from '../constants/theme';
import { Sparkle } from '../components/SheepMascot';

// ─── COMPONENTS ───

const Mascot = ({ variant, size = 200 }: { variant: 'welcome' | 'features' | 'teaching' | 'reading' | 'age' | 'goal', size?: number }) => {
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
      <View style={styles.mascotBgBox}>
        <Animated.View style={animatedStyle}>
          <Image
            source={images[variant]}
            style={styles.mascotImage}
          />
        </Animated.View>
      </View>
      {variant === 'welcome' && (
        <>
          <View style={styles.sparkle1}><Sparkle size={24} color={tokens.colors.accentSoft} /></View>
          <View style={styles.sparkle2}><Sparkle size={32} color={tokens.colors.accentSoft} /></View>
        </>
      )}
    </View>
  );
};

const FeatureItem = ({ title, description, color, Icon, isLast }: any) => (
  <View>
    <View style={styles.featureContent}>
      <View style={[styles.iconCircle, { backgroundColor: color }]}>
        <Icon size={24} color="#00000040" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
    {!isLast && <View style={styles.featureDivider} />}
  </View>
);

const GoalCard = ({ title, selected, onPress }: any) => (
  <Pressable
    onPress={onPress}
    style={[
      styles.goalCard,
      selected && styles.goalCardSelected
    ]}
  >
    <Text style={[
      styles.goalText,
      selected && { color: tokens.colors.accent, fontWeight: '800' }
    ]}>
      {title}
    </Text>
    {selected && (
      <View style={styles.goalCheck}>
        <Text style={{ color: '#FFF', fontSize: 10 }}>✓</Text>
      </View>
    )}
  </Pressable>
);

// ─── PAGES ───

const Page1 = () => {
  const { height } = useWindowDimensions();
  return (
    <Animated.View exiting={FadeOutLeft} style={[styles.page, { paddingHorizontal: 0 }]}>
      <Mascot variant="welcome" />
      <View style={[styles.pageContent, { paddingHorizontal: 32, marginTop: height * 0.045 }]}>
        <Text style={styles.heroTitle}>
          Welcome to <Text style={{ color: tokens.colors.accent }}>Rizzze</Text>!
        </Text>
        <Text style={styles.heroSubtitle}>
          Settle in for a cozy night with sleep-inducing sounds, soft-read stories, and peaceful puzzles
        </Text>
      </View>
    </Animated.View>
  );
};

import { CloudIcon, StoriesIcon, GamesIcon } from '../components/BedtimeIcons';

const Page2 = () => {
  return (
    <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.page}>
      <Mascot variant="teaching" />
      <View style={styles.pageContent}>
        <Text style={styles.sectionLabel}>HOW WE HELP</Text>
        <Text style={styles.sectionTitle}>Designed for deep rest</Text>
        <View style={styles.featureList}>
          <FeatureItem
            title="White noise"
            description="High-fidelity environment sounds"
            color={tokens.colors.softBlue}
            Icon={CloudIcon}
          />
          <FeatureItem
            title="Bedtime stories"
            description="Gentle stories and guided sessions"
            color={tokens.colors.lavender}
            Icon={StoriesIcon}
          />
          <FeatureItem
            title="Relaxing games"
            description="Mini-games to lower heart rate"
            color={tokens.colors.blush}
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
  return (
    <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.page}>
      <Mascot variant="reading" />
      <View style={styles.pageContent}>
        <Text style={styles.sectionLabel}>TELL ME A LITTLE MORE ABOUT YOU</Text>
        <Text style={styles.sectionTitle}>How old are you?</Text>
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
  return (
    <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.page}>
      <Mascot variant="reading" />
      <View style={styles.pageContent}>
        <Text style={styles.sectionLabel}>TELL ME A LITTLE MORE ABOUT YOU</Text>
        <Text style={styles.sectionTitle}>What is your goal?</Text>
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
    <View style={styles.container}>
      <StatusBar style="dark" />



      <SafeAreaView style={styles.safeArea}>
        {/* Progress Dots */}
        <View style={styles.progressContainer}>
          {[0, 1, 2, 3].map(i => (
            <View
              key={i}
              style={[
                styles.progressDot,
                i === currentPage && styles.progressDotActive,
                i < currentPage && styles.progressDotCompleted,
                currentPage === 0 && {
                  backgroundColor: i === currentPage ? tokens.colors.accent : tokens.colors.accentLight
                }
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
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={next}
            style={[
              styles.nextButton,
              currentPage === 0 && { width: '100%' },
              (currentPage === 2 && !age || currentPage === 3 && !goal) && styles.nextButtonDisabled
            ]}
            disabled={currentPage === 2 && !age || currentPage === 3 && !goal}
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
    backgroundColor: tokens.colors.bgPrimary,
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
    backgroundColor: tokens.colors.accentLight,
  },
  progressDotActive: {
    backgroundColor: tokens.colors.accent,
    width: 32,
  },
  progressDotCompleted: {
    backgroundColor: tokens.colors.accentSoft,
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
    backgroundColor: '#E8DFF0',
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
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
    color: tokens.colors.textMuted,
    letterSpacing: 2,
    marginBottom: 8,
  },
  heroTitle: {
    fontFamily: tokens.fonts.heading,
    fontSize: 32,
    fontWeight: '900',
    color: tokens.colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.64,
  },
  heroSubtitle: {
    fontFamily: tokens.fonts.body,
    fontSize: 18,
    color: tokens.colors.textSecondary,
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
    color: tokens.colors.accent,
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: tokens.fonts.heading,
    fontSize: 24,
    fontWeight: '900',
    color: tokens.colors.textPrimary,
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
    backgroundColor: '#E8E2D8',
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
    color: tokens.colors.textPrimary,
    marginBottom: 2,
  },
  featureDescription: {
    fontFamily: tokens.fonts.body,
    fontSize: 13,
    color: tokens.colors.textSecondary,
  },
  selectionGrid: {
    width: '100%',
    gap: 16,
  },
  goalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 0,
    borderColor: tokens.colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    // Top shadow effect
    shadowColor: tokens.colors.accentSoft,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  goalCardSelected: {
    borderColor: tokens.colors.accent,
    borderWidth: 2,
    backgroundColor: '#F8F6FB',
    shadowColor: tokens.colors.accent,
    shadowOpacity: 0.2,
  },
  goalText: {
    fontFamily: tokens.fonts.body,
    fontSize: 16,
    color: tokens.colors.textPrimary,
  },
  goalCheck: {
    position: 'absolute',
    right: 20,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: tokens.colors.accent,
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
    backgroundColor: tokens.colors.accent,
    height: 56,
    borderRadius: tokens.radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.shadows.elevated,
  },
  nextButtonDisabled: {
    backgroundColor: tokens.colors.accentSoft,
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
    color: tokens.colors.textSecondary,
  },
});

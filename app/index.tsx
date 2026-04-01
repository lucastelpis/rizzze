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
  FadeOutLeft,
  interpolateColor
} from 'react-native-reanimated';
import { tokens } from '../constants/theme';
import { Sparkle } from '../components/SheepMascot';
import { useColors } from '@/hooks/useColors';
import { useTheme } from '@/context/ThemeContext';
import { CloudIcon, StoriesIcon, GamesIcon } from '../components/BedtimeIcons';
import { useNotifications } from '@/context/NotificationContext';
import { SleepingSheep } from '../components/SleepingSheep';
import { calculateSleepDuration, formatDuration } from '@/utils/sleepDuration';
import Svg, { Path, Circle } from 'react-native-svg';

// ─── COMPONENTS ───

const Mascot = ({ variant, size = 200, hideSparkles = false }: { variant: 'welcome' | 'features' | 'teaching' | 'reading' | 'age' | 'goal', size?: number, hideSparkles?: boolean }) => {
  const C = useColors();
  const { isDark } = useTheme();
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

  const images: Record<string, any> = {
    welcome: require('../assets/images/mascot_welcome.png'),
    features: require('../assets/images/mascot_features.png'),
    teaching: require('../assets/images/mascot_teaching.png'),
    reading: require('../assets/images/mascot_reading.png'),
    age: require('../assets/images/mascot_age.png'),
    goal: require('../assets/images/mascot_goal.png'),
  };

  return (
    <View style={styles.mascotContainer}>
      <View style={[styles.mascotBgBox, { backgroundColor: isDark ? 'rgba(139, 107, 174, 0.15)' : 'rgba(139, 107, 174, 0.1)' }, variant === 'goal' && { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(45, 43, 61, 0.03)' }]}>
        <Animated.View style={animatedStyle}>
          {variant === 'goal' ? (
            <SleepingSheep size={80} />
          ) : (
            <Image
              source={images[variant]}
              style={styles.mascotImage}
              resizeMode="contain"
            />
          )}
        </Animated.View>
      </View>
      {variant === 'welcome' && !hideSparkles && (
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
          <Icon size={24} color="rgba(255, 255, 255, 0.95)" />
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
        <Text style={[styles.pageDescription, { color: C.textSecondary }]}>
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
        <Text style={[styles.overtitle, { color: C.overtitle }]}>HOW WE HELP</Text>
        <Text style={[styles.heroTitle, { color: C.textPrimary }]}>Designed for deep rest</Text>
        <View style={styles.featureList}>
          <FeatureItem
            title="White noise"
            description="High-fidelity environment sounds"
            color={C.soundsVibrant}
            Icon={CloudIcon}
          />
          <FeatureItem
            title="Bedtime stories"
            description="Gentle stories and guided sessions"
            color={C.sleepVibrant}
            Icon={StoriesIcon}
          />
          <FeatureItem
            title="Relaxing games"
            description="Mini-games to lower heart rate"
            color={C.storiesVibrant}
            Icon={GamesIcon}
            isLast
          />
        </View>
      </View>
    </Animated.View>
  );
};

const PageGender = ({ gender, setGender }: any) => {
  const genders = ['Female', 'Male', 'Others', 'Prefer not to say'];
  const C = useColors();
  return (
    <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.page}>
      <Mascot variant="reading" />
      <View style={styles.pageContent}>
        <Text style={[styles.overtitle, { color: C.overtitle }]}>TELL ME A LITTLE MORE ABOUT YOU</Text>
        <Text style={[styles.heroTitle, { color: C.textPrimary }]}>How do you identify?</Text>
        <View style={styles.selectionGrid}>
          {genders.map(g => (
            <GoalCard key={g} title={g} selected={gender === g} onPress={() => setGender(g)} />
          ))}
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
        <Text style={[styles.overtitle, { color: C.overtitle }]}>TELL ME A LITTLE MORE ABOUT YOU</Text>
        <Text style={[styles.heroTitle, { color: C.textPrimary }]}>How old are you?</Text>
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
        <Text style={[styles.overtitle, { color: C.overtitle }]}>TELL ME A LITTLE MORE ABOUT YOU</Text>
        <Text style={[styles.heroTitle, { color: C.textPrimary }]}>What is your goal?</Text>
        <View style={styles.selectionGrid}>
          {goals.map(g => (
            <GoalCard key={g} title={g} selected={goal === g} onPress={() => setGoal(g)} />
          ))}
        </View>
      </View>
    </Animated.View>
  );
};

const Page5 = () => {
  const C = useColors();
  const { 
    bedtime, setBedtime, 
    wakeUpTime, setWakeUpTime,
    isNotificationsEnabled, toggleNotifications,
    isDailyCheckInEnabled, toggleDailyCheckIn
  } = useNotifications();

  const [localBedtime, setLocalBedtime] = useState(bedtime);
  const [localWakeUp, setLocalWakeUp] = useState(wakeUpTime);

  const adjustBedtime = (type: 'hour' | 'minute', amount: number) => {
    let h = localBedtime.hour;
    let m = localBedtime.minute;
    if (type === 'hour') {
      h = (h + amount + 24) % 24;
    } else {
      m = (m + amount + 60) % 60;
    }
    const newTime = { hour: h, minute: m };
    setLocalBedtime(newTime);
    setBedtime(h, m);
  };

  const adjustWakeUp = (type: 'hour' | 'minute', amount: number) => {
    let h = localWakeUp.hour;
    let m = localWakeUp.minute;
    if (type === 'hour') {
      h = (h + amount + 24) % 24;
    } else {
      m = (m + amount + 60) % 60;
    }
    const newTime = { hour: h, minute: m };
    setLocalWakeUp(newTime);
    setWakeUpTime(h, m);
  };

  const duration = calculateSleepDuration(localBedtime, localWakeUp);
  const isDark = C.mode === 'dark';

  return (
    <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.page}>
      <Mascot variant="welcome" hideSparkles />
      <View style={styles.pageContent}>
        <Text style={[styles.overtitle, { color: C.overtitle }]}>CONSISTENCY IS KEY</Text>
        <Text style={[styles.heroTitle, { color: C.textPrimary }]}>Set your sleep schedule</Text>
        <Text style={[styles.pageDescription, { color: C.textSecondary }]}>
          Wind down at night. Rise with a boost.
        </Text>

        <View style={styles.pickerRow}>
          <TimePickerCard
            label="BEDTIME"
            hour={localBedtime.hour}
            minute={localBedtime.minute}
            onAdjust={adjustBedtime}
            themeColor="#C4AED8"
            Icon={() => (
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="#C4AED8">
                <Path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </Svg>
            )}
          />
          <View style={{ width: 12 }} />
          <TimePickerCard
            label="WAKE UP"
            hour={localWakeUp.hour}
            minute={localWakeUp.minute}
            onAdjust={adjustWakeUp}
            themeColor="#E8C88A"
            Icon={() => (
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="#E8C88A">
                <Circle cx="12" cy="12" r="5" />
                <Path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="#E8C88A" strokeWidth="2" strokeLinecap="round" />
              </Svg>
            )}
          />
        </View>

        <View style={styles.durationBox}>
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={C.textSecondary} strokeWidth="1.5">
            <Circle cx="12" cy="12" r="10" />
            <Path d="M12 6v6l4 2" />
          </Svg>
          <Text style={[styles.durationText, { color: C.textSecondary }]}>
            {formatDuration(duration.hours, duration.minutes)} of sleep
          </Text>
        </View>

        <View style={[styles.divider, { backgroundColor: C.border }]} />

        <View style={styles.togglesContainer}>
          <ToggleRow
            title="Bedtime nudge"
            description="Soft wind-down reminders"
            isEnabled={isNotificationsEnabled}
            onToggle={toggleNotifications}
          />
          <ToggleRow
            title="Morning check-in"
            description="Rate your sleep & rise with a cozy nudge"
            isEnabled={isDailyCheckInEnabled}
            onToggle={toggleDailyCheckIn}
          />
        </View>
      </View>
    </Animated.View>
  );
};

const formatTime = (h: number, m: number) => {
  const hours = h % 12 || 12;
  const minutes = m < 10 ? `0${m}` : m;
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${hours}:${minutes} ${ampm}`;
};

const TimePickerCard = ({ label, hour, minute, onAdjust, themeColor, Icon }: any) => {
  const displayHour = hour % 12 || 12;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const C = useColors();
  const isDark = C.mode === 'dark';
  
  // Use a slightly darker version for arrows in light mode for contrast
  const arrowColor = !isDark ? (label === 'BEDTIME' ? C.accent : '#B89241') : themeColor;

  return (
    <View style={[
      styles.tpCard, 
      { backgroundColor: C.bgCard },
      !isDark && { ...tokens.shadows.card, elevation: 4 }
    ]}>
      <View style={styles.tpHeader}>
        <Icon />
        <Text style={[styles.tpLabel, { color: themeColor }]}>{label}</Text>
      </View>
      
      <View style={styles.tpControls}>
        <View style={styles.tpCol}>
          <TouchableOpacity onPress={() => onAdjust('hour', 1)} style={styles.tpArrow}>
            <Svg width={10} height={6} viewBox="0 0 10 6" fill={arrowColor} opacity={isDark ? 0.6 : 0.8}>
              <Path d="M5 0L10 6H0L5 0Z" />
            </Svg>
          </TouchableOpacity>
          <Text style={[styles.tpValue, { color: C.textPrimary }]}>{displayHour < 10 ? `0${displayHour}` : displayHour}</Text>
          <TouchableOpacity onPress={() => onAdjust('hour', -1)} style={styles.tpArrow}>
            <Svg width={10} height={6} viewBox="0 0 10 6" fill={arrowColor} opacity={isDark ? 0.6 : 0.8}>
              <Path d="M5 6L0 0H10L5 6Z" />
            </Svg>
          </TouchableOpacity>
        </View>
        
        <Text style={[styles.tpSeparator, { color: C.textSecondary }]}>:</Text>
        
        <View style={styles.tpCol}>
          <TouchableOpacity onPress={() => onAdjust('minute', 5)} style={styles.tpArrow}>
            <Svg width={10} height={6} viewBox="0 0 10 6" fill={arrowColor} opacity={isDark ? 0.6 : 0.8}>
              <Path d="M5 0L10 6H0L5 0Z" />
            </Svg>
          </TouchableOpacity>
          <Text style={[styles.tpValue, { color: C.textPrimary }]}>{minute < 10 ? `0${minute}` : minute}</Text>
          <TouchableOpacity onPress={() => onAdjust('minute', -5)} style={styles.tpArrow}>
            <Svg width={10} height={6} viewBox="0 0 10 6" fill={arrowColor} opacity={isDark ? 0.6 : 0.8}>
              <Path d="M5 6L0 0H10L5 6Z" />
            </Svg>
          </TouchableOpacity>
        </View>

        <Text style={[styles.tpAmPm, { color: C.textSecondary }]}>{ampm}</Text>
      </View>
    </View>
  );
};

const ToggleRow = ({ title, description, isEnabled, onToggle }: any) => {
  const switchAnim = useSharedValue(isEnabled ? 1 : 0);
  const C = useColors();
  const { isDark } = useTheme();

  useEffect(() => {
    switchAnim.value = withTiming(isEnabled ? 1 : 0, { duration: 250, easing: Easing.bezier(0.4, 0, 0.2, 1) });
  }, [isEnabled]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      switchAnim.value,
      [0, 1],
      [isDark ? 'rgba(255,255,255,0.1)' : '#E8E2D8', C.accent]
    ),
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: switchAnim.value * 18 }]
  }));

  return (
    <View style={styles.toggleRow}>
      <View style={{ flex: 1, paddingRight: 16 }}>
        <Text style={[styles.toggleTitle, { color: C.textPrimary }]}>{title}</Text>
        <Text style={[styles.toggleDescription, { color: C.textSecondary }]}>{description}</Text>
      </View>
      <TouchableOpacity activeOpacity={1} onPress={() => onToggle(!isEnabled)}>
        <Animated.View style={[styles.toggleTrack, trackStyle]}>
          <Animated.View style={[
            styles.toggleThumb, 
            { backgroundColor: '#FFF' },
            !isDark && tokens.shadows.card,
            thumbStyle
          ]} />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

// ─── MAIN ───

export default function Onboarding() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [goal, setGoal] = useState('');
  const { height } = useWindowDimensions();
  const C = useColors();
  const { isDark } = useTheme();
  const { isNotificationsEnabled, requestPermission } = useNotifications();

  const next = async () => {
    if (currentPage < 5) {
      setCurrentPage(currentPage + 1);
    } else {
      // If notifications are enabled, make sure we have permission
      if (isNotificationsEnabled) {
        await requestPermission();
      }
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
          {[0, 1, 2, 3, 4, 5].map(i => (
            <View
              key={i}
              style={[
                styles.progressDot,
                { backgroundColor: C.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.05)' },
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
          {currentPage === 2 && <PageGender key="pg" gender={gender} setGender={setGender} />}
          {currentPage === 3 && <Page3 key="p3" age={age} setAge={setAge} />}
          {currentPage === 4 && <Page4 key="p4" goal={goal} setGoal={setGoal} />}
          {currentPage === 5 && <Page5 key="p5" />}
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
              (currentPage === 2 && !gender || currentPage === 3 && !age || currentPage === 4 && !goal) && [styles.nextButtonDisabled, { backgroundColor: C.accentSoft }]
            ]}
            disabled={(currentPage === 2 && !gender) || (currentPage === 3 && !age) || (currentPage === 4 && !goal)}
          >
            <Text style={styles.nextButtonText}>
              {(currentPage === 2 && !gender) || (currentPage === 3 && !age) || (currentPage === 4 && !goal)
                ? "Pick an option"
                : currentPage === 5 ? "Let's Start" : "Next"}
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
    width: 110,
    height: 110,
    borderRadius: 24,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotImage: {
    width: 86,
    height: 86,
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
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontFamily: tokens.fonts.heading,
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.44,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontFamily: tokens.fonts.body,
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginTop: 0,
    lineHeight: 19.5,
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
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.44,
  },
  featureList: {
    width: '100%',
    marginTop: 20,
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
    marginTop: 24,
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
  timeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    borderRadius: 24,
    gap: 12,
    ...tokens.shadows.card,
  },
  timeColumn: {
    alignItems: 'center',
    gap: 4,
  },
  timeValue: {
    fontFamily: tokens.fonts.heading,
    fontSize: 42,
    fontWeight: '800',
  },
  timeArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeSeparator: {
    fontSize: 42,
    fontWeight: '800',
    marginTop: -4,
  },
  ampmBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginLeft: 8,
  },
  ampmText: {
    fontFamily: tokens.fonts.caption,
    fontSize: 14,
    fontWeight: '900',
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
  },
  notifRowTitle: {
    fontFamily: tokens.fonts.heading,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  notifRowSubtitle: {
    fontFamily: tokens.fonts.body,
    fontSize: 14,
    opacity: 0.8,
  },
  switchTrack: {
    width: 52,
    height: 30,
    borderRadius: 15,
    padding: 2,
    justifyContent: 'center',
  },
  switchThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  pageDescription: {
    fontFamily: tokens.fonts.body,
    fontSize: 12.5,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  pickerRow: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 24,
    marginTop: 8,
  },
  durationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  durationText: {
    fontFamily: tokens.fonts.body,
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    width: '100%',
    marginBottom: 16,
  },
  togglesContainer: {
    width: '100%',
    gap: 14,
  },
  tpCard: {
    flex: 1,
    backgroundColor: '#3D3A52',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  tpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  tpLabel: {
    fontFamily: tokens.fonts.caption,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tpControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tpCol: {
    alignItems: 'center',
    gap: 2,
  },
  tpArrow: {
    padding: 2,
  },
  tpValue: {
    fontFamily: tokens.fonts.heading,
    fontSize: 28,
    fontWeight: '900',
  },
  tpSeparator: {
    fontFamily: tokens.fonts.heading,
    fontSize: 24,
    fontWeight: '700',
    marginTop: -2,
  },
  tpAmPm: {
    fontFamily: tokens.fonts.body,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
    marginTop: 4,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleTitle: {
    fontFamily: tokens.fonts.body,
    fontSize: 14,
    fontWeight: '700',
  },
  toggleDescription: {
    fontFamily: tokens.fonts.body,
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  toggleTrack: {
    width: 48,
    height: 28,
    borderRadius: 14,
    paddingHorizontal: 3,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFF',
  },
});

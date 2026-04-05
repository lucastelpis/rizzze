import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  useWindowDimensions,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { ScreenLoader } from '../components/ScreenLoader';
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
import { CloudIcon, StoriesIcon, GamesIcon, TrackerIcon } from '../components/BedtimeIcons';
import { useNotifications } from '@/context/NotificationContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { useUser } from '@/context/UserContext';
import { calculateSleepDuration, formatDuration } from '@/utils/sleepDuration';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';
import { SheepStage1, SheepStage2, SheepStage3, SheepStage4, SheepStage5, SheepStage6 } from '../components/sheepStages';

// ─── COMPONENTS ───

const Mascot = ({ variant, size = 200, hideSparkles = false }: { variant: 'welcome' | 'features' | 'teaching' | 'reading' | 'age' | 'goal' | 'name', size?: number, hideSparkles?: boolean }) => {
  const C = useColors();
  const { isDark } = useTheme();
  const { height } = useWindowDimensions();
  const bob = useSharedValue(0);
  
  // Responsive sizing based on screen height
  const baseSize = height < 700 ? 80 : 110;
  const imageSize = height < 700 ? 64 : 86;
  const mascotPadding = height < 700 ? 8 : 12;
  const containerRadius = height < 700 ? 18 : 24;

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
    name: require('../assets/images/mascot_name.png'),
    age: require('../assets/images/mascot_age.png'),
    goal: require('../assets/images/mascot_goal.png'),
  };

  return (
    <View style={styles.mascotContainer}>
      <View style={[
        styles.mascotBgBox, 
        { 
          backgroundColor: isDark ? 'rgba(139, 107, 174, 0.15)' : 'rgba(139, 107, 174, 0.1)',
          width: baseSize,
          height: baseSize,
          borderRadius: containerRadius,
          padding: mascotPadding,
        }, 
        variant === 'goal' && { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(45, 43, 61, 0.03)' }
      ]}>
        <Animated.View style={animatedStyle}>
          <Image
            source={images[variant]}
            style={{ width: imageSize, height: imageSize }}
            contentFit="contain"
            transition={200}
          />
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

const FeatureItem = ({ title, description, bgColor, Icon, isLast }: any) => {
  const C = useColors();
  const { isDark } = useTheme();
  const iconColor = isDark ? 'rgba(255, 255, 255, 0.9)' : C.accent;

  return (
    <View>
      <View style={styles.featureContent}>
        <View style={[styles.iconCircle, { backgroundColor: bgColor }]}>
          <Icon size={24} color={iconColor} />
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
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingTop: height * 0.02 }]}
        showsVerticalScrollIndicator={false}
      >
        <Mascot variant="welcome" />
        <View style={[styles.pageContent, { paddingHorizontal: 32 }]}>
          <Text style={[styles.heroTitle, { color: C.textPrimary }]}>
            Welcome to <Text style={{ color: C.accent }}>Rizzze</Text>!
          </Text>
          <Text style={[styles.pageDescription, { color: C.textSecondary }]}>
            Settle in for a cozy night with sleep-inducing sounds, soft-read stories, and peaceful puzzles
          </Text>
        </View>
      </ScrollView>
    </Animated.View>
  );
};

const Page2 = () => {
  const C = useColors();
  const { isDark } = useTheme();
  return (
    <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.page}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Mascot variant="teaching" />
        <View style={styles.pageContent}>
          <Text style={[styles.overtitle, { color: C.overtitle }]}>HOW WE HELP</Text>
          <Text style={[styles.heroTitle, { color: C.textPrimary }]}>Designed for deep rest</Text>
          <View style={styles.featureList}>
            <FeatureItem
              title="Sleep tracking"
              description="Track your sleep quality over time and receive thoughtful sleep tips"
              bgColor={isDark ? 'rgba(125, 176, 219, 0.2)' : '#E5F0F8'}
              Icon={TrackerIcon}
            />
            <FeatureItem
              title="Sleep sounds"
              description="Elaborated scenes & simple ambient sounds crafted to help you drift off"
              bgColor={isDark ? 'rgba(139, 107, 174, 0.25)' : '#E8DFF0'}
              Icon={CloudIcon}
            />
            <FeatureItem
              title="Stories"
              description="Soft-read tales for a gentle wind-down"
              bgColor={isDark ? 'rgba(232, 200, 138, 0.25)' : '#F5ECD8'}
              Icon={StoriesIcon}
            />
            <FeatureItem
              title="Games"
              description="Cozy mini-games designed to quiet a busy mind"
              bgColor={isDark ? 'rgba(168, 197, 160, 0.2)' : '#EAF2E8'}
              Icon={GamesIcon}
              isLast
            />
          </View>
        </View>
      </ScrollView>
    </Animated.View>
  );
};

const PageName = ({ name, setName }: any) => {
  const C = useColors();
  const { isDark } = useTheme();
  return (
    <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.page}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Mascot variant="name" />
        <View style={styles.pageContent}>
          <Text style={[styles.overtitle, { color: C.overtitle }]}>ABOUT YOU</Text>
          <Text style={[styles.heroTitle, { color: C.textPrimary }]}>What should we call you?</Text>
          <Text style={[styles.pageDescription, { color: C.textSecondary }]}>
            This name will appear on your profile screen
          </Text>
          
          <View style={[styles.inputWrapper, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderColor: C.border }]}>
            <TextInput
              style={[styles.nameInput, { color: C.textPrimary }]}
              placeholder="Your name"
              placeholderTextColor={C.textMuted}
              value={name}
              onChangeText={(text) => {
                if (text.length <= 15) {
                  setName(text);
                }
              }}
              maxLength={15}
              autoFocus
              selectionColor={C.accent}
            />
            <Text style={[styles.charCount, { color: C.textMuted }]}>
              {name.length}/15
            </Text>
          </View>
        </View>
      </ScrollView>
    </Animated.View>
  );
};

const Page3 = () => {
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
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Mascot variant="goal" />
        <View style={styles.pageContent}>
          <Text style={[styles.overtitle, { color: C.overtitle }]}>CONSISTENCY IS KEY</Text>
          <Text style={[styles.heroTitle, { color: C.textPrimary }]}>Set your sleep schedule</Text>
          <Text style={[styles.pageDescription, { color: C.textSecondary }]}>
            Wind down at night. Rise with a boost.
          </Text>

          <View style={[styles.pickerRow, { marginHorizontal: -8 }]}>
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
            <View style={{ width: 10 }} />
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
              onToggle={(enabled: boolean) => toggleNotifications(enabled, false)}
            />
            <ToggleRow
              title="Morning check-in"
              description="Rate your sleep & rise with a cozy nudge"
              isEnabled={isDailyCheckInEnabled}
              onToggle={(enabled: boolean) => toggleDailyCheckIn(enabled, false)}
            />
          </View>

          <Text style={[styles.notificationDisclaimer, { color: C.textSecondary }]}>
            Toggle these off if you'd prefer not to receive notifications. 
            You can change this anytime in your profile settings.
          </Text>
        </View>
      </ScrollView>
    </Animated.View>
  );
};

// ─── PAGE 6 — MEET YOUR COMPANION ───

const STAGE_LABELS = ['Tiny', 'Small', 'Young', 'Adult', 'Elder', '???'];
const STAGE_SIZES = [24, 32, 42, 56, 52, 36];
const STAGE_OPACITIES = [0.35, 0.5, 0.7, 1, 0.55, 0.35];

const CompanionBenefitRow = ({ icon, title, description, isLast, iconBg }: any) => {
  const C = useColors();
  return (
    <View>
      <View style={p6Styles.benefitRow}>
        <View style={[p6Styles.benefitIcon, { backgroundColor: iconBg }]}>
          {icon}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[p6Styles.benefitTitle, { color: C.textPrimary }]}>{title}</Text>
          <Text style={[p6Styles.benefitDesc, { color: C.textSecondary }]}>{description}</Text>
        </View>
      </View>
      {!isLast && <View style={[p6Styles.benefitDivider, { backgroundColor: C.border }]} />}
    </View>
  );
};

const Page4 = () => {
  const C = useColors();
  const { isDark } = useTheme();
  const { width } = useWindowDimensions();

  const SheepComponents = [SheepStage1, SheepStage2, SheepStage3, SheepStage4, SheepStage5, SheepStage6];
  const responsiveSizes = STAGE_SIZES;

  const iconColor = isDark ? 'rgba(255,255,255,0.9)' : C.accent;

  return (
    <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.page}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.pageContent}>
          <Text style={[styles.overtitle, { color: C.overtitle }]}>YOUR COMPANION</Text>
          <Text style={[styles.heroTitle, { color: C.textPrimary }]}>Meet your sheep</Text>
          <Text style={[styles.pageDescription, { color: C.textSecondary }]}>
            Check in daily and watch it grow.{"\n"}How far can you take it?
          </Text>

          {/* ─── Growth Showcase ─── */}
          <View style={p6Styles.showcaseContainer}>
            <View style={p6Styles.sheepRow}>
              {SheepComponents.map((SheepComp, i) => (
                <View key={i} style={[p6Styles.sheepSlot, { opacity: STAGE_OPACITIES[i] }]}>
                  <View style={p6Styles.sheepSvgWrap}>
                    <SheepComp size={responsiveSizes[i]} />
                  </View>
                  <Text style={[
                    p6Styles.stageLabel,
                    { color: C.textSecondary, fontSize: width < 380 ? 8.5 : 10 },
                    i === 3 && { color: C.textPrimary, fontWeight: '800', fontSize: width < 380 ? 10 : 12 },
                  ]}>
                    {STAGE_LABELS[i]}
                  </Text>
                </View>
              ))}
            </View>

            {/* ─── Timeline Bar ─── */}
            <View style={p6Styles.timelineContainer}>
              <View style={[p6Styles.timelineLine, { 
                backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#E8E2D8',
                width: '83.3%',
                alignSelf: 'center',
              }]}>
                <View style={[p6Styles.timelineFilled, { backgroundColor: C.accent, width: '60%' }]} />
              </View>

              <View style={p6Styles.dotsRow}>
                {[0, 1, 2, 3, 4, 5].map(i => (
                  <View key={i} style={p6Styles.dotSlot}>
                    <View
                      style={[
                        p6Styles.dot,
                        i <= 3 && { backgroundColor: C.accent },
                        i > 3 && [
                          p6Styles.dotRing,
                          { borderColor: isDark ? 'rgba(255,255,255,0.2)' : '#D8D2CC', backgroundColor: 'transparent' },
                        ],
                        width < 380 && { width: 7, height: 7, borderRadius: 4 },
                      ]}
                    />
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* ─── Benefits ─── */}
          <View style={p6Styles.benefitsList}>
            <CompanionBenefitRow
              icon={
                <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                  <Circle cx="12" cy="12" r="10" stroke={iconColor} strokeWidth="1.5" />
                  <Path d="M12 7v5l3 3" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" />
                </Svg>
              }
              iconBg={isDark ? 'rgba(139, 107, 174, 0.25)' : '#E8DFF0'}
              title="Rate your sleep daily"
              description="Each check-in helps your sheep grow"
            />
            <CompanionBenefitRow
              icon={
                <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                  <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill={iconColor} />
                </Svg>
              }
              iconBg={isDark ? 'rgba(232, 200, 138, 0.25)' : '#F5ECD8'}
              title="6 unique stages"
              description="Each one a surprise to discover"
            />
            <CompanionBenefitRow
              icon={
                <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                  <Circle cx="12" cy="12" r="10" stroke={iconColor} strokeWidth="1.5" />
                  <Circle cx="12" cy="12" r="4" fill={iconColor} />
                </Svg>
              }
              iconBg={isDark ? 'rgba(168, 197, 160, 0.2)' : '#EAF2E8'}
              title="No pressure, just progress"
              description="Missed a day? Your sheep waits patiently"
              isLast
            />
          </View>

          {/* ─── Access hint ─── */}
          <Text style={[p6Styles.accessHint, { color: C.textMuted }]}>
            Visit your sheep anytime on your Profile
          </Text>
        </View>
      </ScrollView>
    </Animated.View>
  );
};

const p6Styles = StyleSheet.create({
  showcaseContainer: {
    width: '100%',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  sheepRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 0,
    marginBottom: 12,
  },
  sheepSlot: {
    alignItems: 'center',
    flex: 1,
  },
  sheepSvgWrap: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    minHeight: 60,
  },
  stageLabel: {
    fontFamily: tokens.fonts.body,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  timelineContainer: {
    width: '100%',
    marginBottom: 20,
  },
  timelineLine: {
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
  },
  timelineFilled: {
    height: '100%',
    width: '33%',
    borderRadius: 2,
  },
  dotsRow: {
    flexDirection: 'row',
    marginTop: -6,
  },
  dotSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  dotRing: {
    borderWidth: 2,
    width: 11,
    height: 11,
    borderRadius: 6,
    marginTop: -1,
  },
  benefitsList: {
    width: '100%',
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 14,
  },
  benefitIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitTitle: {
    fontFamily: tokens.fonts.heading,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 1,
  },
  benefitDesc: {
    fontFamily: tokens.fonts.body,
    fontSize: 12.5,
  },
  benefitDivider: {
    height: 1,
  },
  accessHint: {
    fontFamily: tokens.fonts.body,
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 16,
    opacity: 0.7,
  },
});

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
          <TouchableOpacity onPress={() => onAdjust('hour', 1)} style={styles.tpArrow} hitSlop={{ top: 15, bottom: 10, left: 15, right: 15 }}>
            <Svg width={10} height={6} viewBox="0 0 10 6" fill={arrowColor} opacity={isDark ? 0.6 : 0.8}>
              <Path d="M5 0L10 6H0L5 0Z" />
            </Svg>
          </TouchableOpacity>
          <Text style={[styles.tpValue, { color: C.textPrimary }]}>{displayHour < 10 ? `0${displayHour}` : displayHour}</Text>
          <TouchableOpacity onPress={() => onAdjust('hour', -1)} style={styles.tpArrow} hitSlop={{ top: 10, bottom: 15, left: 15, right: 15 }}>
            <Svg width={10} height={6} viewBox="0 0 10 6" fill={arrowColor} opacity={isDark ? 0.6 : 0.8}>
              <Path d="M5 6L0 0H10L5 6Z" />
            </Svg>
          </TouchableOpacity>
        </View>
        
        <Text style={[styles.tpSeparator, { color: C.textSecondary }]}>:</Text>
        
        <View style={styles.tpCol}>
          <TouchableOpacity onPress={() => onAdjust('minute', 5)} style={styles.tpArrow} hitSlop={{ top: 15, bottom: 10, left: 15, right: 15 }}>
            <Svg width={10} height={6} viewBox="0 0 10 6" fill={arrowColor} opacity={isDark ? 0.6 : 0.8}>
              <Path d="M5 0L10 6H0L5 0Z" />
            </Svg>
          </TouchableOpacity>
          <Text style={[styles.tpValue, { color: C.textPrimary }]}>{minute < 10 ? `0${minute}` : minute}</Text>
          <TouchableOpacity onPress={() => onAdjust('minute', -5)} style={styles.tpArrow} hitSlop={{ top: 10, bottom: 15, left: 15, right: 15 }}>
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
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState('');
  const { height } = useWindowDimensions();
  const C = useColors();
  const { isDark } = useTheme();
  const { isNotificationsEnabled, isDailyCheckInEnabled, requestPermission } = useNotifications();
  const { isPro, isLoading: subLoading, presentPaywall } = useSubscription();
  const { setName: saveUserName } = useUser();

  // Returning users who already have an active subscription skip onboarding
  useEffect(() => {
    if (!subLoading && isPro) {
      router.replace('/(tabs)');
    }
  }, [subLoading, isPro]);

  const next = async () => {
    if (currentPage < 4) {
      // If we are advancing from the notification page (Page 3),
      // and at least one notification is enabled, request permission now.
      if (currentPage === 3 && (isNotificationsEnabled || isDailyCheckInEnabled)) {
        await requestPermission();
      }
      setCurrentPage(currentPage + 1);
    } else {
      // Finalize setup
      if (name) {
        await saveUserName(name);
      }
      
      // Show paywall — only navigate into app if user starts trial/purchases
      const purchased = await presentPaywall();
      if (purchased) {
        router.replace('/(tabs)');
      }
    }
  };

  const back = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  return (
    <View 
      style={[styles.container, { backgroundColor: C.bgPrimary, opacity: isLoading ? 0 : 1 }]}
      onLayout={() => {
        // Essential to wait for layout before hiding ScreenLoader
        requestAnimationFrame(() => setIsLoading(false));
      }}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          {/* Progress Dots */}
          <View style={styles.progressContainer}>
            {[0, 1, 2, 3, 4].map(i => (
              <View
                key={i}
                style={[
                  styles.progressDot,
                  { backgroundColor: C.mode === 'dark' ? '#5A5670' : 'rgba(0,0,0,0.1)' },
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
            {currentPage === 2 && <PageName key="pn" name={name} setName={setName} />}
            {currentPage === 3 && <Page3 key="p3" />}
            {currentPage === 4 && <Page4 key="p4" />}
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
                currentPage === 4 && { width: '100%' },
                (currentPage === 2 && !name) && [styles.nextButtonDisabled, { backgroundColor: C.accentSoft }]
              ]}
              disabled={currentPage === 2 && !name}
            >
              <Text style={styles.nextButtonText}>
                {currentPage === 2 && !name
                  ? "Fill in to continue"
                  : currentPage === 4 ? "Let's Start" : "Next"}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <ScreenLoader isVisible={isLoading} />
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
    height: 5,
    borderRadius: 3,
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
    alignItems: 'stretch',
    justifyContent: 'center',
    paddingHorizontal: tokens.spacing.xl,
  },
  pageContent: {
    alignItems: 'center',
    width: '100%',
    alignSelf: 'stretch',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: tokens.spacing.xl,
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
    marginBottom: 28,
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
    alignSelf: 'stretch',
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
    alignSelf: 'stretch',
    gap: 12,
    marginTop: 20,
  },
  goalCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    paddingHorizontal: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  goalCardSelected: {
    shadowOpacity: 0.12,
  },
  goalText: {
    fontFamily: tokens.fonts.body,
    fontSize: 16,
  },
  goalCheck: {
    position: 'absolute',
    right: 14,
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
    fontFamily: tokens.fonts.caption,
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.3,
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
    marginBottom: 16,
  },
  pickerRow: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 12,
    marginTop: 4,
  },
  durationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  durationText: {
    fontFamily: tokens.fonts.body,
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    width: '100%',
    marginBottom: 12,
  },
  togglesContainer: {
    width: '100%',
    gap: 14,
  },
  tpCard: {
    flex: 1,
    backgroundColor: '#3D3A52',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
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
    gap: 4,
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
  notificationDisclaimer: {
    fontFamily: tokens.fonts.body,
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 20,
    opacity: 0.6,
    paddingHorizontal: 20,
    lineHeight: 16,
  },
  inputWrapper: {
    width: '100%',
    height: 60,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
  },
  nameInput: {
    flex: 1,
    height: '100%',
    fontFamily: tokens.fonts.heading,
    fontSize: 18,
    fontWeight: '700',
  },
  charCount: {
    fontFamily: tokens.fonts.caption,
    fontSize: 12,
    fontWeight: '600',
  },
});

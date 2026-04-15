import { getSheepComponent } from '@/components/sheepStages';
import { POINT_COLORS } from '@/constants/sheepGrowth';
import { tokens } from '@/constants/theme';
import { useAudio } from '@/context/AudioContext';
import { useNotifications } from '@/context/NotificationContext';
import { useSheepGrowth } from '@/context/SheepGrowthContext';
import { useStreak } from '@/context/StreakContext';
import { useTheme } from '@/context/ThemeContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { useSleep } from '@/context/SleepContext';
import { useUser } from '@/context/UserContext';
import RevenueCatUI from 'react-native-purchases-ui';
import { useColors } from '@/hooks/useColors';
import { posthog } from '@/config/posthog';
import { calculateSleepDuration, formatDuration } from '@/utils/sleepDuration';
import { supabase } from '@/utils/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useBackup } from '@/hooks/useBackup';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';

const CheckIcon = ({ size = 14 }: { size?: number }) => {
  const C = useColors();
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M20 6L9 17l-5-5" />
    </Svg>
  );
};

const MoonIcon = ({ color = "#B5A9DF" }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
      fill={color}
    />
  </Svg>
);

const SunIcon = ({ color = "#F0D880" }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="5" fill={color} />
    <Path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const InfoIcon = ({ size = 12, color = "currentColor" }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="10" />
    <Line x1="12" y1="16" x2="12" y2="12" />
    <Line x1="12" y1="8" x2="12.01" y2="8" />
  </Svg>
);

const ChevronRight = () => {
  const C = useColors();
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M9 18l6-6-6-6" />
    </Svg>
  );
};

const HeartIcon = ({ size = 24, color = '#D4928A', showFill = true }: { size?: number; color?: string; showFill?: boolean }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={showFill ? color : 'none'} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
  </Svg>
);

const CopyIcon = ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <Path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </Svg>
);

const MailIcon = ({ size = 18, color = "currentColor" }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <Polyline points="22,6 12,13 2,6" />
  </Svg>
);

const CloudIconSync = ({ size = 20, color = "currentColor" }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M17.5 19c2.5 0 4.5-2 4.5-4.5 0-2.3-1.7-4.2-3.9-4.5C17.5 6.5 14.5 4 11 4 7.7 4 5 6.7 5 10c-2.2.3-4 2.2-4 4.5C1 17 3 19 5.5 19h12z" />
    <Path d="M9 13l2 2 4-4" />
  </Svg>
);

function formatCooldownTime(ms: number): string {
  if (ms <= 0) return '';
  const totalMin = Math.ceil(ms / 60000);
  const hours = Math.floor(totalMin / 60);
  const mins = totalMin % 60;
  if (hours > 0) {
    const mm = mins < 10 ? `0${mins}` : mins;
    return `${hours}:${mm}h`;
  }
  return `${mins}m`;
}

const StatCard = ({
  label,
  value,
  color,
  icon,
  infoTitle,
  infoMessage,
  onInfoPress
}: {
  label: string;
  value: string;
  color: string;
  icon?: React.ReactNode;
  infoTitle?: string;
  infoMessage?: string;
  onInfoPress?: (title: string, message: string) => void;
}) => {
  const C = useColors();
  const { isDark } = useTheme();

  const handleInfo = () => {
    if (infoTitle && infoMessage && onInfoPress) {
      onInfoPress(infoTitle, infoMessage);
    }
  };

  return (
    <View style={[styles.statCard, { backgroundColor: color }]}>
      {infoMessage && (
        <TouchableOpacity
          style={[
            styles.statInfoBtn,
            { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
          ]}
          onPress={handleInfo}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          activeOpacity={0.7}
        >
          <InfoIcon color={isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.4)'} />
        </TouchableOpacity>
      )}
      <View style={styles.statMainContainer}>
        {icon && <View style={styles.statIconWrapper}>{icon}</View>}
        <Text style={[styles.statValue, { color: C.textPrimary }]}>{value}</Text>
      </View>
      <Text style={[styles.statLabel, { color: C.textSecondary }]}>{label}</Text>
    </View>
  );
};

const SettingsItem = ({
  label,
  value,
  icon,
  valueColor,
  last,
  showChevron = true,
  onPress
}: {
  label: string;
  value?: string;
  icon?: React.ReactNode;
  valueColor?: string;
  last?: boolean;
  showChevron?: boolean;
  onPress?: () => void
}) => {
  const C = useColors();
  return (
    <TouchableOpacity
      style={[styles.settingsItem, { borderBottomColor: C.border }]}
      activeOpacity={0.6}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingsLabelContainer}>
        {icon && <View style={styles.settingsIconWrapper}>{icon}</View>}
        <Text style={[styles.settingsLabel, { color: C.textPrimary }]}>{label}</Text>
      </View>
      <View style={styles.settingsRight}>
        {value && <Text style={[styles.settingsValue, { color: valueColor || C.accent }]}>{value}</Text>}
        {showChevron && <ChevronRight />}
      </View>
    </TouchableOpacity>
  );
};

const ToggleSettingsItem = ({ label, sublabel, isEnabled, onToggle }: {
  label: string;
  sublabel?: string;
  isEnabled: boolean;
  onToggle: (val: boolean) => void;
}) => {
  const C = useColors();
  const { isDark } = useTheme();
  const switchAnim = useSharedValue(isEnabled ? 1 : 0);

  useEffect(() => {
    switchAnim.value = withTiming(isEnabled ? 1 : 0, {
      duration: 250,
      easing: Easing.bezier(0.4, 0, 0.2, 1)
    });
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
    <View style={[styles.settingsItem, { borderBottomColor: 'transparent' }]}>
      <View>
        <Text style={[styles.settingsLabel, { color: C.textPrimary }]}>{label}</Text>
        {sublabel && <Text style={[styles.settingsSublabel, { color: C.textSecondary }]}>{sublabel}</Text>}
      </View>
      <TouchableOpacity activeOpacity={1} onPress={() => onToggle(!isEnabled)}>
        <Animated.View style={[styles.toggleTrack, trackStyle]}>
          <Animated.View style={[
            styles.toggleThumb,
            { backgroundColor: '#FFF' },
            thumbStyle
          ]} />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

// ─── SHEEP GAMIFICATION SECTION ──────────────────────────────────────────────
const SheepGamificationWidget = () => {
  const C = useColors();
  const { isDark } = useTheme();
  const {
    currentStageIndex,
    currentStageName,
    progressToNextStage,
    pointsInCurrentStage,
    pointsForNextStage,
    isMaxStage,
    totalPoints,
  } = useSheepGrowth();

  const SheepComponent = getSheepComponent(currentStageIndex);

  // Early stages have smaller pixel art in the viewBox, so render them larger
  const STAGE_RENDER_SIZES = [140, 120, 105, 90, 90, 90];
  const sheepRenderSize = STAGE_RENDER_SIZES[currentStageIndex] ?? 90;

  // Heart Animation setup
  const heartScale = useSharedValue(0);
  const heartOpacity = useSharedValue(0);
  const heartTranslateY = useSharedValue(0);

  const triggerHeartPop = () => {
    // Reset values immediately
    heartScale.value = 0;
    heartTranslateY.value = 0;
    heartOpacity.value = 1;

    // Execute with a slight sequence for smoothness
    heartScale.value = withSequence(
      withTiming(1.2, { duration: 250, easing: Easing.out(Easing.back(1.5)) }),
      withTiming(1, { duration: 150 })
    );

    heartTranslateY.value = withTiming(-15, {
      duration: 1000,
      easing: Easing.out(Easing.quad),
    });

    heartOpacity.value = withSequence(
      withDelay(600, withTiming(0, { duration: 600 }))
    );
  };

  const heartAnimatedStyle = useAnimatedStyle(() => ({
    opacity: heartOpacity.value,
    transform: [
      { scale: heartScale.value },
      { translateY: heartTranslateY.value }
    ],
    position: 'absolute',
    top: 20,
    zIndex: 100,
  }));

  return (
    <View style={styles.gamificationContainer}>
      {/* Sheep mascot container */}
      <View style={styles.sheepMainWrapper}>
        <Pressable 
          onPress={triggerHeartPop}
          style={({ pressed }) => [
            styles.avatarCircle, 
            { backgroundColor: C.accentLight, transform: [{ scale: pressed ? 0.96 : 1 }] }
          ]}
        >
          <View style={{ transform: [{ scaleX: -1 }], overflow: 'hidden' }}>
            <SheepComponent size={sheepRenderSize} />
          </View>
          <Animated.View pointerEvents="none" style={heartAnimatedStyle}>
            <HeartIcon size={18} />
          </Animated.View>
        </Pressable>
      </View>

      {/* Stage label */}
      <Text style={[styles.stageName, { color: C.textPrimary }]}>{currentStageName}</Text>

      {/* Progress Label — ABOVE the bar */}
      <Text style={[styles.progressLabelTop, { color: C.textMuted }]}>
        {isMaxStage ? `${totalPoints} pts` : `${pointsInCurrentStage} of ${pointsForNextStage} check-ins to next stage`}
      </Text>

      {/* Centered Status Bar */}
      <View style={styles.progressAreaCentered}>
        <View style={styles.progressBarTrackMini}>
          <View style={[styles.progressBarTrackBase, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : C.bgMuted }]}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.min(progressToNextStage * 100, 100)}%`,
                  backgroundColor: POINT_COLORS.daily,
                }
              ]}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

export const ProfileContent = ({
  isModal = false,
  onReplayTour,
}: {
  isModal?: boolean;
  onReplayTour?: () => void;
}) => {
  const { activeSound } = useAudio();
  const { themeMode, setThemeMode, isDark } = useTheme();
  const { streakCount, sleepRatingCount, syncSleepRatings, resetStreakData } = useStreak();
  const {
    bedtime, setBedtime,
    wakeUpTime, setWakeUpTime,
    isNotificationsEnabled, toggleNotifications,
    isDailyCheckInEnabled, toggleDailyCheckIn,
    sendTestNotification,
    resetConfig
  } = useNotifications();
  const { resetGrowthData, addDailyRatingPoint } = useSheepGrowth();
  const { resetSleepData } = useSleep();
  const { isPro, isLoading: subLoading, presentPaywall, restorePurchases } = useSubscription();
  const { name: userName, goal: userGoal, ageRange: userAge, gender: userGender, resetUserData } = useUser();
  const { 
    performBackup, 
    sendVerificationCode, 
    verifyAndLink, 
    restoreFromEmail, 
    unlinkEmail,
    isEmailVerified, 
    email: linkedEmail 
  } = useBackup();
  const C = useColors();

  const handleSubscriptionPress = async () => {
    if (isPro) {
      await RevenueCatUI.presentCustomerCenter();
    } else {
      await presentPaywall();
    }
  };

  useEffect(() => {
    syncSleepRatings();
  }, [syncSleepRatings]);

  const [infoData, setInfoData] = React.useState<{ title: string; message: string } | null>(null);
  const [showInfo, setShowInfo] = React.useState(false);
  const router = useRouter();

  const [showTimePicker, setShowTimePicker] = React.useState(false);
  const [showRestoreModal, setShowRestoreModal] = React.useState(false);
  const [showEmailModal, setShowEmailModal] = React.useState(false);
  const [emailStep, setEmailStep] = React.useState<'input' | 'verify'>('input');
  const [emailInput, setEmailInput] = React.useState('');
  const [otpInput, setOtpInput] = React.useState('');
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [restoreInput, setRestoreInput] = React.useState('');
  const [pickerType, setPickerType] = React.useState<'bedtime' | 'wakeup'>('bedtime');

  const formatTime = (h: number, m: number) => {
    const hh = h % 12 || 12;
    const mm = m < 10 ? `0${m}` : m;
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${hh}:${mm} ${ampm}`;
  };

  const handleReset = async () => {
    Alert.alert(
      "Reset App Data",
      "Are you sure? This will permanently delete your local streaks, sleep history, and progress.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              // Sign out from Supabase first to "freeze" the cloud backup
              await supabase.auth.signOut();
              
              // Then clear everything locally
              await AsyncStorage.clear();
              await resetStreakData();
              await resetGrowthData();
              await resetConfig();
              await resetSleepData();
              await resetUserData();
              router.replace('/');
            } catch (e) {
              console.error("Failed to clear storage", e);
            }
          }
        }
      ]
    );
  };

  const handleSendCode = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.trim())) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }
    setIsSyncing(true);
    const success = await sendVerificationCode(emailInput.trim());
    setIsSyncing(false);
    if (success) setEmailStep('verify');
  };

  const handleVerifyCode = async () => {
    if (otpInput.length < 6) return;
    setIsSyncing(true);
    const success = await verifyAndLink(emailInput.trim(), otpInput.trim());
    setIsSyncing(false);
    if (success) {
      setShowEmailModal(false);
      setEmailStep('input');
      setOtpInput('');
    }
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.scrollContent, activeSound && { paddingBottom: 100 }, isModal && { paddingTop: 0 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Sheep Gamification Header */}
      <View style={styles.header}>
        <SheepGamificationWidget />
        <Text style={[styles.userName, { color: C.textPrimary }]}>{userName}</Text>
        <Text style={[styles.userJoined, { color: C.textSecondary }]}>Rizzzer since March 2026</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsGrid}>
        <StatCard
          label="daily rating streak"
          value={streakCount.toString()}
          onInfoPress={(title, message) => { setInfoData({ title, message }); setShowInfo(true); }}
          infoTitle="Rating Streak"
          infoMessage="The number of consecutive days you've completed a sleep rating."
          color={isDark ? 'rgba(255,255,255,0.05)' : C.bgMuted}
        />
        <StatCard
          label="daily sleep ratings"
          value={sleepRatingCount.toString()}
          icon={<CheckIcon />}
          onInfoPress={(title, message) => { setInfoData({ title, message }); setShowInfo(true); }}
          infoTitle="Daily Sleep Ratings"
          infoMessage="Total count of sleep ratings recorded on the same day they were scheduled. Note: Ratings for past days aren't counted."
          color={isDark ? 'rgba(255,255,255,0.05)' : C.bgMuted}
        />
      </View>

      {/* User Info Section: Removed per user request */}

      {/* Theme Selector Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: C.textMuted }]}>APPEARANCE</Text>
        <View style={[styles.themeSelector, { backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : C.bgMuted }]}>
          {(['auto', 'light', 'dark'] as const).map((mode) => (
            <Pressable
              key={mode}
              onPress={() => setThemeMode(mode)}
              style={[
                styles.themeOption,
                themeMode === mode && [
                  styles.themeOptionActive,
                  { backgroundColor: isDark ? '#4A4668' : C.bgCard }
                ]
              ]}
            >
              <Text style={[
                styles.themeText,
                { color: C.textSecondary },
                themeMode === mode && { color: isDark ? C.white : C.accent, fontFamily: 'Nunito_800ExtraBold' }
              ]}
              >
                {mode.toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Settings Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: C.textMuted }]}>MY SLEEP</Text>
        <SettingsItem
          label="Bedtime goal"
          value={formatTime(bedtime.hour, bedtime.minute)}
          icon={<MoonIcon />}
          onPress={() => { setPickerType('bedtime'); setShowTimePicker(true); }}
        />
        <SettingsItem
          label="Wake-up goal"
          value={formatTime(wakeUpTime.hour, wakeUpTime.minute)}
          icon={<SunIcon />}
          onPress={() => { setPickerType('wakeup'); setShowTimePicker(true); }}
        />

        <View style={styles.durationRow}>
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <Circle cx="12" cy="12" r="10" />
            <Path d="M12 6v6l4 2" />
          </Svg>
          <Text style={[styles.durationText, { color: C.textSecondary }]}>
            {formatDuration(calculateSleepDuration(bedtime, wakeUpTime).hours, calculateSleepDuration(bedtime, wakeUpTime).minutes)} of sleep
          </Text>
        </View>

        <ToggleSettingsItem
          label="Bedtime reminder"
          sublabel={`Nudge at ${formatTime(bedtime.hour, bedtime.minute)}`}
          isEnabled={isNotificationsEnabled}
          onToggle={toggleNotifications}
        />
        <ToggleSettingsItem
          label="Daily check-in"
          sublabel="Rate your sleep each morning"
          isEnabled={isDailyCheckInEnabled}
          onToggle={toggleDailyCheckIn}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: C.textMuted }]}>ACCOUNT & BACKUP</Text>
        
        {isEmailVerified ? (
          <View style={[styles.settingsFlatItem, { borderBottomColor: C.border, paddingBottom: 16 }]}>
            <View style={{ flex: 1, alignItems: 'flex-start' }}>
              <View style={[styles.syncStatusHeader, { width: '100%', justifyContent: 'space-between' }]}>
                <View style={[styles.syncBadge, { backgroundColor: isDark ? 'rgba(74, 139, 86, 0.15)' : '#DDF0E1' }]}>
                  <CloudIconSync size={16} color={isDark ? '#6CC17D' : '#356B3F'} />
                  <Text style={[styles.syncBadgeText, { color: isDark ? '#6CC17D' : '#356B3F' }]}>Cloud Sync Active</Text>
                </View>
                <TouchableOpacity onPress={() => {
                  Alert.alert("Remove Cloud Sync?", "Your current data is safe, but future progress won't be backed up.", [
                    { text: "Cancel", style: "cancel" },
                    { text: "Remove", style: "destructive", onPress: unlinkEmail }
                  ]);
                }}>
                  <Text style={{ color: '#D4928A', fontFamily: tokens.fonts.heading, fontSize: 13, fontWeight: '700' }}>Remove</Text>
                </TouchableOpacity>
              </View>
              <Text style={[styles.settingsLabel, { color: C.textPrimary, marginTop: 8 }]}>{linkedEmail}</Text>
              <Text style={[styles.settingsSublabel, { color: C.textSecondary, marginTop: 4 }]}>Your progress is automatically saved.</Text>
            </View>
          </View>
        ) : (
          <View style={[styles.settingsFlatItem, { borderBottomColor: C.border, paddingBottom: 16 }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingsLabel, { color: C.textPrimary }]}>Cloud Backup</Text>
              <Text style={[styles.settingsSublabel, { color: C.textSecondary, marginTop: 4, marginBottom: 16 }]}>
                Link an email to protect your progress if you lose your phone.
              </Text>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: C.accent }]}
                onPress={() => setShowEmailModal(true)}
              >
                <MailIcon color="#FFF" />
                <Text style={styles.actionBtnText}>Link Email</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <SettingsItem
          label="Restore Progress"
          onPress={() => setShowRestoreModal(true)}
        />
      </View>

      <View style={[styles.section, { marginBottom: 16 }]}>
        <Text style={[styles.sectionTitle, { color: C.textMuted }]}>SUBSCRIPTION, SUPPORT & FEEDBACK</Text>
        <View style={[styles.settingsFlatItem, { borderBottomColor: C.border }]}>
          <Text style={[styles.settingsLabel, { color: C.textPrimary }]}>Subscription</Text>
          <TouchableOpacity style={styles.badgeWrapper} onPress={handleSubscriptionPress} disabled={subLoading}>
            <View style={[styles.proBadge, {
              backgroundColor: isPro
                ? (isDark ? 'rgba(139, 109, 174, 0.2)' : '#EDE5F5')
                : (isDark ? 'rgba(255,255,255,0.08)' : '#F0EDE8')
            }]}>
              <Text style={[styles.proBadgeText, { color: isPro ? '#8B6DAE' : C.textSecondary }]}>
                {subLoading ? '...' : isPro ? 'Rizzze Pro' : 'Free'}
              </Text>
            </View>
            <ChevronRight />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.settingsFlatItem, { borderBottomColor: C.border }]}
          onPress={() => {
            posthog.capture('restore_purchases_tapped');
            restorePurchases();
          }}
        >
          <Text style={[styles.settingsLabel, { color: C.textPrimary }]}>Restore purchases</Text>
        </TouchableOpacity>
        <SettingsItem label="Support" onPress={() => router.push('/support')} />
        <SettingsItem label="Feedback" onPress={() => router.push('/feedback')} />
        {onReplayTour && (
          <SettingsItem
            label="Replay app tour"
            showChevron={false}
            last
            onPress={onReplayTour}
          />
        )}
      </View>

      <TouchableOpacity style={[styles.logoutBtn, { marginTop: 0, opacity: 0.6 }]} onPress={handleReset}>
        <Text style={[styles.logoutText, { color: C.textSecondary, fontSize: 13 }]}>Reset app data</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.logoutBtn, { 
          marginTop: 12, 
          backgroundColor: isDark ? 'rgba(139, 109, 174, 0.15)' : '#EDE5F5',
          borderRadius: 12,
          paddingVertical: 12,
          marginHorizontal: 32,
        }]} 
        onPress={async () => {
          await resetUserData();
          router.replace('/');
        }}
      >
        <Text style={[styles.logoutText, { color: '#8B6DAE', fontSize: 13, fontWeight: '800' }]}>
          DEV: RETURN TO ONBOARDING
        </Text>
      </TouchableOpacity>

      {/* Info Popup Modal */}
      <Modal
        visible={showInfo}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowInfo(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowInfo(false)}
        >
          <Animated.View style={[
            styles.infoModalContent,
            {
              backgroundColor: isDark ? '#2C2844' : C.bgCard,
              borderWidth: isDark ? 1.5 : 0,
              borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'transparent'
            }
          ]}>
            <Text style={[styles.infoModalTitle, { color: C.textPrimary }]}>
              {infoData?.title}
            </Text>
            <Text style={[styles.infoModalMessage, { color: C.textSecondary }]}>
              {infoData?.message}
            </Text>
            <TouchableOpacity
              style={[styles.infoModalCloseBtn, { backgroundColor: C.accent }]}
              onPress={() => setShowInfo(false)}
            >
              <Text style={styles.infoModalCloseBtnText}>Got it</Text>
            </TouchableOpacity>
          </Animated.View>
        </Pressable>
      </Modal>

      {/* Time Picker Modal */}
      <Modal visible={showTimePicker} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowTimePicker(false)} />
          <Animated.View style={[styles.modalContent, { backgroundColor: C.bgCard }]}>
            <Text style={[styles.modalTitle, { color: C.textPrimary }]}>
              {pickerType === 'bedtime' ? 'Set Bedtime' : 'Set Wake Up'}
            </Text>

            <View style={styles.pickerContainer}>
              <TimePicker
                hour={pickerType === 'bedtime' ? bedtime.hour : wakeUpTime.hour}
                minute={pickerType === 'bedtime' ? bedtime.minute : wakeUpTime.minute}
                onChange={(h, m) => pickerType === 'bedtime' ? setBedtime(h, m) : setWakeUpTime(h, m)}
              />
            </View>

            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: C.accent }]}
              onPress={() => setShowTimePicker(false)}
            >
              <Text style={styles.confirmBtnText}>Done</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* Restore Modal */}
      <Modal visible={showRestoreModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowRestoreModal(false)} />
          <Animated.View style={[styles.modalContent, { backgroundColor: C.bgCard }]}>
            <Text style={[styles.modalTitle, { color: C.textPrimary }]}>Restore from Email</Text>
            <Text style={[styles.modalSubtitle, { color: C.textSecondary }]}>
              Enter your email to receive a recovery code. This will overwrite current data.
            </Text>

            <TextInput
              style={[
                styles.restoreInput,
                {
                  backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : C.bgMuted,
                  color: C.textPrimary,
                  borderColor: C.border
                }
              ]}
              placeholder="Email..."
              placeholderTextColor={C.textMuted}
              value={restoreInput}
              onChangeText={setRestoreInput}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F0EDE8' }]}
                onPress={() => {
                  setShowRestoreModal(false);
                  setRestoreInput('');
                }}
              >
                <Text style={[styles.modalBtnText, { color: C.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: C.accent }]}
                onPress={async () => {
                  const val = restoreInput.trim();
                  if (!val || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
                    Alert.alert("Invalid Email", "Please enter a valid email address.");
                    return;
                  }
                  
                  // Start email restore flow
                  setShowRestoreModal(false);
                  setEmailStep('verify');
                  setEmailInput(val);
                  const success = await sendVerificationCode(val);
                  if (success) setShowEmailModal(true);
                  setRestoreInput('');
                }}
              >
                <Text style={[styles.modalBtnText, { color: '#FFF' }]}>Continue</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Email Link Modal */}
      <Modal visible={showEmailModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowEmailModal(false)} />
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%' }}>
            <Animated.View style={[styles.modalContent, { backgroundColor: C.bgCard }]}>
              {emailStep === 'input' ? (
                <>
                  <Text style={[styles.modalTitle, { color: C.textPrimary }]}>Secure with Email</Text>
                  <Text style={[styles.modalSubtitle, { color: C.textSecondary }]}>
                    Receive a secure code to link your account.
                  </Text>
                  <TextInput
                    style={[styles.restoreInput, { backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : C.bgMuted, color: C.textPrimary, borderColor: C.border }]}
                    placeholder="Enter your email"
                    placeholderTextColor={C.textMuted}
                    value={emailInput}
                    onChangeText={setEmailInput}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={[styles.confirmBtn, { backgroundColor: C.accent }]}
                    onPress={handleSendCode}
                    disabled={isSyncing}
                  >
                    {isSyncing ? <ActivityIndicator color="#FFF" /> : <Text style={styles.confirmBtnText}>Send Code</Text>}
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={[styles.modalTitle, { color: C.textPrimary }]}>Check your email</Text>
                  <Text style={[styles.modalSubtitle, { color: C.textSecondary }]}>
                    We sent a secure code to {emailInput}
                  </Text>
                  <TextInput
                    style={[styles.restoreInput, { 
                      backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : C.bgMuted, 
                      color: C.textPrimary, 
                      borderColor: C.border,
                      textAlign: 'center',
                      fontSize: 24,
                      letterSpacing: 4
                    }]}
                    placeholder="00000000"
                    placeholderTextColor={C.textMuted}
                    value={otpInput}
                    onChangeText={setOtpInput}
                    keyboardType="number-pad"
                    maxLength={8}
                  />
                  <TouchableOpacity
                    style={[styles.confirmBtn, { backgroundColor: C.accent }]}
                    onPress={async () => {
                      if (showRestoreModal || restoreInput) { // If coming from restore flow
                        const success = await restoreFromEmail(emailInput, otpInput);
                        if (success) {
                          setShowEmailModal(false);
                          setOtpInput('');
                        }
                      } else {
                        handleVerifyCode();
                      }
                    }}
                    disabled={isSyncing || otpInput.length < 6}
                  >
                    {isSyncing ? <ActivityIndicator color="#FFF" /> : <Text style={styles.confirmBtnText}>Verify & Continue</Text>}
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => setEmailStep('input')}
                    style={{ marginTop: 16 }}
                  >
                    <Text style={{ color: C.accent, textAlign: 'center', fontSize: 13 }}>Change email</Text>
                  </TouchableOpacity>
                </>
              )}
            </Animated.View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </ScrollView>
  );
};

const TimePicker = ({ hour, minute, onChange }: { hour: number; minute: number; onChange: (h: number, m: number) => void }) => {
  const { isDark } = useTheme();
  const C = useColors();
  const displayHour = hour % 12 || 12;
  const ampm = hour >= 12 ? 'PM' : 'AM';

  const arrowColor = !isDark ? C.accent : '#C4AED8';

  const adjust = (type: 'h' | 'm', delta: number) => {
    if (type === 'h') {
      let next = hour + delta;
      if (next > 23) next = 0;
      if (next < 0) next = 23;
      onChange(next, minute);
    } else {
      let next = minute + delta;
      if (next > 59) { next = 0; adjust('h', 1); return; }
      if (next < 0) { next = 55; adjust('h', -1); return; }
      onChange(hour, next);
    }
  };

  return (
    <View style={styles.tpRow}>
      <View style={styles.tpCol}>
        <TouchableOpacity onPress={() => adjust('h', 1)} style={styles.tpArrow} hitSlop={{ top: 15, bottom: 10, left: 15, right: 15 }}>
          <Svg width={14} height={10} viewBox="0 0 10 6" fill={arrowColor} opacity={isDark ? 0.6 : 0.8}>
            <Path d="M5 0L10 6H0L5 0Z" />
          </Svg>
        </TouchableOpacity>
        <Text style={[styles.tpVal, { color: C.textPrimary }]}>{displayHour < 10 ? `0${displayHour}` : displayHour}</Text>
        <TouchableOpacity onPress={() => adjust('h', -1)} style={styles.tpArrow} hitSlop={{ top: 10, bottom: 15, left: 15, right: 15 }}>
          <Svg width={14} height={10} viewBox="0 0 10 6" fill={arrowColor} opacity={isDark ? 0.6 : 0.8}>
            <Path d="M5 6L0 0H10L5 6Z" />
          </Svg>
        </TouchableOpacity>
      </View>
      <Text style={[styles.tpSep, { color: C.textPrimary }]}>:</Text>
      <View style={styles.tpCol}>
        <TouchableOpacity onPress={() => adjust('m', 5)} style={styles.tpArrow} hitSlop={{ top: 15, bottom: 10, left: 15, right: 15 }}>
          <Svg width={14} height={10} viewBox="0 0 10 6" fill={arrowColor} opacity={isDark ? 0.6 : 0.8}>
            <Path d="M5 0L10 6H0L5 0Z" />
          </Svg>
        </TouchableOpacity>
        <Text style={[styles.tpVal, { color: C.textPrimary }]}>{minute < 10 ? `0${minute}` : minute}</Text>
        <TouchableOpacity onPress={() => adjust('m', -5)} style={styles.tpArrow} hitSlop={{ top: 10, bottom: 15, left: 15, right: 15 }}>
          <Svg width={14} height={10} viewBox="0 0 10 6" fill={arrowColor} opacity={isDark ? 0.6 : 0.8}>
            <Path d="M5 6L0 0H10L5 6Z" />
          </Svg>
        </TouchableOpacity>
      </View>
      <View style={styles.tpBadgeWrapper}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => adjust('h', 12)}
          style={[styles.tpBadge, { backgroundColor: isDark ? 'rgba(139, 109, 174, 0.2)' : C.accentLight }]}
        >
          <Text style={[styles.tpBadgeText, { color: C.accent }]}>{ampm}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 20 },
  header: {
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 12,
  },
  userName: {
    fontFamily: tokens.fonts.heading,
    fontSize: 24,
    textAlign: 'center',
    marginTop: 16,
  },
  userJoined: {
    fontFamily: tokens.fonts.body,
    fontSize: 13,
    marginTop: 4,
    marginBottom: 12,
    textAlign: 'center'
  },

  // ── Gamification ──
  gamificationContainer: { alignItems: 'center', gap: 0, width: '100%', marginTop: 20 },
  sheepMainWrapper: { width: '100%', height: 110, alignItems: 'center', justifyContent: 'center' },
  avatarCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...tokens.shadows.elevated
  },
  stageName: {
    fontFamily: tokens.fonts.caption,
    fontSize: 14,
    letterSpacing: 0.5,
    marginTop: 12,
    textAlign: 'center',
  },
  progressAreaCentered: {
    width: '100%',
    alignItems: 'center',
    marginTop: 0,
  },
  progressBarTrackMini: { width: 250 },
  progressLabelTop: {
    fontFamily: tokens.fonts.caption,
    fontSize: 11,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.3
  },
  progressBarTrackBase: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },

  themeSelector: {
    height: 48,
    borderRadius: 24,
    flexDirection: 'row',
    padding: 4,
    marginBottom: 8,
  },
  themeOption: {
    flex: 1,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeOptionActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  themeText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  statCard: { flex: 1, padding: 16, borderRadius: 24, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  statInfoBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  statMainContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statIconWrapper: { marginBottom: 2 },
  statValue: { fontFamily: tokens.fonts.heading, fontSize: 28 },
  statLabel: { fontFamily: tokens.fonts.body, fontSize: 13, textTransform: 'lowercase', marginTop: 0 },
  section: { marginBottom: 32 },
  sectionTitle: { fontFamily: tokens.fonts.caption, fontSize: 11, letterSpacing: 1.2, marginBottom: 12, marginLeft: 4 },
  settingsItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 18, borderBottomWidth: 1 },
  settingsLabelContainer: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  settingsIconWrapper: { width: 24, alignItems: 'center' },
  settingsLabel: { fontFamily: tokens.fonts.body, fontSize: 16 },
  settingsSublabel: { fontFamily: tokens.fonts.body, fontSize: 13, marginTop: 2 },
  settingsRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  settingsValue: { fontFamily: tokens.fonts.body, fontSize: 16 },
  durationRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  durationText: { fontFamily: tokens.fonts.body, fontSize: 13 },
  settingsFlatItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 18, borderBottomWidth: 1 },
  badgeWrapper: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  proBadge: { paddingVertical: 4, paddingHorizontal: 12, borderRadius: 9999 },
  proBadgeText: { fontFamily: tokens.fonts.caption, fontSize: 11 },
  logoutBtn: { paddingVertical: 12, alignItems: 'center', marginTop: 12 },
  logoutText: { fontFamily: tokens.fonts.body, fontSize: 15 },
  toggleTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 3,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '100%',
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    elevation: 8,
    shadowColor: "#2D2B3D",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 32,
  },
  modalTitle: {
    fontFamily: tokens.fonts.heading,
    fontSize: 20,
    marginBottom: 24,
  },
  pickerContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 32,
  },
  confirmBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  confirmBtnText: {
    fontFamily: tokens.fonts.heading,
    fontSize: 16,
    color: '#FFF',
  },
  tpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  tpCol: {
    alignItems: 'center',
    gap: 8,
  },
  tpVal: {
    fontFamily: tokens.fonts.heading,
    fontSize: 48,
    fontWeight: '900',
  },
  tpArrow: {
    padding: 2,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tpSep: {
    fontFamily: tokens.fonts.heading,
    fontSize: 40,
    fontWeight: '800',
    marginTop: -4,
  },
  tpBadgeWrapper: {
    marginLeft: 4,
  },
  tpBadge: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  tpBadgeText: { fontFamily: tokens.fonts.caption, fontSize: 13, fontWeight: '700' },

  // Backup Styles
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  codeText: {
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    flex: 1,
  },
  copyBtn: {
    padding: 8,
    marginLeft: 8,
  },
  restoreInput: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
    fontSize: 14,
    marginBottom: 20,
    borderWidth: 1,
  },
  modalSubtitle: {
    fontFamily: tokens.fonts.body,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalBtn: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnText: {
    fontFamily: tokens.fonts.heading,
    fontSize: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 20,
    ...tokens.shadows.card,
  },
  actionBtnText: {
    color: '#FFF',
    fontFamily: tokens.fonts.heading,
    fontSize: 15,
    fontWeight: '700',
  },
  syncStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  syncBadgeText: {
    fontFamily: tokens.fonts.caption,
    fontSize: 12,
    fontWeight: '800',
  },
  infoModalContent: {
    width: '85%',
    maxWidth: 400,
    padding: 24,
    borderRadius: 32,
    alignItems: 'center',
    ...tokens.shadows.elevated
  },
  infoModalTitle: {
    fontFamily: tokens.fonts.heading,
    fontSize: 20,
    marginBottom: 12,
    textAlign: 'center'
  },
  infoModalMessage: {
    fontFamily: tokens.fonts.body,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24
  },
  infoModalCloseBtn: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 100,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoModalCloseBtnText: {
    color: '#FFF',
    fontFamily: tokens.fonts.heading,
    fontSize: 16,
  }
});

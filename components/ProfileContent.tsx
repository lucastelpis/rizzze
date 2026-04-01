import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Pressable, Alert } from 'react-native';
import Animated from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path, Circle } from 'react-native-svg';
import { tokens } from '@/constants/theme';
import { useAudio } from '@/context/AudioContext';
import { useTheme } from '@/context/ThemeContext';
import { useColors } from '@/hooks/useColors';
import { useStreak } from '@/context/StreakContext';
import { SleepingSheep } from '@/components/SleepingSheep';
import { AwakeSheep } from '@/components/AwakeSheep';
import { useNotifications } from '@/context/NotificationContext';
import { Modal } from 'react-native';

const SettingsIcon = ({ size = 20 }: { size?: number }) => {
  const C = useColors();
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={C.textSecondary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="12" cy="12" r="3" />
      <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </Svg>
  );
};

const ChevronRight = () => {
  const C = useColors();
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M9 18l6-6-6-6" />
    </Svg>
  );
};

const StatCard = ({ label, value, color }: { label: string; value: string; color: string }) => {
  const C = useColors();
  return (
    <View style={[styles.statCard, { backgroundColor: color }]}>
      <Text style={[styles.statValue, { color: C.textPrimary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: C.textSecondary }]}>{label}</Text>
    </View>
  );
};

const SettingsItem = ({ label, value, last, onPress }: { label: string; value?: string; last?: boolean; onPress?: () => void }) => {
  const C = useColors();
  return (
    <TouchableOpacity 
      style={[styles.settingsItem, last && { borderBottomWidth: 0 }, { borderBottomColor: C.border }]} 
      activeOpacity={0.6}
      onPress={onPress}
      disabled={!onPress}
    >
      <Text style={[styles.settingsLabel, { color: C.textPrimary }]}>{label}</Text>
      <View style={styles.settingsRight}>
        {value && <Text style={[styles.settingsValue, { color: C.accent }]}>{value}</Text>}
        <ChevronRight />
      </View>
    </TouchableOpacity>
  );
};

export const ProfileContent = ({ isModal = false }: { isModal?: boolean }) => {
  const { activeSound } = useAudio();
  const { themeMode, setThemeMode, isDark } = useTheme();
  const { streakCount } = useStreak();
  const { bedtime, setBedtime, isNotificationsEnabled, toggleNotifications, sendTestNotification } = useNotifications();
  const C = useColors();
  const router = useRouter();

  const [showTimePicker, setShowTimePicker] = React.useState(false);

  const formatTime = (h: number, m: number) => {
    const hh = h % 12 || 12;
    const mm = m < 10 ? `0${m}` : m;
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${hh}:${mm} ${ampm}`;
  };

  const handleReset = async () => {
    Alert.alert(
      "Reset App Data",
      "Are you sure? This will permanently delete your streaks, sleep history, and preferences.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Reset", 
          style: "destructive", 
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              router.replace('/');
            } catch (e) {
              console.error("Failed to clear storage", e);
            }
          } 
        }
      ]
    );
  };

  return (
    <ScrollView 
      style={styles.scroll} 
      contentContainerStyle={[styles.scrollContent, activeSound && { paddingBottom: 100 }, isModal && { paddingTop: 12 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={[styles.avatarCircle, { backgroundColor: C.accentLight }]}>
            {isDark ? <SleepingSheep size={80} /> : <AwakeSheep size={80} />}
          </View>
          <TouchableOpacity style={[styles.editBadge, { backgroundColor: C.white, borderColor: C.bgPrimary }]}>
            <SettingsIcon size={12} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.userName, { color: C.textPrimary }]}>Lucas Telpis</Text>
        <Text style={[styles.userJoined, { color: C.textSecondary }]}>Zen sleeper since March 2026</Text>
      </View>

      {/* Theme Selector */}
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

      {/* Stats */}
      <View style={styles.statsGrid}>
        <StatCard label="Current streak" value={streakCount.toString()} color={C.sleepBg} />
        <StatCard label="Hours slept" value="28.5" color={C.soundsBg} />
      </View>

      {/* Settings Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: C.textMuted }]}>MY SLEEP</Text>
        <View style={[styles.settingsCard, { backgroundColor: C.bgCard }]}>
          <SettingsItem 
            label="Bedtime goal" 
            value={formatTime(bedtime.hour, bedtime.minute)} 
            onPress={() => setShowTimePicker(true)}
          />
          <SettingsItem label="Wake up goal" value="7:30 AM" />
          <SettingsItem 
            label="Daily reminders" 
            value={isNotificationsEnabled ? "On" : "Off"} 
            onPress={() => toggleNotifications(!isNotificationsEnabled)}
            last 
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: C.textMuted }]}>ACCOUNT</Text>
        <View style={[styles.settingsCard, { backgroundColor: C.bgCard }]}>
          <SettingsItem label="Subscription" value="Rizzze Pro" />
          <SettingsItem label="Test Notification" onPress={() => sendTestNotification()} />
          <SettingsItem label="Support & Feedback" last />
        </View>
      </View>

      {/* Time Picker Modal */}
      <Modal visible={showTimePicker} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowTimePicker(false)} />
          <Animated.View style={[styles.modalContent, { backgroundColor: C.bgCard }]}>
            <Text style={[styles.modalTitle, { color: C.textPrimary }]}>Set Bedtime</Text>
            
            <View style={styles.pickerContainer}>
               <TimePicker 
                 hour={bedtime.hour} 
                 minute={bedtime.minute} 
                 onChange={(h, m) => setBedtime(h, m)} 
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

      <TouchableOpacity style={styles.logoutBtn}>
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.logoutBtn, { marginTop: 0 }]} onPress={handleReset}>
        <Text style={[styles.logoutText, { color: C.textMuted, fontSize: 13 }]}>Reset app data</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 20 },
  header: { alignItems: 'center', marginTop: 12, marginBottom: 32 },
  avatarContainer: { position: 'relative', marginBottom: 16 },
  avatarCircle: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    alignItems: 'center', 
    justifyContent: 'center',
    ...tokens.shadows.elevated
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: { fontFamily: tokens.fonts.heading, fontSize: 24 },
  userJoined: { fontFamily: tokens.fonts.body, fontSize: 13, marginTop: 4 },
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
  statCard: { flex: 1, padding: 16, borderRadius: 20, alignItems: 'center' },
  statValue: { fontFamily: tokens.fonts.heading, fontSize: 22 },
  statLabel: { fontFamily: tokens.fonts.caption, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },
  section: { marginBottom: 24 },
  sectionTitle: { fontFamily: tokens.fonts.caption, fontSize: 11, letterSpacing: 1.2, marginBottom: 10, marginLeft: 4 },
  settingsCard: { borderRadius: 20, overflow: 'hidden', paddingHorizontal: 16 },
  settingsItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1 },
  settingsLabel: { fontFamily: tokens.fonts.body, fontSize: 15 },
  settingsRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  settingsValue: { fontFamily: tokens.fonts.body, fontSize: 14 },
  logoutBtn: { paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  logoutText: { fontFamily: tokens.fonts.body, fontSize: 15, color: '#D47575' },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
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
  // Time Picker Mini Component Styles
  tpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  tpCol: {
    alignItems: 'center',
    gap: 8,
  },
  tpVal: {
    fontFamily: tokens.fonts.heading,
    fontSize: 32,
  },
  tpArrow: {
    padding: 8,
  },
  tpSep: {
    fontSize: 32,
    marginTop: -4,
  },
  tpBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  tpBadgeText: {
    fontFamily: tokens.fonts.caption,
    fontSize: 12,
  }
});

const TimePicker = ({ hour, minute, onChange }: { hour: number; minute: number; onChange: (h: number, m: number) => void }) => {
  const C = useColors();
  const displayHour = hour % 12 || 12;
  const ampm = hour >= 12 ? 'PM' : 'AM';

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
        <TouchableOpacity onPress={() => adjust('h', 1)} style={styles.tpArrow}><Text style={{ color: C.accent }}>▲</Text></TouchableOpacity>
        <Text style={[styles.tpVal, { color: C.textPrimary }]}>{displayHour < 10 ? `0${displayHour}` : displayHour}</Text>
        <TouchableOpacity onPress={() => adjust('h', -1)} style={styles.tpArrow}><Text style={{ color: C.accent }}>▼</Text></TouchableOpacity>
      </View>
      <Text style={[styles.tpSep, { color: C.textPrimary }]}>:</Text>
      <View style={styles.tpCol}>
        <TouchableOpacity onPress={() => adjust('m', 5)} style={styles.tpArrow}><Text style={{ color: C.accent }}>▲</Text></TouchableOpacity>
        <Text style={[styles.tpVal, { color: C.textPrimary }]}>{minute < 10 ? `0${minute}` : minute}</Text>
        <TouchableOpacity onPress={() => adjust('m', -5)} style={styles.tpArrow}><Text style={{ color: C.accent }}>▼</Text></TouchableOpacity>
      </View>
      <View style={[styles.tpBadge, { backgroundColor: C.accentLight }]}>
        <Text style={[styles.tpBadgeText, { color: C.accent }]}>{ampm}</Text>
      </View>
    </View>
  );
};

import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { tokens } from '@/constants/theme';
import { useAudio } from '@/context/AudioContext';
import { BottomNav } from '@/components/BottomNav';

const C = tokens.colors;

const SheepIcon = ({ size = 80 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <Circle cx={20} cy={22} r={11} fill={C.white} />
    <Circle cx={20} cy={12} r={7} fill={C.white} />
    <Circle cx={17.5} cy={13} r={1.2} fill={C.textPrimary} />
    <Circle cx={22.5} cy={13} r={1.2} fill={C.textPrimary} />
    <Circle cx={13} cy={11} r={2.5} fill={C.lavender} />
    <Circle cx={27} cy={11} r={2.5} fill={C.lavender} />
    <Rect x={14} y={31} width={3} height={5} rx={1.5} fill={C.textMuted} />
    <Rect x={23} y={31} width={3} height={5} rx={1.5} fill={C.textMuted} />
  </Svg>
);

const SettingsIcon = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={C.textSecondary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="3" />
    <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </Svg>
);

const ChevronRight = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M9 18l6-6-6-6" />
  </Svg>
);

// Icons and BottomNav removed

// ─── COMPONENTS ─────────────────────────────────────────────────────────────
const StatCard = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <View style={[styles.statCard, { backgroundColor: color }]}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const SettingsItem = ({ label, value, last }: { label: string; value?: string; last?: boolean }) => (
  <TouchableOpacity style={[styles.settingsItem, last && { borderBottomWidth: 0 }]} activeOpacity={0.6}>
    <Text style={styles.settingsLabel}>{label}</Text>
    <View style={styles.settingsRight}>
      {value && <Text style={styles.settingsValue}>{value}</Text>}
      <ChevronRight />
    </View>
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const { activeSound } = useAudio();
  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView 
          style={styles.scroll} 
          contentContainerStyle={[styles.scrollContent, activeSound && { paddingBottom: 100 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarCircle}>
                <SheepIcon />
              </View>
              <TouchableOpacity style={styles.editBadge}>
                <SettingsIcon size={12} />
              </TouchableOpacity>
            </View>
            <Text style={styles.userName}>Lucas Telpis</Text>
            <Text style={styles.userJoined}>Zen sleeper since March 2026</Text>
          </View>

          {/* Stats */}
          <View style={styles.statsGrid}>
            <StatCard label="Night streak" value="7" color={C.lavender} />
            <StatCard label="Hours slept" value="28.5" color={C.softBlue} />
          </View>

          {/* Settings Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>MY SLEEP</Text>
            <View style={styles.settingsCard}>
              <SettingsItem label="Bedtime goal" value="11:30 PM" />
              <SettingsItem label="Wake up goal" value="7:30 AM" />
              <SettingsItem label="Daily reminders" value="On" last />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ACCOUNT</Text>
            <View style={styles.settingsCard}>
              <SettingsItem label="Subscription" value="Rizzze Pro" />
              <SettingsItem label="Notifications" />
              <SettingsItem label="Support & Feedback" last />
            </View>
          </View>

          <TouchableOpacity style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Log out</Text>
          </TouchableOpacity>
        </ScrollView>

        <BottomNav active="profile" />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bgPrimary },
  safeArea: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 20 },
  header: { alignItems: 'center', marginTop: 32, marginBottom: 32 },
  avatarContainer: { position: 'relative', marginBottom: 16 },
  avatarCircle: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    backgroundColor: C.accentLight, 
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
    backgroundColor: C.white,
    borderWidth: 2,
    borderColor: C.bgPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: { fontFamily: tokens.fonts.heading, fontSize: 24, color: C.textPrimary },
  userJoined: { fontFamily: tokens.fonts.body, fontSize: 13, color: C.textSecondary, marginTop: 4 },
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  statCard: { flex: 1, padding: 16, borderRadius: 20, alignItems: 'center' },
  statValue: { fontFamily: tokens.fonts.heading, fontSize: 22, color: C.textPrimary },
  statLabel: { fontFamily: tokens.fonts.caption, fontSize: 10, color: C.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },
  section: { marginBottom: 24 },
  sectionTitle: { fontFamily: tokens.fonts.caption, fontSize: 11, color: C.textMuted, letterSpacing: 1.2, marginBottom: 10, marginLeft: 4 },
  settingsCard: { backgroundColor: C.white, borderRadius: 20, overflow: 'hidden', paddingHorizontal: 16 },
  settingsItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F5F2EE' },
  settingsLabel: { fontFamily: tokens.fonts.body, fontSize: 15, color: C.textPrimary },
  settingsRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  settingsValue: { fontFamily: tokens.fonts.body, fontSize: 14, color: C.accent },
  logoutBtn: { paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  logoutText: { fontFamily: tokens.fonts.body, fontSize: 15, color: '#D47575' },
  // End of styles
});

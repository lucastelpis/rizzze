import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { tokens } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';

// ─── ICON COMPONENTS ──────────────────────────────────────────────────────────

const HomeNavIcon = ({ active, C }: { active: boolean, C: any }) => (
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

const SleepNavIcon = ({ active, C }: { active: boolean, C: any }) => (
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

const SoundsNavIcon = ({ active, C }: { active: boolean, C: any }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M9 18V5l12-2v13" 
      stroke={active ? C.accent : C.textSecondary} 
      strokeWidth={2} 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    <Circle cx={6} cy={18} r={3} fill={active ? C.accent : 'none'} stroke={active ? C.accent : C.textSecondary} strokeWidth={2} />
    <Circle cx={18} cy={16} r={3} fill={active ? C.accent : 'none'} stroke={active ? C.accent : C.textSecondary} strokeWidth={2} />
  </Svg>
);

const ProfileNavIcon = ({ active, C }: { active: boolean, C: any }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={8} r={4} fill={active ? C.accent : 'none'} stroke={active ? C.accent : C.textSecondary} strokeWidth={2} />
    <Path 
      d="M4 20c0-4 3.6-7 8-7s8 3 8 7" 
      stroke={active ? C.accent : C.textSecondary} 
      strokeWidth={2} 
      strokeLinecap="round" 
    />
  </Svg>
);

// ─── NAVIGATION CONFIG ────────────────────────────────────────────────────────

const NAV_TABS = [
  { key: 'home', label: 'Home', Icon: HomeNavIcon, route: '/(tabs)' },
  { key: 'sleep', label: 'Sleep', Icon: SleepNavIcon, route: '/(tabs)/sleep' },
  { key: 'sounds', label: 'Sounds', Icon: SoundsNavIcon, route: '/(tabs)/sounds' },
  { key: 'profile', label: 'Profile', Icon: ProfileNavIcon, route: '/(tabs)/profile' },
];

interface BottomNavProps {
  active: 'home' | 'sleep' | 'sounds' | 'profile';
}

export const BottomNav = ({ active }: BottomNavProps) => {
  const router = useRouter();
  const C = useColors();

  return (
    <View style={[styles.bottomNav, { backgroundColor: C.bgPrimary, borderTopColor: C.border }]}>
      {NAV_TABS.map(({ key, label, Icon, route }) => {
        const isActive = active === key;
        return (
          <TouchableOpacity
            key={key}
            style={styles.navTab}
            onPress={() => {
              if (!isActive) router.push(route as any);
            }}
            activeOpacity={0.7}
          >
            <Icon active={isActive} C={C} />
            <Text style={[
              styles.navLabel, 
              { color: isActive ? C.accent : C.textMuted },
              !isActive && { opacity: 0.6 }
            ]}>
              {label}
            </Text>
            {isActive && <View style={[styles.navDot, { backgroundColor: C.accent }]} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    height: 68,
    flexDirection: 'row',
    borderTopWidth: 1,
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
    fontFamily: tokens.fonts.caption, // Nunito_800ExtraBold
    fontSize: 10,
    fontWeight: '800',
  },
  navDot: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});

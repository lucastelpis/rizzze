import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { Easing, interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { useColors } from '@/hooks/useColors';
import { useTheme } from '@/context/ThemeContext';
import { tokens } from '@/constants/theme';

export const InfoIcon = ({ size = 12, color = "currentColor" }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="10" />
    <Line x1="12" y1="16" x2="12" y2="12" />
    <Line x1="12" y1="8" x2="12.01" y2="8" />
  </Svg>
);

export const ChevronRight = () => {
  const C = useColors();
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M9 18l6-6-6-6" />
    </Svg>
  );
};

export const StatCard = ({
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

export const SettingsItem = ({
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

export const ToggleSettingsItem = ({ label, sublabel, isEnabled, onToggle }: {
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

const styles = StyleSheet.create({
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
  settingsItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 18, borderBottomWidth: 1 },
  settingsLabelContainer: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  settingsIconWrapper: { width: 24, alignItems: 'center' },
  settingsLabel: { fontFamily: tokens.fonts.body, fontSize: 16 },
  settingsSublabel: { fontFamily: tokens.fonts.body, fontSize: 13, marginTop: 2 },
  settingsRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  settingsValue: { fontFamily: tokens.fonts.body, fontSize: 16 },
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
});

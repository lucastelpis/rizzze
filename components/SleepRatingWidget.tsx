import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import Animated, { FadeIn, FadeOut, ZoomIn, Layout } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { useSleep, getDateKey } from '@/context/SleepContext';
import { tokens } from '@/constants/theme';
import { HeaderSheep } from './HeaderSheep';
import { HeartAnimation } from './HeartAnimation';
import { Sparkle } from './SheepMascot';
import { posthog } from '@/config/posthog';

// ─── CONSTANT QUALITY COLORS ──────────────────────────────────────────────────
const QUALITY_COLORS = {
  bad: '#D4928A',
  badBg: '#F0D8D0',
  badText: '#8B4A40',
  okay: '#E8C88A',
  okayBg: '#F2E8D5',
  okayText: '#8B7030',
  good: '#5A8AB0',
  goodBg: '#C8DEF0',
  goodText: '#2B5A80',
  great: '#8B6DAE',
  greatBg: '#E8DFF0',
  greatText: '#6B5A8E',
  perfect: '#6B9A60',
  perfectBg: '#E5F0E0',
  perfectText: '#4A7A42',
};

// ─── ICONS ────────────────────────────────────────────────────────────────────
const BadFace = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Circle cx={12} cy={12} r={11} fill={color} />
    <Circle cx={8.5} cy={10} r={1.5} fill="#FFFFFF" opacity={0.9} />
    <Circle cx={15.5} cy={10} r={1.5} fill="#FFFFFF" opacity={0.9} />
    <Path d="M8.5 16.5 Q12 13.5 15.5 16.5" stroke="#FFFFFF" strokeWidth={1.5} strokeLinecap="round" fill="none" opacity={0.9} />
  </Svg>
);

const OkayFace = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Circle cx={12} cy={12} r={11} fill={color} />
    <Circle cx={8.5} cy={10} r={1.5} fill="#FFFFFF" opacity={0.9} />
    <Circle cx={15.5} cy={10} r={1.5} fill="#FFFFFF" opacity={0.9} />
    <Line x1={8.5} y1={15.5} x2={15.5} y2={15.5} stroke="#FFFFFF" strokeWidth={1.5} strokeLinecap="round" opacity={0.9} />
  </Svg>
);

const GoodFace = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Circle cx={12} cy={12} r={11} fill={color} />
    <Circle cx={8.5} cy={10} r={1.5} fill="#FFFFFF" opacity={0.9} />
    <Circle cx={15.5} cy={10} r={1.5} fill="#FFFFFF" opacity={0.9} />
    <Path d="M8.5 14.5 Q12 17 15.5 14.5" stroke="#FFFFFF" strokeWidth={1.5} strokeLinecap="round" fill="none" opacity={0.9} />
  </Svg>
);

const GreatFace = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Circle cx={12} cy={12} r={11} fill={color} />
    <Circle cx={8.5} cy={10} r={1.5} fill="#FFFFFF" opacity={0.9} />
    <Circle cx={15.5} cy={10} r={1.5} fill="#FFFFFF" opacity={0.9} />
    <Path d="M8 14 Q12 18 16 14" stroke="#FFFFFF" strokeWidth={1.5} strokeLinecap="round" fill="none" opacity={0.9} />
  </Svg>
);

const PerfectFace = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Circle cx={12} cy={12} r={11} fill={color} />
    <Path d="M7 10 Q8.5 8.5 10 10" stroke="#FFFFFF" strokeWidth={1.5} strokeLinecap="round" fill="none" opacity={0.9} />
    <Path d="M14 10 Q15.5 8.5 17 10" stroke="#FFFFFF" strokeWidth={1.5} strokeLinecap="round" fill="none" opacity={0.9} />
    <Path d="M7.5 14 Q12 19 16.5 14" stroke="#FFFFFF" strokeWidth={1.5} strokeLinecap="round" fill="none" opacity={0.9} />
  </Svg>
);

const ratingOptions = [
  { key: 'bad', label: 'Bad', bg: QUALITY_COLORS.badBg, faceColor: QUALITY_COLORS.bad, labelColor: QUALITY_COLORS.badText, Face: BadFace },
  { key: 'okay', label: 'Okay', bg: QUALITY_COLORS.okayBg, faceColor: QUALITY_COLORS.okay, labelColor: QUALITY_COLORS.okayText, Face: OkayFace },
  { key: 'good', label: 'Good', bg: QUALITY_COLORS.goodBg, faceColor: QUALITY_COLORS.good, labelColor: QUALITY_COLORS.goodText, Face: GoodFace },
  { key: 'great', label: 'Great', bg: QUALITY_COLORS.greatBg, faceColor: QUALITY_COLORS.great, labelColor: QUALITY_COLORS.greatText, Face: GreatFace },
  { key: 'perfect', label: 'Perfect', bg: QUALITY_COLORS.perfectBg, faceColor: QUALITY_COLORS.perfect, labelColor: QUALITY_COLORS.perfectText, Face: PerfectFace },
];

export function SleepRatingWidget() {
  const { colors: C, isDark } = useTheme();
  const { getQuality, rateSleep, hasSeenSuccessToday, markSuccessSeen } = useSleep();
  const todayKey = getDateKey();

  const handleRateSleep = (key: string) => {
    rateSleep(todayKey, key as any);
    posthog.capture('sleep_rating_submitted', { rating: key });
  };
  const selectedRating = getQuality(todayKey);

  // Mark success as seen after it renders once with animation
  React.useEffect(() => {
    if (selectedRating && !hasSeenSuccessToday) {
      const timer = setTimeout(() => {
        markSuccessSeen();
      }, 1000); // Wait for animation to finish
      return () => clearTimeout(timer);
    }
  }, [selectedRating, hasSeenSuccessToday]);

  return (
    <Animated.View layout={Layout.springify().damping(15)} style={styles.container}>
      {selectedRating ? (
        <Animated.View 
          entering={hasSeenSuccessToday ? undefined : ZoomIn.springify().damping(12).delay(100)}
          style={[styles.successCard, { 
            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : C.accentLight,
          }]}
        >
          <View style={styles.successLeft}>
            <View style={styles.successTextBlock}>
              <Text style={[styles.successHeading, { color: C.textPrimary }]}>
                Daily check-in done! <Sparkle size={14} color={C.accent} />
              </Text>
              <Text style={[styles.successBody, { color: C.textMuted }]}>
                Your routine sheep grows strong
              </Text>
            </View>
            
            <View style={styles.interactiveRow}>
              {ratingOptions.map(({ key, Face, bg, faceColor }) => {
                const isSelected = key === selectedRating;
                return (
                  <TouchableOpacity 
                    key={key} 
                    onPress={() => handleRateSleep(key)}
                    activeOpacity={0.6}
                    style={[
                      styles.interactiveItem,
                      isSelected && [styles.interactiveItemSelected, { backgroundColor: bg }],
                    ]}
                  >
                    <Face color={isSelected ? faceColor : (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)')} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.mascotWrapper}>
            <HeaderSheep size={60} />
            <HeartAnimation />
          </View>
        </Animated.View>
      ) : (
        <Animated.View exiting={FadeOut.duration(200)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.overline, { color: C.textSecondary }]}>HOW DID YOU SLEEP?</Text>
          </View>
          <Text style={[styles.helperText, { color: C.textMuted }]}>
            Tap to rate today
          </Text>

          <View style={styles.ratingRow}>
            {ratingOptions.map(({ key, label, bg, faceColor, labelColor, Face }) => (
              <TouchableOpacity 
                key={key} 
                onPress={() => handleRateSleep(key)}
                style={styles.ratingItem}
                activeOpacity={0.7}
              >
                <View style={[styles.ratingIcon, { backgroundColor: bg }]}>
                  <Face color={faceColor} />
                </View>
                <Text style={[styles.ratingLabel, { color: labelColor }]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  section: { gap: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  overline: { fontFamily: tokens.fonts.caption, fontSize: 11, letterSpacing: 1.1, fontWeight: '800' },
  helperText: { fontFamily: tokens.fonts.body, fontSize: 12, marginTop: -8 },
  ratingRow: { flexDirection: 'row', justifyContent: 'space-between' },
  ratingItem: { alignItems: 'center', gap: 6 },
  ratingIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  ratingLabel: { fontFamily: tokens.fonts.caption, fontSize: 10 },
  successCard: { 
    borderRadius: 20, 
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    gap: 8,
    minHeight: 114,
  },
  successLeft: { flex: 1, gap: 10 },
  successTextBlock: { gap: 2 },
  successHeading: { fontFamily: tokens.fonts.heading, fontSize: 15 },
  successBody: { fontFamily: tokens.fonts.body, fontSize: 12 },
  interactiveRow: { flexDirection: 'row', gap: 4 },
  interactiveItem: { 
    width: 38, 
    height: 38, 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center', 
  },
  interactiveItemSelected: {
    transform: [{ scale: 1.15 }],
  },
  mascotWrapper: { width: 80, height: 80, alignItems: 'center', justifyContent: 'center' },
});

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Line, Rect } from 'react-native-svg';
import Animated, { FadeIn, FadeOut, ZoomIn, Layout } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useSleep, getDateKey } from '@/context/SleepContext';
import { useSheepGrowth } from '@/context/SheepGrowthContext';
import { tokens } from '@/constants/theme';
import { HeaderSheep } from './HeaderSheep';
import { HeartAnimation } from './HeartAnimation';
import { CommentModal } from './CommentModal';
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

const ProgressCircle = ({ size = 80, strokeWidth = 5, progress = 0, color = "#8B6DAE", isDark = false }: { size?: number, strokeWidth?: number, progress: number, color?: string, isDark?: boolean }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress * circumference);

  return (
    <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.06)"}
        strokeWidth={strokeWidth}
        fill="transparent"
      />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        fill="transparent"
      />
    </Svg>
  );
};

export function SleepRatingWidget() {
  const { colors: C, isDark } = useTheme();
  const { getQuality, getNote, rateSleep, hasSeenSuccessToday, markSuccessSeen } = useSleep();
  const todayKey = getDateKey();
  const [isNoteModalVisible, setIsNoteModalVisible] = React.useState(false);

  const handleRateSleep = (key: string) => {
    rateSleep(todayKey, key as any);
    posthog.capture('sleep_rating_submitted', { rating: key });
  };
  const selectedRating = getQuality(todayKey);
  const currentNote = getNote(todayKey);

  const handleSaveNote = (text: string) => {
    rateSleep(todayKey, selectedRating, text);
    posthog.capture('sleep_note_saved', { length: text.length });
  };

    const {
    currentStageName,
    progressToNextStage,
    pointsInCurrentStage,
    pointsForNextStage,
    isMaxStage,
  } = useSheepGrowth();

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
          style={styles.successWrapper}
        >
          <LinearGradient
            colors={isDark ? ['#2D2844', '#1F1B2E'] : ['#EDE5F5', '#F5EEE6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.successCard, { justifyContent: 'center' }]}
          >
            <View style={styles.successContentRow}>
              <View style={styles.successLeft}>
                <View style={styles.successTextBlock}>
                  <Text style={[styles.successHeading, { color: C.textPrimary }]}>
                    Check-in done! ✨
                  </Text>
                  <Text style={[styles.successBody, { color: isDark ? C.textSecondary : C.textPrimary, opacity: 0.8 }]}>
                    Your sheep grows strong
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
                          isSelected && [styles.interactiveItemSelected, { backgroundColor: bg, borderWidth: 2, borderColor: faceColor, overflow: 'hidden' }],
                          selectedRating && !isSelected && { opacity: 0.5 }
                        ]}
                      >
                        <Face color={isSelected ? faceColor : (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)')} />
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <TouchableOpacity 
                  style={[
                    styles.notePreviewBtn, 
                    { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(139, 109, 174, 0.06)' },
                    currentNote && { borderColor: C.accent + '30', borderWidth: 1 }
                  ]}
                  onPress={() => setIsNoteModalVisible(true)}
                >
                  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                    <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke={C.accent} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke={C.accent} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                  <Text 
                    numberOfLines={1} 
                    style={[styles.notePreviewText, { color: currentNote ? C.textPrimary : C.textSecondary }]}
                  >
                    {currentNote ? 'View / Edit thought' : 'Add a thought...'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.successRight}>
                <View style={styles.auraContainer}>
                  <ProgressCircle 
                    size={76} 
                    progress={Math.max(0.1, progressToNextStage)} 
                    color={isDark ? C.accent : "#8B6DAE"} 
                    isDark={isDark}
                  />
                  <View style={styles.auraMascot}>
                    <HeaderSheep size={48} />
                    <HeartAnimation opacity={0.6} />
                  </View>
                </View>
                <View style={styles.statusBadge}>
                    <Text style={[styles.stageText, { color: C.textPrimary }]}>
                      {(currentStageName || '').toLowerCase().split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </Text>
                    <Text style={[styles.progressCountText, { color: isDark ? C.textMuted : C.textSecondary }]}>
                       {isMaxStage ? 'Fluffy Elder' : `${pointsInCurrentStage}/${pointsForNextStage} check-ins`}
                    </Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      ) : (
        <Animated.View 
          exiting={FadeOut.duration(200)} 
          style={styles.successWrapper}
        >
          <View style={[styles.successCard, { backgroundColor: C.bgCard, justifyContent: 'center', gap: 24 }]}>
            <View style={{ gap: 12 }}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.overline, { color: C.textSecondary }]}>HOW DID YOU SLEEP?</Text>
              </View>
              <Text style={[styles.helperText, { color: C.textMuted }]}>
                Tap to rate today
              </Text>
            </View>

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
          </View>
        </Animated.View>
      )}

      <CommentModal
        isVisible={isNoteModalVisible}
        initialValue={currentNote || ''}
        onSave={handleSaveNote}
        onClose={() => setIsNoteModalVisible(false)}
      />
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
  successWrapper: { 
    width: '100%', 
    borderRadius: 28, 
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  successCard: { 
    padding: 16,
    minHeight: 170,
  },
  successContentRow: { 
    flexDirection: 'row', 
    gap: 12,
    alignItems: 'center',
  },
  successLeft: {
    flex: 2,
    gap: 12,
  },
  successRight: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  auraContainer: {
    width: 76,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
  },
  auraMascot: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTextBlock: { gap: 1 },
  successHeading: { fontFamily: tokens.fonts.heading, fontSize: 16, fontWeight: '800' },
  successBody: { fontFamily: tokens.fonts.body, fontSize: 12 },
  interactiveRow: { flexDirection: 'row', gap: 4 },
  interactiveItem: { 
    width: 36, 
    height: 36, 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  interactiveItemSelected: {
    transform: [{ scale: 1.1 }],
  },
  progressCountText: { 
    fontFamily: tokens.fonts.caption, 
    fontSize: 10, 
    fontWeight: '700',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  stageText: {
    fontFamily: tokens.fonts.heading,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 1,
    textAlign: 'center',
  },
  statusBadge: {
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  notePreviewBtn: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
  },
  notePreviewText: {
    fontFamily: tokens.fonts.body,
    fontSize: 13,
  },
});

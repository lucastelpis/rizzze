import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';
import { useAudio } from '@/context/AudioContext';
import { BottomNav } from '@/components/BottomNav';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { Modal, Pressable } from 'react-native';

// ─── COLORS ───────────────────────────────────────────────────────────────────
const C = {
  bg: '#F8F4EE',
  accent: '#8B6DAE',
  accentLight: '#EDE5F5',
  textPrimary: '#2D2B3D',
  textSecondary: '#7A7589',
  textMuted: '#A9A3B5',
  border: '#E8E2D8',
  white: '#FFFFFF',
  // Sleep quality colors
  bad: '#D4928A',
  badBg: '#F0D8D0',
  badText: '#8B4A40',
  okay: '#E8C88A',
  okayBg: 'rgba(232,200,138,0.2)',
  okayText: '#8B7030',
  good: '#5A8AB0',
  goodBg: '#C8DEF0',
  goodText: '#2B5A80',
  great: '#8B6DAE',
  greatBg: '#E8DFF0',
  greatText: '#6B5A8E',
  perfect: '#6B9A60',
  perfectBg: 'rgba(168,197,160,0.2)',
  perfectText: '#4A7A42',
  noData: '#F0EBE3',
  noDataText: '#A9A3B5',
  lavender: '#E8DFF0',
};

// ─── NAV ICONS ────────────────────────────────────────────────────────────────
// Bottom Nav Icons removed

// ─── CHEVRON ICONS ────────────────────────────────────────────────────────────
const ChevronLeft = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M15 18l-6-6 6-6" stroke={C.textSecondary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ChevronRight = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M9 18l6-6-6-6" stroke={C.textSecondary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const SheepIcon = ({ size = 28 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <Circle cx={20} cy={22} r={11} fill={C.white} />
    <Circle cx={20} cy={12} r={7} fill={C.white} />
    <Circle cx={17.5} cy={13} r={1.2} fill={C.textPrimary} />
    <Circle cx={22.5} cy={13} r={1.2} fill={C.textPrimary} />
    <Circle cx={13} cy={11} r={2.5} fill={C.lavender} />
    <Circle cx={27} cy={11} r={2.5} fill={C.lavender} />
    <Rect x={14} y={31} width={3} height={5} rx={1.5} fill={'#A9A3B5'} />
    <Rect x={23} y={31} width={3} height={5} rx={1.5} fill={'#A9A3B5'} />
  </Svg>
);

const ArrowRight = ({ color = C.accent }: { color?: string }) => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path d="M5 12h14M12 5l7 7-7 7" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ─── FACE ICONS ───────────────────────────────────────────────────────────────
// Bad: frown
const BadFace = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Circle cx={12} cy={12} r={11} fill={color} />
    <Circle cx={8.5} cy={10} r={1.5} fill="#FFFFFF" opacity={0.9} />
    <Circle cx={15.5} cy={10} r={1.5} fill="#FFFFFF" opacity={0.9} />
    <Path d="M8.5 16.5 Q12 13.5 15.5 16.5" stroke="#FFFFFF" strokeWidth={1.5} strokeLinecap="round" fill="none" opacity={0.9} />
  </Svg>
);

// Okay: flat mouth
const OkayFace = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Circle cx={12} cy={12} r={11} fill={color} />
    <Circle cx={8.5} cy={10} r={1.5} fill="#FFFFFF" opacity={0.9} />
    <Circle cx={15.5} cy={10} r={1.5} fill="#FFFFFF" opacity={0.9} />
    <Line x1={8.5} y1={15.5} x2={15.5} y2={15.5} stroke="#FFFFFF" strokeWidth={1.5} strokeLinecap="round" opacity={0.9} />
  </Svg>
);

// Good: slight smile
const GoodFace = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Circle cx={12} cy={12} r={11} fill={color} />
    <Circle cx={8.5} cy={10} r={1.5} fill="#FFFFFF" opacity={0.9} />
    <Circle cx={15.5} cy={10} r={1.5} fill="#FFFFFF" opacity={0.9} />
    <Path d="M8.5 14.5 Q12 17 15.5 14.5" stroke="#FFFFFF" strokeWidth={1.5} strokeLinecap="round" fill="none" opacity={0.9} />
  </Svg>
);

// Great: smile
const GreatFace = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Circle cx={12} cy={12} r={11} fill={color} />
    <Circle cx={8.5} cy={10} r={1.5} fill="#FFFFFF" opacity={0.9} />
    <Circle cx={15.5} cy={10} r={1.5} fill="#FFFFFF" opacity={0.9} />
    <Path d="M8 14 Q12 18 16 14" stroke="#FFFFFF" strokeWidth={1.5} strokeLinecap="round" fill="none" opacity={0.9} />
  </Svg>
);

// Perfect: big smile + squinted happy eyes
const PerfectFace = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Circle cx={12} cy={12} r={11} fill={color} />
    {/* Squinted eyes */}
    <Path d="M7 10 Q8.5 8.5 10 10" stroke="#FFFFFF" strokeWidth={1.5} strokeLinecap="round" fill="none" opacity={0.9} />
    <Path d="M14 10 Q15.5 8.5 17 10" stroke="#FFFFFF" strokeWidth={1.5} strokeLinecap="round" fill="none" opacity={0.9} />
    {/* Big open smile */}
    <Path d="M7.5 14 Q12 19 16.5 14" stroke="#FFFFFF" strokeWidth={1.5} strokeLinecap="round" fill="none" opacity={0.9} />
  </Svg>
);

// ─── RATING OPTIONS ───────────────────────────────────────────────────────────
const ratingOptions = [
  { key: 'bad', label: 'Bad', bg: C.badBg, faceColor: C.bad, labelColor: C.badText, Face: BadFace },
  { key: 'okay', label: 'Okay', bg: C.okayBg, faceColor: C.okay, labelColor: C.okayText, Face: OkayFace },
  { key: 'good', label: 'Good', bg: C.goodBg, faceColor: C.good, labelColor: C.goodText, Face: GoodFace },
  { key: 'great', label: 'Great', bg: C.greatBg, faceColor: C.great, labelColor: C.greatText, Face: GreatFace },
  { key: 'perfect', label: 'Perfect', bg: C.perfectBg, faceColor: C.perfect, labelColor: C.perfectText, Face: PerfectFace },
];

// ─── CALENDAR DATA ────────────────────────────────────────────────────────────
// March 2026 starts on Sunday (index 6 in M-T-W-T-F-S-S grid = col 6)
// Day 1 = Sunday → offset of 6 empty cells in Mon-first grid
type SleepQuality = 'bad' | 'okay' | 'good' | 'great' | 'perfect' | null;

const marchData: SleepQuality[] = [
  'good', 'perfect', 'great', 'perfect', 'good', 'okay', 'bad', // 1-7
  'good', 'great', 'perfect', 'great', 'good', 'great', 'perfect', // 8-14
  'great', 'good', 'perfect', 'perfect', 'great', 'good', 'okay', // 15-21
  'great', 'perfect', 'great', 'perfect', null, // 22-26 (today=26)
  null, null, null, null, null, // 27-31 future
];
// Override day 1 manually
marchData[0] = null; // day 1: no data (weekend at start, or just mark as noData for variety)

// Actually let's make day 1 noData (it was a Sunday, far back), day 2 = bad
// The array is 0-indexed: index 0 = day 1, index 25 = day 26 (today)

const TODAY_DAY = new Date().getDate();
const ACTUAL_MONTH = new Date().getMonth();
const ACTUAL_YEAR = new Date().getFullYear();

// Yesterday's date for record keeping
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const YEST_DAY = yesterday.getDate();
const YEST_MONTH = yesterday.getMonth();
const YEST_YEAR = yesterday.getFullYear();
const YEST_KEY = `${YEST_YEAR}-${YEST_MONTH + 1}-${YEST_DAY}`;

const STORAGE_KEY = 'rizzze_sleep_data';
const SETTINGS_KEY = 'rizzze_sleep_settings';

const MONTH_NAMES = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
];

const SLEEP_TIPS = [
  { title: "Improve Deep Sleep", text: "Reducing blue light 1 hour before bed can improve your deep sleep by up to 20%." },
  { title: "Stable Schedule", text: "Going to bed and waking up at the same time every day stabilizes your rhythm." },
  { title: "Perfect Temp", text: "A room temperature between 18-22°C (64-72°F) is ideal for restorative sleep." },
  { title: "Limit Caffeine", text: "Avoid caffeine at least 6-8 hours before bed so your system can clear it." },
  { title: "Morning Sun", text: "Exposing yourself to sunlight within 30 min of waking helps regulate your cycle." },
];

// Removed local BottomNav component

// ─── TOGGLE SWITCH REMOVED ───

// ─── LEGEND ITEM ──────────────────────────────────────────────────────────────
const LegendItem = ({ color, label }: { color: string; label: string }) => (
  <View style={styles.legendItem}>
    <View style={[styles.legendSwatch, { backgroundColor: color }]} />
    <Text style={styles.legendLabel}>{label}</Text>
  </View>
);

// ─── GET CELL COLOR ───────────────────────────────────────────────────────────
function getCellColor(quality: SleepQuality): { bg: string; textColor: string } {
  switch (quality) {
    case 'bad': return { bg: C.bad, textColor: '#FFFFFF' };
    case 'okay': return { bg: C.okay, textColor: '#FFFFFF' };
    case 'good': return { bg: C.good, textColor: '#FFFFFF' };
    case 'great': return { bg: C.great, textColor: '#FFFFFF' };
    case 'perfect': return { bg: C.perfect, textColor: '#FFFFFF' };
    default: return { bg: C.noData, textColor: C.noDataText };
  }
}

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
export default function SleepScreen() {
  const [selectedRating, setSelectedRating] = useState<string | null>(null);
  const [sleepData, setSleepData] = useState<Record<string, SleepQuality>>({});
  const [currentMonth, setCurrentMonth] = useState(ACTUAL_MONTH);
  const [currentYear, setCurrentYear] = useState(ACTUAL_YEAR);
  const [tipIndex, setTipIndex] = useState(0);
  const [evalTarget, setEvalTarget] = useState<{ day: number, month: number, year: number, dateKey: string } | null>(null);
  const [displayTarget, setDisplayTarget] = useState(evalTarget);
  const router = useRouter();

  useEffect(() => {
    if (evalTarget) setDisplayTarget(evalTarget);
  }, [evalTarget]);
  
  const { activeSound } = useAudio();

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const sleepVal = await AsyncStorage.getItem(STORAGE_KEY);
        if (sleepVal != null) setSleepData(JSON.parse(sleepVal));
      } catch (e) {
        console.error('Failed to load sleep data', e);
      }
    };
    loadData();
  }, []);

  const changeMonth = (dir: 'prev' | 'next') => {
    if (dir === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  // Save rating for a specific date
  const handleRateDate = async (dateKey: string, quality: SleepQuality) => {
    const newSleepData = { ...sleepData, [dateKey]: quality };
    if (dateKey === YEST_KEY) {
      setSelectedRating(quality as string);
    }
    setSleepData(newSleepData);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSleepData));
    } catch (e) {
      console.error('Failed to save sleep data', e);
    }
    setEvalTarget(null);
  };

  const handleRateToday = (quality: SleepQuality) => {
    handleRateDate(YEST_KEY, quality);
  };

  // Compute calendar for current month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  // JS getDay(): 0=Sun, 1=Mon, ..., 6=Sat
  // Our grid is Mon-first (OFFSET: 0=Mon, 1=Tue, ..., 6=Sun)
  const OFFSET = (firstDayOfMonth + 6) % 7; 
  const DAYS_IN_MONTH = new Date(currentYear, currentMonth + 1, 0).getDate();
  const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const nextTip = () => {
    setTipIndex((prev) => (prev + 1) % SLEEP_TIPS.length);
  };

  // Build grid
  const gridCells: number[] = [];
  for (let i = 0; i < OFFSET; i++) gridCells.push(0);
  for (let d = 1; d <= DAYS_IN_MONTH; d++) gridCells.push(d);
  while (gridCells.length % 7 !== 0) gridCells.push(0);

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
          {/* ── HEADER ── */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Sleep</Text>
              <Text style={styles.headerSubtitle}>Track, plan, and improve</Text>
            </View>
            <TouchableOpacity style={styles.sheepButton} activeOpacity={0.8} onPress={() => router.push('/profile')}>
              <SheepIcon size={30} />
            </TouchableOpacity>
          </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, activeSound && { paddingBottom: 100 }]}
          showsVerticalScrollIndicator={false}
        >

          {/* ── HOW DID YOU SLEEP? ── */}
          <View style={[styles.section, styles.ratingSectionPadding]}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.overline}>HOW DID YOU SLEEP?</Text>
              <Text style={styles.lastNightText}>Last night</Text>
            </View>
            <Text style={styles.helperText}>Tap to rate today</Text>

            <View style={styles.ratingRow}>
              {ratingOptions.map(({ key, label, bg, faceColor, labelColor, Face }) => {
                const isSelected = selectedRating === key || sleepData[YEST_KEY] === key;
                return (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.ratingOptionWrapper,
                      (selectedRating !== null || sleepData[YEST_KEY]) && !isSelected && { opacity: 0.5 }
                    ]}
                    onPress={() => handleRateToday(key as SleepQuality)}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.ratingOption,
                        { backgroundColor: bg },
                        isSelected && styles.ratingOptionSelected,
                        isSelected && { borderColor: faceColor, borderWidth: 2 }
                      ]}
                    >
                      <Face color={faceColor} />
                    </View>
                    <Text style={[
                      styles.ratingLabel, 
                      { color: labelColor },
                      isSelected && { fontFamily: 'Nunito_900Black' }
                    ]}>{label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ── SLEEP TIP ── */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.overline}>SLEEP TIP</Text>
              <TouchableOpacity style={styles.nextTipRow} onPress={nextTip} activeOpacity={0.7}>
                <Text style={styles.nextTipLabel}>Next tip</Text>
                <ArrowRight />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.tipCard} activeOpacity={0.9} onPress={nextTip}>
              <View style={styles.tipIconBg}>
                <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <Path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke={C.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <Path d="M12 16V12" stroke={C.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <Path d="M12 8H12.01" stroke={C.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>{SLEEP_TIPS[tipIndex].title}</Text>
                <Text style={styles.tipText}>{SLEEP_TIPS[tipIndex].text}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* ── CALENDAR ── */}
          <View style={[styles.section, { paddingBottom: 40 }]}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.overline}>{MONTH_NAMES[currentMonth]} {currentYear}</Text>
              <View style={styles.chevronRow}>
                <TouchableOpacity 
                  style={styles.chevronBtn} 
                  activeOpacity={0.7}
                  onPress={() => changeMonth('prev')}
                >
                  <ChevronLeft />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.chevronBtn} 
                  activeOpacity={0.7}
                  onPress={() => changeMonth('next')}
                >
                  <ChevronRight />
                </TouchableOpacity>
              </View>
            </View>

            {/* Day labels */}
            <View style={styles.dayLabelsRow}>
              {DAY_LABELS.map((d, i) => (
                <Text key={i} style={styles.dayHeaderLabel}>{d}</Text>
              ))}
            </View>

            {/* Calendar grid */}
            <View style={styles.calendarGrid}>
              {Array.from({ length: Math.ceil(gridCells.length / 7) }).map((_, rowIdx) => (
                <View key={rowIdx} style={styles.calendarRow}>
                  {gridCells.slice(rowIdx * 7, rowIdx * 7 + 7).map((day, colIdx) => {
                    if (day === 0) {
                      return <View key={colIdx} style={styles.calendarCellEmpty} />;
                    }
                    const dayKey = `${currentYear}-${currentMonth + 1}-${day}`;
                    const quality = sleepData[dayKey] || null;
                    const { bg, textColor } = getCellColor(quality);
                    const isToday = day === TODAY_DAY && currentMonth === ACTUAL_MONTH && currentYear === ACTUAL_YEAR;
                    const isPast = new Date(currentYear, currentMonth, day) < new Date(ACTUAL_YEAR, ACTUAL_MONTH, TODAY_DAY);
                    const isFuture = !isToday && !isPast;
                    
                    return (
                      <TouchableOpacity
                        key={colIdx}
                        disabled={!isPast}
                        onPress={() => setEvalTarget({ day, month: currentMonth, year: currentYear, dateKey: dayKey })}
                        style={[
                          styles.calendarCell,
                          { backgroundColor: bg },
                          isToday && styles.calendarCellToday,
                          isFuture && { opacity: 0.35 },
                        ]}
                      >
                        <Text
                          style={[
                            styles.calendarCellText,
                            { color: textColor },
                            isToday && styles.calendarCellTodayText,
                            quality === null && styles.calendarCellNoDataText,
                          ]}
                        >
                          {day}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
            {/* Legend */}
            <View style={styles.legendRow}>
              <LegendItem color={C.bad} label="Bad" />
              <LegendItem color={C.okay} label="Okay" />
              <LegendItem color={C.good} label="Good" />
              <LegendItem color={C.great} label="Great" />
              <LegendItem color={C.perfect} label="Perfect" />
              <LegendItem color={C.noData} label="No data" />
            </View>
          </View>

          {/* ── EVALUATION MODAL ── */}
          <Modal
            animationType="fade"
            transparent={true}
            visible={!!evalTarget}
            onRequestClose={() => setEvalTarget(null)}
          >
            <View style={styles.modalOverlay}>
              <Pressable style={styles.modalBg} onPress={() => setEvalTarget(null)} />
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>How did you sleep?</Text>
                <Text style={styles.modalSubtitle}>
                  {displayTarget && `${displayTarget.day} ${MONTH_NAMES[displayTarget.month]} ${displayTarget.year}`}
                </Text>
                
                <View style={styles.modalRatingRow}>
                  {ratingOptions.map(({ key, bg, faceColor, Face }) => (
                    <TouchableOpacity
                      key={key}
                      style={[styles.modalRatingOption, { backgroundColor: bg }]}
                      onPress={() => displayTarget && handleRateDate(displayTarget.dateKey, key as SleepQuality)}
                    >
                      <Face color={faceColor} />
                    </TouchableOpacity>
                  ))}
                </View>
                
                <TouchableOpacity style={styles.closeModalBtn} onPress={() => setEvalTarget(null)}>
                  <Text style={styles.closeModalText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

        </ScrollView>

        <BottomNav active="sleep" />
      </SafeAreaView>
    </View>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },

  // Header
  header: {
    paddingHorizontal: 24,
    marginTop: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Nunito_900Black',
    fontSize: 28,
    fontWeight: '900',
    color: C.textPrimary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 15,
    fontWeight: '600',
    color: C.textSecondary,
    marginTop: -2,
  },
  sheepButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.lavender,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 107, 174, 0.15)',
  },

  // Section
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
    gap: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  overline: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 11,
    fontWeight: '800',
    color: C.textSecondary,
    letterSpacing: 1.1,
  },
  lastNightText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 12,
    fontWeight: '700',
    color: C.accent,
  },
  helperText: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 12,
    fontWeight: '500',
    color: C.textMuted,
    marginTop: -10,
  },

  ratingSectionPadding: {
    paddingBottom: 16,
  },
  // Rating
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratingOptionWrapper: {
    alignItems: 'center',
    gap: 6,
  },
  ratingOption: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingOptionSelected: {
    shadowColor: '#2D2B3D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  ratingLabel: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 10,
    fontWeight: '700',
  },

  // Chevrons
  chevronRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  chevronBtn: {
    padding: 2,
  },

  // Calendar
  dayLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -6,
  },
  dayHeaderLabel: {
    width: 38,
    textAlign: 'center',
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 10,
    fontWeight: '700',
    color: C.textMuted,
  },
  calendarGrid: {
    gap: 4,
    marginTop: -6,
  },
  calendarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  calendarCell: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarCellEmpty: {
    width: 38,
    height: 38,
  },
  calendarCellToday: {
    borderWidth: 2,
    borderColor: C.textPrimary,
  },
  calendarCellText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 12,
    fontWeight: '700',
  },
  calendarCellTodayText: {
    fontWeight: '800',
  },
  calendarCellNoDataText: {
    fontWeight: '600',
  },

  // Legend
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: -4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendSwatch: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  legendLabel: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 10,
    fontWeight: '600',
    color: C.textSecondary,
  },

  // Sleep Tip
  tipCard: {
    backgroundColor: C.accentLight,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  tipIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipContent: {
    flex: 1,
    gap: 2,
  },
  tipTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 14,
    color: C.accent,
  },
  tipText: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 12,
    color: C.textSecondary,
    lineHeight: 16,
  },
  nextTipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  nextTipLabel: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 11,
    fontWeight: '800',
    color: C.accent,
  },

  // Modal (Generic from alarm, repurposed for eval)
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(45, 43, 61, 0.4)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: C.white,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontFamily: 'Nunito_900Black',
    fontSize: 18,
    color: C.textPrimary,
  },
  modalSubtitle: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: C.textSecondary,
    marginBottom: 24,
    marginTop: 4,
  },
  modalRatingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  modalRatingOption: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeModalBtn: {
    marginTop: 8,
    paddingVertical: 8,
  },
  closeModalText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: C.textMuted,
  },

  // End of styles
});

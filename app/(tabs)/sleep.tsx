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
};

// ─── NAV ICONS ────────────────────────────────────────────────────────────────
const HomeNavIcon = ({ active }: { active: boolean }) => (
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

const SleepNavIcon = ({ active }: { active: boolean }) => (
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

const SoundsNavIcon = ({ active }: { active: boolean }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 18V5l12-2v13"
      stroke={active ? C.accent : C.textSecondary}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx={6} cy={18} r={3} stroke={active ? C.accent : C.textSecondary} strokeWidth={2} />
    <Circle cx={18} cy={16} r={3} stroke={active ? C.accent : C.textSecondary} strokeWidth={2} />
  </Svg>
);

const ProfileNavIcon = ({ active }: { active: boolean }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={8} r={4} stroke={active ? C.accent : C.textSecondary} strokeWidth={2} />
    <Path
      d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
      stroke={active ? C.accent : C.textSecondary}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

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

const TODAY_DAY = 26;

// ─── BOTTOM NAV ───────────────────────────────────────────────────────────────
const navTabs = [
  { key: 'home', label: 'Home', Icon: HomeNavIcon, route: '/(tabs)' },
  { key: 'sleep', label: 'Sleep', Icon: SleepNavIcon, route: '/(tabs)/sleep' },
  { key: 'sounds', label: 'Sounds', Icon: SoundsNavIcon, route: '/(tabs)/sounds' },
  { key: 'profile', label: 'Profile', Icon: ProfileNavIcon, route: '/(tabs)/profile' },
];

const BottomNav = ({ active }: { active: string }) => {
  const router = useRouter();
  return (
    <View style={styles.bottomNav}>
      {navTabs.map(({ key, label, Icon, route }) => {
        const isActive = active === key;
        return (
          <TouchableOpacity
            key={key}
            style={[styles.navTab, !isActive && { opacity: 0.4 }]}
            onPress={() => {
              if (!isActive) router.push(route as any);
            }}
            activeOpacity={0.7}
          >
            <Icon active={isActive} />
            <Text style={[styles.navLabel, isActive ? styles.navLabelActive : styles.navLabelInactive]}>
              {label}
            </Text>
            {isActive && <View style={styles.navDot} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// ─── TOGGLE SWITCH ────────────────────────────────────────────────────────────
const AlarmToggle = ({ value, onToggle }: { value: boolean; onToggle: () => void }) => (
  <TouchableOpacity
    onPress={onToggle}
    style={[styles.toggle, { backgroundColor: value ? C.accent : C.border }]}
    activeOpacity={0.85}
  >
    <View style={[styles.toggleThumb, { alignSelf: value ? 'flex-end' : 'flex-start' }]} />
  </TouchableOpacity>
);

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
  const [alarmOn, setAlarmOn] = useState(true);
  const [selectedRating, setSelectedRating] = useState<string | null>(null);

  // March 2026: day 1 = Sunday
  // In Mon-first grid (M T W T F S S), Sunday is column index 6
  // So offset = 6 empty cells before day 1
  const OFFSET = 6;
  const DAYS_IN_MONTH = 31;
  const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  // Build grid: 6 rows x 7 cols = 42 cells
  // cells[i]: day number or 0 for empty
  const gridCells: number[] = [];
  for (let i = 0; i < OFFSET; i++) gridCells.push(0);
  for (let d = 1; d <= DAYS_IN_MONTH; d++) gridCells.push(d);
  while (gridCells.length % 7 !== 0) gridCells.push(0);

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── HEADER ── */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Sleep</Text>
            <Text style={styles.headerSubtitle}>Track, plan, and improve</Text>
          </View>

          {/* ── ALARM CARD ── */}
          <View style={styles.alarmCard}>
            <View style={styles.alarmRow}>
              {/* Left */}
              <View style={styles.alarmLeft}>
                <Text style={styles.alarmOverline}>ALARM SET FOR</Text>
                <Text style={styles.alarmTime}>23:00</Text>
              </View>
              {/* Right */}
              <View style={styles.alarmRight}>
                <AlarmToggle value={alarmOn} onToggle={() => setAlarmOn(!alarmOn)} />
                <Text style={styles.wakeText}>Wake: 07:00</Text>
              </View>
            </View>
            {/* Buttons */}
            <View style={styles.alarmButtons}>
              <TouchableOpacity style={styles.editBtn} activeOpacity={0.85}>
                <Text style={styles.editBtnText}>Edit alarm</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.soundsBtn} activeOpacity={0.85}>
                <Text style={styles.soundsBtnText}>Sleep sounds</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── HOW DID YOU SLEEP? ── */}
          <View style={[styles.section, styles.ratingSectionPadding]}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.overline}>HOW DID YOU SLEEP?</Text>
              <Text style={styles.lastNightText}>Last night</Text>
            </View>
            <Text style={styles.helperText}>Tap to rate today</Text>

            <View style={styles.ratingRow}>
              {ratingOptions.map(({ key, label, bg, faceColor, labelColor, Face }) => {
                const isSelected = selectedRating === key;
                return (
                  <TouchableOpacity
                    key={key}
                    style={styles.ratingOptionWrapper}
                    onPress={() => setSelectedRating(key)}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.ratingOption,
                        { backgroundColor: bg },
                        isSelected && styles.ratingOptionSelected,
                      ]}
                    >
                      <Face color={faceColor} />
                    </View>
                    <Text style={[styles.ratingLabel, { color: labelColor }]}>{label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ── CALENDAR ── */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.overline}>MARCH 2026</Text>
              <View style={styles.chevronRow}>
                <TouchableOpacity style={styles.chevronBtn} activeOpacity={0.7}>
                  <ChevronLeft />
                </TouchableOpacity>
                <TouchableOpacity style={styles.chevronBtn} activeOpacity={0.7}>
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
                    const dayIndex = day - 1;
                    const quality = dayIndex < marchData.length ? marchData[dayIndex] : null;
                    const { bg, textColor } = getCellColor(quality);
                    const isToday = day === TODAY_DAY;
                    return (
                      <View
                        key={colIdx}
                        style={[
                          styles.calendarCell,
                          { backgroundColor: bg },
                          isToday && styles.calendarCellToday,
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
                      </View>
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
        </ScrollView>

        {/* ── BOTTOM NAV ── */}
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
    paddingVertical: 8,
    gap: 2,
  },
  headerTitle: {
    fontFamily: 'Nunito_900Black',
    fontSize: 22,
    fontWeight: '900',
    color: C.textPrimary,
    letterSpacing: -0.44,
  },
  headerSubtitle: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 13,
    fontWeight: '500',
    color: C.textSecondary,
  },

  // Alarm Card
  alarmCard: {
    marginHorizontal: 20,
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#2D2B3D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
    gap: 16,
  },
  alarmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  alarmLeft: {
    gap: 2,
  },
  alarmOverline: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 11,
    fontWeight: '800',
    color: C.textSecondary,
    letterSpacing: 1.1,
  },
  alarmTime: {
    fontFamily: 'Nunito_900Black',
    fontSize: 36,
    fontWeight: '900',
    color: C.textPrimary,
    letterSpacing: -1.08,
  },
  alarmRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 3,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: C.white,
  },
  wakeText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 11,
    fontWeight: '700',
    color: C.accent,
  },
  alarmButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editBtn: {
    flex: 1,
    height: 40,
    backgroundColor: C.accent,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtnText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 13,
    fontWeight: '700',
    color: C.white,
  },
  soundsBtn: {
    flex: 1,
    height: 40,
    backgroundColor: C.accentLight,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soundsBtnText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 13,
    fontWeight: '700',
    color: C.accent,
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

  // Bottom Nav
  bottomNav: {
    height: 68,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: C.border,
    backgroundColor: C.bg,
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
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 10,
    fontWeight: '800',
  },
  navLabelActive: {
    color: C.accent,
  },
  navLabelInactive: {
    color: C.textSecondary,
    opacity: 0.4,
  },
  navDot: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.accent,
  },
});

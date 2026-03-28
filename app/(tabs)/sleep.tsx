import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';
import { useAudio } from '@/context/AudioContext';
import { BottomNav } from '@/components/BottomNav';
import { useStreak } from '@/context/StreakContext';
import { useTheme } from '@/context/ThemeContext';
import { tokens } from '@/constants/theme';
import { SleepingSheep } from '@/components/SleepingSheep';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── CONSTANT QUALITY COLORS ──────────────────────────────────────────────────
const QUALITY_COLORS = {
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
};

// ─── ICONS ────────────────────────────────────────────────────────────────────
const ChevronLeft = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M15 18l-6-6 6-6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ChevronRight = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M9 18l6-6-6-6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ArrowRight = ({ color }: { color: string }) => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path d="M5 12h14M12 5l7 7-7 7" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

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

// SheepIcon removed in favor of SleepingSheep component

// ─── RATING OPTIONS ───────────────────────────────────────────────────────────
const ratingOptions = [
  { key: 'bad', label: 'Bad', bg: QUALITY_COLORS.badBg, faceColor: QUALITY_COLORS.bad, labelColor: QUALITY_COLORS.badText, Face: BadFace },
  { key: 'okay', label: 'Okay', bg: QUALITY_COLORS.okayBg, faceColor: QUALITY_COLORS.okay, labelColor: QUALITY_COLORS.okayText, Face: OkayFace },
  { key: 'good', label: 'Good', bg: QUALITY_COLORS.goodBg, faceColor: QUALITY_COLORS.good, labelColor: QUALITY_COLORS.goodText, Face: GoodFace },
  { key: 'great', label: 'Great', bg: QUALITY_COLORS.greatBg, faceColor: QUALITY_COLORS.great, labelColor: QUALITY_COLORS.greatText, Face: GreatFace },
  { key: 'perfect', label: 'Perfect', bg: QUALITY_COLORS.perfectBg, faceColor: QUALITY_COLORS.perfect, labelColor: QUALITY_COLORS.perfectText, Face: PerfectFace },
];

const STORAGE_KEY = 'rizzze_sleep_data';
const TODAY_DAY = new Date().getDate();
const ACTUAL_MONTH = new Date().getMonth();
const ACTUAL_YEAR = new Date().getFullYear();

const TODAY_KEY = `${ACTUAL_YEAR}-${ACTUAL_MONTH + 1}-${TODAY_DAY}`;

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

type SleepQuality = 'bad' | 'okay' | 'good' | 'great' | 'perfect' | null;

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function SleepScreen() {
  const { colors: C, isDark } = useTheme();
  const [selectedRating, setSelectedRating] = useState<string | null>(null);
  const [sleepData, setSleepData] = useState<Record<string, SleepQuality>>({});
  const [currentMonth, setCurrentMonth] = useState(ACTUAL_MONTH);
  const [currentYear, setCurrentYear] = useState(ACTUAL_YEAR);
  const [tipIndex, setTipIndex] = useState(0);
  const [evalTarget, setEvalTarget] = useState<{ day: number, month: number, year: number, dateKey: string } | null>(null);
  const { markActivity } = useStreak();
  const { activeSound } = useAudio();
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
        const val = await AsyncStorage.getItem(STORAGE_KEY);
        if (val) setSleepData(JSON.parse(val));
      } catch (e) {
        console.error('Failed load sleep', e);
      }
    };
    loadData();
  }, []);

  const handleRateDate = async (dateKey: string, quality: SleepQuality) => {
    const newData = { ...sleepData, [dateKey]: quality };
    if (dateKey === TODAY_KEY) setSelectedRating(quality as string);
    setSleepData(newData);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      markActivity();
    } catch (e) {
      console.error('Failed save sleep', e);
    }
    setEvalTarget(null);
  };

  const changeMonth = (dir: 'prev' | 'next') => {
    if (dir === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11); setCurrentYear(currentYear - 1);
      } else setCurrentMonth(currentMonth - 1);
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0); setCurrentYear(currentYear + 1);
      } else setCurrentMonth(currentMonth + 1);
    }
  };

  const getCellColor = (quality: SleepQuality) => {
    switch (quality) {
      case 'bad': return { bg: QUALITY_COLORS.bad, text: '#FFF' };
      case 'okay': return { bg: QUALITY_COLORS.okay, text: '#FFF' };
      case 'good': return { bg: QUALITY_COLORS.good, text: '#FFF' };
      case 'great': return { bg: QUALITY_COLORS.great, text: '#FFF' };
      case 'perfect': return { bg: QUALITY_COLORS.perfect, text: '#FFF' };
      default: return { bg: C.bgMuted, text: C.textMuted };
    }
  };

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const OFFSET = (firstDay + 6) % 7;
  const DAYS_IN_MONTH = new Date(currentYear, currentMonth + 1, 0).getDate();
  const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const gridCells: number[] = [];
  for (let i = 0; i < OFFSET; i++) gridCells.push(0);
  for (let d = 1; d <= DAYS_IN_MONTH; d++) gridCells.push(d);
  while (gridCells.length % 7 !== 0) gridCells.push(0);

  return (
    <View style={[styles.root, { backgroundColor: C.bgPrimary }]}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.headerTitle, { color: C.textPrimary }]}>Sleep</Text>
            <Text style={[styles.headerSubtitle, { color: C.textSecondary }]}>Track, plan, and improve</Text>
          </View>
          <TouchableOpacity 
            style={[styles.sheepButton, { backgroundColor: C.accentLight }]} 
            onPress={() => router.push('/profile')}
          >
            <SleepingSheep size={34} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
          {/* RATING */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.overline, { color: C.textSecondary }]}>HOW DID YOU SLEEP?</Text>
            </View>
            <Text style={[styles.helperText, { color: C.textMuted }]}>Tap to rate today</Text>

            <View style={styles.ratingRow}>
              {ratingOptions.map(({ key, label, bg, faceColor, labelColor, Face }) => {
                const isSelected = selectedRating === key || sleepData[TODAY_KEY] === key;
                return (
                  <TouchableOpacity 
                    key={key} 
                    onPress={() => handleRateDate(TODAY_KEY, key as SleepQuality)}
                    style={[styles.ratingItem, isSelected && { opacity: 1 }, !isSelected && (selectedRating || sleepData[TODAY_KEY]) && { opacity: 0.5 }]}
                  >
                    <View style={[styles.ratingIcon, { backgroundColor: bg }, isSelected && { borderWidth: 2, borderColor: faceColor }]}>
                      <Face color={faceColor} />
                    </View>
                    <Text style={[styles.ratingLabel, { color: labelColor }, isSelected && { fontFamily: 'Nunito_900Black' }]}>{label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* TIP */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.overline, { color: C.textSecondary }]}>SLEEP TIP</Text>
              <TouchableOpacity style={styles.nextTip} onPress={() => setTipIndex((tipIndex + 1) % SLEEP_TIPS.length)}>
                <Text style={{ color: C.accent, fontFamily: tokens.fonts.caption, fontSize: 11 }}>Next tip</Text>
                <ArrowRight color={C.accent} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity 
              style={[styles.tipCard, { backgroundColor: C.accentLight }]} 
              onPress={() => setTipIndex((tipIndex + 1) % SLEEP_TIPS.length)}
            >
              <View style={[styles.tipBadge, { backgroundColor: C.white }]}>
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Path d="M12 22a10 10 0 100-20 10 10 0 000 20zM12 16v-4M12 8h.01" stroke={C.accent} strokeWidth={2} strokeLinecap="round" />
                </Svg>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.tipTitle, { color: C.accent }]}>{SLEEP_TIPS[tipIndex].title}</Text>
                <Text style={[styles.tipText, { color: C.textSecondary }]}>{SLEEP_TIPS[tipIndex].text}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* CALENDAR */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.overline, { color: C.textSecondary }]}>{MONTH_NAMES[currentMonth]} {currentYear}</Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity onPress={() => changeMonth('prev')}><ChevronLeft color={C.textSecondary} /></TouchableOpacity>
                <TouchableOpacity onPress={() => changeMonth('next')}><ChevronRight color={C.textSecondary} /></TouchableOpacity>
              </View>
            </View>

            <View style={styles.calGrid}>
              <View style={styles.calRow}>
                {DAY_LABELS.map((l, i) => <Text key={i} style={[styles.calDayHeader, { color: C.textMuted }]}>{l}</Text>)}
              </View>
              {Array.from({ length: Math.ceil(gridCells.length / 7) }).map((_, rIdx) => (
                <View key={rIdx} style={styles.calRow}>
                  {gridCells.slice(rIdx * 7, rIdx * 7 + 7).map((d, cIdx) => {
                    if (d === 0) return <View key={cIdx} style={styles.calCellEmpty} />;
                    const key = `${currentYear}-${currentMonth + 1}-${d}`;
                    const quality = sleepData[key];
                    const { bg, text } = getCellColor(quality);
                    const isToday = d === TODAY_DAY && currentMonth === ACTUAL_MONTH && currentYear === ACTUAL_YEAR;
                    const isPast = new Date(currentYear, currentMonth, d) < new Date(ACTUAL_YEAR, ACTUAL_MONTH, TODAY_DAY);
                    
                    return (
                      <TouchableOpacity 
                        key={cIdx} 
                        style={[styles.calCell, { backgroundColor: bg }, isToday && { borderWidth: 2, borderColor: C.textPrimary }, !isToday && !isPast && { opacity: 0.3 }]}
                        disabled={!isPast}
                        onPress={() => setEvalTarget({ day: d, month: currentMonth, year: currentYear, dateKey: key })}
                      >
                        <Text style={[styles.calCellText, { color: text }, quality === null && { color: C.textMuted }]}>{d}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>

            <View style={styles.legend}>
              {['bad', 'okay', 'good', 'great', 'perfect'].map(k => (
                <View key={k} style={styles.legendItem}>
                  <View style={[styles.legendSwatch, { backgroundColor: (QUALITY_COLORS as any)[k] }]} />
                  <Text style={[styles.legendLabel, { color: C.textSecondary }]}>{k.charAt(0).toUpperCase() + k.slice(1)}</Text>
                </View>
              ))}
              <View style={styles.legendItem}>
                <View style={[styles.legendSwatch, { backgroundColor: C.bgMuted }]} />
                <Text style={[styles.legendLabel, { color: C.textSecondary }]}>No data</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* MODAL */}
        <Modal visible={!!evalTarget} transparent animationType="fade" onRequestClose={() => setEvalTarget(null)}>
          <View style={styles.modalOverlay}>
            <Pressable style={[styles.modalBg, { backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(45,43,61,0.4)' }]} onPress={() => setEvalTarget(null)} />
            <View style={[styles.modalContent, { backgroundColor: C.bgCard }]}>
              <Text style={[styles.modalTitle, { color: C.textPrimary }]}>How did you sleep?</Text>
              <Text style={[styles.modalSubtitle, { color: C.textSecondary }]}>{evalTarget?.day} {MONTH_NAMES[evalTarget?.month || 0]} {evalTarget?.year}</Text>
              <View style={styles.modalRatingRow}>
                {ratingOptions.map(({ key, bg, faceColor, Face }) => (
                  <TouchableOpacity 
                    key={key} 
                    style={[styles.modalRatingIcon, { backgroundColor: bg }]}
                    onPress={() => evalTarget && handleRateDate(evalTarget.dateKey, key as SleepQuality)}
                  >
                    <Face color={faceColor} />
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity onPress={() => setEvalTarget(null)}><Text style={{ color: C.textMuted, fontFamily: tokens.fonts.body }}>Cancel</Text></TouchableOpacity>
            </View>
          </View>
        </Modal>

        <BottomNav active="sleep" />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 24, paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontFamily: tokens.fonts.heading, fontSize: 28 },
  headerSubtitle: { fontFamily: 'Nunito_600SemiBold', fontSize: 15, marginTop: -2 },
  sheepButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  section: { paddingHorizontal: 20, marginTop: 24, gap: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  overline: { fontFamily: tokens.fonts.caption, fontSize: 11, letterSpacing: 1.1 },
  accentLabel: { fontFamily: tokens.fonts.caption, fontSize: 12 },
  helperText: { fontFamily: tokens.fonts.body, fontSize: 12, marginTop: -8 },
  ratingRow: { flexDirection: 'row', justifyContent: 'space-between' },
  ratingItem: { alignItems: 'center', gap: 6 },
  ratingIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  ratingLabel: { fontFamily: tokens.fonts.caption, fontSize: 10 },
  nextTip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tipCard: { borderRadius: 20, padding: 16, flexDirection: 'row', gap: 12, alignItems: 'center' },
  tipBadge: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  tipTitle: { fontFamily: tokens.fonts.caption, fontSize: 14 },
  tipText: { fontFamily: tokens.fonts.body, fontSize: 12, lineHeight: 16 },
  calGrid: { gap: 6 },
  calRow: { flexDirection: 'row', justifyContent: 'space-between' },
  calDayHeader: { width: 40, textAlign: 'center', fontFamily: tokens.fonts.caption, fontSize: 11 },
  calCell: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  calCellEmpty: { width: 40, height: 40 },
  calCellText: { fontFamily: tokens.fonts.caption, fontSize: 12 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginTop: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendSwatch: { width: 10, height: 10, borderRadius: 3 },
  legendLabel: { fontFamily: tokens.fonts.caption, fontSize: 10 },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalBg: { ...StyleSheet.absoluteFillObject },
  modalContent: { width: '85%', borderRadius: 24, padding: 24, alignItems: 'center' },
  modalTitle: { fontFamily: tokens.fonts.heading, fontSize: 18 },
  modalSubtitle: { fontFamily: 'Nunito_600SemiBold', fontSize: 13, marginTop: 4, marginBottom: 20 },
  modalRatingRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 24 },
  modalRatingIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});

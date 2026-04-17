import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
  TextInput,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';
import { useAudio } from '@/context/AudioContext';
import { BottomNav } from '@/components/BottomNav';
import { useStreak } from '@/context/StreakContext';
import { useTheme } from '@/context/ThemeContext';
import { tokens } from '@/constants/theme';
import { HeaderSheep } from '@/components/HeaderSheep';
import { useSleep } from '@/context/SleepContext';
import { SleepRatingWidget } from '@/components/SleepRatingWidget';
import { CommentModal } from '@/components/CommentModal';

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
  { title: "Avoid Blue Light", text: "Reducing screen use 1 hour before bed prevents blue light from suppressing your melatonin production." },
  { title: "Stable Schedule", text: "Consistency helps synchronize your circadian rhythm, making it easier for your brain to trigger sleep." },
  { title: "Perfect Temp", text: "Your core temperature must drop to initiate sleep; 18-22°C (64-72°F) is the scientifically ideal range." },
  { title: "Avoid Late Caffeine", text: "Caffeine blocks adenosine—the chemical that creates 'sleep pressure'—and stays in your system for 8+ hours." },
  { title: "Morning Sunlight", text: "Exposure to sun within 30 min of waking sets your internal clock for better melatonin release at night." },
  { title: "Magnesium Rich Foods", text: "Magnesium acts as a natural GABA agonist, helping your nervous system enter a state of relaxation." },
  { title: "Pre-Sleep Warm Bath", text: "A warm bath 90 min before bed causes vasodilation, which helps your core temperature drop faster for sleep." },
  { title: "Cognitive Offloading", text: "Writing a to-do list before bed offloads future worries, reducing the time it takes to fall asleep." },
  { title: "Deep Pressure Touch", text: "Weighted blankets provide 'Deep Pressure Stimulation,' which can lower cortisol and boost serotonin." },
  { title: "Breathable Bedding", text: "Natural fibers like cotton or linen help with thermoregulation by preventing heat traps during the night." },
  { title: "Lavender Aromatherapy", text: "Linalool in lavender has been shown to stimulate the parasympathetic nervous system for deeper relaxation." },
  { title: "Dim the Lights", text: "Lowering ambient light 2 hours before bed triggers the 'Dim Light Melatonin Onset' (DLMO) phase." },
  { title: "No Sleep with Alcohol", text: "Alcohol may act as a sedative, but it degrades sleep quality by fragmenting rest and suppressing REM." },
  { title: "Paper Books Over E-Readers", text: "Reflected light from paper doesn't suppress melatonin like the emissive blue light from digital screens." },
  { title: "Total Darkness", text: "Using an eye mask or blackouts ensures peak melatonin production by eliminating light pollution." },
  { title: "White Noise Masking", text: "Consistent background sound masks sudden noise spikes that would otherwise trigger a 'startle response'." },
  { title: "Early Digestive Window", text: "Finishing heavy meals 3 hours before bed prevents metabolic activity from interfering with your rest." },
  { title: "Spinal Alignment", text: "Pillows that support your neck's natural curve reduce physical stress and prevents mid-night waking." },
  { title: "Adenosine Buildup", text: "Physical activity during the day increases the buildup of adenosine, leading to higher 'sleep pressure' at night." },
  { title: "Nap Efficiency", text: "Limiting naps to 20 mins avoids entering slow-wave sleep, preventing the 'grogginess' of sleep inertia." },
];

type SleepQuality = 'bad' | 'okay' | 'good' | 'great' | 'perfect' | null;

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function SleepScreen() {
  const { colors: C, isDark } = useTheme();
  const { sleepData, rateSleep } = useSleep();
  const [currentMonth, setCurrentMonth] = useState(ACTUAL_MONTH);
  const [currentYear, setCurrentYear] = useState(ACTUAL_YEAR);
  const [tipIndex, setTipIndex] = useState(0);

  // States for the history evaluation modal
  const [evalTarget, setEvalTarget] = useState<{ day: number, month: number, year: number, dateKey: string } | null>(null);
  const [activeEval, setActiveEval] = useState<{ day: number, month: number, year: number, dateKey: string, pendingNote?: string } | null>(null);
  const [modalView, setModalView] = useState<'rating' | 'note'>('rating');

  const { activeSound } = useAudio();
  const router = useRouter();

  useEffect(() => {
    if (evalTarget) {
      setActiveEval(evalTarget);
      setModalView('rating');
    }
  }, [evalTarget]);

  const handleRateDate = async (dateKey: string, quality: SleepQuality) => {
    await rateSleep(dateKey, quality);
  };

  const handleSaveNoteInline = async (text: string) => {
    if (activeEval) {
      const quality = sleepData[activeEval.dateKey]?.quality || null;
      await rateSleep(activeEval.dateKey, quality, text);
      setModalView('rating');
    }
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
        <View style={styles.maxWidthWrapper}>
          {/* HEADER */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.headerTitle, { color: C.textPrimary }]}>Sleep</Text>
              <Text style={[styles.headerSubtitle, { color: C.textSecondary }]}>Track, plan, and improve</Text>
            </View>
            <TouchableOpacity 
              style={[styles.sheepButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : C.accentLight }]} 
              onPress={() => router.push('/profile')}
              activeOpacity={0.8}
            >
              <HeaderSheep size={34} />
            </TouchableOpacity>
          </View>
          <View style={[styles.headerDivider, { backgroundColor: C.border }]} />

          <Animated.View 
            entering={FadeIn.duration(400)}
            style={{ flex: 1 }}
          >
            <ScrollView 
              contentContainerStyle={[styles.scrollContent, activeSound && { paddingBottom: 100 }]} 
              showsVerticalScrollIndicator={false}
            >
              <SleepRatingWidget />

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
                        const entry = sleepData[key];
                        const quality = entry?.quality || null;
                        const { bg, text } = getCellColor(quality);
                        const isToday = d === TODAY_DAY && currentMonth === ACTUAL_MONTH && currentYear === ACTUAL_YEAR;
                        const isPast = new Date(currentYear, currentMonth, d) < new Date(ACTUAL_YEAR, ACTUAL_MONTH, TODAY_DAY);
                        
                        return (
                          <TouchableOpacity 
                            key={cIdx} 
                            style={[
                              styles.calCell, 
                              { backgroundColor: bg }, 
                              isToday && { borderWidth: 2, borderColor: C.textPrimary }, 
                              !isToday && !isPast && { opacity: 0.3 }
                            ]}
                            disabled={!isPast && !isToday}
                            onPress={() => setEvalTarget({ day: d, month: currentMonth, year: currentYear, dateKey: key })}
                          >
                            <Text style={[styles.calCellText, { color: text }, quality === null && { color: C.textMuted }]}>{d}</Text>
                            {sleepData[key]?.note && (
                              <View style={[styles.noteDot, { backgroundColor: text === '#FFF' ? '#FFF' : C.accent }]} />
                            )}
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
          </Animated.View>

          <BottomNav active="sleep" />
        </View>

        {/* MODAL */}
        <Modal visible={!!evalTarget} transparent animationType="fade" onRequestClose={() => setEvalTarget(null)}>
          <View style={styles.modalOverlay}>
            <Pressable style={[styles.modalBg, { backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(45,43,61,0.4)' }]} onPress={() => setEvalTarget(null)} />
            <View style={[styles.modalContent, { backgroundColor: C.bgCard, maxWidth: 400 }]}>
              {modalView === 'rating' ? (
                <>
                  <Text style={[styles.modalTitle, { color: C.textPrimary }]}>How did you sleep?</Text>
                  <Text style={[styles.modalSubtitle, { color: C.textSecondary }]}>{activeEval?.day} {MONTH_NAMES[activeEval?.month || 0]} {activeEval?.year}</Text>
                  
                  <View style={styles.modalRatingRow}>
                    {ratingOptions.map(({ key, bg, faceColor, Face }) => {
                      const isSelected = activeEval && sleepData[activeEval.dateKey]?.quality === key;
                      return (
                        <TouchableOpacity 
                          key={key} 
                          style={[
                            styles.modalRatingIcon, 
                            { backgroundColor: bg },
                            isSelected && { borderWidth: 2, borderColor: faceColor, transform: [{ scale: 1.1 }] },
                            activeEval && sleepData[activeEval.dateKey]?.quality && !isSelected && { opacity: 0.4 }
                          ]}
                          onPress={() => activeEval && handleRateDate(activeEval.dateKey, key as SleepQuality)}
                          activeOpacity={0.7}
                        >
                          <Face color={faceColor} />
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <TouchableOpacity 
                    style={[
                      styles.modalNoteTrigger, 
                      { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' },
                      activeEval && sleepData[activeEval.dateKey]?.note && { borderColor: C.accent + '30', borderWidth: 1 }
                    ]}
                    onPress={() => setModalView('note')}
                  >
                    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                      <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke={C.accent} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke={C.accent} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                    <Text style={[styles.modalNoteTriggerText, { color: activeEval && sleepData[activeEval.dateKey]?.note ? C.textPrimary : C.textSecondary }]}>
                      {activeEval && sleepData[activeEval.dateKey]?.note ? 'View / Edit Note' : 'Add Note'}
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.modalFooterActions}>
                    <TouchableOpacity 
                      style={[styles.doneButton, { backgroundColor: C.accent }]} 
                      onPress={() => setEvalTarget(null)}
                    >
                      <Text style={styles.doneButtonText}>Done</Text>
                    </TouchableOpacity>
                    {activeEval && sleepData[activeEval.dateKey] && (
                      <TouchableOpacity 
                        style={styles.clearButton}
                        onPress={() => activeEval && handleRateDate(activeEval.dateKey, null)}
                      >
                        <Text style={[styles.clearButtonText, { color: '#FF6B6B' }]}>Clear Rating</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => setEvalTarget(null)} style={{ marginTop: 8 }}>
                      <Text style={[styles.cancelButtonText, { color: C.textMuted }]}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <View style={styles.inlineNoteContainer}>
                  <Text style={[styles.modalTitle, { color: C.textPrimary, marginBottom: 16 }]}>Diary Note</Text>
                  <View style={[styles.modalNoteInputWrap, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                    <TextInput
                      style={[styles.modalNoteInput, { color: C.textPrimary }]}
                      placeholder="How was your sleep?"
                      placeholderTextColor={C.textMuted}
                      multiline
                      maxLength={280}
                      defaultValue={activeEval ? (sleepData[activeEval.dateKey]?.note || '') : ''}
                      autoFocus
                      textAlignVertical="top"
                      onChangeText={(t) => {
                        if (activeEval) activeEval.pendingNote = t;
                      }}
                    />
                  </View>
                  <View style={styles.modalActionsRow}>
                    <TouchableOpacity 
                      style={[styles.modalHalfBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}
                      onPress={() => setModalView('rating')}
                    >
                      <Text style={[styles.modalHalfBtnText, { color: C.textMuted }]}>Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.modalHalfBtn, { backgroundColor: C.accent }]} 
                      onPress={() => {
                        const text = activeEval?.pendingNote ?? (activeEval ? (sleepData[activeEval.dateKey]?.note || '') : '');
                        handleSaveNoteInline(text);
                      }}
                    >
                      <Text style={[styles.modalHalfBtnText, { color: '#FFF' }]}>Save</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>
        </Modal>


      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  maxWidthWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: tokens.layout.contentMaxWidth,
    alignSelf: 'center',
  },
  header: { 
    paddingHorizontal: 24, 
    marginTop: 12, 
    marginBottom: 8, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  headerTitle: { fontFamily: tokens.fonts.heading, fontSize: 28 },
  headerSubtitle: { fontFamily: 'Nunito_600SemiBold', fontSize: 15, marginTop: -2 },
  sheepButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  headerDivider: { height: 1, width: '100%' },
  scrollContent: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 24, gap: 24 },
  section: { gap: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  overline: { fontFamily: tokens.fonts.caption, fontSize: 11, letterSpacing: 1.1 },
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
  noteDot: { width: 4, height: 4, borderRadius: 2, position: 'absolute', top: 6, right: 6 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginTop: 12 },
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
  modalFooterActions: { width: '100%', alignItems: 'center', gap: 8 },
  clearButton: { paddingVertical: 8, paddingHorizontal: 20 },
  clearButtonText: { fontFamily: 'Nunito_700Bold', fontSize: 14 },
  cancelButtonText: { fontFamily: tokens.fonts.body, fontSize: 14 },
  modalActionsRow: { flexDirection: 'row', gap: 12, marginBottom: 20, width: '100%' },
  modalHalfBtn: { 
    flex: 1, 
    height: 48, 
    borderRadius: 14, 
    alignItems: 'center', 
    justifyContent: 'center',
    ...tokens.shadows.elevated 
  },
  modalHalfBtnText: { fontFamily: tokens.fonts.heading, fontSize: 15 },
  modalNoteTrigger: {
    width: '100%',
    padding: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  modalNoteTriggerText: { fontFamily: tokens.fonts.heading, fontSize: 15 },
  inlineNoteContainer: { width: '100%', alignItems: 'center' },
  modalNoteInputWrap: { width: '100%', borderRadius: 16, padding: 16, marginBottom: 20, height: 140 },
  modalNoteInput: { fontFamily: tokens.fonts.body, fontSize: 15, textAlignVertical: 'top', height: '100%' },
  doneButton: { 
    width: '100%', 
    height: 48, 
    borderRadius: 14, 
    alignItems: 'center', 
    justifyContent: 'center',
    ...tokens.shadows.elevated 
  },
  doneButtonText: { color: '#FFF', fontFamily: tokens.fonts.heading, fontSize: 16, fontWeight: '800' },
});

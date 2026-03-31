import { MiniPlayer } from '@/components/MiniPlayer';
import { AwakeSheep } from '@/components/AwakeSheep';
import { CATEGORIES, STORIES } from '@/constants/stories';
import { tokens } from '@/constants/theme';
import { SOUND_ASSETS, useAudio } from '@/context/AudioContext';
import { useTheme } from '@/context/ThemeContext';
import { useColors } from '@/hooks/useColors';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

const { width } = Dimensions.get('window');

// ─── ICONS ────────────────────────────────────────────────────────────────────

const BackChevron = ({ color = '#7A7589' }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M15 18L9 12L15 6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const PlusIcon = ({ color = '#7A7589' }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5V19M5 12H19" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const MinusIcon = ({ color = '#7A7589' }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M5 12H19" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const ArrowDownIcon = ({ color = '#6B5A8E' }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5V19M5 12L12 19L19 12" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const MusicIcon = ({ color = '#6B5A8E' }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M9 18V5l12-2v13" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx={6} cy={18} r={3} stroke={color} strokeWidth={2} />
    <Circle cx={18} cy={16} r={3} stroke={color} strokeWidth={2} />
  </Svg>
);

const FontIcon = ({ color = '#6B5A8E' }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M4 19L10 5H14L20 19M6 15H18M9 8L6 15M15 8L18 15" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Rect x={2} y={2} width={20} height={20} rx={4} stroke={color} strokeWidth={1} strokeDasharray="2 2" />
  </Svg>
);

const PlayIcon = ({ color = '#6B5A8E' }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M7 4L19 12L7 20V4Z" fill={color} />
  </Svg>
);

const PauseIcon = ({ color = '#6B5A8E' }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Rect x={6} y={4} width={4} height={16} fill={color} />
    <Rect x={14} y={4} width={4} height={16} fill={color} />
  </Svg>
);

const SeekToStartIcon = ({ color = '#6B5A8E' }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M19 20L9 12L19 4V20Z" fill={color} />
    <Rect x={5} y={4} width={2} height={16} fill={color} />
  </Svg>
);

const StopIcon = ({ color = '#6B5A8E' }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Rect x={6} y={6} width={12} height={12} fill={color} rx={2} />
  </Svg>
);

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function ReaderScreen() {
  const { storyId } = useLocalSearchParams();
  const { isDark } = useTheme();
  const C = useColors();
  const router = useRouter();
  const { stopSound } = useAudio();

  // Dedicated local player for fireplace ambiance
  const localFireplacePlayer = useAudioPlayer(SOUND_ASSETS['fireplace.m4a']);

  // High-fidelity neural narration player (Pro Mode)
  const story = STORIES.find(s => s.id === storyId) || STORIES[0];
  const proNarrationPlayer = useAudioPlayer(story.audioFile ? SOUND_ASSETS[story.audioFile] : null);
  const proStatus = useAudioPlayerStatus(proNarrationPlayer);

  useEffect(() => {
    if (localFireplacePlayer) {
      localFireplacePlayer.loop = true;
      localFireplacePlayer.volume = 0.1; // Disabled for testing backdrop clarity
    }
  }, [localFireplacePlayer]);

  useEffect(() => {
    if (proNarrationPlayer) {
      proNarrationPlayer.volume = 1.0; // Ensure professional audio is at full volume
    }
  }, [proNarrationPlayer]);

  const [isAutoScroll, setIsAutoScroll] = useState(false);
  const [fontSize, setFontSize] = useState(17);
  const [showFontSettings, setShowFontSettings] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isNarrating, setIsNarrating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentPara, setCurrentPara] = useState(0);

  // Sync current paragraph with audio progress (Pro Mode only)
  useEffect(() => {
    if (isNarrating && story.audioFile && proStatus.duration > 0) {
      const progress = proStatus.currentTime / proStatus.duration;
      const totalParas = story.content.length;
      const estimatedPara = Math.min(Math.floor(progress * totalParas), totalParas - 1);

      if (estimatedPara !== currentPara) {
        setCurrentPara(estimatedPara);
      }
    }
  }, [proStatus.currentTime, isNarrating, story.audioFile]);

  const scrollRef = useRef<ScrollView>(null);
  const scrollY = useRef(0);
  const contentHeight = useRef(0);
  const layoutHeight = useRef(0);

  const category = CATEGORIES.find(c => c.id === story.category) || CATEGORIES[1];

  const narratorActive = useRef(false);
  const britishVoice = useRef<string | null>(null);

  // Auto-scroll logic
  useEffect(() => {
    // Fetch available voices to find a British accent
    const fetchVoices = async () => {
      try {
        const voices = await Speech.getAvailableVoicesAsync();
        const gbVoice = voices.find(v => v.language.startsWith('en-GB') || v.language === 'en-GB');
        if (gbVoice) {
          britishVoice.current = gbVoice.identifier;
        }
      } catch (e) {
        console.warn('Could not fetch voices', e);
      }
    };
    fetchVoices();
  }, []);

  // Auto-scroll logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isAutoScroll) {
      interval = setInterval(() => {
        if (scrollY.current < contentHeight.current - layoutHeight.current) {
          scrollY.current += 1;
          scrollRef.current?.scrollTo({ y: scrollY.current, animated: false });
        } else {
          setIsAutoScroll(false);
        }
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isAutoScroll]);

  // Handle Speech Narration
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (isNarrating) {
      narratorActive.current = true;

      // 1. Start fireplace ambiance immediately
      try {
        localFireplacePlayer.play();
        // STOP background sounds (scenes/simple sounds) when starting a story narration
        stopSound();
      } catch (e) {
        console.warn('Fireplace play error', e);
      }

      if (isPaused) {
        // Handle Pausing
        Speech.stop();
        if (proNarrationPlayer) proNarrationPlayer.pause();
      } else {
        // Handle Playing
        const hasProAudio = Boolean(story.audioFile);
        if (hasProAudio && proNarrationPlayer) {
          proNarrationPlayer.volume = 1.0;
          proNarrationPlayer.play();
        } else {
          timer = setTimeout(() => {
            if (narratorActive.current) {
              speakParagraph(currentPara);
            }
          }, 500);
        }
      }
    } else {
      // 3. STOP EVERYTHING IMMEDIATELY
      narratorActive.current = false;
      setIsPaused(false);
      Speech.stop();
      try {
        localFireplacePlayer.pause();
        if (proNarrationPlayer) {
            proNarrationPlayer.pause();
            proNarrationPlayer.seekTo(0);
        }
      } catch (e) { }
      setCurrentPara(0);
    }

    return () => {
      narratorActive.current = false;
      if (timer) clearTimeout(timer);
      Speech.stop();
      try {
        if (proNarrationPlayer) proNarrationPlayer.pause();
      } catch (e) { }
    };
  }, [isNarrating, isPaused, currentPara, story.audioFile, proNarrationPlayer]);

  const speakParagraph = (index: number) => {
    if (!narratorActive.current || index >= story.content.length) {
      setIsNarrating(false);
      if (index >= story.content.length) setCurrentPara(0);
      return;
    }

    Speech.speak(story.content[index], {
      rate: 0.65, // Ultra-relaxed speed for deep sleep
      pitch: 0.8, // Deeper, more grounded tone for narration
      onDone: () => {
        if (narratorActive.current) {
          setCurrentPara(index + 1);
          speakParagraph(index + 1);
        }
      },
      onError: (e) => {
        // Robust check for intentional cancellations on Web
        const errorStr = String(e).toLowerCase();
        if (errorStr.includes('canceled') || errorStr.includes('interrupted')) return;

        // Also check if the error is an object with an 'error' property equal to 'canceled'
        if (typeof e === 'object' && e !== null && 'error' in e && (e as any).error === 'canceled') return;

        console.error('Narrator error:', e);
        setIsNarrating(false);
      }
    });
  };

  const handleScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    scrollY.current = contentOffset.y;
    contentHeight.current = contentSize.height;
    layoutHeight.current = layoutMeasurement.height;

    const currentProgress = Math.min(
      Math.max(0, contentOffset.y / (contentSize.height - layoutMeasurement.height)),
      1
    );
    setProgress(currentProgress);
  };

  const handleToggleListen = () => {
    setIsNarrating(!isNarrating);
    setIsPaused(false);
  };

  const handleTogglePlayPause = () => {
    setIsPaused(!isPaused);
  };

  const handleSeekToStart = () => {
    if (proNarrationPlayer) {
        proNarrationPlayer.seekTo(0);
    }
    Speech.stop();
    setCurrentPara(0);
    setIsPaused(false);
    
    // If not currently narrating mode, activate it
    if (!isNarrating) {
        setIsNarrating(true);
    }
  };

  const handleBack = () => {
    // Force stop everything immediately before navigating
    narratorActive.current = false;
    setIsNarrating(false);
    Speech.stop();
    try {
      localFireplacePlayer.pause();
      if (proNarrationPlayer) proNarrationPlayer.pause();
    } catch (e) { }
    router.back();
  };

  const handleProfile = () => {
    // Stop audio before leaving to profile
    narratorActive.current = false;
    setIsNarrating(false);
    Speech.stop();
    try {
      localFireplacePlayer.pause();
      if (proNarrationPlayer) proNarrationPlayer.pause();
    } catch (e) { }
    router.push('/profile');
  };

  const changeFontSize = (delta: number) => {
    setFontSize(prev => Math.min(Math.max(14, prev + delta), 28));
  };

  return (
    <View style={[styles.root, { backgroundColor: C.bgPrimary }]}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* TOP BAR */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={[styles.circleButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F0EBE3' }]}
            onPress={handleBack}
          >
            <BackChevron color={isDark ? C.white : '#7A7589'} />
          </TouchableOpacity>

          <View style={styles.topBarCenter}>
            <Text style={[styles.headerCategory, { color: C.textSecondary }]}>
              {category.title.toUpperCase()}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.sheepBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : C.accentLight }]}
            onPress={handleProfile}
            activeOpacity={0.8}
          >
            <AwakeSheep size={34} />
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={handleScroll}
          onContentSizeChange={(w, h) => { contentHeight.current = h; }}
          onLayout={(e) => { layoutHeight.current = e.nativeEvent.layout.height; }}
        >
          {/* STORY HEADER */}
          <View style={styles.storyHeader}>
            <Text style={[styles.storyTitle, { color: C.textPrimary }]}>{story.title}</Text>
            <Text style={[styles.storyMeta, { color: C.textSecondary }]}>
              {story.origin ? `${story.origin} · ` : ''}{story.readTime}
            </Text>
            <View style={[styles.divider, { backgroundColor: '#E8E2D8' }]} />
          </View>

          {/* STORY BODY */}
          <View style={styles.bodyContainer}>
            {story.content.map((para, idx) => {
              const isItalic = story.italicParagraphs?.includes(idx);
              // Disable paragraph tracking for Studio Narration tracks as the timing estimation can be unreliable
              const isActive = isNarrating && idx === currentPara && !story.audioFile;

              return (
                <Text
                  key={idx}
                  style={[
                    styles.paragraph,
                    {
                      color: isActive ? C.accent : (isItalic ? C.textSecondary : C.textPrimary),
                      fontSize: fontSize,
                      lineHeight: fontSize * 1.9,
                      backgroundColor: isActive ? 'rgba(139, 109, 174, 0.05)' : 'transparent',
                    },
                    isItalic && styles.italicPara
                  ]}
                >
                  {para}
                </Text>
              );
            })}
          </View>
        </ScrollView>

        {/* FONT SETTINGS OVERLAY */}
        {showFontSettings && (
          <View style={[styles.fontOverlay, { backgroundColor: C.bgCard, shadowColor: '#000' }]}>
            <TouchableOpacity
              style={styles.closeOverlayBtn}
              onPress={() => setShowFontSettings(false)}
            >
              <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 20, color: C.textMuted }}>×</Text>
            </TouchableOpacity>

            <Text style={[styles.overlayLabel, { color: C.textSecondary }]}>Line Height: 1.9x</Text>
            <View style={styles.controlRow}>
              <TouchableOpacity
                style={[styles.fontAdjBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F0EBE3' }]}
                onPress={() => changeFontSize(-1)}
              >
                <MinusIcon color={C.textPrimary} />
              </TouchableOpacity>
              <Text style={[styles.fontSizeLabel, { color: C.textPrimary }]}>{fontSize}px</Text>
              <TouchableOpacity
                style={[styles.fontAdjBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F0EBE3' }]}
                onPress={() => changeFontSize(1)}
              >
                <PlusIcon color={C.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* FOOTER */}
        <View style={[styles.footer, { backgroundColor: C.bgPrimary, borderTopColor: '#E8E2D8' }]}>
          {/* Progress Section */}
          <View style={styles.progressRow}>
            <View style={[styles.progressBarBase, { backgroundColor: '#E8E2D8' }]}>
              <View style={[styles.progressBarFill, { backgroundColor: C.accent, width: `${progress * 100}%` }]} />
            </View>
            <Text style={[styles.progressLabel, { color: C.textMuted }]}>{Math.round(progress * 100)}%</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[
                styles.actionBtn,
                { backgroundColor: isAutoScroll ? '#EDE5F5' : '#F0EBE3' }
              ]}
              onPress={() => setIsAutoScroll(!isAutoScroll)}
              activeOpacity={0.8}
            >
              <ArrowDownIcon color={isAutoScroll ? C.accent : '#6B5A8E'} />
              <Text style={[
                styles.actionLabel,
                { color: isAutoScroll ? C.accent : '#6B5A8E' }
              ]}>{isAutoScroll ? 'Scrolling' : 'Auto-scroll'}</Text>
            </TouchableOpacity>

            {isNarrating ? (
              <View style={[styles.actionBtn, styles.playbackContainer]}>
                 <TouchableOpacity 
                    style={styles.playbackSubBtn} 
                    onPress={handleSeekToStart}
                    activeOpacity={0.7}
                >
                   <SeekToStartIcon color={C.accent} />
                 </TouchableOpacity>

                 <View style={styles.playbackDivider} />

                 <TouchableOpacity 
                    style={styles.playbackSubBtn} 
                    onPress={handleTogglePlayPause}
                    activeOpacity={0.7}
                >
                   {isPaused ? <PlayIcon color={C.accent} /> : <PauseIcon color={C.accent} />}
                 </TouchableOpacity>

                 <View style={styles.playbackDivider} />

                 <TouchableOpacity 
                    style={styles.playbackSubBtn} 
                    onPress={handleToggleListen}
                    activeOpacity={0.7}
                >
                   <StopIcon color={C.accent} />
                 </TouchableOpacity>
              </View>
            ) : (
                <TouchableOpacity
                    style={[
                        styles.actionBtn,
                        { backgroundColor: '#F0EBE3' }
                    ]}
                    activeOpacity={0.8}
                    onPress={handleToggleListen}
                >
                <MusicIcon color={'#6B5A8E'} />
                <Text style={[styles.actionLabel, { color: '#6B5A8E' }]}>
                    Listen
                </Text>
                </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.fontBtn,
                { backgroundColor: showFontSettings ? '#EDE5F5' : '#F0EBE3' }
              ]}
              activeOpacity={0.8}
              onPress={() => setShowFontSettings(!showFontSettings)}
            >
              <FontIcon color={showFontSettings ? C.accent : '#6B5A8E'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Render MiniPlayer if a background sound is still playing (before pressing Listen) */}
        {!isNarrating && <MiniPlayer bottomOffset={122} />}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safeArea: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  circleButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheepBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerCategory: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },

  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 160,
  },

  storyHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  storyTitle: {
    fontFamily: tokens.fonts.heading,
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.44,
  },
  storyMeta: {
    fontFamily: tokens.fonts.body,
    fontSize: 13,
    fontWeight: '500',
    marginTop: 6,
    textAlign: 'center',
  },
  divider: {
    width: 40,
    height: 2,
    borderRadius: 9999,
    marginTop: 16,
  },

  bodyContainer: {
    gap: 20,
  },
  paragraph: {
    paddingHorizontal: 4,
    borderRadius: 4,
    fontFamily: 'Nunito_400Regular',
    fontWeight: '400',
  },
  italicPara: {
    fontStyle: 'italic',
  },

  fontOverlay: {
    position: 'absolute',
    bottom: 120,
    right: 24,
    left: 24,
    borderRadius: 20,
    padding: 20,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    alignItems: 'center',
  },
  overlayLabel: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    marginBottom: 16,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  fontAdjBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fontSizeLabel: {
    fontFamily: tokens.fonts.heading,
    fontSize: 18,
    fontWeight: '800',
    minWidth: 40,
    textAlign: 'center',
  },
  closeOverlayBtn: {
    position: 'absolute',
    top: 12,
    right: 16,
    padding: 4,
  },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingHorizontal: 32,
    paddingTop: 12,
    paddingBottom: 28,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  progressBarBase: {
    flex: 1,
    height: 3,
    borderRadius: 9999,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 9999,
  },
  progressLabel: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 11,
    fontWeight: '600',
    width: 42,
    textAlign: 'right',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    fontWeight: '700',
  },
  fontBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playbackSubBtn: {
    width: 38,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playbackContainer: {
    backgroundColor: '#EDE5F5',
    gap: 0, // Explicitly remove gap for compact feel
    paddingHorizontal: 0,
  },
  playbackDivider: {
    width: 1,
    height: '40%',
    backgroundColor: 'rgba(139, 109, 174, 0.2)',
  },
});

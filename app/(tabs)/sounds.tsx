import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Rect, Line, G } from 'react-native-svg';
import { ForestNightBg, OceanShoreBg, CityRainBg, FireplaceBg, BirdsongFieldsBg, CozyCafeBg,
  RainBg, FanBg, StaticBg, AcBg
} from '@/components/SoundGraphics';
import { useAudio, useAudioPlayback } from '@/context/AudioContext';
import { BottomNav } from '@/components/BottomNav';
import { useColors } from '@/hooks/useColors';
import { useTheme } from '@/context/ThemeContext';
import { tokens } from '@/constants/theme';
import { AwakeSheep } from '@/components/AwakeSheep';
import { HeaderSheep } from '@/components/HeaderSheep';
import { SCENES_DATA } from '@/constants/sounds';
import { getDailyPick } from '@/utils/dailyPicks';
import { posthog } from '@/config/posthog';

// Local C removed in favor of useColors()

// ─── ICONS ────────────────────────────────────────────────────────────────────
// SheepIcon removed in favor of SleepingSheep component

// Icons removed

// Background components are now imported from SoundGraphics

// ─── COMPONENTS ───────────────────────────────────────────────────────────────
const SceneCard = ({ title, subtitle, tag, bgColor, BgGraphic, gradientOverlay, soundFile, graphicId }: any) => {
  const { width: screenW } = useWindowDimensions();
  const effectiveW = Math.min(screenW, tokens.layout.contentMaxWidth);
  const cardW = Math.floor((effectiveW - 48 - 12) / 2); // 24px padding each side + 12px gap
  const cardH = 120;
  const router = useRouter();
  const { playSelectedSound } = useAudioPlayback();
  
  return (
  <TouchableOpacity 
    style={styles.sceneCard} 
    activeOpacity={0.85}
    onPress={() => {
      // Trigger sound immediately for better perceived performance
      playSelectedSound({ title, subtitle: 'Sleep Scenes Collection', soundFile, graphicId });
      posthog.capture('sound_played', { title, sound_file: soundFile, graphic_id: graphicId, sound_type: 'scene' });
      router.push({
        pathname: '/player',
        params: { title, subtitle: 'Sleep Scenes Collection', soundFile, graphicId }
      });
    }}
  >
    <View style={[styles.sceneCardBg, { backgroundColor: bgColor }]}>
      <BgGraphic w={cardW} h={cardH} />
    </View>
    <LinearGradient
      colors={['transparent', gradientOverlay]}
      style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}
    />
    <View style={styles.sceneCardContent}>
      <Text style={styles.sceneCardTitle}>{title}</Text>
      <Text style={[styles.sceneCardSubtitle, { color: subtitle }]}>{tag}</Text>
    </View>
  </TouchableOpacity>
  );
};

const SimpleSoundCard = ({ title, BgGraphic, soundFile, graphicId }: any) => {
  const { width: screenW } = useWindowDimensions();
  const effectiveW = Math.min(screenW, tokens.layout.contentMaxWidth);
  const cardW = Math.floor((effectiveW - 48 - 10) / 2); // 24px padding each side + 10px gap
  const cardH = 60;
  const router = useRouter();
  const { playSelectedSound } = useAudioPlayback();
  
  return (
  <TouchableOpacity 
    style={styles.simpleSoundCard} 
    activeOpacity={0.85}
    onPress={() => {
      // Trigger sound immediately for better perceived performance
      playSelectedSound({ title, subtitle: 'Simple Sleep Sounds', soundFile, graphicId });
      posthog.capture('sound_played', { title, sound_file: soundFile, graphic_id: graphicId, sound_type: 'simple' });
      router.push({
        pathname: '/player',
        params: { title, subtitle: 'Simple Sleep Sounds', soundFile, graphicId }
      });
    }}
  >
    <View style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}>
      <BgGraphic w={cardW} h={cardH} />
    </View>
    <View style={styles.simpleSoundCardContent}>
      <Text style={styles.simpleSoundCardTitle}>{title}</Text>
    </View>
  </TouchableOpacity>
  );
};

export default function SoundsScreen() {
  const { isDark } = useTheme();
  const { activeSound } = useAudio();
  const { playSelectedSound } = useAudioPlayback();
  const router = useRouter();
  const C = useColors();

  const randomScene = React.useMemo(() => getDailyPick(SCENES_DATA), []);
  const PickGraphic = randomScene?.graphicId ? (require('@/components/SoundGraphics') as any)[randomScene.graphicId] : null;

  return (
    <View style={[styles.root, { backgroundColor: C.bgPrimary }]}>
      <StatusBar style={C.mode === 'dark' ? 'light' : 'dark'} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.maxWidthWrapper}>
          {/* HEADER */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.headerTitle, { color: C.textPrimary }]}>Sounds</Text>
              <Text style={[styles.headerSubtitle, { color: C.textSecondary }]}>Immerse yourself</Text>
            </View>
            <TouchableOpacity 
              style={[styles.sheepButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : C.accentLight }]}
              activeOpacity={0.8}
              onPress={() => router.push('/profile')}
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
              style={styles.scroll} 
              contentContainerStyle={[styles.scrollContent, activeSound && { paddingBottom: 100 }]} 
              showsVerticalScrollIndicator={false}
            >

          {/* TONIGHT'S SOUND */}
          <View>
            <TouchableOpacity 
              style={[styles.pickCard, { backgroundColor: C.bgCard, borderTopColor: C.accent, shadowColor: C.textPrimary }]}
              activeOpacity={0.85}
              onPress={() => {
                const pickParams = {
                  title: randomScene.title,
                  subtitle: 'Sleep Scenes Collection',
                  soundFile: randomScene.soundFile,
                  graphicId: randomScene.graphicId
                };
                playSelectedSound(pickParams);
                router.push({
                  pathname: '/player',
                  params: pickParams
                });
              }}
            >
              <View style={[styles.pickThumb, { backgroundColor: C.accentLight }]}>
                {PickGraphic ? <PickGraphic w={52} h={52} /> : <AwakeSheep size={42} />}
              </View>
              <View style={styles.pickContent}>
                <Text style={[styles.pickOverline, { color: C.accent }]}>TONIGHT'S SOUND</Text>
                <Text style={[styles.pickTitle, { color: C.textPrimary }]}>{randomScene.title}</Text>
                <Text style={[styles.pickSubtitle, { color: C.textSecondary }]}>{randomScene.tag}</Text>
              </View>
              <View style={[styles.playButton, { backgroundColor: C.accent }]}>
                <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
                  <Path d="M4 2.5L13 8L4 13.5V2.5Z" fill="#FFFFFF" />
                </Svg>
              </View>
            </TouchableOpacity>
          </View>

          {/* SCENES */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: C.textSecondary }]}>SCENES</Text>
            <View style={styles.sceneGrid}>
              <SceneCard
                title="Forest night"
                subtitle="#C4AED8"
                tag="Crickets, wind, owls"
                bgColor="#1A2636"
                gradientOverlay="rgba(26,38,54,0.9)"
                BgGraphic={ForestNightBg}
                soundFile="forest.m4a"
                graphicId="ForestNightBg"
              />
              <SceneCard
                title="Ocean shore"
                subtitle="#C8DEF0"
                tag="Waves, seagulls, breeze"
                bgColor="#3A5A7A"
                gradientOverlay="rgba(58,90,122,0.9)"
                BgGraphic={OceanShoreBg}
                soundFile="beach.m4a"
                graphicId="OceanShoreBg"
              />
              <SceneCard
                title="Rainy drive"
                subtitle="#C4AED8"
                tag="Car interior, rain, traffic"
                bgColor="#3A3A4A"
                gradientOverlay="rgba(58,58,74,0.9)"
                BgGraphic={CityRainBg}
                soundFile="rainydrive.m4a"
                graphicId="CityRainBg"
              />
              <SceneCard
                title="Fireplace"
                subtitle="#E8C88A"
                tag="Crackling wood, warmth"
                bgColor="#3A2A28"
                gradientOverlay="rgba(58,42,40,0.9)"
                BgGraphic={FireplaceBg}
                soundFile="fireplace.m4a"
                graphicId="FireplaceBg"
              />
              <SceneCard
                title="Birdsong fields"
                subtitle="#A8C5A0"
                tag="Birdsong, soft breeze, grass"
                bgColor="#28362D"
                gradientOverlay="rgba(40,54,45,0.9)"
                BgGraphic={BirdsongFieldsBg}
                soundFile="birds.m4a"
                graphicId="BirdsongFieldsBg"
              />
              <SceneCard
                title="Cozy café"
                subtitle="#E8C88A"
                tag="Coffee, chatter, soft jazz"
                bgColor="#2A2218"
                gradientOverlay="rgba(42,34,24,0.92)"
                BgGraphic={CozyCafeBg}
                soundFile="coffeeshop.m4a"
                graphicId="CozyCafeBg"
              />
            </View>
          </View>

          {/* SIMPLE SOUNDS */}
          <View style={styles.sectionSimpleSounds}>
            <Text style={[styles.sectionLabel, { color: C.textSecondary }]}>SIMPLE SOUNDS</Text>
            <View style={styles.simpleSoundGrid}>
              <SimpleSoundCard title="Rain" BgGraphic={RainBg} soundFile="simple_rain.m4a" graphicId="RainBg" />
              <SimpleSoundCard title="Fan" BgGraphic={FanBg} soundFile="simple_fan.m4a" graphicId="FanBg" />
              <SimpleSoundCard title="Static" BgGraphic={StaticBg} soundFile="simple_static.m4a" graphicId="StaticBg" />
              <SimpleSoundCard title="A/C" BgGraphic={AcBg} soundFile="simple_ac.m4a" graphicId="AcBg" />
            </View>
            </View>
          </ScrollView>
        </Animated.View>

          <BottomNav active="sounds" />
        </View>
      </SafeAreaView>
    </View>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
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
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: tokens.fonts.heading,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 15,
    fontWeight: '600',
    marginTop: -2,
  },
  sheepButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 24,
  },
  headerDivider: {
    height: 1,
    width: '100%',
  },
  section: {
    gap: 12,
  },
  // Tonight's Pick Card
  pickCard: {
    borderRadius: 20,
    borderTopWidth: 3,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.10,
    shadowRadius: 40,
    elevation: 8,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  pickThumb: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickContent: {
    flex: 1,
    gap: 2,
  },
  pickOverline: {
    fontFamily: tokens.fonts.caption,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  pickTitle: {
    fontFamily: tokens.fonts.caption,
    fontSize: 15,
    fontWeight: '800',
  },
  pickSubtitle: {
    fontFamily: tokens.fonts.body,
    fontSize: 12,
    fontWeight: '500',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionSimpleSounds: {
    gap: 12,
  },
  sectionLabel: {
    fontFamily: tokens.fonts.caption,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  sceneGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  sceneCard: {
    width: '48%',
    height: 120,
    borderRadius: 20,
    overflow: 'hidden',
  },
  sceneCardBg: {
    ...StyleSheet.absoluteFillObject,
  },
  sceneCardContent: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    paddingHorizontal: 10,
    paddingBottom: 14,
  },
  sceneCardTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 15,
    fontWeight: '800',
    color: '#F5F0E8',
  },
  sceneCardSubtitle: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  simpleSoundGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  simpleSoundCard: {
    width: '48%',
    height: 60,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  simpleSoundCardContent: {
    paddingHorizontal: 14,
  },
  simpleSoundCardTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 13,
    fontWeight: '800',
    color: '#F5F0E8',
  },
  
  // Bottom Nav styles removed
});

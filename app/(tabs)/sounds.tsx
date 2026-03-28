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
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Rect, Line, G } from 'react-native-svg';
import { 
  ForestNightBg, OceanShoreBg, CityRainBg, FireplaceBg, BirdsongFieldsBg, CozyCafeBg,
  RainBg, FanBg, StaticBg, AcBg
} from '@/components/SoundGraphics';
import { useAudio } from '@/context/AudioContext';
import { BottomNav } from '@/components/BottomNav';

const C = {
  bg: '#F8F4EE',
  accent: '#8B6DAE',
  textPrimary: '#2D2B3D',
  textSecondary: '#7A7589',
  border: '#E8E2D8',
  white: '#FFFFFF',
  lavender: '#E8DFF0',
};

// ─── ICONS ────────────────────────────────────────────────────────────────────
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

// Icons removed

// Background components are now imported from SoundGraphics

// ─── COMPONENTS ───────────────────────────────────────────────────────────────
const SceneCard = ({ title, subtitle, tag, bgColor, BgGraphic, gradientOverlay, soundFile, graphicId }: any) => {
  const { width: screenW } = useWindowDimensions();
  const cardW = Math.floor((screenW - 48 - 12) / 2); // 24px padding each side + 12px gap
  const cardH = 120;
  const router = useRouter();
  
  return (
  <TouchableOpacity 
    style={styles.sceneCard} 
    activeOpacity={0.85}
    onPress={() => router.push({
      pathname: '/player',
      params: { title, subtitle: 'Scenes collection', soundFile, graphicId }
    })}
  >
    <View style={[styles.sceneCardBg, { backgroundColor: bgColor }]}>
      <BgGraphic w={cardW} h={cardH} />
    </View>
    <LinearGradient
      colors={['transparent', gradientOverlay]}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
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
  const cardW = Math.floor((screenW - 48 - 10) / 2); // 24px padding each side + 10px gap
  const cardH = 60;
  const router = useRouter();
  
  return (
  <TouchableOpacity 
    style={styles.simpleSoundCard} 
    activeOpacity={0.85}
    onPress={() => router.push({
      pathname: '/player',
      params: { title, subtitle: 'Simple sounds collection', soundFile, graphicId }
    })}
  >
    <View style={StyleSheet.absoluteFill}>
      <BgGraphic w={cardW} h={cardH} />
    </View>
    <View style={styles.simpleSoundCardContent}>
      <Text style={styles.simpleSoundCardTitle}>{title}</Text>
    </View>
  </TouchableOpacity>
  );
};

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
export default function SoundsScreen() {
  const { activeSound } = useAudio();
  const router = useRouter();
  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Sounds</Text>
            <Text style={styles.headerSubtitle}>Immerse yourself</Text>
          </View>
          <TouchableOpacity 
            style={styles.sheepButton} 
            activeOpacity={0.8}
            onPress={() => router.push('/profile')}
          >
            <SheepIcon size={30} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scroll} 
          contentContainerStyle={[styles.scrollContent, activeSound && { paddingBottom: 100 }]} 
          showsVerticalScrollIndicator={false}
        >
          {/* SCENES */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>SCENES</Text>
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
                title="City rain"
                subtitle="#C4AED8"
                tag="Rain, traffic hum, puddles"
                bgColor="#3A3A4A"
                gradientOverlay="rgba(58,58,74,0.9)"
                BgGraphic={CityRainBg}
                soundFile="city_rain.m4a"
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
            <Text style={styles.sectionLabel}>SIMPLE SOUNDS</Text>
            <View style={styles.simpleSoundGrid}>
              <SimpleSoundCard title="Rain" BgGraphic={RainBg} soundFile="simple_rain.m4a" graphicId="RainBg" />
              <SimpleSoundCard title="Fan" BgGraphic={FanBg} soundFile="simple_fan.m4a" graphicId="FanBg" />
              <SimpleSoundCard title="Static" BgGraphic={StaticBg} soundFile="simple_static.m4a" graphicId="StaticBg" />
              <SimpleSoundCard title="A/C" BgGraphic={AcBg} soundFile="simple_ac.m4a" graphicId="AcBg" />
            </View>
          </View>
        </ScrollView>

        <BottomNav active="sounds" />
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  section: {
    paddingTop: 0, // 20px was in header
    paddingHorizontal: 24,
  },
  sectionSimpleSounds: {
    paddingTop: 24,
    paddingHorizontal: 24,
  },
  sectionLabel: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 11,
    fontWeight: '800',
    color: '#7A7589',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginBottom: 14,
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

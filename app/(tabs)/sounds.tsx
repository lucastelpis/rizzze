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

// ─── COLORS ───────────────────────────────────────────────────────────────────
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

const HomeNavIcon = ({ active }: { active: boolean }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z" fill={active ? C.accent : 'none'} stroke={active ? C.accent : C.textSecondary} strokeWidth={2} strokeLinejoin="round" />
  </Svg>
);
const SleepNavIcon = ({ active }: { active: boolean }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill={active ? C.accent : 'none'} stroke={active ? C.accent : C.textSecondary} strokeWidth={2} strokeLinejoin="round" />
  </Svg>
);
const SoundsNavIcon = ({ active }: { active: boolean }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M9 18V5l12-2v13" stroke={active ? C.accent : C.textSecondary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx={6} cy={18} r={3} fill={active ? C.accent : 'none'} stroke={active ? C.accent : C.textSecondary} strokeWidth={2} />
    <Circle cx={18} cy={16} r={3} fill={active ? C.accent : 'none'} stroke={active ? C.accent : C.textSecondary} strokeWidth={2} />
  </Svg>
);
const ProfileNavIcon = ({ active }: { active: boolean }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={8} r={4} stroke={active ? C.accent : C.textSecondary} strokeWidth={2} />
    <Path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={active ? C.accent : C.textSecondary} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

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

// ─── BACKGROUND ILLUSTRATIONS (SCENES) ──────────────────────────────────────────
const ForestNightBg = ({ w, h }: { w: number; h: number }) => (
  <Svg width={w} height={h} viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice" style={StyleSheet.absoluteFill}>
    <Rect width={160} height={120} fill="#1A2636"/>
    <Circle cx={130} cy={20} r={14} fill="#C4AED8" opacity={0.3}/>
    <Circle cx={130} cy={20} r={8} fill="#E8DFF0" opacity={0.5}/>
    <Circle cx={20} cy={30} r={1} fill="#E8DFF0" opacity={0.5}/>
    <Circle cx={55} cy={18} r={0.8} fill="#E8DFF0" opacity={0.4}/>
    <Circle cx={90} cy={35} r={1.2} fill="#E8DFF0" opacity={0.3}/>
    <Circle cx={45} cy={50} r={0.6} fill="#E8DFF0" opacity={0.6}/>
    <Circle cx={110} cy={25} r={1} fill="#E8DFF0" opacity={0.5}/>
    <Circle cx={75} cy={12} r={0.8} fill="#E8DFF0" opacity={0.4}/>
    <Path d="M0 80Q40 65 80 75Q120 85 160 70V120H0Z" fill="#2D3A4A"/>
    <Path d="M0 95Q30 82 70 90Q110 98 160 85V120H0Z" fill="#3D4A5A"/>
    <Rect x={20} y={88} width={3} height={22} rx={1} fill="#4A6050" opacity={0.6}/>
    <Path d="M15 90Q21 78 27 90Z" fill="#5A7A60" opacity={0.5}/>
    <Rect x={122} y={84} width={4} height={26} rx={1} fill="#4A6050" opacity={0.5}/>
    <Path d="M115 86Q122 72 129 86Z" fill="#5A7A60" opacity={0.4}/>
  </Svg>
);

const OceanShoreBg = ({ w, h }: { w: number; h: number }) => (
  <Svg width={w} height={h} viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice" style={StyleSheet.absoluteFill}>
    <Rect width={160} height={120} fill="#3A5A7A"/>
    <Circle cx={120} cy={25} r={22} fill="#F5F0E8" opacity={0.08}/>
    <Circle cx={120} cy={25} r={14} fill="#F5F0E8" opacity={0.12}/>
    <Circle cx={120} cy={25} r={7} fill="#F5F0E8" opacity={0.18}/>
    <Path d="M0 55Q20 45 40 53Q60 61 80 50Q100 39 120 47Q140 55 160 45V120H0Z" fill="#4A6A8A"/>
    <Path d="M0 70Q25 60 50 68Q75 76 100 65Q125 54 150 62V120H0Z" fill="#5A7A9A"/>
    <Path d="M0 85Q30 77 60 83Q90 89 120 80Q150 71 160 77V120H0Z" fill="#6A8AAA"/>
    <Path d="M0 105Q40 100 80 105Q120 110 160 103V120H0Z" fill="#C8B888" opacity={0.3}/>
  </Svg>
);

const CityRainBg = ({ w, h }: { w: number; h: number }) => (
  <Svg width={w} height={h} viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice" style={StyleSheet.absoluteFill}>
    <Rect width={160} height={120} fill="#3A3A4A"/>
    <Circle cx={40} cy={10} r={1} fill="#E8DFF0" opacity={0.4}/>
    <Circle cx={100} cy={5} r={0.8} fill="#E8DFF0" opacity={0.3}/>
    <Circle cx={140} cy={15} r={0.9} fill="#E8DFF0" opacity={0.5}/>
    
    <Rect x={10} y={40} width={32} height={72} rx={2} fill="#4A4A5A"/>
    <Rect x={15} y={48} width={8} height={8} rx={1} fill="#E8C88A" opacity={0.5}/>
    <Rect x={27} y={48} width={8} height={8} rx={1} fill="#E8C88A" opacity={0.2}/>
    <Rect x={15} y={64} width={8} height={8} rx={1} fill="#E8C88A" opacity={0.3}/>
    <Rect x={27} y={64} width={8} height={8} rx={1} fill="#E8C88A" opacity={0.5}/>
    <Rect x={15} y={80} width={8} height={8} rx={1} fill="#E8C88A" opacity={0.2}/>
    <Rect x={27} y={80} width={8} height={8} rx={1} fill="#E8C88A" opacity={0.4}/>

    <Rect x={60} y={20} width={38} height={92} rx={2} fill="#4A4A5A"/>
    <Rect x={66} y={30} width={8} height={8} rx={1} fill="#E8C88A" opacity={0.6}/>
    <Rect x={82} y={30} width={8} height={8} rx={1} fill="#E8C88A" opacity={0.2}/>
    <Rect x={66} y={48} width={8} height={8} rx={1} fill="#E8C88A" opacity={0.3}/>
    <Rect x={82} y={48} width={8} height={8} rx={1} fill="#E8C88A" opacity={0.5}/>
    <Rect x={66} y={66} width={8} height={8} rx={1} fill="#E8C88A" opacity={0.2}/>
    <Rect x={82} y={66} width={8} height={8} rx={1} fill="#E8C88A" opacity={0.4}/>
    <Rect x={66} y={84} width={8} height={8} rx={1} fill="#E8C88A" opacity={0.5}/>
    <Rect x={82} y={84} width={8} height={8} rx={1} fill="#E8C88A" opacity={0.2}/>

    <Rect x={115} y={48} width={28} height={64} rx={2} fill="#4A4A5A"/>
    <Rect x={120} y={56} width={8} height={8} rx={1} fill="#E8C88A" opacity={0.4}/>
    <Rect x={120} y={72} width={8} height={8} rx={1} fill="#E8C88A" opacity={0.2}/>
    <Rect x={120} y={88} width={8} height={8} rx={1} fill="#E8C88A" opacity={0.3}/>
    <Rect x={130} y={64} width={8} height={8} rx={1} fill="#E8C88A" opacity={0.2}/>
    
    <Rect x={0} y={108} width={160} height={12} fill="#4A4A5A"/>
    <Rect x={20} y={110} width={120} height={2} rx={1} fill="#5A5A6A"/>
    {[15, 35, 55, 75, 95, 115, 135].map((x, i) => (
      <Line key={i} x1={x + 2} y1={10 + i * 5} x2={x} y2={28 + i * 5} stroke="#C8DEF0" strokeWidth={0.8} opacity={0.2 + (i % 3) * 0.05} />
    ))}
  </Svg>
);

const FireplaceBg = ({ w, h }: { w: number; h: number }) => (
  <Svg width={w} height={h} viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice" style={StyleSheet.absoluteFill}>
    <Rect width={160} height={120} fill="#3A2A28"/>
    <Circle cx={40} cy={30} r={24} fill="#E8C88A" opacity={0.05}/>
    <Circle cx={120} cy={25} r={18} fill="#E8C88A" opacity={0.04}/>
    <Rect x={42} y={55} width={76} height={52} rx={5} fill="#4A3A35"/>
    <Rect x={50} y={62} width={60} height={32} rx={3} fill="#2A1A18"/>
    <Rect x={20} y={104} width={120} height={8} rx={2} fill="#3A2A25"/>
    <Path d="M60 94Q80 72 100 94" fill="#D4928A" opacity={0.55}/>
    <Path d="M66 94Q80 76 94 94" fill="#E8A870" opacity={0.6}/>
    <Path d="M70 94Q80 80 90 94" fill="#E8C88A" opacity={0.65}/>
    <Circle cx={80} cy={90} r={3} fill="#F0D890" opacity={0.8}/>
    <Rect x={55} y={92} width={50} height={4} rx={1} fill="#1A0E0C"/>
  </Svg>
);

const BambooGroveBg = ({ w, h }: { w: number; h: number }) => (
  <Svg width={w} height={h} viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice" style={StyleSheet.absoluteFill}>
    <Rect width={160} height={120} fill="#1A2A1A"/>
    <Circle cx={80} cy={28} r={22} fill="#E8C88A" opacity={0.08}/>
    <Circle cx={80} cy={28} r={13} fill="#E8C88A" opacity={0.14}/>
    <Circle cx={25} cy={15} r={1} fill="#E8DFF0" opacity={0.5}/>
    <Circle cx={60} cy={8} r={0.7} fill="#E8DFF0" opacity={0.35}/>
    <Circle cx={100} cy={18} r={0.9} fill="#E8DFF0" opacity={0.6}/>
    <Circle cx={140} cy={10} r={0.8} fill="#E8DFF0" opacity={0.4}/>
    <Path d="M0 72Q20 62 40 68Q60 74 80 64Q100 54 120 62Q140 70 160 60V120H0Z" fill="#2A3A2A"/>
    <Path d="M0 88Q30 80 60 86Q90 92 120 84Q150 76 160 80V120H0Z" fill="#3A4A3A"/>
    
    <Rect x={17} y={55} width={3} height={55} rx={1} fill="#4A6A40" opacity={0.7}/>
    {[55, 67, 79, 91, 103].map((y, i) => <Rect key={i} x={17} y={y} width={3} height={1} fill="#3A5A30"/>)}
    <Path d="M10 58Q17 44 24 58Z" fill="#5A8050" opacity={0.5}/>
    
    <Rect x={57} y={50} width={4} height={60} rx={1} fill="#4A6A40" opacity={0.65}/>
    {[50, 62, 74, 86, 98].map((y, i) => <Rect key={i} x={57} y={y} width={4} height={1} fill="#3A5A30"/>)}
    <Path d="M50 54Q58 38 66 54Z" fill="#5A8050" opacity={0.45}/>
    
    <Rect x={104} y={56} width={3} height={54} rx={1} fill="#4A6A40" opacity={0.6}/>
    {[56, 68, 80, 92, 104].map((y, i) => <Rect key={i} x={104} y={y} width={3} height={1} fill="#3A5A30"/>)}
    <Path d="M98 60Q105 46 112 60Z" fill="#5A8050" opacity={0.5}/>
    
    <Rect x={137} y={52} width={4} height={58} rx={1} fill="#4A6A40" opacity={0.55}/>
    {[52, 64, 76, 88, 100].map((y, i) => <Rect key={i} x={137} y={y} width={4} height={1} fill="#3A5A30"/>)}
    <Path d="M131 56Q138 42 145 56Z" fill="#5A8050" opacity={0.4}/>
  </Svg>
);

const CozyCafeBg = ({ w, h }: { w: number; h: number }) => (
  <Svg width={w} height={h} viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice" style={StyleSheet.absoluteFill}>
    <Rect width={160} height={120} fill="#2A2218"/>
    <Rect width={160} height={120} fill="#3A3020" opacity={0.45}/>
    <Circle cx={50} cy={30} r={26} fill="#E8C88A" opacity={0.05}/>
    <Circle cx={115} cy={26} r={20} fill="#E8C88A" opacity={0.04}/>
    
    <Rect x={28} y={22} width={104} height={58} rx={7} fill="#4A3A28"/>
    <Rect x={34} y={28} width={92} height={46} rx={4} fill="#2A1E14"/>
    <Rect x={38} y={32} width={84} height={38} rx={3} fill="#1A140E"/>
    
    <Path d="M50 52Q80 36 110 52" stroke="#E8C88A" strokeWidth={1.2} fill="none" opacity={0.35}/>
    <Path d="M55 58Q80 44 105 58" stroke="#E8C88A" strokeWidth={0.8} fill="none" opacity={0.5}/>
    <Circle cx={80} cy={50} r={10} fill="#E8C88A" opacity={0.1}/>
    
    <Rect x={68} y={80} width={24} height={4} rx={2} fill="#3A2E20"/>
    <Rect x={48} y={84} width={64} height={18} rx={4} fill="#4A3A28"/>
  </Svg>
);

// ─── SIMPLE SOUNDS ILLUSTRATIONS ────────────────────────────────────────────────
const RainBg = ({ w, h }: { w: number; h: number }) => (
  <Svg width={w} height={h} viewBox="0 0 160 60" preserveAspectRatio="xMidYMid slice" style={StyleSheet.absoluteFill}>
    <Rect width="160" height="60" fill="#2A3A4A" />
    <Path d="M-10 40 Q 40 20 80 45 T 170 30 L 170 60 L -10 60 Z" fill="#3A4A5A" />
    {[10, 30, 50, 70, 90, 110, 130, 150].map((x, i) => (
      <Line key={i} x1={x + 10} y1={-10} x2={x - 10} y2={70} stroke="#C8DEF0" strokeWidth={1.5} strokeLinecap="round" opacity={0.25 + (i % 3) * 0.05} />
    ))}
  </Svg>
);

const FanBg = ({ w, h }: { w: number; h: number }) => (
  <Svg width={w} height={h} viewBox="0 0 160 60" preserveAspectRatio="xMidYMid slice" style={StyleSheet.absoluteFill}>
    <Rect width="160" height="60" fill="#2A2A3A" />
    <G x={110} y={30}>
      <Circle cx={0} cy={0} r={22} fill="#3A3A4A" />
      <Circle cx={0} cy={0} r={14} fill="#2A2A3A" />
      <Path d="M -2 -14 Q 5 -20 10 -12 Q 5 -6 2 -2 Z" fill="#4A4A5A" opacity={0.7} />
      <Path d="M 2 14 Q -5 20 -10 12 Q -5 6 -2 2 Z" fill="#4A4A5A" opacity={0.7} />
      <Path d="M 14 -2 Q 20 5 12 10 Q 6 5 2 2 Z" fill="#4A4A5A" opacity={0.7} />
      <Path d="M -14 2 Q -20 -5 -12 -10 Q -6 -5 -2 -2 Z" fill="#4A4A5A" opacity={0.7} />
      <Circle cx={0} cy={0} r={4} fill="#4A4A5A" />
    </G>
  </Svg>
);

const StaticBg = ({ w, h }: { w: number; h: number }) => {
  const rects: React.ReactElement[] = [];
  let seed = 1234;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  for (let i = 0; i < 200; i++) {
    const rw = 2 + rand() * 3;
    const rh = 2 + rand() * 3;
    const x = rand() * 160;
    const y = rand() * 60;
    const fill = ['#FFFFFF', '#CCCCCC', '#AAAAAA', '#888888'][Math.floor(rand() * 4)];
    const opacity = 0.3 + rand() * 0.3;
    rects.push(<Rect key={i} x={x} y={y} width={rw} height={rh} fill={fill} opacity={opacity} />);
  }
  return (
    <Svg width={w} height={h} viewBox="0 0 160 60" preserveAspectRatio="xMidYMid slice" style={StyleSheet.absoluteFill}>
      <Rect width="160" height="60" fill="#1E1E1E" />
      {rects}
      <Rect width="160" height="60" fill="#000000" opacity={0.25} />
    </Svg>
  );
};

const AcBg = ({ w, h }: { w: number; h: number }) => (
  <Svg width={w} height={h} viewBox="0 0 160 60" preserveAspectRatio="xMidYMid slice" style={StyleSheet.absoluteFill}>
    <Rect width="160" height="60" fill="#1A2A38" />
    <Rect x={20} y={10} width={120} height={26} rx={5} fill="#243444" stroke="#2E4458" strokeWidth={1} />
    <Rect x={26} y={16} width={108} height={5} rx={2} fill="#2E4458" />
    <Circle cx={130} cy={28} r={2} fill="#3A5068" />
    <Path d="M 40 45 Q 80 35 120 50" fill="none" stroke="#C8DEF0" strokeWidth={1.5} opacity={0.2} strokeLinecap="round" />
    <Path d="M 50 55 Q 80 45 110 55" fill="none" stroke="#C8DEF0" strokeWidth={1.5} opacity={0.35} strokeLinecap="round" />
  </Svg>
);

// ─── COMPONENTS ───────────────────────────────────────────────────────────────
const SceneCard = ({ title, subtitle, tag, bgColor, BgGraphic, gradientOverlay }: any) => {
  const { width: screenW } = useWindowDimensions();
  const cardW = Math.floor((screenW - 48 - 12) / 2); // 24px padding each side + 12px gap
  const cardH = 120;
  return (
  <TouchableOpacity style={styles.sceneCard} activeOpacity={0.85}>
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

const SimpleSoundCard = ({ title, BgGraphic }: any) => {
  const { width: screenW } = useWindowDimensions();
  const cardW = Math.floor((screenW - 48 - 10) / 2); // 24px padding each side + 10px gap
  const cardH = 60;
  return (
  <TouchableOpacity style={styles.simpleSoundCard} activeOpacity={0.85}>
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
          <TouchableOpacity style={styles.sheepButton} activeOpacity={0.8}>
            <SheepIcon size={30} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
              />
              <SceneCard
                title="Ocean shore"
                subtitle="#C8DEF0"
                tag="Waves, seagulls, breeze"
                bgColor="#3A5A7A"
                gradientOverlay="rgba(58,90,122,0.9)"
                BgGraphic={OceanShoreBg}
              />
              <SceneCard
                title="City rain"
                subtitle="#C4AED8"
                tag="Rain, traffic hum, puddles"
                bgColor="#3A3A4A"
                gradientOverlay="rgba(58,58,74,0.9)"
                BgGraphic={CityRainBg}
              />
              <SceneCard
                title="Fireplace"
                subtitle="#E8C88A"
                tag="Crackling wood, warmth"
                bgColor="#3A2A28"
                gradientOverlay="rgba(58,42,40,0.9)"
                BgGraphic={FireplaceBg}
              />
              <SceneCard
                title="Bamboo grove"
                subtitle="#A8C5A0"
                tag="Wind, rustling leaves"
                bgColor="#1A2A1A"
                gradientOverlay="rgba(26,42,26,0.9)"
                BgGraphic={BambooGroveBg}
              />
              <SceneCard
                title="Cozy café"
                subtitle="#E8C88A"
                tag="Coffee, chatter, soft jazz"
                bgColor="#2A2218"
                gradientOverlay="rgba(42,34,24,0.92)"
                BgGraphic={CozyCafeBg}
              />
            </View>
          </View>

          {/* SIMPLE SOUNDS */}
          <View style={styles.sectionSimpleSounds}>
            <Text style={styles.sectionLabel}>SIMPLE SOUNDS</Text>
            <View style={styles.simpleSoundGrid}>
              <SimpleSoundCard title="Rain" BgGraphic={RainBg} />
              <SimpleSoundCard title="Fan" BgGraphic={FanBg} />
              <SimpleSoundCard title="Static" BgGraphic={StaticBg} />
              <SimpleSoundCard title="A/C" BgGraphic={AcBg} />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  headerTitle: {
    fontFamily: 'Nunito_900Black',
    fontSize: 22,
    fontWeight: '900',
    color: '#2D2B3D',
    letterSpacing: -0.44, // -0.02em = -2%
  },
  headerSubtitle: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 13,
    fontWeight: '500',
    color: '#7A7589',
    marginTop: 2,
  },
  sheepButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0EBE3',
    alignItems: 'center',
    justifyContent: 'center',
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
    fontWeight: '600',
  },
  navLabelActive: {
    color: C.accent,
    fontWeight: '800',
  },
  navLabelInactive: {
    color: C.textSecondary,
    fontWeight: '600',
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

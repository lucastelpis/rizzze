import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';

interface GraphicProps {
  w?: number;
  h?: number;
  overlayColor?: string;
  showOverlay?: boolean;
}

// ─── UTILS ────────────────────────────────────────────────────────────────────
const Overlay = ({ color }: { color: string }) => (
  <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
    <Defs>
      <LinearGradient id="bottomFade" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0.3" stopColor={color} stopOpacity="0" />
        <Stop offset="0.92" stopColor={color} stopOpacity="0.92" />
      </LinearGradient>
    </Defs>
    <Rect width="100%" height="100%" fill="url(#bottomFade)" />
  </Svg>
);

// ─── CATEGORY GRAPHICS ────────────────────────────────────────────────────────

export const CozyCategoryBg = ({ showOverlay = true }: GraphicProps) => (
  <View style={StyleSheet.absoluteFill}>
    <Svg width="100%" height="100%" viewBox="0 0 160 160" preserveAspectRatio="xMidYMid slice">
      <Rect width={160} height={160} fill="#3A2A28" />
      {/* Fireplace glow */}
      <Rect x={40} y={60} width={80} height={60} rx={4} fill="#2A1A18" />
      <Path d="M60 110 Q80 70 100 110" fill="#D4928A" opacity={0.4} />
      <Path d="M65 110 Q80 85 95 110" fill="#E8A870" opacity={0.6} />
      <Path d="M70 110 Q80 95 90 110" fill="#E8C88A" opacity={0.8} />
    </Svg>
    {showOverlay && <Overlay color="#3A2A28" />}
  </View>
);

export const FolkloreCategoryBg = ({ showOverlay = true }: GraphicProps) => (
  <View style={StyleSheet.absoluteFill}>
    <Svg width="100%" height="100%" viewBox="0 0 160 160" preserveAspectRatio="xMidYMid slice">
      <Rect width={160} height={160} fill="#1A2636" />
      {/* Crescent Moon */}
      <Defs>
        <Path id="moon" d="M20 0 A20 20 0 1 0 20 40 A15 15 0 1 1 20 0" />
      </Defs>
      <G transform="translate(110, 30)">
        <Circle cx={20} cy={20} r={20} fill="#E8DFF0" />
        <Circle cx={28} cy={16} r={20} fill="#1A2636" />
      </G>
      {/* Stars */}
      <Circle cx={30} cy={40} r={1} fill="#E8DFF0" opacity={0.4} />
      <Circle cx={55} cy={25} r={0.8} fill="#E8DFF0" opacity={0.3} />
      <Circle cx={85} cy={45} r={1.2} fill="#E8DFF0" opacity={0.5} />
      <Circle cx={20} cy={70} r={0.6} fill="#E8DFF0" opacity={0.3} />
      {/* Hills */}
      <Path d="M0 120 Q40 100 80 125 T160 115 V160 H0 Z" fill="#243444" />
      <Path d="M0 140 Q50 130 100 145 T160 135 V160 H0 Z" fill="#2D3A4A" />
    </Svg>
    {showOverlay && <Overlay color="#1A2636" />}
  </View>
);

export const ReflectiveCategoryBg = ({ showOverlay = true }: GraphicProps) => (
  <View style={StyleSheet.absoluteFill}>
    <Svg width="100%" height="100%" viewBox="0 0 160 160" preserveAspectRatio="xMidYMid slice">
      <Rect width={160} height={160} fill="#3A3348" />
      {/* Concentric Circles */}
      <G transform="translate(80, 80)">
        <Circle r={45} stroke="#4A4058" strokeWidth={1} opacity={0.6} fill="none" />
        <Circle r={30} stroke="#5A5068" strokeWidth={1} opacity={0.5} fill="none" />
        <Circle r={16} stroke="#6A6078" strokeWidth={1} opacity={0.4} fill="none" />
        <Circle r={6} fill="#8B6DAE" opacity={0.35} />
      </G>
      {/* Flowing lines at bottom */}
      <Path d="M0 140 Q40 130 80 145 T160 135" stroke="#8B6DAE" strokeWidth={1} fill="none" opacity={0.2} />
      <Path d="M0 150 Q50 145 100 155 T160 145" stroke="#8B6DAE" strokeWidth={1} fill="none" opacity={0.15} />
    </Svg>
    {showOverlay && <Overlay color="#3A3348" />}
  </View>
);

export const WonderCategoryBg = ({ showOverlay = true }: GraphicProps) => (
  <View style={StyleSheet.absoluteFill}>
    <Svg width="100%" height="100%" viewBox="0 0 160 160" preserveAspectRatio="xMidYMid slice">
      <Rect width={160} height={160} fill="#1A2030" />
      {/* Stars scattered */}
      <Circle cx={20} cy={30} r={1.2} fill="#F5F0E8" opacity={0.6} />
      <Circle cx={50} cy={20} r={0.8} fill="#C8DEF0" opacity={0.4} />
      <Circle cx={120} cy={25} r={2} fill="#F5F0E8" opacity={0.8} />
      <Circle cx={140} cy={60} r={1} fill="#C8DEF0" opacity={0.3} />
      <Circle cx={40} cy={80} r={1.5} fill="#F5F0E8" opacity={0.5} />
      <Circle cx={85} cy={45} r={0.8} fill="#C8DEF0" opacity={0.7} />
      <Circle cx={110} cy={90} r={1.8} fill="#F5F0E8" opacity={0.4} />
      {/* Rolling Hills */}
      <Path d="M0 125 Q40 115 80 130 T160 120 V160 H0 Z" fill="#2A3040" />
      <Path d="M0 145 Q50 140 100 150 T160 140 V160 H0 Z" fill="#3A4050" />
    </Svg>
    {showOverlay && <Overlay color="#1A2030" />}
  </View>
);

// ─── THUMBNAILS ───────────────────────────────────────────────────────────────

import { G } from 'react-native-svg';

export const TheMoonRabbitThumb = ({ size = 56 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 56 56">
    <Rect width={56} height={56} rx={14} fill="#1A2636" />
    <Circle cx={42} cy={14} r={8} fill="#E8DFF0" opacity={0.2} />
    <G transform="translate(12, 32)">
        {/* Simple rabbit silhouette head */}
        <Circle cx={16} cy={8} r={10} fill="#F5F0E8" opacity={0.8} />
        <Rect x={10} y={-8} width={4} height={12} rx={2} fill="#F5F0E8" opacity={0.8} />
        <Rect x={18} y={-8} width={4} height={12} rx={2} fill="#F5F0E8" opacity={0.8} />
    </G>
  </Svg>
);

export const TheGiftsOfTheSeaThumb = ({ size = 56 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 56 56">
    <Rect width={56} height={56} rx={14} fill="#2D4A6A" />
    <Path d="M0 28 Q14 20 28 28 T56 28 V56 H0 Z" fill="#3D5A7A" />
    <Path d="M0 40 Q14 32 28 40 T56 40 V56 H0 Z" fill="#4D6A8A" />
  </Svg>
);

export const CraneMoonThumb = ({ size = 56 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 56 56">
    <Rect width={56} height={56} rx={14} fill="#2D3A2D" />
    <Circle cx={40} cy={16} r={6} fill="#F5F0E8" opacity={0.3} />
    {/* Tree silhouette */}
    <Rect x={12} y={30} width={4} height={26} fill="#1D2A1D" />
    <Path d="M2 35 Q14 20 26 35" fill="#1D2A1D" />
  </Svg>
);

export const SpiritLanternThumb = ({ size = 56 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 56 56">
    <Rect width={56} height={56} rx={14} fill="#3A3348" />
    <Circle cx={28} cy={28} r={12} fill="#EDE5F5" opacity={0.15} />
    <Circle cx={28} cy={28} r={6} fill="#8B6DAE" opacity={0.4} />
  </Svg>
);

export const TheTeaMastersMorningThumb = ({ size = 56 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 56 56">
    <Rect width={56} height={56} rx={14} fill="#3A2A28" />
    <Rect x={18} y={32} width={20} height={12} rx={2} fill="#F5F0E8" opacity={0.6} />
    <Path d="M28 22 Q28 10 32 10" stroke="#F5F0E8" opacity={0.3} strokeWidth={1} />
  </Svg>
);

export const ShelterInTheStormThumb = ({ size = 56 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 56 56">
    <Rect width={56} height={56} rx={14} fill="#2A2A38" />
    {/* Cottage silhouette */}
    <Path d="M12 40 L28 24 L44 40 V50 H12 Z" fill="#1A1A28" />
    <Rect x={24} y={36} width={8} height={8} rx={1} fill="#E8C88A" opacity={0.6} />
    {/* Rain drops */}
    <Path d="M40 10 L38 14M45 15 L43 19M50 10 L48 14" stroke="#F5F0E8" strokeWidth={1} opacity={0.2} />
  </Svg>
);

export const OnLettingGoThumb = ({ size = 56 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 56 56">
    <Rect width={56} height={56} rx={14} fill="#4A3A58" />
    {/* Ethereal feather */}
    <G transform="rotate(-30, 28, 28)">
      <Path d="M28 15 Q34 28 28 45" stroke="#F5F0E8" strokeWidth={1} opacity={0.4} />
      <Path d="M28 15 Q18 25 28 35 Q38 25 28 15" fill="#F5F0E8" opacity={0.2} />
    </G>
  </Svg>
);

export const TheBeautyOfSmallRitualsThumb = ({ size = 56 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 56 56">
    <Rect width={56} height={56} rx={14} fill="#3A3348" />
    {/* Candle */}
    <Rect x={26} y={30} width={4} height={20} fill="#F5F0E8" opacity={0.6} />
    <Circle cx={28} cy={22} r={6} fill="#E8C88A" opacity={0.3} />
    <Path d="M28 22 Q28 18 29 16" stroke="#E8C88A" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

export const TheMemoryOfStarsThumb = ({ size = 56 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 56 56">
    <Rect width={56} height={56} rx={14} fill="#1A2030" />
    <Circle cx={15} cy={15} r={1.5} fill="#F5F0E8" />
    <Circle cx={40} cy={20} r={2} fill="#F5F0E8" opacity={0.6} />
    <Circle cx={25} cy={40} r={1} fill="#F5F0E8" opacity={0.4} />
    <Path d="M10 40 Q28 30 46 42" stroke="#C8DEF0" strokeWidth={0.5} opacity={0.3} fill="none" />
  </Svg>
);

export const CitiesOfLightThumb = ({ size = 56 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 56 56">
    <Rect width={56} height={56} rx={14} fill="#1A303A" />
    <Path d="M0 35 Q14 30 28 35 T56 35" stroke="#C8DEF0" strokeWidth={1} opacity={0.2} fill="none" />
    <Path d="M0 45 Q14 40 28 45 T56 45" stroke="#C8DEF0" strokeWidth={1} opacity={0.15} fill="none" />
    <Circle cx={20} cy={30} r={1} fill="#C8DEF0" opacity={0.8} />
    <Circle cx={35} cy={38} r={1.5} fill="#C8DEF0" opacity={0.6} />
    <Circle cx={12} cy={42} r={0.8} fill="#C8DEF0" opacity={0.4} />
  </Svg>
);

// ─── NEW THUMBNAILS ───────────────────────────────────────────────────────────

// --- FOLKLORE ---
export const TheKeeperOfLostThingsThumb = ({ size = 56 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 56 56">
    <Rect width={56} height={56} rx={14} fill="#2D2B3D" />
    <Rect x={18} y={20} width={20} height={24} rx={2} fill="#C4AED8" opacity={0.3} />
    <Circle cx={28} cy={30} r={4} fill="#F5F0E8" opacity={0.6} />
    <Path d="M24 15 L32 15" stroke="#F5F0E8" strokeWidth={1} opacity={0.4} />
  </Svg>
);

export const TheBirdsCouncilThumb = ({ size = 56 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 56 56">
    <Rect width={56} height={56} rx={14} fill="#1A2636" />
    <Path d="M15 40 Q28 20 41 40" stroke="#E8DFF0" strokeWidth={2} opacity={0.4} fill="none" />
    <Path d="M20 35 Q28 25 36 35" stroke="#E8DFF0" strokeWidth={1.5} opacity={0.3} fill="none" />
    <Circle cx={28} cy={20} r={3} fill="#E8DFF0" opacity={0.6} />
  </Svg>
);

export const TheHouseOfEchoesThumb = ({ size = 56 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 56 56">
    <Rect width={56} height={56} rx={14} fill="#3A3348" />
    <Path d="M15 45 L15 30 L28 18 L41 30 L41 45 Z" fill="#F5F0E8" opacity={0.15} />
    <Circle cx={28} cy={32} r={8} stroke="#8B6DAE" strokeWidth={1} opacity={0.4} fill="none" />
    <Circle cx={28} cy={32} r={4} stroke="#8B6DAE" strokeWidth={1} opacity={0.2} fill="none" />
  </Svg>
);

export const TheMapmakersLastMapThumb = ({ size = 56 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 56 56">
    <Rect width={56} height={56} rx={14} fill="#2D3A2D" />
    <Path d="M12 12 L44 12 L44 44 L12 44 Z" stroke="#F5F0E8" strokeWidth={1} opacity={0.3} fill="none" />
    <Path d="M12 28 Q28 20 44 28" stroke="#F5F0E8" strokeWidth={0.5} opacity={0.2} fill="none" />
    <Path d="M28 12 Q35 28 28 44" stroke="#F5F0E8" strokeWidth={0.5} opacity={0.2} fill="none" />
    <Circle cx={35} cy={35} r={3} fill="#E8C88A" opacity={0.5} />
  </Svg>
);

export const TheGardenersPatienceThumb = ({ size = 56 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 56 56">
    <Rect width={56} height={56} rx={14} fill="#2A3A28" />
    <Circle cx={28} cy={45} r={12} fill="#A8C5A0" opacity={0.2} />
    <Path d="M28 45 V20" stroke="#F5F0E8" strokeWidth={1.5} opacity={0.4} />
    <Path d="M28 25 Q35 15 28 10 Q21 15 28 25" fill="#E8DFF0" opacity={0.6} />
  </Svg>
);

export const TheLibraryThatOnlyOpensAtNightThumb = ({ size = 56 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 56 56">
    <Rect width={56} height={56} rx={14} fill="#141424" />
    <Rect x={15} y={15} width={10} height={26} rx={1} fill="#8B6DAE" opacity={0.4} />
    <Rect x={28} y={20} width={10} height={21} rx={1} fill="#C4AED8" opacity={0.3} fillRule="evenodd" />
    <Rect x={41} y={10} width={10} height={31} rx={1} fill="#F5F0E8" opacity={0.2} />
  </Svg>
);

export const TheWeaverOfInvisibleThreadThumb = ({ size = 56 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 56 56">
    <Rect width={56} height={56} rx={14} fill="#3A2A28" />
    <Path d="M10 10 C15 45 40 10 46 46" stroke="#F5F0E8" strokeWidth={1} opacity={0.3} fill="none" />
    <Path d="M10 46 C15 10 40 45 46 10" stroke="#F5F0E8" strokeWidth={1} opacity={0.2} fill="none" />
    <Circle cx={28} cy={28} r={15} stroke="#E8C88A" strokeWidth={0.5} opacity={0.15} fill="none" />
  </Svg>
);

export const TheRiverThatFlowedUphillThumb = ({ size = 56 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 56 56">
    <Rect width={56} height={56} rx={14} fill="#1A2636" />
    <Path d="M10 45 Q28 50 46 45 T10 35 Q28 40 46 35 T10 25 Q28 30 46 25" stroke="#C8DEF0" strokeWidth={1.5} opacity={0.4} fill="none" />
    <Path d="M40 15 L28 5 L16 15" stroke="#F5F0E8" strokeWidth={2} opacity={0.5} fill="none" />
  </Svg>
);

// --- COZY ---
export const TheInnAtTheEdgeOfTheWorldThumb = ({ size = 56 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 56 56">
    <Rect width={56} height={56} rx={14} fill="#2A2A38" />
    <Path d="M10 42 L28 25 L46 42 V50 H10 Z" fill="#F5F0E8" opacity={0.1} />
    <Rect x={25} y={35} width={6} height={10} fill="#E8C88A" opacity={0.6} />
    <Circle cx={15} cy={15} r={4} fill="#F5F0E8" opacity={0.15} />
  </Svg>
);

export const TheAtticOfForgottenThingsThumb = ({ size = 56 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 56 56">
    <Rect width={56} height={56} rx={14} fill="#3A3348" />
    <Path d="M5 50 L28 10 L51 50 Z" stroke="#F5F0E8" strokeWidth={1} opacity={0.1} fill="none" />
    <Rect x={20} y={35} width={16} height={12} rx={1} fill="#C4AED8" opacity={0.3} />
    <Path d="M22 25 L34 25" stroke="#F5F0E8" strokeWidth={0.5} opacity={0.2} />
  </Svg>
);

export const TheBenchByTheRiverThumb = ({ size = 56 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 56 56">
    <Rect width={56} height={56} rx={14} fill="#2B5A80" />
    <Path d="M0 40 Q14 30 28 40 T56 40 V56 H0 Z" fill="#C8DEF0" opacity={0.2} />
    <Rect x={15} y={25} width={26} height={4} rx={1} fill="#F5F0E8" opacity={0.6} />
    <Rect x={18} y={29} width={2} height={8} fill="#F5F0E8" opacity={0.4} />
    <Rect x={36} y={29} width={2} height={8} fill="#F5F0E8" opacity={0.4} />
  </Svg>
);

export const TheKitchenThatNeverGetsDirtyThumb = ({ size = 56 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 56 56">
    <Rect width={56} height={56} rx={14} fill="#3A2A28" />
    <Circle cx={28} cy={28} r={18} stroke="#EDE5F5" strokeWidth={1} opacity={0.1} fill="none" />
    <Rect x={20} y={30} width={16} height={8} rx={4} fill="#F5F0E8" opacity={0.5} />
    <Path d="M24 25 Q28 15 32 25" stroke="#F5F0E8" strokeWidth={1.5} opacity={0.3} fill="none" />
  </Svg>
);

export const TheLibraryCartThumb = ({ size = 56 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 56 56">
    <Rect width={56} height={56} rx={14} fill="#2D4A6A" />
    <Rect x={15} y={20} width={26} height={20} rx={2} fill="#F5F0E8" opacity={0.2} />
    <Circle cx={18} cy={45} r={3} fill="#A9A3B5" opacity={0.6} />
    <Circle cx={38} cy={45} r={3} fill="#A9A3B5" opacity={0.6} />
    <Path d="M18 25 H28 M18 30 H38 M18 35 H34" stroke="#F5F0E8" strokeWidth={1} opacity={0.4} />
  </Svg>
);

export const TheStairwellAtDuskThumb = ({ size = 56 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 56 56">
    <Rect width={56} height={56} rx={14} fill="#4A3A28" />
    <Path d="M10 45 H20 V35 H30 V25 H40 V15 H50" stroke="#E8C88A" strokeWidth={2} opacity={0.7} fill="none" />
    <LinearGradient id="dusk" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor="#E8C88A" stopOpacity="0.4" />
        <Stop offset="1" stopColor="#8B4A40" stopOpacity="0.1" />
    </LinearGradient>
    <Rect width={56} height={56} fill="url(#dusk)" opacity={0.3} />
  </Svg>
);

export const TheSewingCircleThumb = ({ size = 56 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 56 56">
    <Rect width={56} height={56} rx={14} fill="#3A3348" />
    <Circle cx={28} cy={28} r={20} stroke="#C4AED8" strokeWidth={1} strokeDasharray="4 4" opacity={0.4} fill="none" />
    <Path d="M15 28 L41 28" stroke="#F5F0E8" strokeWidth={1} opacity={0.6} />
    <Circle cx={41} cy={28} r={1.5} fill="#F5F0E8" />
  </Svg>
);

export const TheMarketBeforeDawnThumb = ({ size = 56 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 56 56">
    <Rect width={56} height={56} rx={14} fill="#1A2030" />
    <Circle cx={45} cy={12} r={6} fill="#E8C88A" opacity={0.2} />
    <Rect x={10} y={35} width={12} height={12} rx={2} fill="#A8C5A0" opacity={0.5} />
    <Rect x={25} y={35} width={12} height={12} rx={2} fill="#F0D8D0" opacity={0.5} />
    <Rect x={40} y={35} width={12} height={12} rx={2} fill="#E8C88A" opacity={0.4} />
  </Svg>
);

// --- REFLECTIVE ---
export const OnTheMythOfConstantGrowthThumb = ({ size = 56 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 56 56">
    <Rect width={56} height={56} rx={14} fill="#2D2B3D" />
    <Path d="M28 50 V30" stroke="#A8C5A0" strokeWidth={2} opacity={0.6} />
    <Circle cx={28} cy={25} r={10} fill="#A8C5A0" opacity={0.2} />
    <Circle cx={28} cy={45} r={15} stroke="#F5F0E8" strokeWidth={0.5} opacity={0.1} fill="none" />
  </Svg>
);

export const OnBeingWrongThumb = ({ size = 56 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 56 56">
    <Rect width={56} height={56} rx={14} fill="#3D3A52" />
    <Path d="M15 15 L41 41 M15 41 L41 15" stroke="#F0D8D0" strokeWidth={1} opacity={0.2} />
    <Circle cx={28} cy={28} r={12} stroke="#F5F0E8" strokeWidth={2} opacity={0.6} fill="none" />
    <Path d="M28 16 V22" stroke="#F5F0E8" strokeWidth={2} opacity={0.6} />
  </Svg>
);

export const OnTheWeightYoureCarryingThumb = ({ size = 56 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 56 56">
    <Rect width={56} height={56} rx={14} fill="#2D2B3D" />
    <Path d="M10 45 Q28 10 46 45" stroke="#8B6DAE" strokeWidth={4} opacity={0.3} fill="none" />
    <Circle cx={28} cy={40} r={6} fill="#C4AED8" opacity={0.7} />
  </Svg>
);

export const OnSeasonsThumb = ({ size = 56 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 56 56">
    <Rect width={56} height={56} rx={14} fill="#2D2B3D" />
    <G transform="translate(28, 28)">
        <Circle r={18} stroke="#F5F0E8" strokeWidth={1} opacity={0.1} fill="none" />
        <Circle cx={14} cy={0} r={4} fill="#E8C88A" opacity={0.6} />
        <Circle cx={0} cy={14} r={4} fill="#A8C5A0" opacity={0.6} />
        <Circle cx={-14} cy={0} r={4} fill="#F0D8D0" opacity={0.6} />
        <Circle cx={0} cy={-14} r={4} fill="#C8DEF0" opacity={0.6} />
    </G>
  </Svg>
);

export const OnAuthenticityAsARadicalActThumb = ({ size = 56 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 56 56">
    <Rect width={56} height={56} rx={14} fill="#3D3A52" />
    <Circle cx={28} cy={28} r={20} stroke="#8B6DAE" strokeWidth={1} opacity={0.2} fill="none" />
    <Path d="M28 18 L32 28 L42 28 L34 34 L37 44 L28 38 L19 44 L22 34 L14 28 L24 28 Z" fill="#E8C88A" opacity={0.8} />
  </Svg>
);

export const OnSolitudeVsLonelinessThumb = ({ size = 56 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 56 56">
    <Rect width={56} height={56} rx={14} fill="#2D2B3D" />
    <Circle cx={28} cy={28} r={6} fill="#F5F0E8" opacity={0.8} />
    <Circle cx={28} cy={28} r={18} stroke="#F5F0E8" strokeWidth={1} opacity={0.1} fill="none" />
  </Svg>
);

export const OnForgivingYourselfThumb = ({ size = 56 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 56 56">
    <Rect width={56} height={56} rx={14} fill="#3D3A52" />
    <Path d="M28 45 C10 30 20 15 28 22 C36 15 46 30 28 45" fill="#F0D8D0" opacity={0.4} />
    <Circle cx={28} cy={28} r={22} stroke="#F5F0E8" strokeWidth={0.5} opacity={0.1} fill="none" />
  </Svg>
);

export const OnDeathMakingLifePreciousThumb = ({ size = 56 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 56 56">
    <Rect width={56} height={56} rx={14} fill="#1A1A1A" />
    <Circle cx={28} cy={28} r={12} fill="#E8C88A" opacity={0.6} />
    <Path d="M28 10 V46 M10 28 H46" stroke="#F5F0E8" strokeWidth={0.5} opacity={0.2} />
  </Svg>
);

// --- WONDER ---
export const OnConnectionsWeCantSeeThumb = ({ size = 56 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 56 56">
    <Rect width={56} height={56} rx={14} fill="#1A2030" />
    <Circle cx={15} cy={15} r={2} fill="#C8DEF0" />
    <Circle cx={40} cy={20} r={2} fill="#C8DEF0" />
    <Circle cx={25} cy={40} r={2} fill="#C8DEF0" />
    <Path d="M15 15 L40 20 L25 40 Z" stroke="#C8DEF0" strokeWidth={0.5} opacity={0.3} fill="none" />
    <Circle cx={28} cy={28} r={15} stroke="#F5F0E8" strokeWidth={0.5} opacity={0.1} fill="none" />
  </Svg>
);

export const OnTheAgeOfLightThumb = ({ size = 56 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 56 56">
    <Rect width={56} height={56} rx={14} fill="#141414" />
    <Circle cx={28} cy={28} r={4} fill="#F5F0E8" />
    <Circle cx={28} cy={28} r={10} stroke="#F5F0E8" strokeWidth={1} opacity={0.4} fill="none" />
    <Circle cx={28} cy={28} r={18} stroke="#F5F0E8" strokeWidth={0.5} opacity={0.2} fill="none" />
    <Path d="M28 0 V56 M0 28 H56" stroke="#F5F0E8" strokeWidth={0.1} opacity={0.3} />
  </Svg>
);

export const OnFractalsAndSelfSimilarityThumb = ({ size = 56 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 56 56">
    <Rect width={56} height={56} rx={14} fill="#1A2030" />
    <G transform="translate(28, 28)">
        <Path d="M0 -20 L5 -5 L20 0 L5 5 L0 20 L-5 5 L-20 0 L-5 -5 Z" fill="#C8DEF0" opacity={0.6} />
        <Path d="M0 -10 L2 -2 L10 0 L2 2 L0 10 L-2 2 L-10 0 L-2 -2 Z" fill="#F5F0E8" opacity={0.4} />
    </G>
  </Svg>
);

export const OnExtremophilesThumb = ({ size = 56 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 56 56">
    <Rect width={56} height={56} rx={14} fill="#3A1A1A" />
    <Path d="M0 45 Q28 35 56 45 V56 H0 Z" fill="#8B4A40" opacity={0.4} />
    <Circle cx={20} cy={30} r={4} fill="#F5F0E8" opacity={0.6} />
    <Path d="M18 30 L22 30 M20 28 L20 32" stroke="#3A1A1A" strokeWidth={1} />
  </Svg>
);

export const OnDecompositionThumb = ({ size = 56 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 56 56">
    <Rect width={56} height={56} rx={14} fill="#2D3A2D" />
    <Rect x={10} y={40} width={36} height={6} rx={1} fill="#4A3A28" opacity={0.6} />
    <Circle cx={15} cy={38} r={2} fill="#A8C5A0" opacity={0.4} />
    <Circle cx={25} cy={36} r={1.5} fill="#A8C5A0" opacity={0.3} />
    <Circle cx={38} cy={38} r={2.5} fill="#A8C5A0" opacity={0.5} />
  </Svg>
);

export const OnMycorrhizalNetworksThumb = ({ size = 56 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 56 56">
    <Rect width={56} height={56} rx={14} fill="#1A2E1A" />
    <Path d="M10 50 Q15 30 20 50 Q25 20 30 50 Q35 35 40 50 Q45 25 50 50" stroke="#F5F0E8" strokeWidth={0.5} opacity={0.2} fill="none" />
    <Circle cx={20} cy={45} r={3} fill="#A8C5A0" opacity={0.6} />
    <Circle cx={35} cy={42} r={2} fill="#A8C5A0" opacity={0.4} />
  </Svg>
);

export const OnTheResilienceOfLifeThumb = ({ size = 56 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 56 56">
    <Rect width={56} height={56} rx={14} fill="#2D2B3D" />
    <Path d="M15 45 Q28 15 41 45" stroke="#A8C5A0" strokeWidth={3} opacity={0.6} fill="none" />
    <Circle cx={28} cy={25} r={4} fill="#F5F0E8" opacity={0.8} />
  </Svg>
);

export const OnKindnessAsPhysicsThumb = ({ size = 56 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 56 56">
    <Rect width={56} height={56} rx={14} fill="#3D3A52" />
    <Circle cx={28} cy={28} r={4} fill="#8B6DAE" />
    <Circle cx={28} cy={28} r={10} stroke="#8B6DAE" strokeWidth={1} opacity={0.4} fill="none" />
    <Circle cx={28} cy={28} r={18} stroke="#8B6DAE" strokeWidth={0.5} opacity={0.2} fill="none" />
    <Circle cx={28} cy={28} r={26} stroke="#8B6DAE" strokeWidth={0.2} opacity={0.1} fill="none" />
  </Svg>
);

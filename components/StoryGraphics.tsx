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

export const MoonRabbitThumb = ({ size = 56 }: { size?: number }) => (
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

export const GiftsSeaThumb = ({ size = 56 }: { size?: number }) => (
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

export const TeaMasterThumb = ({ size = 56 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 56 56">
    <Rect width={56} height={56} rx={14} fill="#3A2A28" />
    <Rect x={18} y={32} width={20} height={12} rx={2} fill="#F5F0E8" opacity={0.6} />
    <Path d="M28 22 Q28 10 32 10" stroke="#F5F0E8" opacity={0.3} strokeWidth={1} />
  </Svg>
);

export const ShelterStormThumb = ({ size = 56 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 56 56">
    <Rect width={56} height={56} rx={14} fill="#2A2A38" />
    {/* Cottage silhouette */}
    <Path d="M12 40 L28 24 L44 40 V50 H12 Z" fill="#1A1A28" />
    <Rect x={24} y={36} width={8} height={8} rx={1} fill="#E8C88A" opacity={0.6} />
    {/* Rain drops */}
    <Path d="M40 10 L38 14M45 15 L43 19M50 10 L48 14" stroke="#F5F0E8" strokeWidth={1} opacity={0.2} />
  </Svg>
);

export const LettingGoThumb = ({ size = 56 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 56 56">
    <Rect width={56} height={56} rx={14} fill="#4A3A58" />
    {/* Ethereal feather */}
    <G transform="rotate(-30, 28, 28)">
      <Path d="M28 15 Q34 28 28 45" stroke="#F5F0E8" strokeWidth={1} opacity={0.4} />
      <Path d="M28 15 Q18 25 28 35 Q38 25 28 15" fill="#F5F0E8" opacity={0.2} />
    </G>
  </Svg>
);

export const SmallRitualsThumb = ({ size = 56 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 56 56">
    <Rect width={56} height={56} rx={14} fill="#3A3348" />
    {/* Candle */}
    <Rect x={26} y={30} width={4} height={20} fill="#F5F0E8" opacity={0.6} />
    <Circle cx={28} cy={22} r={6} fill="#E8C88A" opacity={0.3} />
    <Path d="M28 22 Q28 18 29 16" stroke="#E8C88A" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

export const MemoryStarsThumb = ({ size = 56 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 56 56">
    <Rect width={56} height={56} rx={14} fill="#1A2030" />
    <Circle cx={15} cy={15} r={1.5} fill="#F5F0E8" />
    <Circle cx={40} cy={20} r={2} fill="#F5F0E8" opacity={0.6} />
    <Circle cx={25} cy={40} r={1} fill="#F5F0E8" opacity={0.4} />
    <Path d="M10 40 Q28 30 46 42" stroke="#C8DEF0" strokeWidth={0.5} opacity={0.3} fill="none" />
  </Svg>
);

export const CitiesLightThumb = ({ size = 56 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 56 56">
    <Rect width={56} height={56} rx={14} fill="#1A303A" />
    <Path d="M0 35 Q14 30 28 35 T56 35" stroke="#C8DEF0" strokeWidth={1} opacity={0.2} fill="none" />
    <Path d="M0 45 Q14 40 28 45 T56 45" stroke="#C8DEF0" strokeWidth={1} opacity={0.15} fill="none" />
    <Circle cx={20} cy={30} r={1} fill="#C8DEF0" opacity={0.8} />
    <Circle cx={35} cy={38} r={1.5} fill="#C8DEF0" opacity={0.6} />
    <Circle cx={12} cy={42} r={0.8} fill="#C8DEF0" opacity={0.4} />
  </Svg>
);

import React from 'react';
import Svg, { Rect, G, Text as SvgText, Path } from 'react-native-svg';
import { tokens } from '../constants/theme';

interface SheepMascotProps {
  size?: number;
  sleeping?: boolean;
  style?: any;
}

export const SheepMascot: React.FC<SheepMascotProps> = ({ size = 120, sleeping = false, style = {} }) => (
  <Svg width={size} height={size} viewBox="0 0 64 64" style={style}>
    {/* Wool body */}
    <Rect x="14" y="22" width="36" height="28" fill="#F5EEF8" />
    <Rect x="18" y="18" width="28" height="4" fill="#F5EEF8" />
    <Rect x="12" y="26" width="4" height="20" fill="#F5EEF8" />
    <Rect x="48" y="26" width="4" height="20" fill="#F5EEF8" />
    <Rect x="16" y="48" width="32" height="4" fill="#E8DFF0" />
    
    {/* Face */}
    <Rect x="26" y="28" width="16" height="14" fill="#E8D8C0" />
    <Rect x="24" y="30" width="2" height="10" fill="#E8D8C0" />
    <Rect x="42" y="30" width="2" height="10" fill="#E8D8C0" />
    
    {/* Eyes */}
    {sleeping ? (
      <G>
        <Rect x="29" y="33" width="4" height="2" fill="#2D2B3D" />
        <Rect x="37" y="33" width="4" height="2" fill="#2D2B3D" />
      </G>
    ) : (
      <G>
        <Rect x="30" y="32" width="2" height="4" fill="#2D2B3D" />
        <Rect x="38" y="32" width="2" height="4" fill="#2D2B3D" />
        <Rect x="30" y="32" width="2" height="2" fill="#FFFFFF" />
      </G>
    )}
    
    {/* Cheeks */}
    <Rect x="26" y="36" width="4" height="2" fill="#E8A8A0" opacity={0.7} />
    <Rect x="40" y="36" width="4" height="2" fill="#E8A8A0" opacity={0.7} />
    
    {/* Mouth */}
    <Rect x="34" y="37" width="2" height="2" fill="#2D2B3D" />
    <Rect x="36" y="38" width="2" height="2" fill="#2D2B3D" />
    
    {/* Ears */}
    <Rect x="22" y="24" width="4" height="6" fill="#E8D8C0" />
    <Rect x="44" y="24" width="4" height="6" fill="#E8D8C0" />
    
    {/* Flower */}
    <Rect x="18" y="16" width="8" height="8" fill="#C8DEF0" />
    <Rect x="22" y="14" width="4" height="4" fill="#C8DEF0" />
    <Rect x="14" y="18" width="4" height="4" fill="#C8DEF0" />
    <Rect x="20" y="18" width="4" height="4" fill="#F0E868" />
    <Rect x="14" y="14" width="4" height="4" fill="#78B868" />
    
    {/* Hooves */}
    <Rect x="18" y="50" width="4" height="4" fill="#C8B888" />
    <Rect x="28" y="50" width="4" height="4" fill="#C8B888" />
    <Rect x="36" y="50" width="4" height="4" fill="#C8B888" />
    <Rect x="44" y="50" width="4" height="4" fill="#C8B888" />
    
    {/* Zzz for sleeping */}
    {sleeping && (
      <G>
        <SvgText x="48" y="22" fontSize="6" fill={tokens.colors.common.accent} fontWeight="bold" fontFamily="monospace">z</SvgText>
        <SvgText x="52" y="18" fontSize="5" fill={tokens.colors.common.accentSoft} fontWeight="bold" fontFamily="monospace">z</SvgText>
        <SvgText x="55" y="14" fontSize="4" fill={tokens.colors.light.accentLight} fontWeight="bold" fontFamily="monospace">z</SvgText>
      </G>
    )}
  </Svg>
);

export const Sparkle = ({ size = 16, color = tokens.colors.common.accent }) => (
  <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <Path d="M8 0L9.5 6.5L16 8L9.5 9.5L8 16L6.5 9.5L0 8L6.5 6.5L8 0Z" fill={color} />
  </Svg>
);

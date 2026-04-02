import React from 'react';
import Svg, { Rect } from 'react-native-svg';

export const SheepStage3 = ({ size = 80 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    {/* Wool body */}
    <Rect x="16" y="26" width="32" height="24" fill="#F5EEF8" />
    <Rect x="20" y="22" width="24" height="4" fill="#F5EEF8" />
    <Rect x="14" y="30" width="4" height="16" fill="#F5EEF8" />
    <Rect x="46" y="30" width="4" height="16" fill="#F5EEF8" />
    <Rect x="18" y="48" width="28" height="2" fill="#E8DFF0" />
    <Rect x="16" y="38" width="32" height="10" fill="#EDE5F5" opacity={0.4} />
    {/* Outline */}
    <Rect x="20" y="22" width="24" height="2" fill="#2D2B3D" />
    <Rect x="18" y="24" width="2" height="2" fill="#2D2B3D" />
    <Rect x="44" y="24" width="2" height="2" fill="#2D2B3D" />
    <Rect x="14" y="26" width="2" height="2" fill="#2D2B3D" />
    <Rect x="48" y="26" width="2" height="2" fill="#2D2B3D" />
    <Rect x="12" y="28" width="2" height="2" fill="#2D2B3D" />
    <Rect x="50" y="28" width="2" height="2" fill="#2D2B3D" />
    <Rect x="12" y="30" width="2" height="18" fill="#2D2B3D" />
    <Rect x="50" y="30" width="2" height="18" fill="#2D2B3D" />
    <Rect x="14" y="48" width="2" height="2" fill="#2D2B3D" />
    <Rect x="48" y="48" width="2" height="2" fill="#2D2B3D" />
    <Rect x="18" y="50" width="28" height="2" fill="#2D2B3D" />
    {/* Face */}
    <Rect x="26" y="30" width="15" height="12" fill="#E8D8C0" />
    <Rect x="24" y="32" width="2" height="8" fill="#E8D8C0" />
    <Rect x="40" y="32" width="2" height="8" fill="#E8D8C0" />
    {/* Eyes */}
    <Rect x="30" y="34" width="2" height="2" fill="#2D2B3D" />
    <Rect x="36" y="34" width="2" height="2" fill="#2D2B3D" />
    {/* Cheeks */}
    <Rect x="26" y="38" width="4" height="2" fill="#E8A8A0" opacity={0.7} />
    <Rect x="38" y="38" width="4" height="2" fill="#E8A8A0" opacity={0.7} />
    {/* Mouth */}
    <Rect x="33" y="39" width="3" height="1.5" fill="#2D2B3D" />
    {/* Ears */}
    <Rect x="22" y="28" width="4" height="4" fill="#E8D8C0" />
    <Rect x="41" y="28" width="4" height="4" fill="#E8D8C0" />
    {/* Hooves */}
    <Rect x="20" y="50" width="4" height="4" fill="#C8B888" />
    <Rect x="27" y="50" width="4" height="4" fill="#C8B888" />
    <Rect x="35" y="50" width="4" height="4" fill="#C8B888" />
    <Rect x="42" y="50" width="4" height="4" fill="#C8B888" />
  </Svg>
);

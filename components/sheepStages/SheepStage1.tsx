import React from 'react';
import Svg, { Rect } from 'react-native-svg';

export const SheepStage1 = ({ size = 80 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    {/* Wool body */}
    <Rect x="24" y="32" width="16" height="12" fill="#F5EEF8" />
    <Rect x="26" y="30" width="12" height="4" fill="#F5EEF8" />
    <Rect x="22" y="33" width="2" height="11" fill="#F5EEF8" />
    <Rect x="40" y="33" width="2" height="11" fill="#F5EEF8" />
    <Rect x="24" y="44" width="16" height="2" fill="#E8DFF0" />
    {/* Outline */}
    <Rect x="26" y="30" width="12" height="1" fill="#2D2B3D" />
    <Rect x="24" y="31" width="2" height="1" fill="#2D2B3D" />
    <Rect x="38" y="31" width="2" height="1" fill="#2D2B3D" />
    <Rect x="22" y="32" width="2" height="1" fill="#2D2B3D" />
    <Rect x="40" y="32" width="2" height="1" fill="#2D2B3D" />
    <Rect x="21" y="33" width="1" height="12" fill="#2D2B3D" />
    <Rect x="42" y="33" width="1" height="12" fill="#2D2B3D" />
    <Rect x="22" y="44" width="2" height="1" fill="#2D2B3D" />
    <Rect x="40" y="44" width="2" height="1" fill="#2D2B3D" />
    <Rect x="24" y="45" width="16" height="1" fill="#2D2B3D" />
    {/* Face */}
    <Rect x="28" y="36" width="8" height="6" fill="#E8D8C0" />
    <Rect x="30" y="38" width="2" height="2" fill="#2D2B3D" />
    <Rect x="34" y="38" width="2" height="2" fill="#2D2B3D" />
    {/* Cheeks */}
    <Rect x="28" y="40" width="2" height="1" fill="#E8A8A0" opacity={0.7} />
    <Rect x="35" y="40" width="2" height="1" fill="#E8A8A0" opacity={0.7} />
    {/* Ears */}
    <Rect x="26" y="35" width="2" height="3" fill="#E8D8C0" />
    <Rect x="36" y="35" width="2" height="3" fill="#E8D8C0" />
    {/* Hooves */}
    <Rect x="28" y="45" width="2" height="2" fill="#C8B888" />
    <Rect x="34" y="45" width="2" height="2" fill="#C8B888" />
  </Svg>
);

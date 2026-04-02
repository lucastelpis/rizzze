import React from 'react';
import Svg, { Rect } from 'react-native-svg';

export const SheepStage2 = ({ size = 80 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    {/* Wool body */}
    <Rect x="20" y="30" width="24" height="18" fill="#F5EEF8" />
    <Rect x="22" y="28" width="20" height="4" fill="#F5EEF8" />
    <Rect x="18" y="32" width="2" height="14" fill="#F5EEF8" />
    <Rect x="44" y="32" width="2" height="14" fill="#F5EEF8" />
    <Rect x="20" y="46" width="24" height="2" fill="#E8DFF0" />
    {/* Outline */}
    <Rect x="22" y="28" width="20" height="1" fill="#2D2B3D" />
    <Rect x="20" y="29" width="2" height="1" fill="#2D2B3D" />
    <Rect x="42" y="29" width="2" height="1" fill="#2D2B3D" />
    <Rect x="18" y="30" width="2" height="1" fill="#2D2B3D" />
    <Rect x="44" y="30" width="2" height="1" fill="#2D2B3D" />
    <Rect x="17" y="31" width="1" height="16" fill="#2D2B3D" />
    <Rect x="46" y="31" width="1" height="16" fill="#2D2B3D" />
    <Rect x="18" y="46" width="2" height="1" fill="#2D2B3D" />
    <Rect x="44" y="46" width="2" height="1" fill="#2D2B3D" />
    <Rect x="20" y="47" width="24" height="1" fill="#2D2B3D" />
    {/* Face */}
    <Rect x="26" y="34" width="13" height="8" fill="#E8D8C0" />
    <Rect x="24" y="36" width="2" height="5" fill="#E8D8C0" />
    <Rect x="38" y="36" width="2" height="5" fill="#E8D8C0" />
    {/* Eyes */}
    <Rect x="29" y="36" width="2" height="2" fill="#2D2B3D" />
    <Rect x="35" y="36" width="2" height="2" fill="#2D2B3D" />
    {/* Cheeks */}
    <Rect x="26" y="39" width="3" height="1" fill="#E8A8A0" opacity={0.7} />
    <Rect x="38" y="39" width="3" height="1" fill="#E8A8A0" opacity={0.7} />
    {/* Mouth */}
    <Rect x="33" y="40" width="1" height="1" fill="#2D2B3D" />
    {/* Ears */}
    <Rect x="24" y="32" width="2" height="4" fill="#E8D8C0" />
    <Rect x="39" y="32" width="2" height="4" fill="#E8D8C0" />
    {/* Hooves */}
    <Rect x="24" y="47" width="2" height="2" fill="#C8B888" />
    <Rect x="29" y="47" width="2" height="2" fill="#C8B888" />
    <Rect x="34" y="47" width="2" height="2" fill="#C8B888" />
    <Rect x="39" y="47" width="2" height="2" fill="#C8B888" />
  </Svg>
);

import React from 'react';
import Svg, { Rect } from 'react-native-svg';

export const SheepStage6 = ({ size = 80 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    {/* Golden wool body */}
    <Rect x="14" y="22" width="36" height="28" fill="#F8F0D8" />
    <Rect x="18" y="18" width="28" height="4" fill="#F8F0D8" />
    <Rect x="12" y="26" width="4" height="20" fill="#F8F0D8" />
    <Rect x="48" y="26" width="4" height="20" fill="#F8F0D8" />
    <Rect x="16" y="20" width="2" height="2" fill="#F8F0D8" />
    <Rect x="46" y="20" width="2" height="2" fill="#F8F0D8" />
    <Rect x="16" y="48" width="32" height="4" fill="#F0E8C8" />
    <Rect x="14" y="38" width="36" height="12" fill="#F0E8C8" opacity={0.5} />
    <Rect x="14" y="48" width="36" height="4" fill="#F0E8C8" />
    <Rect x="52" y="24" width="2" height="26" fill="#F0E8C8" />
    <Rect x="10" y="24" width="2" height="26" fill="#F0E8C8" />
    <Rect x="12" y="22" width="2" height="4" fill="#F0E8C8" />
    <Rect x="12" y="45" width="2" height="5" fill="#F0E8C8" />
    <Rect x="50" y="45" width="2" height="5" fill="#F0E8C8" />
    <Rect x="50" y="22" width="2" height="4" fill="#F0E8C8" />
    <Rect x="14" y="38" width="36" height="12" fill="#F0E8C8" opacity={0.5} />
    {/* Golden outline */}
    <Rect x="18" y="16" width="28" height="2" fill="#B8964A" />
    <Rect x="16" y="18" width="4" height="2" fill="#B8964A" />
    <Rect x="44" y="18" width="4" height="2" fill="#B8964A" />
    <Rect x="12" y="20" width="4" height="2" fill="#B8964A" />
    <Rect x="48" y="20" width="4" height="2" fill="#B8964A" />
    <Rect x="8" y="22" width="4" height="2" fill="#B8964A" />
    <Rect x="52" y="22" width="4" height="2" fill="#B8964A" />
    <Rect x="8" y="24" width="2" height="26" fill="#B8964A" />
    <Rect x="54" y="24" width="2" height="26" fill="#B8964A" />
    <Rect x="10" y="50" width="4" height="2" fill="#B8964A" />
    <Rect x="50" y="50" width="4" height="2" fill="#B8964A" />
    <Rect x="14" y="52" width="36" height="2" fill="#B8964A" />
    {/* Face */}
    <Rect x="26" y="28" width="16" height="14" fill="#E8D8C0" />
    <Rect x="24" y="30" width="2" height="10" fill="#E8D8C0" />
    <Rect x="42" y="30" width="2" height="10" fill="#E8D8C0" />
    {/* Eyes */}
    <Rect x="30" y="32" width="2" height="2" fill="#2D2B3D" />
    <Rect x="30" y="34" width="2" height="2" fill="#2D2B3D" />
    <Rect x="38" y="32" width="2" height="2" fill="#2D2B3D" />
    <Rect x="38" y="34" width="2" height="2" fill="#2D2B3D" />
    {/* Cheeks */}
    <Rect x="26" y="36" width="4" height="2" fill="#E8A8A0" opacity={0.7} />
    <Rect x="40" y="36" width="4" height="2" fill="#E8A8A0" opacity={0.7} />
    {/* Mouth */}
    <Rect x="34" y="37" width="2" height="2" fill="#2D2B3D" />
    <Rect x="36" y="38" width="2" height="2" fill="#2D2B3D" />
    {/* Ears */}
    <Rect x="22" y="24" width="4" height="6" fill="#E8D8C0" />
    <Rect x="44" y="24" width="4" height="6" fill="#E8D8C0" />
    {/* Hooves */}
    <Rect x="16" y="52" width="4" height="4" fill="#C8B888" />
    <Rect x="25" y="52" width="4" height="4" fill="#C8B888" />
    <Rect x="34" y="52" width="4" height="4" fill="#C8B888" />
    <Rect x="43" y="52" width="4" height="4" fill="#C8B888" />
  </Svg>
);

import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface ToolIconProps {
  size?: number;
  color?: string;
  opacity?: number;
}

// Axe Icon (Lucide-style)
export const AxeIcon = ({ size = 24, color = "currentColor", opacity = 1 }: ToolIconProps) => (
  <Svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={color} 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ opacity }}
  >
    <Path d="m14 12-8.381 8.38a1 1 0 0 1-3.001-3L11 9"/>
    <Path d="M15 15.5a.5.5 0 0 0 .5.5A6.5 6.5 0 0 0 22 9.5a.5.5 0 0 0-.5-.5h-1.672a2 2 0 0 1-1.414-.586l-5.062-5.062a1.205 1.205 0 0 0-1.704 0L9.352 5.648a1.205 1.205 0 0 0 0 1.704l5.062 5.062A2 2 0 0 1 15 13.828z"/>
  </Svg>
);

// Pickaxe Icon (Lucide-style)
export const PickaxeIcon = ({ size = 24, color = "currentColor", opacity = 1 }: ToolIconProps) => (
  <Svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={color} 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ opacity }}
  >
    <Path d="m14 13-8.381 8.38a1 1 0 0 1-3.001-3L11 9.999"/>
    <Path d="M15.973 4.027A13 13 0 0 0 5.902 2.373c-1.398.342-1.092 2.158.277 2.601a19.9 19.9 0 0 1 5.822 3.024"/>
    <Path d="M16.001 11.999a19.9 19.9 0 0 1 3.024 5.824c.444 1.369 2.26 1.676 2.603.278A13 13 0 0 0 20 8.069"/>
    <Path d="M18.352 3.352a1.205 1.205 0 0 0-1.704 0l-5.296 5.296a1.205 1.205 0 0 0 0 1.704l2.296 2.296a1.205 1.205 0 0 0 1.704 0l5.296-5.296a1.205 1.205 0 0 0 0-1.704z"/>
  </Svg>
);

// Trimmer Icon (Formerly Scythe, Lucide Scissors)
export const TrimmerIcon = ({ size = 24, color = "currentColor", opacity = 1 }: ToolIconProps) => (
  <Svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={color} 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ opacity }}
  >
    <Circle cx="6" cy="6" r="3"/>
    <Path d="M8.12 8.12 12 12"/>
    <Path d="M20 4 8.12 15.88"/>
    <Circle cx="6" cy="18" r="3"/>
    <Path d="M14.8 14.8 20 20"/>
  </Svg>
);

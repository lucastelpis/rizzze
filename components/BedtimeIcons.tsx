import React from 'react';
import Svg, { Path, Rect, Circle, G } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

export const CloudIcon: React.FC<IconProps> = ({ size = 24, color = "currentColor" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M17.5 19C15.01 19 13 16.99 13 14.5C13 12.01 15.01 10 17.5 10C19.99 10 22 12.01 22 14.5C22 16.99 19.99 19 17.5 19ZM6.5 19C4.01 19 2 16.99 2 14.5C2 12.01 4.01 10 6.5 10C8.99 10 11 12.01 11 14.5C11 16.99 8.99 19 6.5 19ZM12 14C9.79 14 8 12.21 8 10C8 7.79 9.79 6 12 6C14.21 6 16 7.79 16 10C16 12.21 14.21 14 12 14Z" fill={color} />
    <Path d="M9 20L8 22M12 20L11 22M15 20L14 22" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const StoriesIcon: React.FC<IconProps> = ({ size = 24, color = "currentColor" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 19.5V4.5C4 3.67157 4.67157 3 5.5 3H18.5V17H6.5C5.11929 17 4 18.1193 4 19.5Z" stroke={color} strokeWidth="2" fill="none" />
    <Path d="M18.5 17V21H6.5C5.11929 21 4 19.8807 4 18.5" stroke={color} strokeWidth="2" />
    <Path d="M8 7H14M8 11H14" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const GamesIcon: React.FC<IconProps> = ({ size = 24, color = "currentColor" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M10 10V6C10 4.89543 10.8954 4 12 4C13.1046 4 14 4.89543 14 6V10M10 10H6C4.89543 10 4 10.8954 4 12C4 13.1046 4.89543 14 6 14H10M10 14V18C10 19.1046 10.8954 20 12 20C13.1046 20 14 19.1046 14 18V14M14 14H18C19.1046 14 20 13.1046 20 12C20 10.8954 19.1046 10 18 10H14" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Rect x="9" y="9" width="6" height="6" rx="1" fill={color} />
  </Svg>
);

export const TrackerIcon: React.FC<IconProps> = ({ size = 24, color = "currentColor" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 19V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19Z" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M7 16L11 10L14 13L17 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);


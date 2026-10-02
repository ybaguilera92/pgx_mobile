import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export interface AppIconProps {
  name: string;
  color?: string;
  size?: number;
  direction?: 'rtl' | 'ltr';
  allowFontScaling?: boolean;
  style?: any;
}

/**
 * Native mobile icon component powered by Expo MaterialCommunityIcons glyphs.
 * Used by Metro bundler on Android / iOS devices.
 * Uses font glyphs exclusively — ZERO web DOM tags like svg/circle.
 */
export const AppIcon: React.FC<AppIconProps> = ({
  name,
  color = '#002E62',
  size = 24,
  style,
}) => {
  if (!name || typeof name !== 'string') {
    return null;
  }

  // Map any aliases or normalize icon names for MaterialCommunityIcons
  let iconName = name;

  switch (name) {
    case 'qr-code':
      iconName = 'qrcode-scan';
      break;
    case 'cross':
    case 'x':
      iconName = 'close';
      break;
    case 'moon':
      iconName = 'weather-night';
      break;
    case 'sun':
      iconName = 'white-balance-sunny';
      break;
    case 'file-text':
      iconName = 'file-document-outline';
      break;
    case 'check':
      iconName = 'check-circle';
      break;
    case 'search':
      iconName = 'magnify';
      break;
    case 'refresh-cw':
      iconName = 'refresh';
      break;
    case 'file-upload':
      iconName = 'upload';
      break;
    case 'shield':
      iconName = 'shield-check';
      break;
    case 'flash-on':
      iconName = 'flash';
      break;
    default:
      iconName = name;
  }

  return (
    <MaterialCommunityIcons
      name={iconName as any}
      size={size}
      color={color}
      style={style}
    />
  );
};

export default AppIcon;

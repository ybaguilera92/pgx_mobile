import React from 'react';
import {
  QrCode,
  Eye,
  EyeOff,
  X,
  Moon,
  Sun,
  Camera,
  FileText,
  Download,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Search,
  Upload,
  Keyboard,
  ShieldCheck,
} from 'lucide-react';

export interface AppIconProps {
  name: string;
  color?: string;
  size?: number;
  direction?: 'rtl' | 'ltr';
  allowFontScaling?: boolean;
  style?: any;
}

/**
 * Universal icon component that renders smoothly on Web and Mobile,
 * using crisp SVG icons and preventing missing font or JSX build errors.
 */
export const AppIcon: React.FC<AppIconProps> = ({
  name,
  color = '#002E62',
  size = 24,
  style,
}) => {
  const iconProps = { color, size, style };

  switch (name) {
    case 'qrcode-scan':
    case 'qrcode':
    case 'qr-code':
      return <QrCode {...iconProps} />;
    case 'eye':
      return <Eye {...iconProps} />;
    case 'eye-off':
      return <EyeOff {...iconProps} />;
    case 'close':
    case 'cross':
    case 'x':
      return <X {...iconProps} />;
    case 'weather-night':
    case 'moon':
      return <Moon {...iconProps} />;
    case 'white-balance-sunny':
    case 'sun':
      return <Sun {...iconProps} />;
    case 'camera':
    case 'camera-reverse':
    case 'camera-switch':
      return <Camera {...iconProps} />;
    case 'file-document-outline':
    case 'file-pdf-box':
    case 'file-text':
      return <FileText {...iconProps} />;
    case 'download':
      return <Download {...iconProps} />;
    case 'alert-circle':
    case 'alert':
      return <AlertCircle {...iconProps} />;
    case 'check-circle':
    case 'check':
      return <CheckCircle2 {...iconProps} />;
    case 'refresh':
    case 'refresh-cw':
      return <RefreshCw {...iconProps} />;
    case 'magnify':
    case 'search':
      return <Search {...iconProps} />;
    case 'upload':
    case 'file-upload':
      return <Upload {...iconProps} />;
    case 'keyboard':
    case 'keyboard-outline':
      return <Keyboard {...iconProps} />;
    case 'shield-check':
    case 'shield':
      return <ShieldCheck {...iconProps} />;
    default:
      return <Search {...iconProps} />;
  }
};

export default AppIcon;

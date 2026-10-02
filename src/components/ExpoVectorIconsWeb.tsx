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
  ChevronLeft,
  ChevronRight,
  Menu,
} from 'lucide-react';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: any;
}

export const MaterialCommunityIcons: React.FC<IconProps> = ({
  name,
  size = 24,
  color = 'currentColor',
  style,
}) => {
  const iconProps = { size, color, style };

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
    case 'chevron-left':
    case 'arrow-left':
      return <ChevronLeft {...iconProps} />;
    case 'chevron-right':
    case 'arrow-right':
      return <ChevronRight {...iconProps} />;
    case 'menu':
      return <Menu {...iconProps} />;
    default:
      return <Search {...iconProps} />;
  }
};

export default {
  MaterialCommunityIcons,
};

import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { IconButton } from 'react-native-paper';
import jsQR from 'jsqr';

interface QrCodeScanProps {
  onClear: (val: boolean) => void;
  qrScanValue: (value: string) => void;
  isLandscape?: boolean;
}

export const QrCodeScan: React.FC<QrCodeScanProps> = ({ onClear, qrScanValue }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualMode, setManualMode] = useState(false);

  // Web camera refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleQrDetected = (codeText: string) => {
    setIsProcessing(true);
    qrScanValue(codeText);
    stopWebCamera();
    onClear(false);
  };

  const startWebCamera = async () => {
    if (Platform.OS !== 'web') return;
    setErrorMessage('');
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setHasPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        requestAnimationFrame(scanTick);
      }
    } catch (err: any) {
      console.warn('Camera error:', err);
      setHasPermission(false);
      setErrorMessage('Could not open camera. You can upload an image of your QR code below.');
      setManualMode(true);
    }
  };

  const stopWebCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const scanTick = () => {
    if (!videoRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
      animationFrameRef.current = requestAnimationFrame(scanTick);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'attemptBoth',
    });

    if (code && code.data) {
      handleQrDetected(code.data);
      return;
    }

    animationFrameRef.current = requestAnimationFrame(scanTick);
  };

  useEffect(() => {
    if (Platform.OS === 'web') {
      startWebCamera();
    }
    return () => {
      stopWebCamera();
    };
  }, []);

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setErrorMessage('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setIsProcessing(false);
          setErrorMessage('Failed to create decoding canvas.');
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth',
        });

        if (code && code.data) {
          handleQrDetected(code.data);
        } else {
          setIsProcessing(false);
          setErrorMessage('No QR code found in this image. Please try another image.');
        }
      };
      img.onerror = () => {
        setIsProcessing(false);
        setErrorMessage('Failed to read image file.');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <View style={styles.container}>
      {/* Header bar */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Scan PGx QR Code</Text>
        <IconButton
          icon="close"
          iconColor="#ffffff"
          size={24}
          onPress={() => {
            stopWebCamera();
            onClear(false);
          }}
        />
      </View>

      {/* Main Viewport */}
      <View style={styles.scannerArea}>
        {Platform.OS === 'web' && (
          <>
            <video
              ref={videoRef}
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: manualMode ? 'none' : 'block',
              }}
              muted
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </>
        )}

        {/* Viewfinder Target */}
        {!manualMode && (
          <View style={styles.targetContainer}>
            <View style={styles.targetBox}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
              <View style={styles.laserLine} />
            </View>
            <Text style={styles.instructionText}>Align the QR code within the frame</Text>
          </View>
        )}

        {/* Manual Image Upload Mode */}
        {manualMode && (
          <View style={styles.manualContainer}>
            <Text style={styles.manualTitle}>Upload QR Code Image</Text>
            <Text style={styles.manualSubtitle}>
              Select an image containing your PGx report QR code to scan it.
            </Text>

            {Platform.OS === 'web' && (
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFile}
                style={{ display: 'none' }}
              />
            )}

            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => {
                if (Platform.OS === 'web' && fileInputRef.current) {
                  fileInputRef.current.click();
                }
              }}
            >
              <Text style={styles.uploadButtonText}>Choose Image</Text>
            </TouchableOpacity>

            {hasPermission === false && (
              <TouchableOpacity onPress={startWebCamera} style={styles.retryBtn}>
                <Text style={styles.retryText}>Retry camera access</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Error notification */}
        {errorMessage ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Processing Spinner */}
        {isProcessing && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#3C8DBC" />
            <Text style={styles.loadingText}>Processing QR Code...</Text>
          </View>
        )}
      </View>

      {/* Footer controls */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.toggleModeBtn}
          onPress={() => setManualMode(!manualMode)}
        >
          <Text style={styles.toggleModeText}>
            {manualMode ? 'Switch to Live Camera' : 'Upload Image Instead'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            stopWebCamera();
            onClear(false);
          }}
          style={styles.cancelBtn}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    zIndex: 10,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scannerArea: {
    flex: 1,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  targetContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  targetBox: {
    width: 260,
    height: 260,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#3C8DBC',
  },
  topLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 10,
  },
  topRight: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 10,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 10,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 10,
  },
  laserLine: {
    position: 'absolute',
    left: 10,
    right: 10,
    top: '50%',
    height: 2,
    backgroundColor: '#3C8DBC',
  },
  instructionText: {
    color: '#f1f5f9',
    marginTop: 20,
    fontSize: 13,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  manualContainer: {
    padding: 24,
    alignItems: 'center',
    maxWidth: 380,
    zIndex: 5,
  },
  manualTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  manualSubtitle: {
    color: '#94a3b8',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
  },
  uploadButton: {
    backgroundColor: '#002E62',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(60, 141, 188, 0.4)',
  },
  uploadButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  retryBtn: {
    marginTop: 16,
  },
  retryText: {
    color: '#3C8DBC',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  errorBanner: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(185, 28, 28, 0.9)',
    padding: 10,
    borderRadius: 8,
    zIndex: 20,
  },
  errorBannerText: {
    color: '#fee2e2',
    fontSize: 12,
    textAlign: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 25,
  },
  loadingText: {
    color: '#ffffff',
    marginTop: 10,
    fontSize: 13,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    zIndex: 10,
  },
  toggleModeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  toggleModeText: {
    color: '#3C8DBC',
    fontSize: 12,
    fontWeight: '500',
  },
  cancelBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  cancelText: {
    color: '#94a3b8',
    fontSize: 12,
  },
});

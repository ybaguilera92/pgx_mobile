import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions, BarcodeSettings } from 'expo-camera';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ErrorBoundary from './ErrorBoundary';

const BARCODE_SETTINGS: BarcodeSettings = {
  barcodeTypes: ['qr'],
};

interface QrCodeScanProps {
  onClear: (val: boolean) => void;
  qrScanValue: (value: string) => void;
  isLandscape?: boolean;
}

const QrCodeScanInner: React.FC<QrCodeScanProps> = ({ onClear, qrScanValue }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [mountError, setMountError] = useState<string | null>(null);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [scanned, setScanned] = useState(false);

  const handleBarcodeScanned = useCallback(
    (data: string) => {
      if (scanned) return;
      setScanned(true);
      if (data) {
        qrScanValue(data);
        onClear(false);
      }
    },
    [scanned, qrScanValue, onClear]
  );

  const handleClose = () => {
    onClear(false);
  };

  // State 1: Permission is still loading from system
  if (!permission) {
    return (
      <View style={styles.fullscreenDark}>
        <ActivityIndicator size="large" color="#38bdf8" />
        <Text style={styles.statusText}>Comprobando permisos de cámara...</Text>
        <TouchableOpacity style={styles.secondaryBtn} onPress={handleClose}>
          <Text style={styles.secondaryBtnText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // State 2: Permission not granted yet or denied
  if (!permission.granted) {
    return (
      <View style={styles.fullscreenDark}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="camera-outline" size={36} color="#38bdf8" />
          </View>
          <Text style={styles.title}>Permiso de Cámara Requerido</Text>
          <Text style={styles.subtitle}>
            Para escanear el código QR de su reporte PGx, la aplicación necesita acceso a la cámara de su dispositivo.
          </Text>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={async () => {
              try {
                await requestPermission();
              } catch (err: any) {
                setMountError(err?.message || 'Error solicitando permiso');
              }
            }}
          >
            <Text style={styles.primaryBtnText}>Permitir Acceso a la Cámara</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.textBtn} onPress={handleClose}>
            <Text style={styles.textBtnText}>Ingresar código manualmente</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // State 3: Mount error on hardware / CameraX initialization
  if (mountError) {
    return (
      <View style={styles.fullscreenDark}>
        <View style={styles.card}>
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
            <MaterialCommunityIcons name="camera-off" size={36} color="#ef4444" />
          </View>
          <Text style={styles.title}>No se pudo iniciar la cámara</Text>
          <Text style={styles.subtitle}>{mountError}</Text>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => {
              setMountError(null);
              setIsCameraReady(false);
            }}
          >
            <Text style={styles.primaryBtnText}>Reintentar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.textBtn} onPress={handleClose}>
            <Text style={styles.textBtnText}>Ingresar código manualmente</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // State 4: Camera active
  return (
    <View style={styles.container}>
      {/* Native Camera View filling screen */}
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={isTorchOn}
        barcodeScannerSettings={BARCODE_SETTINGS}
        onCameraReady={() => setIsCameraReady(true)}
        onMountError={(err) => {
          console.warn('Camera onMountError:', err);
          setMountError(err?.message || 'No se pudo iniciar la vista de cámara.');
        }}
        onBarcodeScanned={
          scanned
            ? undefined
            : ({ data }) => {
                handleBarcodeScanned(data);
              }
        }
      />

      {/* Top Controls Overlay */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>Escanear Código QR PGx</Text>
        <View style={styles.topBarButtons}>
          <TouchableOpacity
            style={[styles.iconButton, isTorchOn && styles.iconButtonActive]}
            onPress={() => setIsTorchOn(!isTorchOn)}
            accessibilityLabel="Activar o desactivar linterna"
          >
            <MaterialCommunityIcons
              name={isTorchOn ? 'flash' : 'flash-off'}
              size={22}
              color="#ffffff"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleClose}
            accessibilityLabel="Cerrar escáner"
          >
            <MaterialCommunityIcons name="close" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Viewfinder Target in Center */}
      <View style={styles.targetWrapper} pointerEvents="none">
        <View style={styles.targetFrame}>
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
          <View style={styles.laserBar} />
        </View>
        <Text style={styles.instructionBanner}>
          Apunte la cámara al código QR de su reporte
        </Text>
      </View>

      {/* Bottom Controls */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
          <Text style={styles.cancelButtonText}>Ingresar código manualmente</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export const QrCodeScan: React.FC<QrCodeScanProps> = (props) => (
  <ErrorBoundary
    fallbackTitle="Error en el escáner de cámara"
    onReset={() => props.onClear(false)}
  >
    <QrCodeScanInner {...props} />
  </ErrorBoundary>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
    position: 'relative',
    justifyContent: 'space-between',
  },
  fullscreenDark: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#090d16',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#131b2e',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
  },
  statusText: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 16,
    marginBottom: 20,
  },
  primaryBtn: {
    backgroundColor: '#0284c7',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  textBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  textBtnText: {
    color: '#38bdf8',
    fontSize: 14,
    fontWeight: '500',
  },
  secondaryBtn: {
    backgroundColor: '#1e293b',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  secondaryBtnText: {
    color: '#cbd5e1',
    fontSize: 14,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? 36 : 16,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    zIndex: 10,
  },
  topBarTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  topBarButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonActive: {
    backgroundColor: '#0284c7',
  },
  targetWrapper: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  targetFrame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: '#38bdf8',
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  laserBar: {
    position: 'absolute',
    top: '50%',
    left: 12,
    right: 12,
    height: 2,
    backgroundColor: '#ef4444',
  },
  instructionBanner: {
    marginTop: 24,
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '500',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  bottomBar: {
    paddingBottom: Platform.OS === 'android' ? 28 : 20,
    paddingTop: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    zIndex: 10,
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default QrCodeScan;

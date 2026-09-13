import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  useWindowDimensions,
  ScrollView,
  Platform,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { PaperProvider, IconButton } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';

import { QrCodeScan } from './src/components/QrCodeScan';
import ReportForm, { ReportFormHandle } from './src/components/ReportForm';
import { AppIcon } from './src/components/AppIcon';
import ErrorBoundary from './src/components/ErrorBoundary';
import { lightTheme, darkTheme } from './src/theme';
import { storageService } from './src/services/StorageService';
import logoImg from './src/assets/images/logo-mini.png';

export { lightTheme, darkTheme };
export const theme = lightTheme;

interface NotificationState {
  type: 'success' | 'error';
  title: string;
  message: string;
}

export default function App() {
  const systemColorScheme = useColorScheme();
  const [themePreference, setThemePreference] = useState<'light' | 'dark' | 'system'>('system');
  const [loading, setLoading] = useState(false);
  const [qrScan, setQrScan] = useState(false);
  const [qrScanValue, setQrScanValue] = useState('');
  const [isCancel, setIsCancel] = useState(false);
  const [notification, setNotification] = useState<NotificationState | null>(null);

  const reportFormRef = useRef<ReportFormHandle | null>(null);
  const { width, height } = useWindowDimensions();
  const isLandscapeMode = width > height && width > 600;

  // Load saved theme preference
  useEffect(() => {
    async function loadTheme() {
      const saved = await storageService.getThemeMode();
      if (saved) {
        setThemePreference(saved);
      }
    }
    loadTheme();
  }, []);

  const isDarkMode =
    themePreference === 'dark' ||
    (themePreference === 'system' && systemColorScheme === 'dark');

  const currentTheme = isDarkMode ? darkTheme : lightTheme;

  const toggleTheme = async () => {
    const nextMode = isDarkMode ? 'light' : 'dark';
    setThemePreference(nextMode);
    await storageService.saveThemeMode(nextMode);
  };

  const showNotification = (type: 'success' | 'error', title: string, message: string) => {
    setNotification({ type, title, message });
    setTimeout(() => {
      setNotification((curr) => (curr?.title === title ? null : curr));
    }, 6000);
  };

  return (
    <ErrorBoundary fallbackTitle="Error en la aplicación">
      <PaperProvider
        theme={currentTheme}
        {...(Platform.OS === 'web'
          ? {
              settings: {
                icon: (props: any) => <AppIcon {...props} />,
              },
            }
          : {})}
      >
        <SafeAreaView
          style={[
            styles.safeArea,
            { backgroundColor: qrScan ? '#000000' : currentTheme.colors.background },
          ]}
        >
          <StatusBar
            style={qrScan ? 'light' : isDarkMode ? 'light' : 'dark'}
            backgroundColor={qrScan ? '#000000' : currentTheme.colors.background}
          />

        {!qrScan ? (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.container}>
              {/* Card wrapper */}
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: currentTheme.custom.cardBackground,
                    borderColor: currentTheme.custom.cardBorder,
                  },
                ]}
              >
                {/* Top Bar with Theme toggle & QR scan button */}
                <View style={styles.topBar}>
                  <View style={styles.topBarActions}>
                    {/* Theme toggle button */}
                    <IconButton
                      icon={isDarkMode ? 'white-balance-sunny' : 'weather-night'}
                      iconColor={isDarkMode ? '#38bdf8' : '#002E62'}
                      size={22}
                      mode="contained-tonal"
                      containerColor={currentTheme.custom.qrButtonBg}
                      onPress={toggleTheme}
                      accessibilityLabel="Cambiar tema claro u oscuro"
                      style={styles.actionBtn}
                    />

                    {/* QR scan trigger button */}
                    <IconButton
                      icon="qrcode-scan"
                      iconColor={isDarkMode ? '#38bdf8' : '#002E62'}
                      size={22}
                      mode="contained-tonal"
                      containerColor={currentTheme.custom.qrButtonBg}
                      onPress={() => setQrScan(true)}
                      accessibilityLabel="Escanear código QR"
                      style={styles.actionBtn}
                    />
                  </View>
                </View>

                {/* Header branding */}
                <View style={styles.header}>
                  <View
                    style={[
                      styles.logoWrapper,
                      {
                        backgroundColor: currentTheme.custom.logoBg,
                        borderColor: currentTheme.custom.cardBorder,
                      },
                    ]}
                  >
                    <Image
                      source={typeof logoImg === 'string' ? { uri: logoImg } : logoImg}
                      style={styles.logo}
                      resizeMode="contain"
                    />
                  </View>

                  <Text
                    style={[
                      styles.title,
                      { color: currentTheme.custom.headerTitle },
                    ]}
                  >
                    PGx Reports
                  </Text>
                  {!isLandscapeMode && (
                    <Text
                      style={[
                        styles.subtitle,
                        { color: currentTheme.custom.mutedText },
                      ]}
                    >
                      Enter or scan your report key to download your PGx report
                    </Text>
                  )}
                </View>

                {/* Form Component */}
                <View style={styles.formContainer}>
                  <ReportForm
                    ref={reportFormRef}
                    loading={setLoading}
                    scanValue={qrScanValue}
                    cancel={isCancel}
                    qrScanValue={setQrScanValue}
                    onNotification={showNotification}
                  />
                </View>
              </View>

              {/* Portal Security text */}
              <View style={styles.footerNote}>
                <Text
                  style={[
                    styles.footerText,
                    { color: currentTheme.custom.mutedText },
                  ]}
                >
                  Secure Pharmacogenomics Patient Diagnostic Portal
                </Text>
              </View>
            </View>
          </ScrollView>
        ) : (
          <QrCodeScan
            onClear={setQrScan}
            qrScanValue={(val) => {
              setQrScanValue(val);
              setQrScan(false);
              showNotification('success', 'QR Code Scanned', 'Parameters loaded from QR.');
            }}
            isLandscape={isLandscapeMode}
          />
        )}

        {/* Global Loading Overlay */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <View
              style={[
                styles.loadingCard,
                {
                  backgroundColor: currentTheme.custom.cardBackground,
                  borderColor: currentTheme.custom.cardBorder,
                },
              ]}
            >
              <ActivityIndicator
                size="large"
                color={currentTheme.colors.primary}
              />
              <Text
                style={[
                  styles.loadingCardText,
                  { color: currentTheme.colors.onSurface },
                ]}
              >
                Loading PGx Report...
              </Text>
            </View>
          </View>
        )}

        {/* Toast / Notification Banner */}
        {notification && (
          <View
            style={[
              styles.toastBanner,
              notification.type === 'error' ? styles.toastError : styles.toastSuccess,
              {
                backgroundColor:
                  notification.type === 'error'
                    ? isDarkMode
                      ? '#450a0a'
                      : '#fef2f2'
                    : isDarkMode
                    ? '#052e16'
                    : '#f0fdf4',
                borderColor:
                  notification.type === 'error'
                    ? isDarkMode
                      ? '#991b1b'
                      : '#fca5a5'
                    : isDarkMode
                    ? '#166534'
                    : '#86efac',
              },
            ]}
          >
            <View style={styles.toastTextContainer}>
              <Text
                style={[
                  styles.toastTitle,
                  { color: currentTheme.colors.onSurface },
                ]}
              >
                {notification.title}
              </Text>
              <Text
                style={[
                  styles.toastMessage,
                  { color: currentTheme.custom.mutedText },
                ]}
              >
                {notification.message}
              </Text>
            </View>
            <IconButton
              icon="close"
              size={18}
              iconColor={currentTheme.custom.mutedText}
              onPress={() => setNotification(null)}
              style={styles.toastClose}
            />
          </View>
        )}
      </SafeAreaView>
    </PaperProvider>
  </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  container: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
  card: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#002E62',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 4,
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    margin: 0,
  },
  header: {
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 12,
  },
  logoWrapper: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 12,
  },
  logo: {
    width: 52,
    height: 52,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 280,
    lineHeight: 18,
  },
  formContainer: {
    marginTop: 8,
  },
  footerNote: {
    marginTop: 18,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    textAlign: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
    minWidth: 200,
    borderWidth: 1,
    elevation: 8,
  },
  loadingCardText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  toastBanner: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    maxWidth: 420,
    alignSelf: 'center',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    zIndex: 1000,
    elevation: 6,
  },
  toastSuccess: {},
  toastError: {},
  toastTextContainer: {
    flex: 1,
    paddingRight: 8,
  },
  toastTitle: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  toastMessage: {
    fontSize: 12,
    marginTop: 2,
  },
  toastClose: {
    margin: 0,
  },
});

import React, {useRef, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  SafeAreaView,
  Image,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import {IconButton, Provider} from 'react-native-paper';
import Spinner from 'react-native-loading-spinner-overlay';
import Toast from 'react-native-toast-message';
import {widthToDp as wp, heightToDp as hp} from 'rn-responsive-screen';

import {theme} from '.';
import {QrCodeScan} from './src/components/QrCodeScan';
import ReportForm from './src/components/ReportForm';

import {notificationService} from './src/services/NotifierService';

const App = () => {
  const [loading, setLoading] = useState(false);
  const [qrScan, setQrScan] = useState(false);
  const [qrScanValue, setQrScanValue] = useState('');
  const [isCancel, setIsCancel] = useState(false);
  const childRef = useRef<any>();

  const toastConfig = {success: () => <></>};

  const {width, height} = useWindowDimensions();
  const isLandscapeMode = width > height ? true : false;

  // Eliminamos el listener de eventos de notifee ya que react-native-push-notification
  // maneja las notificaciones de forma diferente
  // Las acciones se manejan directamente en la UI de la aplicación

  return (
    <>
      {!qrScan ? (
        <>
          <Provider theme={theme}>
            <SafeAreaView style={styles.container}>
              <Spinner
                visible={loading}
                textContent={'Loading...'}
                textStyle={styles.spinnerTextStyle}
              />
              <ScrollView>
                <View style={styles.qrContainer}>
                  <IconButton
                    icon="qrcode-scan"
                    size={35}
                    onPress={() => setQrScan(true)}
                  />
                </View>
                <View style={styles.infoContainer}>
                  <Image
                    source={require('./src/assets/images/logo-mini.png')}
                  />
                  {!isLandscapeMode && (
                    <>
                      <Text style={styles.title}>PGx Reports</Text>
                      <Text style={styles.subtitle}>
                        Enter or scan your report key for download your PGx
                        report
                      </Text>
                    </>
                  )}
                </View>
                <View style={styles.reportFormContainer}>
                  <ReportForm
                    scanValue={qrScanValue}
                    cancel={isCancel}
                    loading={setLoading}
                    qrScanValue={setQrScanValue}
                    ref={childRef}
                  />
                </View>
              </ScrollView>
            </SafeAreaView>
          </Provider>
          <Toast config={toastConfig} />
        </>
      ) : (
        <QrCodeScan
          onClear={setQrScan}
          qrScanValue={setQrScanValue}
          isLandscape={isLandscapeMode}
        />
      )}
      <StatusBar backgroundColor={'white'} barStyle="dark-content" />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  qrContainer: {
    alignItems: 'flex-end',
    padding: hp(1),
    marginTop: hp(6), // Baja el botón de escanear QR
  },
  infoContainer: {
    flex: 0.6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp(2), // Baja el logo
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    padding: hp(2),
  },
  subtitle: {
    fontWeight: 'bold',
    paddingBottom: hp(2),
    marginHorizontal: wp(4),
    justifyContent: 'center',
    textAlign: 'center',
  },
  reportFormContainer: {
    flex: 1,
    padding: hp(2)
  },
  spinnerTextStyle: {
    color: '#FFF',
  },
});

export default App;

import React, {useEffect, useState, useRef} from 'react';
import {StyleSheet, View, Text, Alert, ActivityIndicator} from 'react-native';
import {IconButton, Button} from 'react-native-paper';
import {useCameraDevices, Camera} from 'react-native-vision-camera';
import {RNHoleView} from 'react-native-hole-view';
import {widthToDp, heightToDp} from 'rn-responsive-screen';
import QRLocalImage from 'react-native-qrcode-local-image';

export const QrCodeScan = ({onClear, qrScanValue, isLandscape}) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [qrRaw, setQrRaw] = useState('');
  const cameraRef = useRef(null);

  const devices = useCameraDevices();
  const device = Array.isArray(devices)
    ? devices.find(d => d.position === 'back')
    : devices.back;

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(
        status === 'authorized' || status === 'granted' || status === 'GRANTED',
      );
    })();
  }, []);

  // Función para validar la estructura del QR code
  const validateQRStructure = qrData => {
    try {
      const parsed = JSON.parse(qrData.data);
      return parsed.Key && parsed.AccesionNumber;
    } catch (error) {
      return false;
    }
  };

  // Procesar la imagen y extraer el QR real
  const processImageForQR = async imagePath => {
    return new Promise((resolve, reject) => {
      QRLocalImage.decode(imagePath, (err, data) => {
        if (err) {
          setQrRaw('');
          // console.error('Error procesando imagen:', err);
          reject(err);
        } else {
          setQrRaw(data);
          resolve({data});
        }
      });
    });
  };

  // Procesar la foto capturada y detectar QR
  const processPhoto = async photo => {
    setProcessing(true);
    try {
      const qrData = await processImageForQR(photo.path);
      if (!qrData) {
        Alert.alert(
          'QR Not Detected',
          'No QR code could be detected in the image. Please try again.',
        );
        return;
      }
      if (validateQRStructure(qrData)) {
        qrScanValue(qrData.data);
        onClear();
        // const parsedQR = JSON.parse(qrData.data);
        // Alert.alert(
        //   'QR Code Detected', 'The data has been automatically filled in the form.',
        //   // `✅ QR procesado exitosamente!\n\n📋 Key: ${parsedQR.Key}\n📋 AccesionNumber: ${parsedQR.AccesionNumber}\n\nLos datos han sido llenados automáticamente en el formulario.`,
        //   [
        //     { text: 'OK', onPress: () => onClear() }
        //   ]
        // );
      } else {
        Alert.alert(
          'QR Detected',
          `The text extracted from the QR code does not have the expected structure.`,
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Error processing image. Please try again. ');
    } finally {
      setProcessing(false);
    }
  };

  // Tomar foto y procesar
  const handleScan = async () => {
    if (!cameraRef.current) return;
    setProcessing(true);
    try {
      const photo = await cameraRef.current.takePhoto({
        qualityPrioritization: 'quality',
        flash: 'off',
        skipMetadata: true,
      });
      await processPhoto(photo);
    } catch (error) {
      Alert.alert('Error', 'The photo could not be captured.');
      setProcessing(false);
    }
  };

  // Al inicio del componente QrCodeScan
  const timerRef = useRef(null);

  useEffect(() => {
    if (processing) {
      timerRef.current = setTimeout(() => {
        if (processing) {
          Alert.alert(
            'Error',
            'QR processing is taking too long. Try capturing the photo again.',
          );
          setProcessing(false); // O la función que corresponda para resetear el estado
        }
      }, 5000);
    } else {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [processing]);

  if (!hasPermission) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          No camera permission. Please grant permission in settings.
        </Text>
      </View>
    );
  }
  if (!device) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Charging camera...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
      />
      {/* Overlay con área de escaneo */}
      {isLandscape ? (
        <RNHoleView
          holes={[
            {
              x: widthToDp('45%'),
              y: heightToDp('20%'),
              width: widthToDp('60%'),
              height: heightToDp('60%'),
              borderRadius: 10,
            },
          ]}
          style={styles.rnholeView}
        />
      ) : (
        <RNHoleView
          holes={[
            {
              x: widthToDp('20%'),
              y: heightToDp('45%'),
              width: widthToDp('60%'),
              height: heightToDp('60%'),
              borderRadius: 10,
            },
          ]}
          style={styles.rnholeView}
        />
      )}
      {/* Botones */}
      <View
        style={
          isLandscape ? styles.landscapeButtonWrapper : styles.buttonWrapper
        }>
        {/* <Button
          mode="contained"
          onPress={handleScan}
          loading={processing}
          disabled={processing}
          style={{ marginLeft: 16 }}
        >
          Scan QR
        </Button>        */}
        <IconButton
          icon="qrcode-scan"
          mode="contained-tonal"
          loading={processing}
          disabled={processing}
          size={50}
          style={styles.cameraButton}
          onPress={handleScan}
        />
        <IconButton
          icon="close"
          mode="contained-tonal"
          size={50}
          style={styles.cameraButton}
          onPress={() => onClear()}
        />
      </View>
      {/* Mostrar el texto real extraído del QR */}
      {/* {qrRaw ? (
        <View style={styles.qrRawContainer}>
          <Text style={styles.qrRawLabel}>Texto extraído del QR:</Text>
          <Text style={styles.qrRawText}>{qrRaw}</Text>
        </View>
      ) : null} */}
      {/* Indicador de procesamiento */}
      {processing && (
        <View style={styles.processingIndicator}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.processingText}>Processing QR...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignContent: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#060606ff',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    padding: 20,
  },
  processingIndicator: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
  },
  processingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  rnholeView: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  buttonWrapper: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    padding: heightToDp(10),
    marginTop: heightToDp(10),
  },
  landscapeButtonWrapper: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: heightToDp(10),
    marginTop: heightToDp(10),
  },
  cameraButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderColor: 'rgba(220,220,220, 0.3)',
    borderWidth: 2,
  },
  qrRawContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 12,
    borderRadius: 8,
    elevation: 2,
  },
  qrRawLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  qrRawText: {
    color: '#222',
    fontSize: 15,
    fontFamily: 'monospace',
  },
});

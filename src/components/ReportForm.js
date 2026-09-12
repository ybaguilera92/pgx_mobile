import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from 'react';
import {View, KeyboardAvoidingView, Platform, StyleSheet} from 'react-native';
import {TextInput, Button, Text} from 'react-native-paper';
import {useForm, Controller} from 'react-hook-form';
import {
  downloadFile,
  DocumentDirectoryPath,
  stopDownload,
  mkdir,
  exists,
} from 'react-native-fs';
import {widthToDp as wp, heightToDp as hp} from 'rn-responsive-screen';
import FileViewer from 'react-native-file-viewer';
import Icon from 'react-native-vector-icons/Ionicons';

import {DownloadDialog} from './DownloadDialog';

import {notificationService} from '../services/NotifierService';
import {downloadPermissionService} from '../services/DownloadPermissions';
import {reportService} from '../services/ReportService';
import {checkIsJsonService} from '../services/CheckIsJsonService';
import {storageService} from '../services/StorageService';
import {messageService} from '../services/MessageService';

const ReportForm = ({loading, scanValue, cancel, qrScanValue}, ref) => {
  const [reportKeyVisible, setReportKeyVisible] = useState(true);
  const [progress, setProgress] = useState(null);
  const [downloadId, setDownloadId] = useState(null);
  const [visible, setVisible] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfLocalPath, setPdfLocalPath] = useState(null);

  const searchIcon = Icon.getImageSourceSync('search', 25, '#4099FF');

  useEffect(() => {
    if (cancel === true) {
      cancelDownload();
    }
  });

  const showDialog = () => {
    setProgress(0);
    setVisible(true);
  };

  const hideDialog = () => {
    setVisible(false);
    setProgress(null);
  };

  const cancelDownload = async () => {
    await stopDownload(downloadId);
    hideDialog();
    setDownloadId(null);
    setPdfUrl('');
    notificationService.cancelNotification();
  };

  useImperativeHandle(ref, () => ({
    openReport: () => {
      openReport();
    },
  }));

  const openReport = () => {
    FileViewer.open(pdfLocalPath, {showAppsSuggestions: true});
    hideDialog();
    setDownloadId(null);
    setPdfUrl('');
  };

  const {
    handleSubmit,
    control,
    reset,
    watch,
    formState: {errors, isValid},
  } = useForm({mode: 'onChange'});

  const onSubmit = data => {
    loading(true);
    reportService
      .getReportUrl(data)
      .then(res => {
        setPdfUrl(res);
      })
      .catch(err => {
        messageService.errorMessage(err.message, 'Error getting report');
        resetFormValues();
      })
      .finally(() => loading(false));
  };

  useEffect(() => {
    let defaultValues = {};
    if (checkIsJsonService.isJson(scanValue)) {
      let qrScan = JSON.stringify(scanValue);
      qrScan = JSON.parse(scanValue);
      defaultValues.AccesionNumber = qrScan.AccesionNumber;
      defaultValues.Key = qrScan.Key;
    } else {
      defaultValues.AccesionNumber = storageService.getAccessionNumber();
      defaultValues.Key = scanValue;
    }
    reset({...defaultValues});
  }, [scanValue, reset]);

  useEffect(() => {
    const subscription = watch(value => {
      storageService.saveAccessionNumber(value.AccesionNumber);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const downloadPDF = async url => {
    if (Platform.OS !== 'ios') {
      downloadPermissionService.androidDownloadPermissions();
    }

    const path = DocumentDirectoryPath;

    const exist = exists(path).then(resp => {
      if (!resp) {
        mkdir(path);
      }
    });

    let fileName = url.split(/[/?]+/);
    fileName = fileName
      .filter(elem => elem.includes('.docx') || elem.includes('.pdf'))[0]
      .split(/[.]/);

    let extension = fileName[1];
    fileName = fileName[0];

    setPdfLocalPath(`${path}/${fileName}-${Date.now() % 1000000}.${extension}`);

    const options = {
      fromUrl: url,
      toFile: `${path}/${fileName}-${Date.now() % 1000000}.${extension}`,
      progressDivider: 10,
      progress: resp => {
        const currentProgress = (resp.bytesWritten / resp.contentLength) * 100;
        setProgress(Math.round(currentProgress));
        setDownloadId(resp.jobId);
      },
    };

    notificationService.onDisplayNotification();
    showDialog();

    downloadFile(options)
      .promise.then(resp => {
        if (resp && resp.statusCode === 200 && resp.bytesWritten > 0) {
          setDownloadId(resp.jobId);
          setProgress(101);
        } else {
          messageService.errorMessage(resp.message, 'Error download pdf');
          hideDialog();
        }
      })
      .catch(err => {
        messageService.errorMessage(err.message, 'Error download pdf');
        hideDialog();
      });

    resetFormValues();
  };

  useEffect(() => {
    notificationService.onUpdateNotification(
      progress,
      pdfLocalPath ? pdfLocalPath.split('0/')[1] : '',
    );
  }, [progress, pdfLocalPath]);

  // Eliminamos el listener de eventos de notifee ya que react-native-push-notification
  // no soporta acciones interactivas en Android de forma nativa
  // Las acciones de cancelar y abrir se manejan directamente en la UI del diálogo

  const resetFormValues = () => {
    let defaultValues = {};
    defaultValues.AccesionNumber = '';
    defaultValues.Key = '';
    reset({...defaultValues});
    qrScanValue('');
  };

  const filePathInDevice = () => {
    if (Platform.OS !== 'ios') {
      return pdfLocalPath.split('0/')[1];
    } else {
      let path = pdfLocalPath
        .split(/[/?]+/)
        .filter(elem => elem.includes('.docx') || elem.includes('.pdf'));
      return `files/PGx Report/${path}`;
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'position' : ''}
      style={styles.container}>
      <Controller
        control={control}
        render={({field: {onChange, onBlur, value}}) => (
          <TextInput
            style={styles.input}
            label="Accession Number"
            onBlur={onBlur}
            value={value}
            error={!!errors.AccesionNumber}
            onChangeText={text => onChange(text)}
          />
        )}
        name="AccesionNumber"
        rules={{
          required: {value: true, message: 'Accession number is required!'},
        }}
      />
      {errors.AccesionNumber && (
        <Text style={styles.errorMessage}>{errors.AccesionNumber.message}</Text>
      )}

      <Controller
        control={control}
        render={({field: {onChange, onBlur, value}}) => (
          <TextInput
            style={styles.input}
            label="Report Key"
            onBlur={onBlur}
            value={value}
            error={!!errors.Key}
            onChangeText={text => onChange(text)}
            secureTextEntry={reportKeyVisible}
            right={
              <TextInput.Icon
                name={reportKeyVisible ? 'eye-off' : 'eye'}
                onPress={() => setReportKeyVisible(!reportKeyVisible)}
              />
            }
          />
        )}
        name="Key"
        rules={{required: {value: true, message: 'Report key is required!'}}}
      />
      {errors.Key && (
        <Text style={styles.errorMessage}>{errors.Key.message}</Text>
      )}

      <View style={styles.buttonContainer}>
        <Button
          style={styles.button}
          icon={searchIcon}
          mode="contained"
          disabled={!isValid}
          uppercase={false}
          onPress={handleSubmit(onSubmit)}>
          Search
        </Button>

        <Button
          style={styles.button}
          icon="download"
          mode="contained"
          disabled={!pdfUrl || !isValid}
          uppercase={false}
          onPress={() => downloadPDF(pdfUrl)}>
          Download
        </Button>

        <DownloadDialog
          show={visible}
          downloadId={downloadId}
          downloadProgress={progress}
          onCancel={cancelDownload}
          onOpen={openReport}
          reportPath={pdfLocalPath ? filePathInDevice() : ''}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

export default forwardRef(ReportForm);

const styles = StyleSheet.create({
  container: {
    paddingRight: wp(15),
    paddingLeft: wp(15),
    paddingTop: hp(2),
  },
  button: {
    marginVertical: hp(4),
  },
  buttonContainer: {
    paddingVertical: hp(8),
  },
  input: {
    backgroundColor: 'white',
    marginVertical: hp(2),
  },
  dialogContent: {
    justifyContent: 'flex-end',
    textAlign: 'right',
  },
});

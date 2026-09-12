import React, {useEffect, useState} from 'react';
import {StyleSheet, Platform} from 'react-native';
import {
  Button,
  Portal,
  Dialog,
  Paragraph,
  ProgressBar,
  Text,
} from 'react-native-paper';

export const DownloadDialog = ({
  show,
  onCancel,
  onOpen,
  downloadId,
  downloadProgress,
  reportPath,
}) => {
  const [visible, setVisible] = useState();
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    setVisible(show);
  }, [show]);

  useEffect(() => {
    setProgress(downloadProgress);
  }, [downloadProgress]);

  const cancel = () => {
    setVisible(false);
    onCancel();
  };

  const openReport = () => {
    onOpen();
  };

  const displayText = () => {
    if (!progress) {
      return <Dialog.Title>Preparing to download</Dialog.Title>;
    } else if (progress < 100) {
      return <Dialog.Title>Downloading report</Dialog.Title>;
    } else {
      return <Dialog.Title>Successfully downloaded!</Dialog.Title>;
    }
  };

  return (
    <Portal>
      <Dialog visible={visible} dismissable={false}>
        {displayText()}
        <Dialog.Content>
          {progress !== 101 ? (
            <>
              <Paragraph style={styles.dialogContent}>
                {progress ? `${progress}%` : ''}
              </Paragraph>
              <ProgressBar
                progress={progress / 100}
                indeterminate={!progress}
              />
            </>
          ) : (
            <Text>Report path: {reportPath}</Text>
          )}
        </Dialog.Content>
        {downloadId ? (
          <Dialog.Actions>
            <Button onPress={() => cancel()}>Cancel</Button>
            {progress === 101 && Platform.OS !== 'ios' ? (
              <Button onPress={() => openReport()}>Open</Button>
            ) : null}
          </Dialog.Actions>
        ) : (
          <Dialog.Actions />
        )}
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  dialogContent: {
    justifyContent: 'flex-end',
    textAlign: 'right',
  },
});

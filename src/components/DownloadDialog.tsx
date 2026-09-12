import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Button, Dialog, Portal, ProgressBar, useTheme } from 'react-native-paper';

interface DownloadDialogProps {
  show: boolean;
  cancel: () => void;
  open: () => void;
  downloadProgress: number | null;
  title: string;
  reportUrl?: string | null;
}

export const DownloadDialog: React.FC<DownloadDialogProps> = ({
  show,
  cancel,
  open,
  downloadProgress,
  title,
}) => {
  const theme = useTheme();
  const numericProgress = downloadProgress !== null ? downloadProgress / 100 : 0;
  const isComplete = downloadProgress !== null && downloadProgress >= 100;

  return (
    <Portal>
      <Dialog
        visible={show}
        onDismiss={cancel}
        style={[
          styles.dialog,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.outlineVariant,
            borderWidth: theme.dark ? 1 : 0,
          },
        ]}
      >
        <Dialog.Title style={[styles.title, { color: theme.colors.onSurface }]}>
          {title}
        </Dialog.Title>
        <Dialog.Content>
          <View style={styles.progressContainer}>
            <ProgressBar
              progress={Math.max(0.05, numericProgress)}
              color={theme.colors.primary}
              style={[
                styles.progressBar,
                { backgroundColor: theme.colors.surfaceVariant },
              ]}
            />
            <Text
              style={[
                styles.progressText,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {downloadProgress !== null ? `${Math.round(downloadProgress)}%` : 'Connecting...'}
            </Text>
            {isComplete && (
              <Text
                style={[
                  styles.completeSubtext,
                  { color: theme.dark ? '#86efac' : '#15803d' },
                ]}
              >
                Report downloaded successfully. Tap Open to view your document.
              </Text>
            )}
          </View>
        </Dialog.Content>
        <Dialog.Actions style={styles.actions}>
          <Button onPress={cancel} textColor={theme.colors.onSurfaceVariant}>
            Close
          </Button>
          {isComplete && (
            <Button
              mode="contained"
              onPress={open}
              buttonColor={theme.colors.primary}
              textColor={theme.colors.onPrimary}
              style={styles.openBtn}
            >
              Open Report
            </Button>
          )}
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  dialog: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    maxWidth: 420,
    width: '90%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#002E62',
    textAlign: 'center',
    paddingTop: 8,
  },
  progressContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  progressBar: {
    width: '100%',
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#002E62',
    marginTop: 4,
  },
  completeSubtext: {
    fontSize: 12,
    color: '#16a34a',
    marginTop: 8,
    textAlign: 'center',
  },
  actions: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    justifyContent: 'flex-end',
  },
  openBtn: {
    borderRadius: 8,
    marginLeft: 8,
  },
});

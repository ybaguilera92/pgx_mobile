import { Platform } from 'react-native';

export const fileService = {
  downloadAndOpenReport: async function (
    url: string,
    onProgress?: (percent: number) => void
  ): Promise<string> {
    if (Platform.OS === 'web') {
      if (onProgress) onProgress(30);
      await new Promise((r) => setTimeout(r, 250));
      if (onProgress) onProgress(75);
      await new Promise((r) => setTimeout(r, 250));
      if (onProgress) onProgress(100);

      try {
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.download = `PGx-Report-${Date.now() % 100000}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (err) {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
      return url;
    } else {
      try {
        const FileSystem = await import('expo-file-system');
        const Sharing = await import('expo-sharing');
        const fileName = `PGx-Report-${Date.now() % 100000}.pdf`;
        const fileUri = `${FileSystem.documentDirectory}${fileName}`;

        const downloadResumable = FileSystem.createDownloadResumable(
          url,
          fileUri,
          {},
          (downloadProgress) => {
            const total = downloadProgress.totalBytesExpectedToWrite;
            const written = downloadProgress.totalBytesWritten;
            const progress = total > 0 ? Math.round((written / total) * 100) : 50;
            if (onProgress) onProgress(progress);
          }
        );

        const result = await downloadResumable.downloadAsync();
        if (result && result.uri) {
          if (onProgress) onProgress(100);
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(result.uri);
          }
          return result.uri;
        }
      } catch (err: any) {
        console.error('Download error:', err);
        throw new Error(err?.message || 'Failed to download report on device.');
      }
      return url;
    }
  },
};

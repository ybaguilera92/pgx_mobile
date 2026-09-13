import { Platform } from "react-native";

export function getFilenameFromUrl(
  url: string,
  defaultName = "PGx_Report.pdf",
): string {
  try {
    const cleanUrl = url.split("?")[0].split("#")[0];
    const parts = cleanUrl.split("/").filter(Boolean);
    const last = parts[parts.length - 1];
    if (last) {
      let decoded = decodeURIComponent(last).trim();
      if (decoded.length > 0) {
        if (!decoded.includes(".")) {
          decoded = `${decoded}.pdf`;
        }
        return decoded;
      }
    }
  } catch (e) {
    console.warn("Error extracting filename from URL:", e);
  }
  return defaultName;
}

let activeDownloadTask: any = null;

async function getPgxReportsDir(): Promise<string> {
  const FileSystem = await import("expo-file-system");

  if (Platform.OS === "android") {
    const publicDownloadDir =
      "file:///storage/emulated/0/Download/PGx_Reports/";
    try {
      const dirInfo = await FileSystem.getInfoAsync(publicDownloadDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(publicDownloadDir, {
          intermediates: true,
        });
      }
      return publicDownloadDir;
    } catch (err) {
      console.warn(
        "Could not create /storage/emulated/0/Download/PGx_Reports/, falling back to document directory:",
        err,
      );
    }
  }

  const appDir = `${FileSystem.documentDirectory}PGx_Reports/`;
  try {
    const dirInfo = await FileSystem.getInfoAsync(appDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(appDir, { intermediates: true });
    }
    return appDir;
  } catch (err) {
    console.warn("Could not create PGx_Reports in documentDirectory:", err);
    return FileSystem.documentDirectory || "";
  }
}

export const fileService = {
  getFilenameFromUrl,

  cancelDownload: async function (): Promise<void> {
    if (activeDownloadTask) {
      try {
        await activeDownloadTask.cancelAsync();
      } catch (e) {
        console.warn("Error cancelling download:", e);
      } finally {
        activeDownloadTask = null;
      }
    }
  },

  downloadReport: async function (
    url: string,
    onProgress?: (percent: number) => void,
  ): Promise<string> {
    const fileName = getFilenameFromUrl(url);

    if (Platform.OS === "web") {
      if (onProgress) onProgress(0);
      await new Promise((r) => setTimeout(r, 150));
      if (onProgress) onProgress(35);
      await new Promise((r) => setTimeout(r, 200));
      if (onProgress) onProgress(70);
      await new Promise((r) => setTimeout(r, 200));
      if (onProgress) onProgress(100);

      try {
        const a = document.createElement("a");
        a.href = url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (err) {
        window.open(url, "_blank", "noopener,noreferrer");
      }
      return url;
    } else {
      try {
        const FileSystem = await import("expo-file-system");
        const targetDir = await getPgxReportsDir();
        const fileUri = `${targetDir}${fileName}`;

        if (onProgress) onProgress(0);

        const downloadResumable = FileSystem.createDownloadResumable(
          url,
          fileUri,
          {},
          (downloadProgress) => {
            const total = downloadProgress.totalBytesExpectedToWrite;
            const written = downloadProgress.totalBytesWritten;
            const progress =
              total > 0
                ? Math.min(
                    100,
                    Math.max(0, Math.round((written / total) * 100)),
                  )
                : 0;
            if (onProgress) onProgress(progress);
          },
        );

        activeDownloadTask = downloadResumable;
        const result = await downloadResumable.downloadAsync();
        activeDownloadTask = null;

        if (result && result.uri) {
          if (onProgress) onProgress(100);
          return result.uri;
        }

        return fileUri;
      } catch (err: any) {
        activeDownloadTask = null;
        console.error("Download error:", err);
        throw new Error(err?.message || "Failed to download report on device.");
      }
    }
  },

  openReport: async function (fileUriOrUrl: string): Promise<void> {
    if (Platform.OS === "web") {
      window.open(fileUriOrUrl, "_blank", "noopener,noreferrer");
      return;
    }

    try {
      const Sharing = await import("expo-sharing");
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(fileUriOrUrl, {
          mimeType: "application/pdf",
          dialogTitle: "Open PGx Report",
          UTI: "com.adobe.pdf",
        });
        return;
      }
    } catch (shareErr) {
      console.warn("Sharing error, attempting Linking fallback:", shareErr);
    }

    try {
      const { Linking } = await import("react-native");
      const supported = await Linking.canOpenURL(fileUriOrUrl);
      if (supported) {
        await Linking.openURL(fileUriOrUrl);
      } else {
        throw new Error("No application found to open this document.");
      }
    } catch (linkErr: any) {
      console.error("Failed to open document:", linkErr);
      throw new Error(linkErr?.message || "Could not open document.");
    }
  },

  downloadAndOpenReport: async function (
    url: string,
    onProgress?: (percent: number) => void,
  ): Promise<string> {
    const localUri = await this.downloadReport(url, onProgress);
    await this.openReport(localUri);
    return localUri;
  },
};

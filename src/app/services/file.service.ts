import { Injectable } from '@angular/core';

let isCancelled = false;

@Injectable({
  providedIn: 'root'
})
export class FileService {
  getFilenameFromUrl(url: string, defaultName = 'PGx_Report.pdf'): string {
    try {
      const cleanUrl = url.split('?')[0].split('#')[0];
      const parts = cleanUrl.split('/').filter(Boolean);
      const last = parts[parts.length - 1];
      if (last) {
        let decoded = decodeURIComponent(last).trim();
        if (decoded.length > 0) {
          if (!decoded.includes('.')) {
            decoded = `${decoded}.pdf`;
          }
          return decoded;
        }
      }
    } catch (e) {
      console.warn('Error extracting filename from URL:', e);
    }
    return defaultName;
  }

  cancelDownload(): void {
    isCancelled = true;
  }

  async downloadReport(
    url: string,
    onProgress?: (percent: number) => void
  ): Promise<string> {
    isCancelled = false;
    const fileName = this.getFilenameFromUrl(url);

    const steps = [
      { delay: 120, pct: 20 },
      { delay: 180, pct: 45 },
      { delay: 200, pct: 75 },
      { delay: 200, pct: 100 },
    ];

    if (onProgress) onProgress(5);

    for (const step of steps) {
      await new Promise((r) => setTimeout(r, step.delay));
      if (isCancelled) {
        throw new Error('Download cancelled');
      }
      if (onProgress) onProgress(step.pct);
    }

    try {
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.warn('Direct anchor download failed, link is ready:', err);
    }

    return url;
  }

  openReport(fileUriOrUrl: string): void {
    try {
      const a = document.createElement('a');
      a.href = fileUriOrUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.warn('Could not open report link:', err);
    }
  }
}

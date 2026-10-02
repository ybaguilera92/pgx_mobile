import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly ACCESSION_KEY = '@accession_number';
  private readonly THEME_KEY = '@theme_mode';

  getAccessionNumber(): string {
    try {
      return localStorage.getItem(this.ACCESSION_KEY) || '';
    } catch {
      return '';
    }
  }

  saveAccessionNumber(val: string): void {
    try {
      if (val) {
        localStorage.setItem(this.ACCESSION_KEY, val);
      } else {
        localStorage.removeItem(this.ACCESSION_KEY);
      }
    } catch (e) {
      console.warn('Storage write error:', e);
    }
  }

  getThemeMode(): 'light' | 'dark' | 'system' {
    try {
      const mode = localStorage.getItem(this.THEME_KEY);
      if (mode === 'light' || mode === 'dark') {
        return mode;
      }
      return 'system';
    } catch {
      return 'system';
    }
  }

  saveThemeMode(mode: 'light' | 'dark'): void {
    try {
      localStorage.setItem(this.THEME_KEY, mode);
    } catch (e) {
      console.warn('Storage write error:', e);
    }
  }
}

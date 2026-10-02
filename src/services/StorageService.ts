import AsyncStorage from '@react-native-async-storage/async-storage';

let cachedAccessionNumber = '';

export const storageService = {
  saveAccessionNumber: async function (value: string): Promise<void> {
    cachedAccessionNumber = value || '';
    try {
      await AsyncStorage.setItem('accessionNumber', cachedAccessionNumber);
    } catch (e) {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('accessionNumber', cachedAccessionNumber);
        }
      } catch {
        // ignore
      }
    }
  },

  getAccessionNumber: async function (): Promise<string> {
    try {
      const value = await AsyncStorage.getItem('accessionNumber');
      if (value !== null) {
        cachedAccessionNumber = value;
        return value;
      }
    } catch (e) {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const stored = window.localStorage.getItem('accessionNumber');
          if (stored !== null) {
            cachedAccessionNumber = stored;
            return stored;
          }
        }
      } catch {
        // ignore
      }
    }
    return cachedAccessionNumber;
  },

  removeAccessionNumber: async function (): Promise<void> {
    cachedAccessionNumber = '';
    try {
      await AsyncStorage.removeItem('accessionNumber');
    } catch (e) {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem('accessionNumber');
        }
      } catch {
        // ignore
      }
    }
  },

  saveThemeMode: async function (mode: 'light' | 'dark' | 'system'): Promise<void> {
    try {
      await AsyncStorage.setItem('appThemeMode', mode);
    } catch {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('appThemeMode', mode);
        }
      } catch {
        // ignore
      }
    }
  },

  getThemeMode: async function (): Promise<'light' | 'dark' | 'system' | null> {
    try {
      const mode = await AsyncStorage.getItem('appThemeMode');
      if (mode === 'light' || mode === 'dark' || mode === 'system') {
        return mode;
      }
    } catch {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const mode = window.localStorage.getItem('appThemeMode');
          if (mode === 'light' || mode === 'dark' || mode === 'system') {
            return mode;
          }
        }
      } catch {
        // ignore
      }
    }
    return null;
  },
};

import { create } from 'zustand';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

interface ThemeState {
  isDark: boolean;
  hasHydrated: boolean;
  loadTheme: () => Promise<void>;
  setDark: (isDark: boolean) => void;
  toggleTheme: () => void;
}

const THEME_KEY = 'runpilot.theme';

function readThemeFromWeb(): boolean | null {
  if (typeof globalThis.localStorage === 'undefined') return null;
  const value = globalThis.localStorage.getItem(THEME_KEY);
  return value === null ? null : value === 'dark';
}

function writeThemeToWeb(isDark: boolean) {
  if (typeof globalThis.localStorage === 'undefined') return;
  globalThis.localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
}

async function persistTheme(isDark: boolean) {
  if (Platform.OS === 'web') {
    writeThemeToWeb(isDark);
    return;
  }
  await SecureStore.setItemAsync(THEME_KEY, isDark ? 'dark' : 'light');
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: Platform.OS === 'web' ? readThemeFromWeb() ?? false : false,
  hasHydrated: Platform.OS === 'web',
  loadTheme: async () => {
    if (Platform.OS === 'web') {
      set({ isDark: readThemeFromWeb() ?? false, hasHydrated: true });
      return;
    }
    try {
      const value = await SecureStore.getItemAsync(THEME_KEY);
      set({ isDark: value === 'dark', hasHydrated: true });
    } catch {
      set({ hasHydrated: true });
    }
  },
  setDark: (isDark) => {
    set({ isDark });
    void persistTheme(isDark);
  },
  toggleTheme: () =>
    set((state) => {
      const nextIsDark = !state.isDark;
      void persistTheme(nextIsDark);
      return { isDark: nextIsDark };
    }),
}));

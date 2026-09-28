import { create } from 'zustand';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

/** system: sigue al telefono. light/dark: eleccion manual del conductor. */
export type ThemePreference = 'system' | 'light' | 'dark';

interface ThemeState {
  preference: ThemePreference;
  hasHydrated: boolean;
  loadTheme: () => Promise<void>;
  setPreference: (preference: ThemePreference) => void;
}

const THEME_KEY = 'runpilot.theme';

function parse(value: string | null): ThemePreference {
  return value === 'dark' || value === 'light' ? value : 'system';
}

function readThemeFromWeb(): ThemePreference {
  if (typeof globalThis.localStorage === 'undefined') return 'system';
  return parse(globalThis.localStorage.getItem(THEME_KEY));
}

async function persistTheme(preference: ThemePreference) {
  if (Platform.OS === 'web') {
    if (typeof globalThis.localStorage === 'undefined') return;
    if (preference === 'system') globalThis.localStorage.removeItem(THEME_KEY);
    else globalThis.localStorage.setItem(THEME_KEY, preference);
    return;
  }
  if (preference === 'system') await SecureStore.deleteItemAsync(THEME_KEY);
  else await SecureStore.setItemAsync(THEME_KEY, preference);
}

export const useThemeStore = create<ThemeState>((set) => ({
  preference: Platform.OS === 'web' ? readThemeFromWeb() : 'system',
  hasHydrated: Platform.OS === 'web',
  loadTheme: async () => {
    if (Platform.OS === 'web') {
      set({ preference: readThemeFromWeb(), hasHydrated: true });
      return;
    }
    try {
      const value = await SecureStore.getItemAsync(THEME_KEY);
      set({ preference: parse(value), hasHydrated: true });
    } catch {
      set({ hasHydrated: true });
    }
  },
  setPreference: (preference) => {
    set({ preference });
    void persistTheme(preference);
  },
}));

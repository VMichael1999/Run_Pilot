import { useColorScheme } from 'react-native';
import { useThemeStore } from '@store/useThemeStore';
import { ThemeColors } from './colors';

/** Modo noche efectivo: la eleccion manual manda; si no hay, el del telefono. */
export function useIsDark(): boolean {
  const preference = useThemeStore((state) => state.preference);
  const scheme = useColorScheme();
  return preference === 'system' ? scheme === 'dark' : preference === 'dark';
}

export function useAppTheme() {
  return useIsDark() ? ThemeColors.dark : ThemeColors.light;
}

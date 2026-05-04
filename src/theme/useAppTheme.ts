import { useThemeStore } from '@store/useThemeStore';
import { ThemeColors } from './colors';

export function useAppTheme() {
  const isDark = useThemeStore((state) => state.isDark);
  return isDark ? ThemeColors.dark : ThemeColors.light;
}

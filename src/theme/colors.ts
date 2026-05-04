export const Colors = {
  primary: '#001f3f',
  secondary: '#000289',
  tertiary: '#0003c7',

  backgroundLight: '#eeeeee',
  backgroundItemLight: '#fefefe',
  backgroundDark: '#000000',
  backgroundItemDark: '#2a2e32',

  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',

  textPrimary: '#1a1a1a',
  textSecondary: '#6b7280',
  textDisabled: '#9ca3af',

  error: '#ef4444',
  success: '#22c55e',
  warning: '#f59e0b',

  divider: '#e5e7eb',
  shadow: 'rgba(0, 0, 0, 0.1)',
} as const;

export type ColorKey = keyof typeof Colors;

export const ThemeColors = {
  light: {
    primary: Colors.primary,
    accent: '#1d5fa8',
    background: '#f4f7fb',
    surface: Colors.white,
    surfaceMuted: '#eef2f7',
    surfaceSoft: '#eaf2ff',
    drawer: '#1a2f4e',
    text: Colors.textPrimary,
    textMuted: Colors.textSecondary,
    textDisabled: Colors.textDisabled,
    divider: '#edf2f7',
    iconButton: Colors.white,
    shadow: Colors.shadow,
    statusBar: 'dark' as const,
  },
  dark: {
    primary: '#7DB7FF',
    accent: '#5EA8FF',
    background: '#121212',
    surface: '#1E1E1E',
    surfaceMuted: '#262626',
    surfaceSoft: '#242424',
    drawer: '#121212',
    text: '#ffffff',
    textMuted: 'rgba(255,255,255,0.7)',
    textDisabled: 'rgba(255,255,255,0.38)',
    divider: 'rgba(255,255,255,0.12)',
    iconButton: '#1E1E1E',
    shadow: 'rgba(0, 0, 0, 0.35)',
    statusBar: 'light' as const,
  },
} as const;

export type ThemeMode = keyof typeof ThemeColors;
export type AppTheme = (typeof ThemeColors)[ThemeMode];
